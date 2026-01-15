from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    entry_number = Column(String, unique=True, index=True) # e.g., 2024CS10020
    email = Column(String, unique=True, index=True)
    name = Column(String)
    department = Column(String, nullable=True)
    hostel = Column(String, nullable=True)
    current_year = Column(Integer, nullable=True)
    
    # Profile
    photo_url = Column(String, nullable=True)
    interests = Column(JSON, default=[]) # ["Coding", "Music"]
    
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    authorizations = relationship("AuthRole", back_populates="user")
    registrations = relationship("Registration", back_populates="user")