from sqlalchemy import Column, String, Float, Integer, Date, DateTime, ForeignKey
from datetime import datetime, timezone
from .park import Base

class WeatherCache(Base):
    __tablename__ = "weather_cache"

    id = Column(Integer, primary_key=True, index=True)
    park_id = Column(String, ForeignKey("parks.id"), nullable=False, index=True)
    forecast_date = Column(Date, nullable=False, index=True)
    weather_condition = Column(String, nullable=False)
    temp_max = Column(Float, nullable=False)
    precipitation_prob = Column(Float, nullable=True)
    uv_index = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
