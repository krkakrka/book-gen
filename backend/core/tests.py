# Requires a local Postgres instance reachable via the POSTGRES_* env vars
# (see .env.example) — Django creates/drops a throwaway test database against
# that same server, per project convention of not mocking the DB.
from rest_framework import status
from rest_framework.test import APITestCase


class HealthCheckTests(APITestCase):
    def test_health_check_returns_ok(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok"})
