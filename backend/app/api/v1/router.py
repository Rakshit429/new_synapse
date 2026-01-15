from fastapi import APIRouter
from app.api.v1.endpoints import auth, events, user, orgs

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
# Placeholder imports for files I didn't explicitly write out fully above to save space
# api_router.include_router(user.router, prefix="/user", tags=["user"])
# api_router.include_router(orgs.router, prefix="/org", tags=["orgs"])