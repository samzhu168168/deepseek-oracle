from __future__ import annotations

import unittest
import importlib.util
import json
import sys
import types
from types import SimpleNamespace
from pathlib import Path
from unittest.mock import Mock, patch

import requests
from flask import Flask

LICENSE_MODULE_PATH = Path(__file__).parents[1] / "app" / "api" / "license.py"
SPEC = importlib.util.spec_from_file_location("elemental_bond_license_api", LICENSE_MODULE_PATH)
license_api = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(license_api)


EXPECTED_PRODUCT_ID = "test-product-id"


VALID_REPORT = {
    "fullAnalysis": "A complete relationship analysis.",
    "palaceReadings": {
        "person1": "Person one reading.",
        "person2": "Person two reading.",
        "combined": "Combined reading.",
    },
    "timingWindows": {
        "q2_2026": "Second-quarter timing.",
        "q3_2026": "Third-quarter timing.",
        "q4_2026": "Fourth-quarter timing.",
    },
    "karmicProtocol": ["A practical relationship step."],
    "elementAdvice": "Element-specific advice.",
}


class ProviderHttpError(Exception):
    def __init__(self, status_code: int):
        super().__init__("provider request failed")
        self.status_code = status_code


def gumroad_response(payload: dict) -> Mock:
    response = Mock()
    response.raise_for_status.return_value = None
    response.json.return_value = payload
    return response


class LicenseVerificationTests(unittest.TestCase):
    def setUp(self):
        self.original_product_id = license_api.GUMROAD_PRODUCT_ID
        license_api.GUMROAD_PRODUCT_ID = EXPECTED_PRODUCT_ID
        license_api._report_cache.clear()
        app = Flask(__name__)
        app.register_blueprint(license_api.license_bp)
        app.config.update(TESTING=True)
        self.client = app.test_client()

    def tearDown(self):
        license_api.GUMROAD_PRODUCT_ID = self.original_product_id

    def test_empty_license_key_fails(self):
        response = self.client.post("/api/verify-license", json={"license_key": ""})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.get_json()["success"])

    @patch.object(license_api.requests, "post")
    def test_invalid_license_key_fails(self, post):
        post.return_value = gumroad_response({"success": False})
        response = self.client.post("/api/verify-license", json={"license_key": "invalid"})
        self.assertEqual(response.get_json()["error_code"], "invalid_license")

    @patch.object(license_api.requests, "post", side_effect=requests.Timeout())
    def test_api_timeout_fails_gracefully(self, _post):
        response = self.client.post("/api/verify-license", json={"license_key": "unavailable"})
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.get_json()["error_code"], "verification_unavailable")

    @patch.object(license_api.requests, "post")
    def test_refunded_or_disputed_purchase_fails(self, post):
        for revoked_field in ("refunded", "disputed", "chargebacked"):
            with self.subTest(revoked_field=revoked_field):
                post.return_value = gumroad_response({
                    "success": True,
                    "purchase": {"product_id": EXPECTED_PRODUCT_ID, revoked_field: True},
                })
                response = self.client.post("/api/verify-license", json={"license_key": "revoked"})
                self.assertEqual(response.get_json()["error_code"], "purchase_revoked")

    @patch.object(license_api.requests, "post")
    def test_valid_purchase_passes_without_incrementing_uses(self, post):
        post.return_value = gumroad_response({
            "success": True,
            "purchase": {
                "id": "purchase-id",
                "product_id": EXPECTED_PRODUCT_ID,
                "refunded": False,
                "disputed": False,
                "chargebacked": False,
            },
        })
        response = self.client.post("/api/verify-license", json={"license_key": "valid"})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["success"])
        self.assertEqual(post.call_args.kwargs["data"]["increment_uses_count"], "false")

    @patch.object(license_api, "_generate_report_text", return_value=json.dumps(VALID_REPORT))
    @patch.object(license_api, "_verify_gumroad_license", return_value=(True, "", {"id": "purchase-id"}))
    def test_valid_license_generates_and_unlocks_report(self, _verify, _generate):
        response = self.client.post("/api/generate-full-report", json=self._report_request())
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["success"])
        self.assertEqual(response.get_json()["report"], VALID_REPORT)

    @patch.object(license_api, "_generate_report_text", side_effect=TimeoutError("private timeout detail"))
    @patch.object(license_api, "_verify_gumroad_license", return_value=(True, "", {}))
    def test_provider_timeout_fails_gracefully(self, _verify, _generate):
        response = self.client.post("/api/generate-full-report", json=self._report_request())
        self.assertEqual(response.status_code, 504)
        self.assertEqual(response.get_json()["error_code"], "provider_timeout")
        self.assertNotIn("private timeout detail", response.get_data(as_text=True))

    @patch.object(license_api, "_verify_gumroad_license", return_value=(True, "", {}))
    def test_provider_authentication_failure_is_safe(self, _verify):
        for status_code in (401, 403):
            with self.subTest(status_code=status_code):
                with patch.object(license_api, "_generate_report_text", side_effect=ProviderHttpError(status_code)):
                    response = self.client.post("/api/generate-full-report", json=self._report_request())
                    self.assertEqual(response.status_code, 502)
                    self.assertEqual(response.get_json()["error_code"], "provider_authentication_failed")
                    self.assertNotIn("provider request failed", response.get_data(as_text=True))

    @patch.object(license_api, "_generate_report_text", side_effect=ProviderHttpError(429))
    @patch.object(license_api, "_verify_gumroad_license", return_value=(True, "", {}))
    def test_provider_rate_limit_fails_gracefully(self, _verify, _generate):
        response = self.client.post("/api/generate-full-report", json=self._report_request())
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.get_json()["error_code"], "provider_rate_limited")

    @patch.object(license_api, "_generate_report_text", return_value="")
    @patch.object(license_api, "_verify_gumroad_license", return_value=(True, "", {}))
    def test_empty_provider_response_fails_gracefully(self, _verify, _generate):
        response = self.client.post("/api/generate-full-report", json=self._report_request())
        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.get_json()["error_code"], "invalid_provider_response")

    @patch.object(license_api, "_generate_report_text", return_value="not json")
    @patch.object(license_api, "_verify_gumroad_license", return_value=(True, "", {}))
    def test_malformed_provider_response_fails_gracefully(self, _verify, _generate):
        response = self.client.post("/api/generate-full-report", json=self._report_request())
        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.get_json()["error_code"], "invalid_provider_response")

    @staticmethod
    def _report_request():
        return {
            "license_key": "fixture-license",
            "person1": {"date": "1990-01-01", "time": "08:00", "gender": "Unknown"},
            "person2": {"date": "1992-02-02", "time": "09:00", "gender": "Unknown"},
            "score": 75,
            "element_pair": "Water-Wood",
        }

