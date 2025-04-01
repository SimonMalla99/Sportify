from django.db import models
from django.contrib.auth.models import User


class DraftedPlayer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    player_id = models.IntegerField()  # FPL Player ID
    player_name = models.CharField(max_length=100)
    team = models.CharField(max_length=50)
    position = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.user.username} - {self.player_name}"