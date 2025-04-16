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

class PlayerGamePerformance(models.Model):
    player_id = models.IntegerField()
    fixture_id = models.IntegerField()
    opponent_team = models.CharField(max_length=100)
    minutes = models.IntegerField()
    goals_scored = models.IntegerField()
    assists = models.IntegerField()
    clean_sheets = models.BooleanField()
    saves = models.IntegerField()
    yellow_cards = models.IntegerField()
    red_cards = models.IntegerField()
    penalties_saved = models.IntegerField()
    penalties_missed = models.IntegerField()
    position = models.CharField(max_length=20)
    total_points = models.FloatField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('player_id', 'fixture_id', 'user')
