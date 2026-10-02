from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class DataStatus(str, Enum):
    FRESH = "FRESH"
    STALE = "STALE"
    EXPIRED = "EXPIRED"
    UNAVAILABLE = "UNAVAILABLE"


class Confidence(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LIMITED = "LIMITED"


class Provenance(BaseModel):
    source: str = Field(..., min_length=1)
    source_url: Optional[HttpUrl] = None
    source_type: str = Field(..., min_length=1)
    fetched_at: Optional[datetime] = None
    last_verified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    confidence: Confidence = Confidence.LIMITED
    data_status: DataStatus = DataStatus.UNAVAILABLE
