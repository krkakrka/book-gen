from django.urls import include, path

from . import views

urlpatterns = [
    path("health/", views.health_check, name="health-check"),
    path("auth/login/", views.login_view, name="auth-login"),
    path("auth/logout/", views.logout_view, name="auth-logout"),
    path("", include("books.urls")),
]
