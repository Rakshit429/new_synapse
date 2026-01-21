from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core import database, security, config
from app.models.user import User
from app.schemas.token import TokenPayload

security_scheme = HTTPBearer()
# 1. NEW: Define a scheme that doesn't error if token is missing
security_scheme_optional = HTTPBearer(auto_error=False)

def get_db() -> Generator:
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token_creds: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> User:
    """Enforces Login (Returns 403 if missing)"""
    token = token_creds.credentials
    try:
        payload = jwt.decode(
            token, config.settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.id == int(token_data.sub)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# 2. NEW: Add this function
def get_current_user_optional(
    db: Session = Depends(get_db),
    token_creds: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme_optional)
) -> Optional[User]:
    """Allows Anonymous access (Returns None if missing)"""
    if not token_creds:
        return None
    
    token = token_creds.credentials
    try:
        payload = jwt.decode(
            token, config.settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValueError):
        return None # Return None instead of Error if token is bad
    
    user = db.query(User).filter(User.id == int(token_data.sub)).first()
    return user