from typing import Any

from pydantic import BaseModel, Field


class TripCreateRequest(BaseModel):
    park_id: str = Field(min_length=1, max_length=120)
    visit_date: str = Field(min_length=10, max_length=10)
    payload: dict[str, Any] = Field(default_factory=dict)


class TripResponse(TripCreateRequest):
    id: str
    created_at: str | None = None
