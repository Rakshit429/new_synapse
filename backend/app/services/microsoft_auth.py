import httpx
from app.core.config import settings
from fastapi import HTTPException

async def validate_microsoft_code(code: str):
    """
    Exchanges the auth code from frontend for an Access Token from Azure.
    Then gets the User Profile from Microsoft Graph API.
    """
    async with httpx.AsyncClient() as client:
        # 1. Exchange Code for Token
        token_data = {
            "client_id": settings.MS_CLIENT_ID,
            "scope": "User.Read",
            "code": code,
            "redirect_uri": settings.MS_REDIRECT_URI,
            "grant_type": "authorization_code",
            "client_secret": settings.MS_CLIENT_SECRET,
        }
        
        # Note: Tenant ID 'common' endpoint usually works for multi-tenant or personal
        # For strict org only, use specific tenant ID url
        token_url = f"https://login.microsoftonline.com/{settings.MS_TENANT_ID}/oauth2/v2.0/token"
        
        r = await client.post(token_url, data=token_data)
        if r.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Microsoft Token Error: {r.text}")
        
        tokens = r.json()
        access_token = tokens.get("access_token")

        # 2. Get User Profile using Token
        graph_url = "https://graph.microsoft.com/v1.0/me"
        headers = {"Authorization": f"Bearer {access_token}"}
        
        me_res = await client.get(graph_url, headers=headers)
        if me_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch MS Profile")
            
        user_data = me_res.json()
        
        # Return necessary fields
        return {
            "email": user_data.get("mail") or user_data.get("userPrincipalName"),
            "name": user_data.get("displayName"),
            "oid": user_data.get("id")
        }