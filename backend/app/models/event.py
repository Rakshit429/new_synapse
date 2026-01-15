from sqlalchemy import Column, Integer, String, Boolean, JSON, Text, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    
    # Logistics
    date = Column(DateTime) # Store as datetime object
    venue = Column(String)
    image_url = Column(String, nullable=True)
    
    # Organizer Info
    org_name = Column(String) # "DevClub"
    org_type = Column(String) # "Club", "Fest", "Department"
    event_manager_email = Column(String) # Who created it
    
    # Discovery
    tags = Column(JSON, default=[]) 
    target_audience = Column(JSON, default={}) # {"depts": [], "years": []}
    is_private = Column(Boolean, default=False)
    
    # Dynamic Form
    custom_form_schema = Column(JSON, default=[]) # [{"label": "Size", "type": "text"}]

    # Relationships
    registrations = relationship("Registration", back_populates="event")