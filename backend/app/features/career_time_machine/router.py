from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User
from app.features.career_time_machine.schemas import (
    CareerJourneyCreate,
    CareerJourneyUpdate,
    CareerJourneyResponse,
    CareerExploreResponse,
    CareerTimelineResponse,
    SkillGapRequest,
    SkillGapResponse,
    CareerInsightsResponse,
)
from app.features.career_time_machine.service import CareerTimeMachineService
from app.features.career_time_machine.insights import CareerInsightsService

router = APIRouter(prefix="/career-time-machine", tags=["Career Time Machine"])


@router.post(
    "/journeys",
    response_model=CareerJourneyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new career journey stage"
)
def create_journey(
    journey_in: CareerJourneyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a real career journey stage (e.g. past job, internship, or current role).
    Requires authentication.
    """
    return CareerTimeMachineService.create_journey(db, current_user, journey_in)


@router.get(
    "/journeys/me",
    response_model=List[CareerJourneyResponse],
    summary="Get all career journey stages for authenticated user"
)
def get_my_journeys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all career journey records belonging to the authenticated user.
    """
    return CareerTimeMachineService.get_my_journeys(db, current_user)


@router.get(
    "/explore",
    response_model=CareerExploreResponse,
    summary="Explore verified alumni career pathways"
)
def explore_journeys(
    target_title: Optional[str] = Query(None, description="Filter by job title or role"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    skill: Optional[str] = Query(None, description="Filter by acquired or used skill"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    optional_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Search and filter authentic alumni career journeys.
    Respects record privacy: unauthenticated callers see only public records;
    authenticated members also see network_only records.
    """
    return CareerTimeMachineService.explore_journeys(
        db=db,
        requesting_user=optional_user,
        target_title=target_title,
        industry=industry,
        skill=skill,
        page=page,
        page_size=page_size
    )


@router.post(
    "/skill-gap",
    response_model=SkillGapResponse,
    summary="Perform deterministic skill-gap analysis"
)
def analyze_skill_gap(
    request: SkillGapRequest,
    db: Session = Depends(get_db)
):
    """
    Compares the student's current skills against real alumni records who held the target role.
    Prioritizes missing skills based on empirical frequency in database records.
    Provides real projects/achievements as concrete learning evidence.
    """
    return CareerTimeMachineService.analyze_skill_gap(db, request)


@router.get(
    "/insights",
    response_model=CareerInsightsResponse,
    summary="Get empirical career progression insights"
)
def get_career_insights(
    query: str = Query(..., min_length=1, description="Role title or industry query"),
    db: Session = Depends(get_db)
):
    """
    Extracts high-level progression patterns, common stepping stones, and in-demand skills
    from stored alumni journeys without hallucinations.
    """
    return CareerInsightsService.get_insights(db, query)


@router.get(
    "/journeys/{journey_id}/timeline",
    response_model=CareerTimelineResponse,
    summary="Get full chronological career timeline"
)
def get_journey_timeline(
    journey_id: int,
    optional_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the complete chronological career timeline of the alumni associated
    with the given journey ID.
    """
    return CareerTimeMachineService.get_timeline(db, journey_id, optional_user)


@router.get(
    "/journeys/{journey_id}",
    response_model=CareerJourneyResponse,
    summary="Get single career journey by ID"
)
def get_journey_by_id(
    journey_id: int,
    optional_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific career journey by ID. Respects visibility restrictions.
    """
    return CareerTimeMachineService.get_journey_by_id(db, journey_id, optional_user)


@router.patch(
    "/journeys/{journey_id}",
    response_model=CareerJourneyResponse,
    summary="Update an existing career journey stage"
)
def update_journey(
    journey_id: int,
    journey_in: CareerJourneyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a career journey stage. Only the author of the record is authorized.
    """
    return CareerTimeMachineService.update_journey(db, current_user, journey_id, journey_in)


@router.delete(
    "/journeys/{journey_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a career journey stage"
)
def delete_journey(
    journey_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a career journey stage. Only the author of the record is authorized.
    """
    CareerTimeMachineService.delete_journey(db, current_user, journey_id)
    return None
