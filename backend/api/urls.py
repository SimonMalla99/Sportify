from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    fetch_fpl_data,
    fetch_fixtures,
    fetch_players,
    save_draft,
    has_team,
    NewsArticleView, NewsArticleDetail,
    UserView, calculate_player_game_points, submit_team_prediction, evaluate_prediction, debug_team_performance
)

urlpatterns = [
    path('fpl-data/', fetch_fpl_data, name='fetch_fpl_data'),
    path('fpl-fixtures/', fetch_fixtures, name='fetch_fixtures'),
    path('fpl-players/', fetch_players, name='fetch_players'),
    path('user/', UserView.as_view(), name='user-detail'),
    path('save-draft/', save_draft, name='save_draft'),
    path('has-team/', has_team, name='has_team'),
    path('user-team/', views.get_user_team),
    path('news/', NewsArticleView.as_view(), name='news-article'),
    path('custom-points/', calculate_player_game_points),
    path('team-performance/', views.calculate_team_game_performance),
    path("submit-prediction/", submit_team_prediction, name="submit_team_prediction"),
    path("evaluate-prediction/", evaluate_prediction, name="evaluate_prediction"),
    path("debug-team-performance/", debug_team_performance),
    path('news/<int:pk>/', NewsArticleDetail.as_view(), name='news-detail'),

]
