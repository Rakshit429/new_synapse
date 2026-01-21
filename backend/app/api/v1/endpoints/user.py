from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.schemas.event import EventOut
from app.models.registration import Registration
import uuid

router = APIRouter()

@router.put("/profile", response_model=UserOut)
def update_profile(
    user_in: UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Update user interests, photo, or department."""
    if user_in.interests is not None:
        current_user.interests = user_in.interests
    if user_in.photo_url is not None:
        current_user.photo_url = user_in.photo_url
    if user_in.department is not None:
        current_user.department = user_in.department
    if user_in.hostel is not None:
        current_user.hostel = user_in.hostel
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/calendar", response_model=list[EventOut])
def get_my_calendar(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all events the user has registered for."""
    # SQLAlchemy relationship magic
    return [reg.event for reg in current_user.registrations]

