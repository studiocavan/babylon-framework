from django.urls import path
from . import views

urlpatterns = [
    path('health', views.health, name='health'),
    path('status', views.api_status, name='status'),
    path('metrics', views.metrics, name='metrics'),
    path('simulate-block', views.simulate_block, name='simulate-block'),
]
