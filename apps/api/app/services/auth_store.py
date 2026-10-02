import hashlib
import hmac
import os
import secrets
import sqlite3
import json
from contextlib import closing
from pathlib import Path
from typing import Any

from app.core.config import settings


class AuthStore:
    def __init__(self) -> None:
        self.database_path = self._database_path()
        self._initialize()

    def _database_path(self) -> str:
        if not settings.DATABASE_URL.startswith("sqlite:///"):
            raise RuntimeError("The local auth store requires a SQLite DATABASE_URL")
        relative_path = settings.DATABASE_URL.removeprefix("sqlite:///")
        path = Path(relative_path)
        if not path.is_absolute():
            path = Path.cwd() / path
        path.parent.mkdir(parents=True, exist_ok=True)
        return str(path)

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with closing(self._connect()) as connection:
            with connection:
                connection.executescript(
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL UNIQUE,
                        password_hash TEXT NOT NULL,
                        created_at TEXT NOT NULL
                    );
                    CREATE TABLE IF NOT EXISTS sessions (
                        token_hash TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        expires_at TEXT NOT NULL,
                        FOREIGN KEY(user_id) REFERENCES users(id)
                    );
                    CREATE TABLE IF NOT EXISTS trips (
                        id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        park_id TEXT NOT NULL,
                        visit_date TEXT NOT NULL,
                        payload TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        FOREIGN KEY(user_id) REFERENCES users(id)
                    );
                    CREATE TABLE IF NOT EXISTS notifications (
                        id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        title TEXT NOT NULL,
                        message TEXT NOT NULL,
                        notification_type TEXT NOT NULL,
                        read INTEGER NOT NULL DEFAULT 0,
                        created_at TEXT NOT NULL,
                        FOREIGN KEY(user_id) REFERENCES users(id)
                    );
                    """
                )

    @staticmethod
    def _hash_password(password: str, salt: bytes | None = None) -> str:
        salt = salt or os.urandom(16)
        digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
        return f"scrypt${salt.hex()}${digest.hex()}"

    @staticmethod
    def _verify_password(password: str, encoded: str) -> bool:
        try:
            _, salt_hex, digest_hex = encoded.split("$", 2)
            candidate = hashlib.scrypt(
                password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1
            )
            return hmac.compare_digest(candidate.hex(), digest_hex)
        except (ValueError, TypeError):
            return False

    def create_user(self, name: str, email: str, password: str) -> dict[str, Any]:
        user_id = f"usr_{secrets.token_urlsafe(12)}"
        normalized_email = email.lower()
        with closing(self._connect()) as connection:
            with connection:
                connection.execute(
                    "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
                    (
                        user_id,
                        name.strip(),
                        normalized_email,
                        self._hash_password(password),
                    ),
                )
        return {
            "id": user_id,
            "name": name.strip(),
            "email": normalized_email,
            "provider": "email",
        }

    def authenticate(self, email: str, password: str) -> dict[str, Any] | None:
        with closing(self._connect()) as connection:
            with connection:
                row = connection.execute(
                    "SELECT id, name, email, password_hash FROM users WHERE email = ?",
                    (email.lower(),),
                ).fetchone()
        if row is None or not self._verify_password(password, row["password_hash"]):
            return None
        return {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "provider": "email",
        }

    def get_or_create_external_user(
        self, name: str, email: str, provider: str
    ) -> dict[str, Any]:
        normalized_email = email.lower()
        with closing(self._connect()) as connection:
            row = connection.execute(
                "SELECT id, name, email FROM users WHERE email = ?", (normalized_email,)
            ).fetchone()
            if row is None:
                user_id = f"usr_{secrets.token_urlsafe(12)}"
                connection.execute(
                    "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
                    (
                        user_id,
                        name.strip() or normalized_email.split("@")[0],
                        normalized_email,
                        self._hash_password(secrets.token_urlsafe(32)),
                    ),
                )
                return {
                    "id": user_id,
                    "name": name.strip() or normalized_email.split("@")[0],
                    "email": normalized_email,
                    "provider": provider,
                }
        return {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "provider": provider,
        }

    def create_session(self, user_id: str, expires_at: str) -> str:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        with closing(self._connect()) as connection:
            with connection:
                connection.execute(
                    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
                    (token_hash, user_id, expires_at),
                )
        return token

    def get_user_for_session(self, token: str) -> dict[str, Any] | None:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        with closing(self._connect()) as connection:
            with connection:
                row = connection.execute(
                    """
                    SELECT users.id, users.name, users.email
                    FROM sessions JOIN users ON users.id = sessions.user_id
                    WHERE sessions.token_hash = ? AND sessions.expires_at > datetime('now')
                    """,
                    (token_hash,),
                ).fetchone()
        if row is None:
            return None
        return {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "provider": "email",
        }

    def revoke_session(self, token: str) -> None:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        with closing(self._connect()) as connection:
            with connection:
                connection.execute(
                    "DELETE FROM sessions WHERE token_hash = ?", (token_hash,)
                )

    def create_trip(
        self, user_id: str, park_id: str, visit_date: str, payload: dict[str, Any]
    ) -> dict[str, Any]:
        trip_id = f"trip_{secrets.token_urlsafe(12)}"
        with closing(self._connect()) as connection:
            with connection:
                connection.execute(
                    "INSERT INTO trips (id, user_id, park_id, visit_date, payload, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
                    (trip_id, user_id, park_id, visit_date, json.dumps(payload)),
                )
        return {
            "id": trip_id,
            "user_id": user_id,
            "park_id": park_id,
            "visit_date": visit_date,
            "payload": payload,
        }

    def list_trips(self, user_id: str) -> list[dict[str, Any]]:
        with closing(self._connect()) as connection:
            rows = connection.execute(
                "SELECT id, park_id, visit_date, payload, created_at FROM trips WHERE user_id = ? ORDER BY created_at DESC",
                (user_id,),
            ).fetchall()
        return [
            {
                "id": row["id"],
                "park_id": row["park_id"],
                "visit_date": row["visit_date"],
                "payload": json.loads(row["payload"]),
                "created_at": row["created_at"],
            }
            for row in rows
        ]

        def delete_trip(self, user_id: str, trip_id: str) -> bool:
            with closing(self._connect()) as connection:
                with connection:
                    cursor = connection.execute(
                        "DELETE FROM trips WHERE id = ? AND user_id = ?",
                        (trip_id, user_id),
                    )
            return cursor.rowcount > 0

    def list_notifications(self, user_id: str) -> list[dict[str, Any]]:
        with closing(self._connect()) as connection:
            rows = connection.execute(
                "SELECT id, title, message, notification_type, read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
                (user_id,),
            ).fetchall()
        return [dict(row) | {"read": bool(row["read"])} for row in rows]

    def mark_notification_read(self, user_id: str, notification_id: str) -> bool:
        with closing(self._connect()) as connection:
            with connection:
                cursor = connection.execute(
                    "UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?",
                    (notification_id, user_id),
                )
        return cursor.rowcount > 0

    def mark_all_notifications_read(self, user_id: str) -> None:
        with closing(self._connect()) as connection:
            with connection:
                connection.execute(
                    "UPDATE notifications SET read = 1 WHERE user_id = ?", (user_id,)
                )


_auth_store: AuthStore | None = None


def get_auth_store() -> AuthStore:
    global _auth_store
    if _auth_store is None:
        _auth_store = AuthStore()
    return _auth_store
