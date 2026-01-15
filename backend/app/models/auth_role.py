from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuthRole(Base):
    __tablename__ = "auth_roles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    org_name = Column(String) # "DevClub"
    role_name = Column(String) # "club_head", "coordinator"
    org_type = Column(String) # "Club"

    user = relationship("User", back_populates="authorizations")