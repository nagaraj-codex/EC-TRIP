from fastapi import APIRouter, Cookie, HTTPException, status

from app.api.routes.auth import SESSION_COOKIE
from app.services.auth_store import get_auth_store

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _user_id(session: str | None) -> str:
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required"
        )
    user = get_auth_store().get_user_for_session(session)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid",
        )
    return user["id"]


@router.get("")
def list_notifications(
    queuecut_session: str | None = Cookie(default=None, alias=SESSION_COOKIE),
):
    return {
        "status": "success",
        "data": get_auth_store().list_notifications(_user_id(queuecut_session)),
    }


@router.post("/{notification_id}/read")
def mark_read(
    notification_id: str,
    queuecut_session: str | None = Cookie(default=None, alias=SESSION_COOKIE),
):
    if not get_auth_store().mark_notification_read(
        _user_id(queuecut_session), notification_id
    ):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success", "notification_id": notification_id, "read": True}


@router.post("/read-all")
def mark_all_read(
    queuecut_session: str | None = Cookie(default=None, alias=SESSION_COOKIE),
):
    get_auth_store().mark_all_notifications_read(_user_id(queuecut_session))
    return {"status": "success", "read": True}
