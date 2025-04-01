from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
import requests
from django.http import JsonResponse
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from rest_framework import viewsets, permissions
from .models import DraftedPlayer
from .serializers import DraftedPlayerSerializer

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
        return Response({"id": user.id, "username": user.username})

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

class DraftedPlayerViewSet(viewsets.ModelViewSet):
    queryset = DraftedPlayer.objects.all()
    serializer_class = DraftedPlayerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DraftedPlayer.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)