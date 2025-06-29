from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
import requests
import json
from django.http import JsonResponse
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .models import DraftedPlayer, PlayerGamePerformance
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .models import NewsArticle
from .serializers import NewsArticleSerializer
from rest_framework import viewsets, permissions
from .models import TeamGamePerformance
from django.views.decorators.http import require_http_methods
from .models import TeamPrediction
from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from .serializers import UserProfileSerializer
from .models import UserProfile
from .serializers import UserProfileSerializer
from django.core.mail import send_mail
from django.template.loader import render_to_string  # Optional, for better HTML email
from django.utils.html import strip_tags
import random
from django.core.cache import cache
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            user = User.objects.get(username=request.data["username"])
            try:
                is_blocked = user.profile.is_blocked
            except UserProfile.DoesNotExist:
                is_blocked = False  # fallback if no profile yet

            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_blocked": is_blocked  # ✅ include this
            }
            response.data["user"] = user_data

        return response

class UserView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is logged in

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,  
            "is_superuser": user.is_superuser,
            "is_blocked": user.profile.is_blocked if hasattr(user, "profile") else False
        })


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()  # Creates the user and returns it
        if user.email:
            send_mail(
                subject="Welcome to Sportify!",
                message="Thanks for signing up. Enjoy your fantasy sports experience!",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
    


def fetch_fpl_data(request):
    url = "https://fantasy.premierleague.com/api/bootstrap-static/"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({"error": "Failed to fetch data"}, status=500)
    
def fetch_players(request):
    url = "https://fantasy.premierleague.com/api/bootstrap-static/"
    
    try:
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            players = data.get("elements", [])
            teams = data.get("teams", [])
            team_map = {team["id"]: team["name"] for team in teams}
            position_map = {
                1: "Goalkeeper",
                2: "Defender",
                3: "Midfielder",
                4: "Forward"
            }

            player_list = []
            
            for player in players:
                # Get the player's history (if available)
                history = player.get("history", [])

                player_list.append({
                    "id": player["id"],
                    "first_name": player["first_name"],
                    "second_name": player["second_name"],
                    "team": team_map.get(player["team"], "Unknown Team"),
                    "total_points": player["total_points"],
                    "goals_scored": player["goals_scored"],
                    "goals_conceded": player["goals_conceded"],
                    "penalties_saved": player["penalties_saved"],
                    "saves": player["saves"],
                    "assists": player["assists"],
                    "yellow_cards": player["yellow_cards"],
                    "red_cards": player["red_cards"],
                    "photo": f"https://resources.premierleague.com/premierleague/photos/players/110x140/p{player['photo']}",
                    "position": position_map.get(player["element_type"], "Unknown Position"),
                    "price": player["now_cost"] / 10,  
                })

            return JsonResponse(player_list, safe=False)

        else:
            return JsonResponse({"error": f"Failed to fetch player data. Status code: {response.status_code}"}, status=500)

    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

def fetch_fixtures(request):
    url = "https://fantasy.premierleague.com/api/fixtures/"
    response = requests.get(url)
    
    if response.status_code == 200:
        data2 = response.json()
        return JsonResponse(data2, safe=False)
    else:
        return JsonResponse({"error": "Failed to fetch data"}, status=500)

from decimal import Decimal


@csrf_exempt
def save_draft(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            drafted_players = data.get("drafted_players", [])
            user_id = drafted_players[0]["user_id"] if drafted_players else None

            if not user_id:
                return JsonResponse({"error": "User ID is required"}, status=400)

            user = User.objects.get(id=user_id)
            saved_players = []

            for player in drafted_players:
                obj = DraftedPlayer.objects.create(
                    player_id=player["player_id"],
                    user_id=player["user_id"],
                    position=player["position"]
                )
                saved_players.append(obj)

            # 💡 Fetch player names and prices from FPL API
            fpl_data = requests.get("https://fantasy.premierleague.com/api/bootstrap-static/").json()
            all_players = {p["id"]: p for p in fpl_data["elements"]}
            player_prices = {p["id"]: p["now_cost"] / 10 for p in fpl_data["elements"]}

            # Calculate total team cost
            total_cost = sum(player_prices.get(int(p["player_id"]), 0) for p in drafted_players)

            # 🔄 Update user's remaining budget
            try:
                profile = user.profile
                remaining_budget = profile.budget - Decimal(str(total_cost))
                profile.budget = max(Decimal("0.00"), remaining_budget)
                profile.save()
            except Exception as e:
                return JsonResponse({"error": "Failed to update user budget", "details": str(e)}, status=500)

            # Build HTML table
            table_html = "<h2>Your Drafted Fantasy Team</h2><table border='1' cellpadding='8' cellspacing='0'><tr><th>First Name</th><th>Last Name</th><th>Position</th></tr>"
            for dp in saved_players:
                player_info = all_players.get(dp.player_id)
                if player_info:
                    table_html += f"<tr><td>{player_info['first_name']}</td><td>{player_info['second_name']}</td><td>{dp.position}</td></tr>"
            table_html += "</table>"

            # Add total cost to email
            table_html += f"<p><strong>Total Cost:</strong> £{total_cost:.1f}m</p>"

            # Send email
            if user.email:
                send_mail(
                    subject="Your Fantasy Team Has Been Drafted!",
                    message=strip_tags(table_html),  # Fallback plain text
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                    html_message=table_html
                )

            return JsonResponse({"success": True, "message": "Draft saved and email sent!"})

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)

    return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)



