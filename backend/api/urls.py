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
    UserView, 
    calculate_player_game_points, 
    submit_team_prediction, 
    evaluate_prediction, 
    debug_team_performance, 
    fetch_npl_cricket_data,
    fetch_npl_cricket_data,
    fetch_npl_matches,
    fetch_npl_teams,
    fetch_npl_seasons,
    fetch_npl_standings,
    leaderboard_view,
    create_user_profile,
    get_user_profile,
    update_user_profile
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
    path('npl-cricket/', fetch_npl_cricket_data, name='fetch_npl_cricket_data'),
    path('npl-matches/', fetch_npl_matches, name='fetch_npl_matches'),
    path('npl-teams/', fetch_npl_teams, name='fetch_npl_teams'),
    path('npl-seasons/', fetch_npl_seasons, name='fetch_npl_seasons'),
    path('npl-standings/', fetch_npl_standings, name='fetch_npl_standings'),
    path('leaderboard/', leaderboard_view, name='leaderboard'),
    path("create-profile/", create_user_profile, name="create_user_profile"),
    path("get-profile/", get_user_profile, name="get_user_profile"),
    path("update-profile/", update_user_profile, name="update_user_profile"),


]
