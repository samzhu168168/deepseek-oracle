from flask import Blueprint, request

from app.services import get_analysis_service, get_divination_service
from app.utils.errors import validation_error
from app.utils.response import success_response


history_bp = Blueprint("history", __name__)


@history_bp.get("/history")
def get_history():
    try:
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("page_size", 20))
    except ValueError as exc:
        raise validation_error("page", "page and page_size must be integer") from exc

    service = get_analysis_service()
    data = service.get_history(
        page=page,
        page_size=page_size,
        user_id=0,
        is_admin=False,
    )
    return success_response(data=data)


@history_bp.get("/result/<int:result_id>")
def get_result(result_id: int):
    service = get_analysis_service()
    data = service.get_result(
        result_id,
        user_id=0,
        is_admin=False,
    )
    return success_response(data=data)


@history_bp.get("/result/<int:result_id>/<analysis_type>")
def get_result_item(result_id: int, analysis_type: str):
    service = get_analysis_service()
    data = service.get_result_item(
        result_id=result_id,
        analysis_type=analysis_type,
        user_id=0,
        is_admin=False,
    )
    return success_response(data=data)


@history_bp.get("/history/divinations")
def get_divination_history():
    try:
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("page_size", 20))
    except ValueError as exc:
        raise validation_error("page", "page and page_size must be integer") from exc

    divination_type = str(request.args.get("type", "")).strip().lower()
    if divination_type not in {"", "all", "ziwei", "meihua"}:
        raise validation_error("type", "type must be all/ziwei/meihua")
    if divination_type == "all":
        divination_type = ""

    data = get_divination_service().list_records(
        user_id=0,
        page=page,
        page_size=page_size,
        divination_type=divination_type or None,
    )
    return success_response(data=data)


@history_bp.get("/history/divinations/<int:record_id>")
def get_divination_history_detail(record_id: int):
    data = get_divination_service().get_record(
        record_id=record_id,
        user_id=0,
        is_admin=False,
    )
    return success_response(data=data)
