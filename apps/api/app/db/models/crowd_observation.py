import uuid
from sqlalchemy import Column, String, Float, Boolean, Integer, Date, DateTime, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from .park import Base
import enum

class CrowdLevelEnum(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    very_high = "very_high"

class CrowdObservation(Base):
    __tablename__ = "crowd_observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    visit_date = Column(Date, nullable=False)
    park_id = Column(String, ForeignKey("parks.id"), nullable=False, index=True)
    day_type = Column(String, nullable=False) # 'weekday', 'weekend', 'holiday'
    is_school_vacation = Column(Boolean, nullable=False, default=False)
    weather_condition = Column(String, nullable=False) # 'sunny', 'cloudy', 'light_rain', 'heavy_rain'
    ticket_price_paid = Column(Float, nullable=False)
    observed_crowd_overall = Column(SQLAlchemyEnum(CrowdLevelEnum), nullable=False)
    observed_wait_top_ride_minutes = Column(Integer, nullable=False)
    fasttrack_purchased = Column(Boolean, nullable=False, default=False)
    is_verified_geofence = Column(Boolean, nullable=False, default=False)
    recaptcha_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
