from django.db import models
from django.contrib.auth.models import User

class DraftedPlayer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    player_id = models.IntegerField()  # Storing the API's player.id
    position = models.CharField(max_length=10)  # Store the position for easy filtering

    def __str__(self):
        return f"{self.user.username} - Player ID: {self.player_id}"
