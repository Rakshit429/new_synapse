from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    
    custom_answers = Column(JSON, default={}) # {"Size": "M"}
    feedback_rating = Column(Integer, nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")

    __table_args__ = (UniqueConstraint('user_id', 'event_id', name='_user_event_uc'),)