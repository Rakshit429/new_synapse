from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.event import Event
from app.models.auth_role import AuthRole
from app.schemas.event import EventCreate, EventOut
from app.schemas.user import TeamMemberCreate, UserOut

router = APIRouter()

# --- Dependencies ---

def get_current_org_role(
    current_user: User = Depends(deps.get_current_user),
):
    """Helper: Check if user belongs to an organization."""
    if not current_user.authorizations:
        raise HTTPException(status_code=403, detail="You do not manage any organization.")
    # For V1, we return the first role found. 
    # In V2, you might pass ?org_id=X to switch between multiple orgs.
    return current_user.authorizations[0] 

def get_org_head_role(
    role: AuthRole = Depends(get_current_org_role)
):
    """Gatekeeper: Only allow the 'Head' (e.g. Secy/General Secy) to manage the team."""
    # We check if the role string contains 'head' (e.g., 'club_head', 'fest_head')
    if "head" not in role.role_name.lower():
        raise HTTPException(
            status_code=403, 
            detail="Only the Organization Head can manage team members."
        )
    return role

# --- Dashboard & Events (Existing) ---

@router.get("/dashboard")
def get_org_dashboard(
    db: Session = Depends(deps.get_db),
    role: AuthRole = Depends(get_current_org_role)
):
    event_count = db.query(Event).filter(Event.org_name == role.org_name).count()
    org_events = db.query(Event).filter(Event.org_name == role.org_name).all()
    total_regs = sum(len(e.registrations) for e in org_events)
    
    return {
        "org_name": role.org_name,
        "your_role": role.role_name,
        "total_events": event_count,
        "total_registrations": total_regs
    }

@router.post("/events", response_model=EventOut)
def create_org_event(
    event_in: EventCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    role: AuthRole = Depends(get_current_org_role)
):
    # Security: Force org_name to match the user's permission
    event = Event(
        **event_in.dict(),
        org_name=role.org_name, 
        org_type=role.org_type,
        event_manager_email=current_user.email
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

# --- TEAM MANAGEMENT APIs (New) ---

@router.get("/team", response_model=list[dict])
def get_team_members(
    db: Session = Depends(deps.get_db),
    role: AuthRole = Depends(get_current_org_role)
):
    """List all members of this organization."""
    # Find all AuthRoles matching this org
    team_roles = db.query(AuthRole).filter(AuthRole.org_name == role.org_name).all()
    
    # Format the response nicely
    results = []
    for r in team_roles:
        results.append({
            "user_id": r.user_id,
            "name": r.user.name,
            "email": r.user.email,
            "role": r.role_name
        })
    return results

@router.post("/team")
def add_team_member(
    member_in: TeamMemberCreate,
    db: Session = Depends(deps.get_db),
    head_role: AuthRole = Depends(get_org_head_role) # Only Heads can access
):
    """Appoint a Coordinator or Executive."""
    
    # 1. Validate Role Input
    if member_in.role not in ["coordinator", "executive"]:
        raise HTTPException(status_code=400, detail="Role must be 'coordinator' or 'executive'")

    # 2. Find the user to add
    target_user = db.query(User).filter(User.email == member_in.email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User with this email not found. Ask them to login once first.")

    # 3. Check if they are already in the team
    existing = db.query(AuthRole).filter(
        AuthRole.user_id == target_user.id,
        AuthRole.org_name == head_role.org_name
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already part of this team.")

    # 4. Assign Role
    new_role = AuthRole(
        user_id=target_user.id,
        org_name=head_role.org_name,
        role_name=member_in.role, # coordinator/executive
        org_type=head_role.org_type
    )
    db.add(new_role)
    db.commit()
    
    return {"msg": f"Added {target_user.name} as {member_in.role}"}

@router.delete("/team/{user_id}")
def remove_team_member(
    user_id: int,
    db: Session = Depends(deps.get_db),
    head_role: AuthRole = Depends(get_org_head_role) # Only Heads can access
):
    """Fire a team member."""
    
    # Prevent Head from deleting themselves (accidentally locking themselves out)
    if user_id == head_role.user_id:
        raise HTTPException(status_code=400, detail="You cannot remove yourself. Contact Admin.")

    role_to_delete = db.query(AuthRole).filter(
        AuthRole.user_id == user_id,
        AuthRole.org_name == head_role.org_name
    ).first()
    
    if not role_to_delete:
        raise HTTPException(status_code=404, detail="Member not found in your team.")
        
    db.delete(role_to_delete)
    db.commit()
    
    return {"msg": "Team member removed"}