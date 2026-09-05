from sqlalchemy import Column, Integer, String, Boolean, Float, Date, Enum as SQLAlchemyEnum
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class DayTypeEnum(enum.Enum):
    weekday = "weekday"
    weekend = "weekend"
    holiday = "holiday"

class WeatherConditionEnum(enum.Enum):
    sunny = "sunny"
    cloudy = "cloudy"
    light_rain = "light_rain"
    heavy_rain = "heavy_rain"

class CrowdLevelEnum(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    very_high = "very_high"

class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    visit_date = Column(Date, nullable=False)
    park_id = Column(String, nullable=False, index=True)
    day_type = Column(SQLAlchemyEnum(DayTypeEnum), nullable=False)
    is_school_vacation = Column(Boolean, nullable=False, default=False)
    weather_condition = Column(SQLAlchemyEnum(WeatherConditionEnum), nullable=False)
    ticket_price_paid = Column(Float, nullable=False)
    offer_applied = Column(String, nullable=True)
    observed_crowd_overall = Column(SQLAlchemyEnum(CrowdLevelEnum), nullable=False)
    observed_wait_top_ride = Column(Integer, nullable=False)
    fasttrack_purchased = Column(Boolean, nullable=False, default=False)
