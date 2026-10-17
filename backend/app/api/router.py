from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.features.career_time_machine.router import router as career_time_machine_router

api_router = APIRouter()

# Authentication & User Profile Management
api_router.include_router(auth_router)

# Major Feature 1: Career Time Machine
api_router.include_router(career_time_machine_router)

# Future features will be mounted here:
# api_router.include_router(mentorship_router)
# api_router.include_router(mock_interview_router)
# api_router.include_router(directory_router)
# api_router.include_router(networking_router)