@csrf_exempt
def has_team(request):
    if request.method == "GET":
        user_id = request.GET.get("user_id")

        if not user_id:
            return JsonResponse({"error": "User ID is required"}, status=400)

        has_team = DraftedPlayer.objects.filter(user_id=user_id).count() == 11
        return JsonResponse({"has_team": has_team})

    return JsonResponse({"error": "GET request only"}, status=405)

@csrf_exempt
def get_user_team(request):
    if request.method == "GET":
        user_id = request.GET.get("user_id")

        if not user_id:
            return JsonResponse({"error": "User ID is required"}, status=400)

        drafted_players = DraftedPlayer.objects.filter(user_id=user_id)

        # Fetch bootstrap-static data
        fpl_response = requests.get("https://fantasy.premierleague.com/api/bootstrap-static/")
        if fpl_response.status_code != 200:
            return JsonResponse({"error": "Failed to fetch player data from FPL API"}, status=500)

        fpl_data = fpl_response.json()
        all_players = {p["id"]: p for p in fpl_data["elements"]}
        teams = {t["id"]: t["name"] for t in fpl_data["teams"]}
        positions = {
            1: "Goalkeeper",
            2: "Defender",
            3: "Midfielder",
            4: "Forward"
        }

        team_data = []

        for dp in drafted_players:
            player_data = all_players.get(dp.player_id)
            if player_data:
                # Fetch detailed per-game stats
                summary_url = f"https://fantasy.premierleague.com/api/element-summary/{dp.player_id}/"
                match_history = []

                try:
                    summary_response = requests.get(summary_url)
                    if summary_response.status_code == 200:
                        summary_data = summary_response.json()
                        match_history = summary_data.get("history", [])
                except Exception as e:
                    print(f"Error fetching element-summary for player {dp.player_id}: {str(e)}")

                team_data.append({
                    "id": dp.player_id,
                    "first_name": player_data["first_name"],
                    "second_name": player_data["second_name"],
                    "team": teams.get(player_data["team"], "Unknown"),
                    "position": positions.get(player_data["element_type"], "Unknown"),
                    "match_history": match_history  # ⬅️ this is the new data
                })

        return JsonResponse(team_data, safe=False)

    return JsonResponse({"error": "GET method only"}, status=405)


