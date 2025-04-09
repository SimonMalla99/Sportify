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
from .models import DraftedPlayer
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .models import NewsArticle
from .serializers import NewsArticleSerializer
from rest_framework import viewsets, permissions
from .models import PlayerPrediction
from .serializers import PlayerPredictionSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)  # Get tokens

        if response.status_code == 200:
            user = User.objects.get(username=request.data["username"])  # Fetch user details
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
            response.data["user"] = user_data  # Attach user data to response

        return response
class UserView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is logged in

    def get(self, request):
        user = request.user
        return Response({"id": user.id, "username": user.username, "is_superuser": user.is_superuser})

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


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
                matches_played = len(history)  # Count the number of games they have played, including substitutions

                player_list.append({
                    "id": player["id"],
                    "first_name": player["first_name"],
                    "second_name": player["second_name"],
                    "team": team_map.get(player["team"], "Unknown Team"),
                    "total_points": player["total_points"],
                    "goals_scored": player["goals_scored"],
                    "assists": player["assists"],
                    "yellow_cards": player["yellow_cards"],
                    "red_cards": player["red_cards"],
                    "position": position_map.get(player["element_type"], "Unknown Position"),
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

@csrf_exempt
def save_draft(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            drafted_players = data.get("drafted_players", [])

            for player in drafted_players:
                DraftedPlayer.objects.create(
                    player_id=player["player_id"],
                    user_id=player["user_id"],
                    position=player["position"]
                )

            return JsonResponse({"success": True, "message": "Draft saved successfully!"})
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

        # Fetch live player info from FPL API to get names
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
                team_data.append({
                    "first_name": player_data["first_name"],
                    "second_name": player_data["second_name"],
                    "team": teams.get(player_data["team"], "Unknown"),
                    "position": positions.get(player_data["element_type"], "Unknown")
                })

        return JsonResponse(team_data, safe=False)

    return JsonResponse({"error": "GET method only"}, status=405)

class NewsArticleView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def get(self, request):
        news_articles = NewsArticle.objects.all().order_by("-id")
        serializer = NewsArticleSerializer(news_articles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = NewsArticleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class PlayerPredictionViewSet(viewsets.ModelViewSet):
    serializer_class = PlayerPredictionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PlayerPrediction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)