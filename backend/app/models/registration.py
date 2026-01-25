from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    
    # 1. Foreign Keys (Indexed & Non-Nullable)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    
    # 2. Data
    custom_answers = Column(JSON, default=dict)
    feedback_rating = Column(Integer, nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow, index=True)

    # 3. Relationships
    user = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")

    # 4. Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'event_id', name='_user_event_uc'),
        CheckConstraint('feedback_rating >= 1 AND feedback_rating <= 10', name='check_rating_range'),
    )