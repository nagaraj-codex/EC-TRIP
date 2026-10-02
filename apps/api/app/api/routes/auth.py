from datetime import datetime, timedelta, timezone
import sqlite3
import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Cookie, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse

from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.core.config import settings
from app.services.auth_store import get_auth_store

router = APIRouter(prefix="/auth", tags=["Authentication"])
SESSION_COOKIE = "queuecut_session"
SESSION_DAYS = 7
OAUTH_STATE_COOKIE = "queuecut_google_oauth_state"


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite="lax",
        path="/",
    )


@router.post(
    "/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED
)
def register(payload: RegisterRequest, response: Response) -> AuthResponse:
    store = get_auth_store()
    try:
        user = store.create_user(payload.name, str(payload.email), payload.password)
    except sqlite3.IntegrityError as exc:
        raise HTTPException(
            status_code=409, detail="An account with that email already exists"
        ) from exc
    token = store.create_session(
        user["id"],
        (datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)).isoformat(),
    )
    _set_session_cookie(response, token)
    return AuthResponse(user=UserResponse(**user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response) -> AuthResponse:
    user = get_auth_store().authenticate(str(payload.email), payload.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = get_auth_store().create_session(
        user["id"],
        (datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)).isoformat(),
    )
    _set_session_cookie(response, token)
    return AuthResponse(user=UserResponse(**user))


@router.get("/me", response_model=AuthResponse)
def current_user(
    queuecut_session: str | None = Cookie(default=None, alias=SESSION_COOKIE),
) -> AuthResponse:
    if not queuecut_session:
        raise HTTPException(status_code=401, detail="Authentication required")
    user = get_auth_store().get_user_for_session(queuecut_session)
    if user is None:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    return AuthResponse(user=UserResponse(**user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    queuecut_session: str | None = Cookie(default=None, alias=SESSION_COOKIE),
) -> Response:
    if queuecut_session:
        get_auth_store().revoke_session(queuecut_session)
    response.delete_cookie(SESSION_COOKIE, path="/")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/google/status")
def google_status():
    configured = bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)
    return {
        "configured": configured,
        "status": "AVAILABLE" if configured else "UNAVAILABLE",
        "prompt": "select_account" if configured else None,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI if configured else None,
    }


@router.get("/google/login")
def google_login():
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured")
    state = secrets.token_urlsafe(32)
    query = urlencode(
        {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "prompt": "select_account",
        }
    )
    response = RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}")
    response.set_cookie(
        OAUTH_STATE_COOKIE,
        state,
        max_age=600,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite="lax",
        path="/",
    )
    return response


@router.get("/google/callback", response_model=AuthResponse)
async def google_callback(
    request: Request,
    response: Response,
    code: str | None = None,
    state: str | None = None,
):
    expected_state = request.cookies.get(OAUTH_STATE_COOKIE)
    if (
        not code
        or not state
        or not expected_state
        or not secrets.compare_digest(state, expected_state)
    ):
        raise HTTPException(
            status_code=400, detail="Invalid or expired Google OAuth state"
        )
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured")
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )
            token_response.raise_for_status()
            id_token = token_response.json().get("id_token")
            if not id_token:
                raise ValueError("Google did not return an ID token")
            identity_response = await client.get(
                "https://oauth2.googleapis.com/tokeninfo", params={"id_token": id_token}
            )
            identity_response.raise_for_status()
            identity = identity_response.json()
        if identity.get("aud") != settings.GOOGLE_CLIENT_ID or identity.get(
            "email_verified"
        ) not in {True, "true"}:
            raise ValueError("Google identity validation failed")
        user = get_auth_store().get_or_create_external_user(
            identity.get("name", ""), identity["email"], "google"
        )
        token = get_auth_store().create_session(
            user["id"],
            (datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)).isoformat(),
        )
        _set_session_cookie(response, token)
        response.delete_cookie(OAUTH_STATE_COOKIE, path="/")
        return AuthResponse(user=UserResponse(**user))
    except (httpx.HTTPError, KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=502, detail="Google sign-in could not be verified"
        ) from exc