class NewsArticleView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def get(self, request):
        category = request.GET.get("category")

        if category:
            news_articles = NewsArticle.objects.filter(category=category).order_by("-id")
        else:
            news_articles = NewsArticle.objects.all().order_by("-id")

        serializer = NewsArticleSerializer(news_articles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = NewsArticleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
from rest_framework import generics
from .models import NewsArticle
from .serializers import NewsArticleSerializer

class NewsArticleDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = NewsArticle.objects.all()
    serializer_class = NewsArticleSerializer
    permission_classes = [AllowAny]  # Or IsAdminUser if you want it admin-only

    
def calculate_custom_points(stats, position):
    points = 0
    minutes = stats.get("minutes", 0)

    if minutes >= 60:
        points += 5
    elif minutes > 0:
        points += 2.5

    points += stats.get("goals_scored", 0) * 50
    points += stats.get("assists", 0) * 25

    if stats.get("clean_sheets", 0):
        if position in ["Goalkeeper", "Defender"]:
            points += 15
        elif position == "Midfielder":
            points += 3

    points += (stats.get("saves", 0) // 3) * 1
    points += stats.get("penalties_saved", 0) * 25
    points -= stats.get("penalties_missed", 0) * 10
    points -= stats.get("yellow_cards", 0) * 5
    points -= stats.get("red_cards", 0) * 15

    return points

@csrf_exempt
def calculate_player_game_points(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "User ID is required"}, status=400)

    drafted_players = DraftedPlayer.objects.filter(user_id=user_id)
    fpl_data = requests.get("https://fantasy.premierleague.com/api/bootstrap-static/").json()
    position_map = {
        1: "Goalkeeper",
        2: "Defender",
        3: "Midfielder",
        4: "Forward"
    }

    results = []

    for dp in drafted_players:
        summary_url = f"https://fantasy.premierleague.com/api/element-summary/{dp.player_id}/"
        res = requests.get(summary_url)
        if res.status_code != 200:
            continue

        data = res.json()
        games = data.get("history", [])

        # get player position
        player_info = next((p for p in fpl_data["elements"] if p["id"] == dp.player_id), None)
        if not player_info:
            continue
        position = position_map.get(player_info["element_type"], "Unknown")

        for game in games:
            points = calculate_custom_points(game, position)

            perf, created = PlayerGamePerformance.objects.update_or_create(
                player_id=dp.player_id,
                fixture_id=game["fixture"],
                user_id=user_id,
                defaults={
                    "opponent_team": game["opponent_team"],
                    "minutes": game["minutes"],
                    "goals_scored": game["goals_scored"],
                    "assists": game["assists"],
                    "clean_sheets": bool(game["clean_sheets"]),
                    "saves": game["saves"],
                    "yellow_cards": game["yellow_cards"],
                    "red_cards": game["red_cards"],
                    "penalties_saved": game["penalties_saved"],
                    "penalties_missed": game["penalties_missed"],
                    "position": position,
                    "total_points": points,
                    "gameweek": game["round"]
                }
            )
            results.append({
                "player_id": dp.player_id,
                "fixture_id": game["fixture"],
                "opponent_team": game["opponent_team"],
                "minutes": game["minutes"],
                "goals_scored": game["goals_scored"],
                "assists": game["assists"],
                "yellow_cards": game["yellow_cards"],
                "red_cards": game["red_cards"],
                "saves": game["saves"],
                "clean_sheets": bool(game["clean_sheets"]),
                "total_points": points,
                "gameweek": game["round"]
            })


    return JsonResponse(results, safe=False)


@csrf_exempt
def calculate_team_game_performance(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET allowed"}, status=405)

    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "user_id is required"}, status=400)

    performances = PlayerGamePerformance.objects.filter(user_id=user_id)
    gameweeks = performances.values_list("gameweek", flat=True).distinct()

    results = []
    allpoints = 0  # <-- ADD THIS

    for gameweek in gameweeks:
        fixture_players = performances.filter(gameweek=gameweek)

        total_goals = 0
        total_assists = 0
        total_clean_sheets = 0
        total_saves = 0
        total_yellow_cards = 0
        total_red_cards = 0
        total_points = 0

        forward_goals = 0
        midfielder_goals = 0
        defender_clean_sheets = 0
        goalkeeper_clean_sheets = 0

        for p in fixture_players:
            total_goals += p.goals_scored
            total_assists += p.assists
            total_clean_sheets += int(p.clean_sheets)
            total_saves += p.saves
            total_yellow_cards += p.yellow_cards
            total_red_cards += p.red_cards
            total_points += p.total_points

            # Breakdown
            if p.position == "Forward":
                forward_goals += p.goals_scored
            elif p.position == "Midfielder":
                midfielder_goals += p.goals_scored
            elif p.position == "Defender":
                defender_clean_sheets += int(p.clean_sheets)
            elif p.position == "Goalkeeper":
                goalkeeper_clean_sheets += int(p.clean_sheets)

        # ⬅️ Add to grand total
        allpoints += total_points

        team_perf, created = TeamGamePerformance.objects.update_or_create(
            user_id=user_id,
            gameweek=gameweek,
            defaults={
                "total_goals": total_goals,
                "total_assists": total_assists,
                "total_clean_sheets": total_clean_sheets,
                "total_saves": total_saves,
                "total_yellow_cards": total_yellow_cards,
                "total_red_cards": total_red_cards,
                "total_points": total_points,
                "forward_goals": forward_goals,
                "midfielder_goals": midfielder_goals,
                "defender_clean_sheets": defender_clean_sheets,
                "goalkeeper_clean_sheets": goalkeeper_clean_sheets,
            }
        )

        results.append({
            "gameweek": gameweek,
            "total_goals": total_goals,
            "total_assists": total_assists,
            "total_saves": total_saves,
            "total_yellow_cards": total_yellow_cards,
            "total_red_cards": total_red_cards,
            "total_points": total_points,
            "final_points": team_perf.final_points,
            "forward_goals": forward_goals,
            "midfielder_goals": midfielder_goals,
            "defender_clean_sheets": defender_clean_sheets,
            "goalkeeper_clean_sheets": goalkeeper_clean_sheets,
        })

    # ✅ Add this to include the grand total
    return JsonResponse({
        "gameweek_results": results,
        "allpoints": allpoints
    }, safe=False)




