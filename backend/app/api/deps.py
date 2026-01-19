from typing import Generator
from fastapi import Depends, HTTPException, status
# 1. CHANGED: Import HTTPBearer instead of OAuth2PasswordBearer
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core import database, security, config
from app.models.user import User
from app.schemas.token import TokenPayload

# 2. CHANGED: Define the security scheme as HTTPBearer
security_scheme = HTTPBearer()

def get_db() -> Generator:
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    # 3. CHANGED: dependency accepts HTTPAuthorizationCredentials
    token_creds: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> User:
    # 4. CHANGED: Extract the actual token string
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

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user