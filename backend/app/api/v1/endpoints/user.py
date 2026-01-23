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
    for field, value in user_in.dict(exclude_unset=True).items():
        setattr(current_user, field, value)

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