@csrf_exempt
@require_http_methods(["POST"])
def submit_team_prediction(request):
    try:
        data = json.loads(request.body)

        user_id = data.get("user_id")
        gameweek = data.get("gameweek")

        # Predicted stats
        predicted_forward_goals = data.get("predicted_forward_goals", 0)
        predicted_midfielder_goals = data.get("predicted_midfielder_goals", 0)
        predicted_defender_clean_sheets = data.get("predicted_defender_clean_sheets", 0)
        predicted_goalkeeper_clean_sheets = data.get("predicted_goalkeeper_clean_sheets", 0)
        predicted_total_assists = data.get("predicted_total_assists", 0)

        if not user_id or gameweek is None:
            return JsonResponse({"error": "user_id and gameweek are required"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

        # Save or update prediction
        prediction, created = TeamPrediction.objects.update_or_create(
            user=user,
            gameweek=gameweek,
            defaults={
                "predicted_forward_goals": predicted_forward_goals,
                "predicted_midfielder_goals": predicted_midfielder_goals,
                "predicted_defender_clean_sheets": predicted_defender_clean_sheets,
                "predicted_goalkeeper_clean_sheets": predicted_goalkeeper_clean_sheets,
                "predicted_total_assists": predicted_total_assists,
            }
        )

        return JsonResponse({
            "success": True,
            "message": "Prediction submitted successfully!",
            "created": created
        })

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def evaluate_prediction(request):
    try:
        data = json.loads(request.body)

        user_id = data.get("user_id")
        gameweek = data.get("gameweek")

        if not user_id or gameweek is None:
            return JsonResponse({"error": "user_id and gameweek are required"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

        try:
            prediction = TeamPrediction.objects.get(user=user, gameweek=gameweek)
        except TeamPrediction.DoesNotExist:
            return JsonResponse({"error": "Prediction not found for this user and gameweek"}, status=404)

        try:
            performance = TeamGamePerformance.objects.get(user=user, gameweek=gameweek)
        except TeamGamePerformance.DoesNotExist:
            return JsonResponse({"error": "No team performance data found for this gameweek"}, status=404)

        # Check if prediction is correct
# Count correct predictions
        correct_count = 0
        if prediction.predicted_forward_goals == performance.forward_goals:
            correct_count += 1
        if prediction.predicted_midfielder_goals == performance.midfielder_goals:
            correct_count += 1
        if prediction.predicted_defender_clean_sheets == performance.defender_clean_sheets:
            correct_count += 1
        if prediction.predicted_goalkeeper_clean_sheets == performance.goalkeeper_clean_sheets:
            correct_count += 1
        if prediction.predicted_total_assists == performance.total_assists:
            correct_count += 1

        # Multiplier logic: 1.0 base + 0.1 per correct, capped at 1.5
        multiplier = min(1.0 + (0.1 * correct_count), 1.5)
        final_points = round(performance.total_points * multiplier, 2)

        # Save updated fields
        prediction.prediction_correct = correct_count == 5
        prediction.multiplier_applied = True
        prediction.save()

        performance.final_points = final_points
        performance.save()


        return JsonResponse({
            "success": True,
            "correct_count": correct_count,
            "multiplier": multiplier,
            "prediction_correct": correct_count == 5,
            "multiplier_applied": True,
            "final_points": final_points,
            "original_points": performance.total_points,
        })


    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def debug_team_performance(request):
    user_id = request.GET.get("user_id")
    gameweek = request.GET.get("gameweek")

    try:
        perf = TeamGamePerformance.objects.get(user_id=user_id, gameweek=gameweek)
        return JsonResponse({
            "user_id": user_id,
            "gameweek": gameweek,
            "total_points": perf.total_points,
            "final_points": perf.final_points
        })
    except TeamGamePerformance.DoesNotExist:
        return JsonResponse({"error": "No performance found"}, status=404)
    

@csrf_exempt
def fetch_npl_cricket_data(request):
    if request.method == "GET":
        try:
            url = "http://core.espnuk.org/v2/sports/cricket/leagues/1462594/"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            return JsonResponse(data, safe=False)
        except requests.exceptions.RequestException as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "GET method only"}, status=405)

@csrf_exempt
def fetch_npl_matches(request):
    if request.method == "GET":
        try:
            base_events_url = "http://core.espnuk.org/v2/sports/cricket/leagues/1462594/events"
            events_response = requests.get(base_events_url)
            events_response.raise_for_status()
            events_data = events_response.json()

            match_urls = [item["$ref"] for item in events_data.get("items", [])]
            all_match_details = []

            for match_url in match_urls:
                match_res = requests.get(match_url)
                if match_res.status_code == 200:
                    match_data = match_res.json()
                    all_match_details.append({
                        "id": match_data.get("id"),
                        "name": match_data.get("name"),
                        "shortName": match_data.get("shortName"),
                        "description": match_data.get("description"),
                        "status": match_data.get("status"),
                        "startDate": match_data.get("startDate"),
                        "venue": match_data.get("venue", {}).get("fullName"),
                        "competitors": match_data.get("competitors", []),
                    })
            return JsonResponse(all_match_details, safe=False)

        except requests.exceptions.RequestException as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "GET only"}, status=405)


