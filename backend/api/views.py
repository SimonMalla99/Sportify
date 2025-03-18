from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note
import requests
from django.http import JsonResponse
from django.conf import settings


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    

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
    
def fetch_fixtures(request):
    url = "https://fantasy.premierleague.com/api/fixtures/"
    response = requests.get(url)
    
    if response.status_code == 200:
        data2 = response.json()
        return JsonResponse(data2, safe=False)
    else:
        return JsonResponse({"error": "Failed to fetch data"}, status=500)

