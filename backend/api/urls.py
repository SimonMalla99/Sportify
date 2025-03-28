from django.urls import path
from . import views
from .views import fetch_fpl_data
from .views import fetch_fixtures
from .views import fetch_players

urlpatterns = [
    path('fpl-data/', fetch_fpl_data, name='fetch_fpl_data'),
    path('fpl-fixtures/', fetch_fixtures, name='fetch_fixtures'),
    path('fpl-players/', fetch_players),
]
