# Requires a local Postgres instance reachable via the POSTGRES_* env vars
# (see .env.example) — Django creates/drops a throwaway test database against
# that same server, per project convention of not mocking the DB.
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

DEV_USER_EMAIL = "parent@home.com"
DEV_USER_PASSWORD = "storyseed-dev"


class HealthCheckTests(APITestCase):
    def test_health_check_returns_ok(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok"})


class DevUserSeedTests(TestCase):
    """0001_seed_dev_user creates the single dev login, keyed by email as username."""

    def test_exactly_one_dev_user_seeded(self):
        User = get_user_model()
        self.assertEqual(User.objects.count(), 1)
        user = User.objects.get()
        self.assertEqual(user.username, DEV_USER_EMAIL)
        self.assertEqual(user.email, DEV_USER_EMAIL)
        self.assertTrue(user.check_password(DEV_USER_PASSWORD))


class LoginTests(APITestCase):
    def test_login_with_valid_credentials_returns_200_and_sets_session_cookie(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": DEV_USER_EMAIL, "password": DEV_USER_PASSWORD},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"email": DEV_USER_EMAIL})
        self.assertIn("sessionid", response.cookies)

    def test_login_with_wrong_password_returns_400(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": DEV_USER_EMAIL, "password": "not-the-password"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"detail": "Invalid credentials."})
        self.assertNotIn("sessionid", response.cookies)

    def test_login_with_unknown_email_returns_400(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": "nobody@home.com", "password": DEV_USER_PASSWORD},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"detail": "Invalid credentials."})
        self.assertNotIn("sessionid", response.cookies)

    def test_login_missing_password_returns_400(self):
        response = self.client.post(
            "/api/auth/login/", {"email": DEV_USER_EMAIL}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)


class LogoutTests(APITestCase):
    # DRF's IsAuthenticated coerces 401 -> 403 whenever the first configured
    # authenticator (SessionAuthentication, here) has no WWW-Authenticate
    # header to offer — see APIView.handle_exception. That's the real,
    # documented behavior with this project's (default) DRF auth classes.
    def test_logout_after_login_returns_204_and_clears_session(self):
        login_response = self.client.post(
            "/api/auth/login/",
            {"email": DEV_USER_EMAIL, "password": DEV_USER_PASSWORD},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        response = self.client.post("/api/auth/logout/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.post("/api/auth/logout/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_logout_while_not_logged_in_returns_403(self):
        response = self.client.post("/api/auth/logout/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class CsrfTokenTests(APITestCase):
    def test_csrf_endpoint_returns_200_and_sets_csrf_cookie(self):
        response = self.client.get("/api/auth/csrf/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("csrftoken", response.cookies)
        self.assertTrue(response.cookies["csrftoken"].value)

    def test_csrf_cookie_satisfies_csrf_middleware_on_subsequent_unsafe_request(self):
        # Default APITestCase client has enforce_csrf_checks=False, which would
        # let an unsafe request through even with a missing/wrong CSRF token —
        # use an explicit client with enforcement on so this test actually
        # proves the cookie round-trip works against CsrfViewMiddleware.
        client = APIClient(enforce_csrf_checks=True)

        client.get("/api/auth/csrf/")

        login_response = client.post(
            "/api/auth/login/",
            {"email": DEV_USER_EMAIL, "password": DEV_USER_PASSWORD},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        # login() rotates the CSRF token, so read the cookie again post-login
        # rather than reusing the value fetched before authenticating.
        csrf_token = client.cookies["csrftoken"].value
        logout_response = client.post(
            "/api/auth/logout/", HTTP_X_CSRFTOKEN=csrf_token
        )
        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)


class CorsHeadersTests(APITestCase):
    def test_allowed_origin_receives_cors_headers(self):
        response = self.client.get(
            "/api/health/", HTTP_ORIGIN="http://localhost:3000"
        )
        self.assertEqual(
            response["Access-Control-Allow-Origin"], "http://localhost:3000"
        )
        self.assertEqual(response["Access-Control-Allow-Credentials"], "true")
