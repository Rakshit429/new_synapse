from pydantic import BaseModel
from typing import Optional
from .user import UserOut

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None