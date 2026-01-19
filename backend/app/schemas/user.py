from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr
    entry_number: Optional[str] = None
    department: Optional[str] = None
    hostel: Optional[str] = None
    interests: List[str] = []

class UserUpdate(BaseModel):
    interests: Optional[List[str]] = None
    photo_url: Optional[str] = None
    department: Optional[str] = None
    hostel: Optional[str] = None

class UserOut(UserBase):
    id: int
    photo_url: Optional[str] = None
    class Config:
        from_attributes = True

class AuthRoleSchema(BaseModel):
    org_name: str
    role_name: str
    org_type: str

class TeamMemberCreate(BaseModel):
    email: EmailStr
    role: str  # Must be "coordinator" or "executive"