"""
FastAPI Router for Unclaimed Talent Radar Feature.
Exposes endpoints for discovery, personalized recommendations, skill mapping,
detailed opportunity reasoning, and recommendation feedback.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.features.unclaimed_talent_radar.schemas import (
    RadarDiscoverResponse,
    RadarPersonalizedDashboardResponse,
    RadarRecommendationResponse,
    RadarFeedbackCreate,
    RadarFeedbackResponse,
    SkillMapResponse,
    UserProfileAnalysisResponse,
    DiscoveryMode,
    OpportunityCreate,
    OpportunityResponse,
)
from app.features.unclaimed_talent_radar.service import radar_service

router = APIRouter(
    prefix="/unclaimed-talent-radar",
    tags=["Unclaimed Talent Radar"],
)


@router.get(
    "/discover",
    response_model=RadarDiscoverResponse,
    status_code=status.HTTP_200_OK,
    summary="Discover Opportunities Across Industries",
    description=(
        "Discovers relevant opportunities inside and outside the user's primary industry. "
        "Evaluates direct skill overlap, transferable skill bridges, project evidence, "
        "experience level, and explicit eligibility criteria."
    ),
)
def discover_opportunities(
    opportunity_type: Optional[str] = Query(None, description="Filter by opportunity type (job, internship, research_project, etc.)"),
    industry: Optional[str] = Query(None, description="Filter by industry domain"),
    discovery_mode: DiscoveryMode = Query(DiscoveryMode.ALL, description="all, cross_industry_only, or direct_only"),
    min_score: float = Query(0.0, ge=0.0, le=100.0, description="Minimum relevance score threshold"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("relevance", description="Sort by 'relevance', 'deadline', or 'created_at'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return radar_service.discover_opportunities(
        db=db,
        current_user=current_user,
        opportunity_type=opportunity_type,
        industry=industry,
        discovery_mode=discovery_mode,
        min_score=min_score,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
    )


@router.get(
    "/recommendations/me",
    response_model=RadarPersonalizedDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Personalized Radar Dashboard for Authenticated User",
    description=(
        "Retrieves personalized recommendations segmented into Direct Matches, "
        "Adjacent-Industry Opportunities, and Exploratory Prospects, accompanied by "
        "rigorous profile evidence analysis and deterministic learning path priorities."
    ),
)
def get_my_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return radar_service.get_personalized_recommendations(
        db=db,
        current_user=current_user,
    )


@router.get(
    "/profile-analysis",
    response_model=UserProfileAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Inspect Profile Evidence Breakdown",
    description="Inspect self-declared vs project-evidenced vs verified skills and historical projects.",
)
def get_my_profile_evidence_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return radar_service.analyze_user_profile(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/skill-map",
    response_model=SkillMapResponse,
    status_code=status.HTTP_200_OK,
    summary="Explore Transferable Skill Graph",
    description=(
        "Inspect canonical skills, aliases, associated domains, transferable relationships, "
        "explanations, and explicit relationship boundary limits."
    ),
)
def get_skill_map(
    skill: Optional[str] = Query(None, description="Optional canonical skill or alias to filter by"),
    domain: Optional[str] = Query(None, description="Optional domain to filter by"),
):
    return radar_service.get_skill_map(
        skill=skill,
        domain=domain,
    )


@router.get(
    "/recommendations/{opportunity_id}",
    response_model=RadarRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Opportunity Recommendation Reasoning",
    description="Retrieve detailed matching evidence and reasoning for a specific opportunity.",
)
def get_opportunity_recommendation_reasoning(
    opportunity_id: int = Path(..., ge=1, description="Target Opportunity ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return radar_service.get_opportunity_recommendation_details(
        db=db,
        opportunity_id=opportunity_id,
        current_user=current_user,
    )


@router.post(
    "/feedback",
    response_model=RadarFeedbackResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit Recommendation Feedback",
    description=(
        "Record feedback (relevant, not_relevant, already_skilled, interested_in_industry, "
        "not_interested_in_industry). Prevents duplicate records and adapts future ranking."
    ),
)
def submit_recommendation_feedback(
    feedback_in: RadarFeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return radar_service.record_feedback(
        db=db,
        current_user=current_user,
        feedback_in=feedback_in,
    )


@router.post(
    "/opportunities",
    response_model=OpportunityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Opportunity Record",
    description="Store an empirical opportunity record (job, internship, research project, challenge).",
)
def create_opportunity(
    opp_in: OpportunityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return radar_service.create_opportunity(
        db=db,
        opp_in=opp_in,
        current_user=current_user,
    )
