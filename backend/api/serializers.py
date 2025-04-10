from django.contrib.auth.models import User
from rest_framework import serializers
from .models import NewsArticle
from .models import PlayerPrediction


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class NewsArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsArticle
        fields = '__all__'


class PlayerPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerPrediction
        fields = '__all__'