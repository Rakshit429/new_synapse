from pydantic import BaseModel

class LoginRequest(BaseModel):
    code: str
    # You can add fields here later (e.g., "platform": "web" vs "android")