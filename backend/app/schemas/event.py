from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.enums import OrgType, OrgName

class EventBase(BaseModel):
    name: str
    description: str
    date: datetime
    venue: str
    
    # ✅ STRICT VALIDATION: Must be a valid Enum value
    org_name: OrgName 
    org_type: OrgType 
    
    tags: List[str] = []
    is_private: bool = False

class EventCreate(EventBase):
    target_audience: Optional[Dict[str, Any]] = {}
    custom_form_schema: Optional[List[Dict[str, Any]]] = []
    image_url: Optional[str] = None

class EventOut(EventBase):
    id: int
    image_url: Optional[str] = None
    is_registered: bool = False 
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    target_audience: Optional[Dict[str, Any]] = {}
    
    class Config:
        from_attributes = True

class EventDetail(EventOut):
    custom_form_schema: List[Dict[str, Any]] = []