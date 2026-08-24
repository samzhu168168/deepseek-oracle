from __future__ import annotations

import unittest
import importlib.util
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


def gumroad_response(payload: dict) -> Mock:
    response = Mock()
    response.raise_for_status.return_value = None
    response.json.return_value = payload
    return response


class LicenseVerificationTests(unittest.TestCase):
    def setUp(self):
        self.original_product_id = license_api.GUMROAD_PRODUCT_ID
        license_api.GUMROAD_PRODUCT_ID = EXPECTED_PRODUCT_ID
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


if __name__ == "__main__":
    unittest.main()
