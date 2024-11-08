from django.urls import path
from .views import hello_world

urlpatterns = [
    path('hello/', hello_world),  # This should point to the `hello_world` view
]