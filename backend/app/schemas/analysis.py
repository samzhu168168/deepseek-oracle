from datetime import datetime

from app.utils.errors import validation_error


ALLOWED_GENDERS = {"男", "女"}
ALLOWED_CALENDARS = {"solar", "lunar"}


def validate_analyze_payload(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise validation_error("body", "invalid json body")

    required_fields = ["date", "timezone", "gender", "calendar"]
    for field in required_fields:
        if field not in payload:
            raise validation_error(field, f"missing required field: {field}")

    date_value = payload.get("date")
    try:
        datetime.strptime(str(date_value), "%Y-%m-%d")
    except ValueError as exc:
        raise validation_error("date", "date must match YYYY-MM-DD") from exc

    timezone_value = payload.get("timezone")
    try:
        timezone_value = int(timezone_value)
    except (TypeError, ValueError) as exc:
        raise validation_error("timezone", "timezone must be integer") from exc

    if timezone_value < 0 or timezone_value > 12:
        raise validation_error("timezone", "timezone must be in range 0-12")

    gender_value = str(payload.get("gender"))
    if gender_value not in ALLOWED_GENDERS:
        raise validation_error("gender", "gender must be one of: 男, 女")

    calendar_value = str(payload.get("calendar"))
    if calendar_value not in ALLOWED_CALENDARS:
        raise validation_error("calendar", "calendar must be one of: solar, lunar")

    normalized = {
        "date": str(date_value),
        "timezone": timezone_value,
        "gender": gender_value,
        "calendar": calendar_value,
    }

    provider = payload.get("provider")
    model = payload.get("model")
    prompt_version = payload.get("prompt_version")

    if provider:
        normalized["provider"] = str(provider)
    if model:
        normalized["model"] = str(model)
    if prompt_version:
        normalized["prompt_version"] = str(prompt_version)

    return normalized


def _validate_birth_info(payload: dict, field_prefix: str) -> dict:
    if not isinstance(payload, dict):
        raise validation_error(field_prefix, f"{field_prefix} must be object")

    required_fields = ["date", "timezone", "gender", "calendar"]
    for field in required_fields:
        if field not in payload:
            raise validation_error(field_prefix, f"missing required field: {field_prefix}.{field}")

    date_value = payload.get("date")
    try:
        datetime.strptime(str(date_value), "%Y-%m-%d")
    except ValueError as exc:
        raise validation_error(f"{field_prefix}.date", "date must match YYYY-MM-DD") from exc

    timezone_value = payload.get("timezone")
    try:
        timezone_value = int(timezone_value)
    except (TypeError, ValueError) as exc:
        raise validation_error(f"{field_prefix}.timezone", "timezone must be integer") from exc

    if timezone_value < 0 or timezone_value > 12:
        raise validation_error(f"{field_prefix}.timezone", "timezone must be in range 0-12")

    gender_value = str(payload.get("gender"))
    if gender_value not in ALLOWED_GENDERS:
        raise validation_error(f"{field_prefix}.gender", "gender must be one of: 男, 女")

    calendar_value = str(payload.get("calendar"))
    if calendar_value not in ALLOWED_CALENDARS:
        raise validation_error(f"{field_prefix}.calendar", "calendar must be one of: solar, lunar")

    return {
        "date": str(date_value),
        "timezone": timezone_value,
        "gender": gender_value,
        "calendar": calendar_value,
    }


def validate_bond_payload(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise validation_error("body", "invalid json body")

    person_a = payload.get("person_a")
    person_b = payload.get("person_b")
    if not isinstance(person_a, dict):
        raise validation_error("person_a", "person_a is required")
    if not isinstance(person_b, dict):
        raise validation_error("person_b", "person_b is required")

    birth_a = _validate_birth_info(person_a.get("birth_info"), "person_a.birth_info")
    birth_b = _validate_birth_info(person_b.get("birth_info"), "person_b.birth_info")

    license_key = str(payload.get("license_key") or "").strip()
    if license_key and len(license_key) > 128:
        raise validation_error("license_key", "license_key is too long")

    return {
        "person_a": {"birth_info": birth_a},
        "person_b": {"birth_info": birth_b},
        "license_key": license_key,
    }
