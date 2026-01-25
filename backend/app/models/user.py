from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    # 1. Identity
    entry_number = Column(String, unique=True, index=True, nullable=True) 
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    
    # 2. Demographics (Indexed for Analytics)
    department = Column(String, nullable=True, index=True)
    hostel = Column(String, nullable=True)
    current_year = Column(Integer, nullable=True, index=True)
    
    # 3. Profile
    photo_url = Column(String, nullable=True)
    interests = Column(JSON, default=list) # Fixed mutable default
    
    # 4. Status
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 5. Relationships (Cascade added)
    authorizations = relationship("AuthRole", back_populates="user", cascade="all, delete-orphan")
    registrations = relationship("Registration", back_populates="user", cascade="all, delete-orphan")