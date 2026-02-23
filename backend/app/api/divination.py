from flask import Blueprint, request

from app.schemas.divination import validate_meihua_divination_payload, validate_ziwei_divination_payload
from app.services import get_divination_service
from app.utils.response import success_response


divination_bp = Blueprint("divination", __name__)


@divination_bp.post("/divination/ziwei")
def ziwei_divination():
    payload = request.get_json(silent=True) or {}
    normalized = validate_ziwei_divination_payload(payload)
    service = get_divination_service()
    data = service.run_ziwei(normalized)
    record_id = service.save_ziwei_record(
        user_id=0,
        payload=normalized,
        result=data,
    )
    data["record_id"] = record_id
    return success_response(data=data)


@divination_bp.post("/divination/meihua")
def meihua_divination():
    payload = request.get_json(silent=True) or {}
    normalized = validate_meihua_divination_payload(payload)
    service = get_divination_service()
    data = service.run_meihua(normalized)
    record_id = service.save_meihua_record(
        user_id=0,
        payload=normalized,
        result=data,
    )
    data["record_id"] = record_id
    return success_response(data=data)
