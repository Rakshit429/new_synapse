from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Response
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.event import Event
from app.models.auth_role import AuthRole
from app.models.registration import Registration
from app.models.enums import RoleName, OrgType
from app.schemas.event import EventOut
from app.schemas.user import TeamMemberCreate
from app.core.config import settings
from app.services.exports import generate_event_registration_csv
import shutil
import os
import json
from datetime import datetime

router = APIRouter()

# ------------------------------------------------------------------
# 🔐 HIERARCHY DEFINITIONS
# ------------------------------------------------------------------

# Roles that manage others (The "Bosses")
HEAD_ROLES_SET = {
    "overall coordinator",
    "president",
    "vice president",
    "general secretary",
    "deputy general secretary",
    "secretary",
    "convener"
}

# ------------------------------------------------------------------
# 🔐 DEPENDENCIES
# ------------------------------------------------------------------

def get_org_role_by_id(
    org_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Validates that the current user has ANY role in the specific org_id 
    requested in the URL.
    """
    auth = next((a for a in current_user.authorizations if a.id == org_id), None)
    
    if not auth:
        raise HTTPException(
            status_code=403, 
            detail="You are not authorized to manage this organization."
        )
    return auth

def get_org_head(
    role: AuthRole = Depends(get_org_role_by_id)
):
    """
    Validates that the requester is a HEAD (e.g., President, OC).
    """
    # ✅ FIX: role.role_name is now a String, so we compare directly
    if role.role_name not in HEAD_ROLES_SET:
        raise HTTPException(
            status_code=403, 
            detail="Permission Denied. Only Organization Heads can manage the team."
        )
    return role

# ------------------------------------------------------------------
# 📊 DASHBOARD & ANALYTICS
# ------------------------------------------------------------------

@router.get("/{org_id}/dashboard")
def get_org_dashboard(
    org_id: int,
    db: Session = Depends(deps.get_db),
    role: AuthRole = Depends(get_org_role_by_id)
):
    """Returns stats specific to the selected organization."""
    # ✅ FIX: Removed .value (role.org_name is already a string)
    org_events = db.query(Event).filter(Event.org_name == role.org_name).all()
    
    total_events = len(org_events)
    total_regs = sum(len(e.registrations) for e in org_events)
    
    dept_counts = {}
    for event in org_events:
        for reg in event.registrations:
            dept = reg.user.department or "Unknown"
            dept_counts[dept] = dept_counts.get(dept, 0) + 1

    return {
        "org_name": role.org_name,
        "your_role": role.role_name,
        "total_events": total_events,
        "total_registrations": total_regs,
        "dept_analytics": dept_counts 
    }

# ------------------------------------------------------------------
# 📅 EVENT MANAGEMENT
# ------------------------------------------------------------------

@router.get("/{org_id}/events", response_model=list[EventOut])
def get_org_events(
    org_id: int,
    db: Session = Depends(deps.get_db),
    role: AuthRole = Depends(get_org_role_by_id)
):
    # ✅ FIX: Removed .value
    return db.query(Event).filter(Event.org_name == role.org_name).order_by(Event.date.desc()).all()

@router.post("/{org_id}/events", response_model=EventOut)
def create_org_event(
    org_id: int,
    name: str = Form(...),
    description: str = Form(...),
    date: str = Form(...),
    venue: str = Form(...),
    tags: str = Form("[]"), 
    custom_form_schema: str = Form("[]"),
    target_audience: str = Form("{}"), 
    is_private: bool = Form(False),
    photo: UploadFile = File(None),
    
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    role: AuthRole = Depends(get_org_role_by_id)
):
    # 1. Handle File Upload
    filename = None
    if photo:
        os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
        import uuid
        ext = photo.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(settings.UPLOAD_FOLDER, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

    # 2. Parse JSON fields
    try:
        tags_list = json.loads(tags)
        schema_list = json.loads(custom_form_schema)
        audience_dict = json.loads(target_audience)
        date_obj = datetime.fromisoformat(date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid data format: {str(e)}")

    # 3. Create Event
    event = Event(
        name=name,
        description=description,
        date=date_obj,
        venue=venue,
        image_url=filename,
        tags=tags_list,
        custom_form_schema=schema_list,
        target_audience=audience_dict,
        is_private=is_private,
        
        # ✅ FIX: Pass string directly
        org_name=role.org_name, 
        org_type=role.org_type,
        
        event_manager_email=current_user.email
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

# ------------------------------------------------------------------
# 📥 DATA EXPORTS & REGISTRATIONS
# ------------------------------------------------------------------

@router.get("/{org_id}/events/{event_id}/registrations")
def get_event_registrations(
    org_id: int,
    event_id: int,
    db: Session = Depends(deps.get_db),
    role: AuthRole = Depends(get_org_role_by_id)
):
    """View list of students registered for a specific event."""
    # ✅ FIX: Removed .value
    event = db.query(Event).filter(Event.id == event_id, Event.org_name == role.org_name).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or not owned by you")
    
    results = []
    for reg in event.registrations:
        results.append({
            "name": reg.user.name,
            "email": reg.user.email,
            "entry_number": reg.user.entry_number,
            "custom_answers": reg.custom_answers,
            "registered_at": reg.registered_at
        })
    return results

@router.get("/{org_id}/events/{event_id}/csv")
def download_event_csv(
    org_id: int,
    event_id: int,
    db: Session = Depends(deps.get_db),
    role: AuthRole = Depends(get_org_role_by_id)
):
    """Download the attendee list as a CSV file."""
    # ✅ FIX: Removed .value
    event = db.query(Event).filter(Event.id == event_id, Event.org_name == role.org_name).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    csv_file = generate_event_registration_csv(db, event_id)
    
    return Response(
        content=csv_file.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=registrations_{event_id}.csv"}
    )

@router.get("/{org_id}/events/{event_id}/feedback")
def get_event_feedback(
    org_id: int,
    event_id: int,
    db: Session = Depends(deps.get_db),
    role: AuthRole = Depends(get_org_role_by_id)
):
    """Get average rating and stats."""
    # ✅ FIX: Removed .value
    event = db.query(Event).filter(Event.id == event_id, Event.org_name == role.org_name).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    ratings = [r.feedback_rating for r in event.registrations if r.feedback_rating]
    
    if not ratings:
        return {"average": 0, "count": 0, "distribution": {}}
        
    return {
        "average": round(sum(ratings) / len(ratings), 1),
        "count": len(ratings),
        "distribution": {i: ratings.count(i) for i in range(1, 11)}
    }

# ------------------------------------------------------------------
# 👥 TEAM MANAGEMENT (Strictly Protected)
# ------------------------------------------------------------------

@router.get("/{org_id}/team", response_model=list[dict])
def get_team_members(
    org_id: int,
    db: Session = Depends(deps.get_db),
    role: AuthRole = Depends(get_org_role_by_id)
):
    """View all team members."""
    # ✅ FIX: Removed .value
    team_roles = db.query(AuthRole).filter(AuthRole.org_name == role.org_name).all()
    return [{
        "user_id": r.user_id, 
        "name": r.user.name, 
        "email": r.user.email, 
        "role": r.role_name
    } for r in team_roles]

@router.post("/{org_id}/team")
def add_team_member(
    org_id: int,
    member_in: TeamMemberCreate,
    db: Session = Depends(deps.get_db),
    head_role: AuthRole = Depends(get_org_head)
):
    """
    Appoint a new team member.
    RESTRICTION: Heads cannot appoint other Heads (e.g., President).
    """
    # ✅ FIX 1: Use .value for comparison (Enum Object vs String Set)
    if member_in.role.value in HEAD_ROLES_SET:
        raise HTTPException(
            status_code=403, 
            detail="Permission Denied. You cannot appoint other Heads (President, OC, etc.). Contact Admin."
        )

    target_user = db.query(User).filter(User.email == member_in.email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found. They must login to Synapse at least once.")

    # Check using string directly
    existing = db.query(AuthRole).filter(
        AuthRole.user_id == target_user.id,
        AuthRole.org_name == head_role.org_name
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already in team")

    new_role = AuthRole(
        user_id=target_user.id,
        org_name=head_role.org_name,
        # ✅ FIX 2: Extract the string value for the database
        role_name=member_in.role.value, 
        org_type=head_role.org_type
    )
    db.add(new_role)
    db.commit()
    return {"msg": "Member added"}

@router.delete("/{org_id}/team/{user_id}")
def remove_team_member(
    org_id: int,
    user_id: int,
    db: Session = Depends(deps.get_db),
    head_role: AuthRole = Depends(get_org_head)
):
    if user_id == head_role.user_id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")

    # ✅ FIX: Use string directly
    role_to_delete = db.query(AuthRole).filter(
        AuthRole.user_id == user_id,
        AuthRole.org_name == head_role.org_name
    ).first()
    
    if not role_to_delete:
        raise HTTPException(status_code=404, detail="Member not found")

    # ✅ FIX: Check against set of strings
    if role_to_delete.role_name in HEAD_ROLES_SET:
        raise HTTPException(
            status_code=403, 
            detail="Permission Denied. You cannot remove another Head-level member."
        )
    
    db.delete(role_to_delete)
    db.commit()
    
    return {"msg": "Member removed"}