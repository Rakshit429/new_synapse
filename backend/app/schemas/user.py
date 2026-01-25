from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from app.models.enums import RoleName, OrgType, OrgName

# --- Auth Role Schemas ---
class AuthRoleOut(BaseModel):
    id: int
    org_name: OrgName
    role_name: RoleName
    org_type: OrgType

    class Config:
        from_attributes = True


class AuthRoleSchema(BaseModel):
    org_name: OrgName
    role_name: RoleName
    org_type: OrgType


# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    entry_number: Optional[str] = None
    department: Optional[str] = None
    hostel: Optional[str] = None
    interests: List[str] = []
    current_year: Optional[int] = None

class UserUpdate(BaseModel):
    interests: Optional[List[str]] = None
    photo_url: Optional[str] = None
    department: Optional[str] = None
    hostel: Optional[str] = None
    current_year: Optional[int] = None

class UserOut(UserBase):
    id: int
    photo_url: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: Optional[datetime] = None
    
    authorizations: List[AuthRoleOut] = [] 

    class Config:
        from_attributes = True

# --- Team Management Schema ---
class TeamMemberCreate(BaseModel):
    email: EmailStr
    role: RoleName