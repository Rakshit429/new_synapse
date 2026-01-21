from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.api import deps
from app.services.microsoft_auth import validate_microsoft_code
from app.models.user import User
from app.core.security import create_access_token
from app.schemas.token import Token
from app.schemas.auth import LoginRequest
from app.schemas.user import UserOut  
router = APIRouter()

@router.post("/login/microsoft", response_model=Token)
async def login_microsoft(
    login_data: LoginRequest,
    db: Session = Depends(deps.get_db)
):
    # 1. Validate Code with Azure
    ms_user = await validate_microsoft_code(login_data.code)
    email = ms_user["email"].lower()
    
    # 2. Check Domain
    if not email.endswith("iitd.ac.in"):
        raise HTTPException(status_code=400, detail="Only @iitd.ac.in emails allowed")

    # 3. Check DB
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Create new user
        # Extract entry number logic here if needed
        entry_number = email.split("@")[0].upper()         
        user = User(
            email=email,
            name=ms_user["name"],
            entry_number=entry_number
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # 4. Create Local JWT
    access_token = create_access_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(deps.get_current_user)):
    """
    Fetch the current user. 
    The response_model=UserOut ensures 'authorizations' are included.
    """
    return current_user