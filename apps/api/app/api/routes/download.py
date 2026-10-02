import json
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel, Field

router = APIRouter(prefix="/download", tags=["Downloads"])


class ExportRequest(BaseModel):
    user: Any = "Guest"
    settings: Dict[str, Any] = Field(default_factory=dict)
    saved_trips: List[Dict[str, Any]] = Field(default_factory=list)


@router.post("/export", response_class=Response)
async def export_user_data(payload: ExportRequest) -> Response:
    """Return a browser-downloadable snapshot of the user's local app data."""
    export_payload = {
        "user": payload.user,
        "settings": payload.settings,
        "saved_trips": payload.saved_trips,
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "app": "QueueCut",
    }
    content = json.dumps(export_payload, ensure_ascii=True, indent=2)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="queuecut-export.json"'},
    )
