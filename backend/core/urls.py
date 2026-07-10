from django.urls import include, path

from . import views

urlpatterns = [
    path("health/", views.health_check, name="health-check"),
    path("", include("books.urls")),
]
