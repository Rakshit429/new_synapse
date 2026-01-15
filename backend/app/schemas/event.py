from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class EventBase(BaseModel):
    name: str
    description: str
    date: datetime
    venue: str
    org_name: str
    org_type: str
    tags: List[str] = []
    is_private: bool = False

class EventCreate(EventBase):
    target_audience: Optional[Dict] = {}
    custom_form_schema: Optional[List[Dict]] = []
    image_url: Optional[str] = None

class EventOut(EventBase):
    id: int
    image_url: Optional[str] = None
    is_registered: bool = False # Computed dynamically
    class Config:
        from_attributes = True

class EventDetail(EventOut):
    custom_form_schema: List[Dict] = []