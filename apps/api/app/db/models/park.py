from sqlalchemy import Column, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Park(Base):
    __tablename__ = "parks"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    base_price_weekday = Column(Float, nullable=False)
    base_price_weekend = Column(Float, nullable=False)
    fasttrack_available = Column(Boolean, nullable=False, default=False)
    fasttrack_base_price = Column(Float, nullable=True)