@csrf_exempt
def fetch_npl_teams(request):
    if request.method == "GET":
        try:
            teams_url = "http://core.espnuk.org/v2/sports/cricket/leagues/1462594/teams"
            response = requests.get(teams_url)
            response.raise_for_status()
            data = response.json()

            team_refs = [item["$ref"] for item in data.get("items", [])]
            team_list = []

            for ref_url in team_refs:
                team_res = requests.get(ref_url)
                if team_res.status_code == 200:
                    team_data = team_res.json()
                    team_list.append({
                        "id": team_data.get("id"),
                        "name": team_data.get("name"),
                        "abbreviation": team_data.get("abbreviation"),
                        "shortDisplayName": team_data.get("shortDisplayName"),
                        "logo": team_data.get("logos", [{}])[0].get("href") if team_data.get("logos") else None,
                        "clubhouse": team_data.get("clubhouse", {}).get("href"),
                        "links": team_data.get("links", [])
                    })

            return JsonResponse(team_list, safe=False)

        except requests.exceptions.RequestException as e:
            return JsonResponse({"error": "Failed to fetch from ESPN", "details": str(e)}, status=502)

    return JsonResponse({"error": "GET method only"}, status=405)



@csrf_exempt
def fetch_npl_seasons(request):
    if request.method == "GET":
        try:
            url = "http://core.espnuk.org/v2/sports/cricket/leagues/1462594/seasons"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()

            season_refs = [item["$ref"] for item in data.get("items", [])]
            season_list = []

            for ref in season_refs:
                season_res = requests.get(ref)
                if season_res.status_code == 200:
                    season_data = season_res.json()
                    season_list.append({
                        "id": season_data.get("id"),
                        "year": season_data.get("year"),
                        "startDate": season_data.get("startDate"),
                        "endDate": season_data.get("endDate"),
                        "status": season_data.get("status", {}).get("type") if season_data.get("status") else None
                    })

            return JsonResponse(season_list, safe=False)

        except requests.exceptions.RequestException as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "GET method only"}, status=405)

