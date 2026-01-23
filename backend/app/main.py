from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# -----------------------
# CORS
# -----------------------
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# -----------------------
# 🔥 STATIC FILES (THIS WAS MISSING)
# -----------------------
# Your images are stored in: backend/static/uploads
app.mount(
    "/uploads",
    StaticFiles(directory="static/uploads"),
    name="uploads"
)

# -----------------------
# API ROUTES
# -----------------------
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to Synapse API V1"}
