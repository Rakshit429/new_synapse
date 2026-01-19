from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.auth_role import AuthRole
from app.schemas.user import AuthRoleSchema, UserOut

router = APIRouter()

def get_superuser(current_user: User = Depends(deps.get_current_user)):
    """Gatekeeper: Only allow Super Admins."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not a Superuser")
    return current_user

@router.post("/authorize")
def authorize_club_head(
    email: str,
    role_data: AuthRoleSchema,
    db: Session = Depends(deps.get_db),
    admin: User = Depends(get_superuser)
):
    """Give a student the power to manage a Club/Fest."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check duplication
    existing = db.query(AuthRole).filter(
        AuthRole.user_id == user.id, 
        AuthRole.org_name == role_data.org_name
    ).first()
    
    if existing:
        return {"msg": "User already has this role"}

    new_role = AuthRole(
        user_id=user.id,
        org_name=role_data.org_name,
        role_name=role_data.role_name,
        org_type=role_data.org_type
    )
    db.add(new_role)
    db.commit()
    return {"msg": f"Authorized {user.name} for {role_data.org_name}"}

@router.get("/users", response_model=list[UserOut])
def list_all_users(
    db: Session = Depends(deps.get_db),
    admin: User = Depends(get_superuser)
):
    return db.query(User).all()