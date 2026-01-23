from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api import deps
from app.models.event import Event
from app.models.user import User
from app.models.registration import Registration
from app.schemas.event import EventOut, EventDetail
from app.services.recommender import get_event_recommendations
from typing import Optional

router = APIRouter()


def normalize_org_type(org_type: str) -> str:
    """
    Frontend sends: Clubs / Fests / Departments
    DB stores:      Club / Fest / Department
    """
    mapping = {
        "Clubs": "Club",
        "Fests": "Fest",
        "Departments": "Department"
    }
    return mapping.get(org_type, org_type)


@router.get("/", response_model=List[EventOut])
def get_events(
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional),

    sort_by: str = Query("date", pattern="^(date|popularity)$"),

    # FILTER PARAMS (FROM FRONTEND)
    org_type: Optional[str] = None,
    board: Optional[str] = None,   # UI-only, ignored safely
    item: Optional[str] = None,
    search: Optional[str] = None,

    skip: int = 0,
    limit: int = 20
):
    query = db.query(Event)

    # 1️⃣ ORG TYPE FILTER
    if org_type:
        query = query.filter(
            Event.org_type == normalize_org_type(org_type)
        )

    # 2️⃣ FINAL ITEM FILTER → org_name
    if item:
        query = query.filter(Event.org_name == item)

    # 3️⃣ SEARCH
    if search:
        query = query.filter(Event.name.ilike(f"%{search}%"))

    # 4️⃣ SORT
    if sort_by == "date":
        query = query.order_by(Event.date.asc())

    events = query.offset(skip).limit(limit).all()

    # 5️⃣ REGISTRATION STATUS
    if current_user:
        registered_ids = {r.event_id for r in current_user.registrations}
        for e in events:
            e.is_registered = e.id in registered_ids
    else:
        for e in events:
            e.is_registered = False

    return events


# ----------------------------
# UNCHANGED ROUTES
# ----------------------------

@router.get("/recommendations", response_model=List[EventOut])
def get_recommendations(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return get_event_recommendations(db, current_user.id)


@router.get("/{event_id}", response_model=EventDetail)
def get_event_detail(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if current_user:
        event.is_registered = any(
            r.event_id == event_id for r in current_user.registrations
        )
    else:
        event.is_registered = False

    return event


@router.post("/{event_id}/register")
def register_for_event(
    event_id: int,
    custom_answers: dict = {},
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    existing = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == event_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already registered")

    db.add(
        Registration(
            user_id=current_user.id,
            event_id=event_id,
            custom_answers=custom_answers
        )
    )
    db.commit()

    return {"status": "success", "msg": "Registered successfully"}