class FallbackProviderTests(unittest.TestCase):
    def test_primary_failure_uses_configured_fallback(self):
        package = types.ModuleType("audit_llm")
        package.__path__ = []
        base = types.ModuleType("audit_llm.base")

        class BaseLLMProvider:
            def __init__(self, model: str):
                self.model = model

        base.BaseLLMProvider = BaseLLMProvider
        base.LLMResult = object
        base.ToolChatResult = object
        sys.modules["audit_llm"] = package
        sys.modules["audit_llm.base"] = base

        fallback_path = Path(__file__).parents[1] / "app" / "llm_providers" / "fallback.py"
        spec = importlib.util.spec_from_file_location("audit_llm.fallback", fallback_path)
        module = importlib.util.module_from_spec(spec)
        assert spec and spec.loader
        spec.loader.exec_module(module)

        primary = SimpleNamespace(model="primary-model")
        primary.generate = Mock(side_effect=RuntimeError("primary failed"))
        fallback = SimpleNamespace(model="fallback-model")
        fallback.generate = Mock(return_value=SimpleNamespace(fallback_used=False))

        provider = module.FallbackProvider(primary=primary, fallback=fallback)
        result = provider.generate("prompt", timeout_s=60)

        self.assertTrue(result.fallback_used)
        primary.generate.assert_called_once_with("prompt", 60)
        fallback.generate.assert_called_once_with("prompt", 60)


if __name__ == "__main__":
    unittest.main()
