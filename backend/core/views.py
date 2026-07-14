from django.contrib.auth import authenticate, login, logout
from django.db import connection
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .serializers import LoginSerializer


@api_view(["GET"])
def health_check(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return Response({"status": "ok"})


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = authenticate(
        request,
        username=serializer.validated_data["email"],
        password=serializer.validated_data["password"],
    )
    if user is None:
        return Response({"detail": "Invalid credentials."}, status=400)
    login(request, user)
    return Response({"email": user.email})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response(status=204)


@api_view(["GET"])
@permission_classes([AllowAny])
def session_view(request):
    # Manual check (rather than permission_classes=[IsAuthenticated]) so an
    # anonymous request gets a clean 401 instead of DRF's usual 403 fallback
    # (see logout_view/core/tests.py for why SessionAuthentication yields 403).
    if not request.user.is_authenticated:
        return Response(status=401)
    return Response({"email": request.user.email})


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_view(request):
    return Response({"detail": get_token(request)})