@csrf_exempt
def fetch_npl_standings(request):
    if request.method == "GET":
        url = "http://core.espnuk.org/v2/sports/cricket/leagues/1462594/seasons/2024/types/1/groups/1/standings/1"

        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()

            standings = []

            for entry in data.get("standings", []):
                team_ref = entry.get("team", {}).get("$ref")
                team_id = team_ref.split("/")[-1] if team_ref else None

                # Fetch team name from $ref
                team_name = "Unknown"
                if team_ref:
                    try:
                        team_response = requests.get(team_ref)
                        if team_response.status_code == 200:
                            team_data = team_response.json()
                            team_name = team_data.get("name", "Unknown")
                    except:
                        pass

                stats = entry.get("records", [])[0].get("stats", []) if entry.get("records") else []
                team_stats = {stat["name"]: stat["value"] for stat in stats}

                standings.append({
                    "team_id": team_id,
                    "team_name": team_name,
                    "rank": team_stats.get("rank"),
                    "matches_played": team_stats.get("matchesPlayed"),
                    "matches_won": team_stats.get("matchesWon"),
                    "matches_lost": team_stats.get("matchesLost"),
                    "matches_tied": team_stats.get("matchesTied", 0),
                    "matches_no_result": team_stats.get("matchesNoResult", 0),
                })

            return JsonResponse(standings, safe=False)

        except requests.exceptions.RequestException as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "GET method only"}, status=405)

@csrf_exempt
def leaderboard_view(request):
    if request.method == "GET":
        users = User.objects.all()
        leaderboard = []

        for user in users:
            performances = TeamGamePerformance.objects.filter(user=user)

            total = 0
            for perf in performances:
                if perf.final_points and perf.final_points > 0:
                    total += perf.final_points
                else:
                    total += perf.total_points

            leaderboard.append({
                "user_id": user.id,
                "username": user.username,
                "allpoints": round(total, 2)
            })

        # Sort descending by points
        leaderboard.sort(key=lambda x: x["allpoints"], reverse=True)

        # Add rank
        for i, item in enumerate(leaderboard, start=1):
            item["rank"] = i

        return JsonResponse(leaderboard, safe=False)

    return JsonResponse({"error": "GET method only"}, status=405)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def create_user_profile(request):
    user_id = request.data.get("user_id")
    if not user_id:
        return JsonResponse({"error": "User ID is required"}, status=400)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    serializer = UserProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=user)
        return JsonResponse({"message": "Profile created successfully!"}, status=201)

    # 🔥 Log the actual issue:
    print("Serializer errors:", serializer.errors)
    return JsonResponse(serializer.errors, status=400)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_user_profile(request):
    user_id = request.GET.get("user_id")  # 👈 get from query string
    if not user_id:
        return Response({"error": "User ID required"}, status=400)

    try:
        user = User.objects.get(id=user_id)
        profile = user.profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except UserProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "User ID is required"}, status=400)

    try:
        user = User.objects.get(id=user_id)
        profile = user.profile
    except (User.DoesNotExist, UserProfile.DoesNotExist):
        return JsonResponse({"error": "User or profile not found"}, status=404)

    data = request.data

    # Update username
    new_username = data.get("username")
    if new_username and new_username != user.username:
        user.username = new_username
        user.save()

    # Update UserProfile fields
    profile.dob = data.get("dob", profile.dob)
    profile.phone_number = data.get("phone_number", profile.phone_number)
    profile.bio = data.get("bio", profile.bio)

    # Favourite Sports (JSON list)
    favourite_sports = data.get("favourite_sports")
    if favourite_sports:
        try:
            profile.favourite_sports = json.loads(favourite_sports)
        except Exception as e:
            print("Error parsing favourite_sports:", e)

    # Profile Picture (if uploaded)
    if "profile_picture" in request.FILES:
        profile.profile_picture = request.FILES["profile_picture"]

    profile.save()

    return JsonResponse({"message": "Profile updated successfully!"}, status=200)

