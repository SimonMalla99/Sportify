from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import fetch_fpl_data, fetch_fixtures, fetch_players, save_draft, has_team, UserView

urlpatterns = [
    path('fpl-data/', fetch_fpl_data, name='fetch_fpl_data'),
    path('fpl-fixtures/', fetch_fixtures, name='fetch_fixtures'),
    path('fpl-players/', fetch_players, name='fetch_players'),
    path('user/', UserView.as_view(), name='user-detail'),
    path('save-draft/', save_draft, name='save_draft'),
    path("has-team/", has_team, name="has_team"),
    path("user-team/", views.get_user_team),
 
]
