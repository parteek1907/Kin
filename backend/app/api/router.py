from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.features.career_time_machine.router import router as career_time_machine_router
from app.features.qualification_connections.router import router as qualification_connections_router
from app.features.social.router import router as social_router
from app.features.skill_bounty.router import router as skill_bounty_router
from app.features.unclaimed_talent_radar.router import router as unclaimed_talent_radar_router

api_router = APIRouter()

# Authentication & User Profile Management
api_router.include_router(auth_router)

# Major Feature 1: Career Time Machine
api_router.include_router(career_time_machine_router)

# Major Feature 2: Qualification-Based Auto Connections
api_router.include_router(qualification_connections_router)

# Major Feature 3: Social Networking & Connection Management
api_router.include_router(social_router)

# Major Feature 4: Skill Bounty Network
api_router.include_router(skill_bounty_router)

# Major Feature 5: Unclaimed Talent Radar
api_router.include_router(unclaimed_talent_radar_router)