@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response({"detail": "Both old and new passwords are required."}, status=400)

    if not user.check_password(old_password):
        return Response({"detail": "Old password is incorrect."}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({"detail": "Password changed successfully."}, status=200)

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def request_reset_otp(request):
    email = request.data.get("email")
    if not email:
        return JsonResponse({"error": "Email is required"}, status=400)

    try:
        user = User.objects.get(email=email)
        otp = random.randint(100000, 999999)
        cache.set(f"reset_otp_{email}", otp, timeout=300)  # 5 mins

        send_mail(
            subject="Your Sportify Password Reset OTP",
            message=f"Your OTP is: {otp}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return JsonResponse({"message": "OTP sent to your email"}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "No user found with that email"}, status=404)

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password_with_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    new_password = request.data.get("new_password")

    if not all([email, otp, new_password]):
        return JsonResponse({"error": "Email, OTP, and new password are required"}, status=400)

    cached_otp = cache.get(f"reset_otp_{email}")
    if not cached_otp or str(cached_otp) != str(otp):
        return JsonResponse({"error": "Invalid or expired OTP"}, status=400)

    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        cache.delete(f"reset_otp_{email}")
        return JsonResponse({"message": "Password reset successful"}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

@api_view(["GET"])
def get_all_users(request):
    users = User.objects.all()
    user_data = []

    for user in users:
        try:
            profile = user.profile
            is_blocked = profile.is_blocked
        except UserProfile.DoesNotExist:
            is_blocked = False  # Default to not blocked if no profile exists

        user_data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_blocked": is_blocked,
        })

    return Response(user_data)

@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def block_user(request):
    user_id = request.data.get("user_id")
    if not user_id:
        return JsonResponse({"error": "User ID is required"}, status=400)

    try:
        user = User.objects.get(id=user_id)
        profile = user.profile
        profile.is_blocked = True
        profile.save()
        return JsonResponse({"message": f"User {user.username} blocked."})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except UserProfile.DoesNotExist:
        return JsonResponse({"error": "UserProfile not found"}, status=404)


@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unblock_user(request):
    user_id = request.data.get("user_id")
    if not user_id:
        return JsonResponse({"error": "User ID is required"}, status=400)

    try:
        user = User.objects.get(id=user_id)
        profile = user.profile
        profile.is_blocked = False
        profile.save()
        return JsonResponse({"message": f"User {user.username} unblocked."})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except UserProfile.DoesNotExist:
        return JsonResponse({"error": "UserProfile not found"}, status=404)

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import TeamPrediction
from .serializers import TeamPredictionSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def prediction_history(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return Response({"error": "User ID required"}, status=400)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    predictions = TeamPrediction.objects.filter(user=user).order_by('-gameweek')
    serializer = TeamPredictionSerializer(predictions, many=True)
    return Response({"predictions": serializer.data})


@csrf_exempt
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    if not request.user.is_superuser:
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        user = User.objects.get(id=user_id)
        username = user.username
        user.delete()  # 💥 Deletes the user and cascades to related models
        return JsonResponse({"message": f"User '{username}' and all associated data deleted successfully."}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
