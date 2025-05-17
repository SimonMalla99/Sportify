from django.db import models
from django.contrib.auth.models import User


class DraftedPlayer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    player_id = models.IntegerField()  # Storing the API's player.id
    position = models.CharField(max_length=10)  # Store the position for easy filtering

    def __str__(self):
        return f"{self.user.username} - Player ID: {self.player_id}"

class NewsArticle(models.Model):
    CATEGORY_CHOICES = [
        ('Football', 'Football'),
        ('Basketball', 'Basketball'),
        ('Cricket', 'Cricket'),
        ('Swimming', 'Swimming'),
        ('Table Tennis', 'Table Tennis'),
        ('Badminton', 'Badminton'),
        ('Volleyball', 'Volleyball'),
        ('Track and Field', 'Track and Field'),
        ('Other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='news_images/')
    body = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    created_at = models.DateTimeField(auto_now_add=True)


class PlayerGamePerformance(models.Model):
    player_id = models.IntegerField()
    fixture_id = models.IntegerField()
    gameweek = models.IntegerField(null=True, blank=True)
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



class TeamGamePerformance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    gameweek = models.IntegerField()

    total_goals = models.IntegerField(default=0)
    total_assists = models.IntegerField(default=0)
    total_clean_sheets = models.IntegerField(default=0)
    total_saves = models.IntegerField(default=0)
    total_yellow_cards = models.IntegerField(default=0)
    total_red_cards = models.IntegerField(default=0)
    total_points = models.IntegerField(default=0)

    forward_goals = models.IntegerField(default=0)
    midfielder_goals = models.IntegerField(default=0)
    defender_clean_sheets = models.IntegerField(default=0)
    goalkeeper_clean_sheets = models.IntegerField(default=0)

    final_points = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'gameweek')


class TeamPrediction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    gameweek = models.IntegerField()

    predicted_forward_goals = models.IntegerField(default=0)
    predicted_midfielder_goals = models.IntegerField(default=0)
    predicted_defender_clean_sheets = models.IntegerField(default=0)
    predicted_goalkeeper_clean_sheets = models.IntegerField(default=0)
    predicted_total_assists = models.IntegerField(default=0)

    multiplier_applied = models.BooleanField(default=False)
    prediction_correct = models.BooleanField(default=False)  # Will be determined after comparison

    class Meta:
        unique_together = ('user', 'gameweek')

    def __str__(self):
        return f"Prediction by {self.user.username} for GW{self.gameweek}"
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    dob = models.DateField()
    phone_number = models.CharField(max_length=10)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    
    SPORTS_CHOICES = [
        ('Football', 'Football'),
        ('Basketball', 'Basketball'),
        ('Cricket', 'Cricket'),
        ('Swimming', 'Swimming'),
        ('Table Tennis', 'Table Tennis'),
        ('Badminton', 'Badminton'),
        ('Volleyball', 'Volleyball'),
        ('Track and Field', 'Track and Field'),
    ]
    favourite_sports = models.JSONField(default=list, blank=True)  # stores selected sports as list of strings

    def __str__(self):
        return f"{self.user.username}'s profile"