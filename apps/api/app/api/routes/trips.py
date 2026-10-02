from fastapi import APIRouter, Cookie, HTTPException, status

from app.api.routes.auth import SESSION_COOKIE
from app.schemas.trips import TripCreateRequest
from app.services.auth_store import get_auth_store

router = APIRouter(prefix="/trips", tags=["Saved Trips"])


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
def list_trips(
    queuecut_session: str | None = Cookie(default=None, alias=SESSION_COOKIE),
):
    return {
        "status": "success",
        "data": get_auth_store().list_trips(_user_id(queuecut_session)),
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreateRequest,
    queuecut_session: str | None = Cookie(default=None, alias=SESSION_COOKIE),
):
    trip = get_auth_store().create_trip(
        _user_id(queuecut_session), payload.park_id, payload.visit_date, payload.payload
    )
    return {"status": "success", "data": trip}


@router.delete("/{trip_id}")
def delete_trip(
    trip_id: str,
    queuecut_session: str | None = Cookie(default=None, alias=SESSION_COOKIE),
):
    if not get_auth_store().delete_trip(_user_id(queuecut_session), trip_id):
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"status": "success", "trip_id": trip_id}
