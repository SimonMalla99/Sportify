from django.db import models
from django.contrib.auth.models import User


class DraftedPlayer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    player_id = models.IntegerField()  # Storing the API's player.id
    position = models.CharField(max_length=10)  # Store the position for easy filtering

    def __str__(self):
        return f"{self.user.username} - Player ID: {self.player_id}"

class NewsArticle(models.Model):
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='news_images/')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class PlayerPrediction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    player_id = models.IntegerField()  # Same as in DraftedPlayer
    predicted_goals = models.PositiveIntegerField(default=0)
    predicted_assists = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'player_id')

    def __str__(self):
        return f"{self.user.username} - Player ID: {self.player_id} Prediction"
