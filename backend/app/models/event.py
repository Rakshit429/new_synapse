from sqlalchemy import Column, Integer, String, Boolean, JSON, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
from app.models.enums import OrgType, OrgName # Import both Enums

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    
    # Core
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    venue = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    
    org_name = Column(String, nullable=False, index=True)
    org_type = Column(String, nullable=False, index=True)
    
    event_manager_email = Column(String, nullable=False)
    
    # Metadata
    tags = Column(JSON, default=list) 
    target_audience = Column(JSON, default=dict)
    is_private = Column(Boolean, default=False, index=True)
    custom_form_schema = Column(JSON, default=list) 

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    registrations = relationship("Registration", back_populates="event", cascade="all, delete-orphan")