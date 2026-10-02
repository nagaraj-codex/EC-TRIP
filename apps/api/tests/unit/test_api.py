import unittest
import sys
import os
import uuid

# Ensure apps/api is in sys.path
api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings


class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")

    def test_news_reports_unavailable_without_provider(self):
        response = self.client.get("/api/v1/news")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "UNAVAILABLE")
        self.assertEqual(response.json()["data"], [])

    def test_google_status_does_not_fake_configuration(self):
        response = self.client.get("/api/v1/auth/google/status")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["configured"])
        self.assertEqual(response.json()["status"], "UNAVAILABLE")

    def test_root(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("QueueCut", response.json()["message"])

    def test_pricing_single_source_of_truth(self):
        self.assertIn("wonderla-chennai", settings.PARK_PRICING)
        self.assertEqual(settings.PARK_PRICING["wonderla-chennai"]["weekday"], 1312.0)
        self.assertEqual(settings.PARK_PRICING["wonderla-chennai"]["weekend"], 1549.0)

    def test_get_all_parks(self):
        response = self.client.get("/api/v1/parks")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIsInstance(data["data"], list)
        self.assertIn("provenance", data["data"][0])
        self.assertIn(
            data["data"][0]["provenance"]["data_status"],
            [
                "FRESH",
                "STALE",
                "EXPIRED",
                "UNAVAILABLE",
            ],
        )

    def test_database_and_cors_defaults_are_safe(self):
        self.assertEqual(settings.DATABASE_URL, "sqlite:///./queuecut.db")
        self.assertNotIn("*", settings.CORS_ORIGINS)

    def test_email_auth_register_session_and_logout(self):
        email = f"queuecut-{uuid.uuid4().hex}@example.com"
        register = self.client.post(
            "/api/v1/auth/register",
            json={
                "name": "QueueCut Tester",
                "email": email,
                "password": "correct-horse-battery",
            },
        )
        self.assertEqual(register.status_code, 201)
        self.assertIn("queuecut_session", register.cookies)

        current = self.client.get("/api/v1/auth/me")
        self.assertEqual(current.status_code, 200)
        self.assertEqual(current.json()["user"]["email"], email)

        logout = self.client.post("/api/v1/auth/logout")
        self.assertEqual(logout.status_code, 204)
        self.assertEqual(self.client.get("/api/v1/auth/me").status_code, 401)

    def test_email_auth_rejects_invalid_password(self):
        email = f"queuecut-{uuid.uuid4().hex}@example.com"
        self.client.post(
            "/api/v1/auth/register",
            json={
                "name": "QueueCut Tester",
                "email": email,
                "password": "correct-horse-battery",
            },
        )
        self.client.post("/api/v1/auth/logout")
        login = self.client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "wrong-password"},
        )
        self.assertEqual(login.status_code, 401)

    def test_trips_require_authentication_and_persist_for_user(self):
        guest_response = self.client.get("/api/v1/trips")
        self.assertEqual(guest_response.status_code, 401)

        email = f"queuecut-{uuid.uuid4().hex}@example.com"
        register = self.client.post(
            "/api/v1/auth/register",
            json={
                "name": "Trip Tester",
                "email": email,
                "password": "correct-horse-battery",
            },
        )
        self.assertEqual(register.status_code, 201)
        created = self.client.post(
            "/api/v1/trips",
            json={
                "park_id": "wonderla-chennai",
                "visit_date": "2026-10-01",
                "payload": {"priority": "thrill"},
            },
        )
        self.assertEqual(created.status_code, 201)
        listed = self.client.get("/api/v1/trips")
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.json()["data"][0]["park_id"], "wonderla-chennai")
        self.client.post("/api/v1/auth/logout")

    def test_get_specific_park(self):
        response = self.client.get("/api/v1/parks/wonderla-chennai")
        self.assertIn(response.status_code, [200, 404])
        if response.status_code == 200:
            data = response.json()
            self.assertEqual(data["status"], "success")
            self.assertIn("data", data)

    def test_get_nonexistent_park(self):
        response = self.client.get("/api/v1/parks/nonexistent-park-id")
        self.assertEqual(response.status_code, 404)

    def test_telemetry_weather(self):
        response = self.client.get("/api/v1/telemetry/weather?park_id=wonderla-chennai")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("weather", data)
        self.assertIn("solar_uv", data)

    def test_telemetry_commute(self):
        response = self.client.get(
            "/api/v1/telemetry/commute?park_id=wonderla-chennai&origin_city=Chennai"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("distance_km", data)
        self.assertIn("estimated_fuel_cost_inr", data)

    def test_itinerary_generation(self):
        payload = {
            "park_id": "wonderla-chennai",
            "visit_date": "2026-09-08",
            "priority": "Best Balanced",
        }
        response = self.client.post("/api/v1/itinerary/generate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["park_id"], "wonderla-chennai")
        self.assertTrue(len(data["timeline"]) >= 4)

    def test_feedback_report_and_rate_limiting(self):
        payload = {
            "park_id": "wonderla-chennai",
            "visit_date": "2026-09-06",
            "observed_crowd": "low",
            "observed_wait_top_ride_minutes": 15,
            "fasttrack_purchased": False,
            "user_lat": 12.75,
            "user_lon": 80.19,
        }
        response = self.client.post("/api/v1/feedback/report", json=payload)
        self.assertIn(response.status_code, [200, 429])
        if response.status_code == 200:
            self.assertEqual(response.json()["status"], "success")

    def test_chat_advisor(self):
        payload = {
            "prompt": "What is the best time to visit Wonderla?",
            "context": {"park_id": "wonderla-chennai"},
        }
        response = self.client.post("/api/v1/chat/ask", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("response", response.json())

    def test_download_export(self):
        response = self.client.post(
            "/api/v1/download/export",
            json={"user": "Guest", "settings": {"preferredPark": "wonderla-chennai"}},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("attachment", response.headers["content-disposition"])
        self.assertEqual(
            response.json()["settings"]["preferredPark"], "wonderla-chennai"
        )

    def test_recommendation_flow_and_confidence(self):
        payload = {
            "park_id": "wonderla-chennai",
            "candidate_dates": ["2026-09-08", "2026-09-09"],
            "priority": "Best Balanced",
        }
        response = self.client.post("/api/v1/recommendation/recommend", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["park_id"], "wonderla-chennai")
        self.assertEqual(len(data["evaluations"]), 2)
        for ev in data["evaluations"]:
            self.assertIn(ev["confidence"], ["High", "Medium", "Low"])
            self.assertTrue(len(ev["reasoning"]) > 5)

    def test_cache_service(self):
        import asyncio
        from app.services.cache import get_cache, set_cache

        async def run_cache_test():
            await set_cache("test_unit_key", {"status": "ok", "value": 42}, ttl=60)
            cached = await get_cache("test_unit_key")
            return cached

        result = asyncio.run(run_cache_test())
        self.assertIsNotNone(result)
        self.assertEqual(result.get("value"), 42)

    def test_telemetry_alert_endpoint(self):
        response = self.client.post(
            "/api/v1/telemetry/trigger-alert?message=Test+Live+Alert"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "broadcast_complete")
        self.assertIn("recipients_count", data)


if __name__ == "__main__":
    unittest.main()
