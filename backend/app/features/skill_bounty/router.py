"""
FastAPI Router for Skill Bounty Network.
Exposes endpoints for challenge management, submissions, reviews, outcomes, and AI-ready matching.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.features.skill_bounty.schemas import (
    ChallengeCreate,
    ChallengeUpdate,
    ChallengeResponse,
    ChallengeListResponse,
    SubmissionCreate,
    SubmissionUpdate,
    SubmissionResponse,
    ReviewCreate,
    ReviewResponse,
    OutcomeCreate,
    OutcomeResponse,
    ChallengeRecommendationsResponse,
)
from app.features.skill_bounty.service import SkillBountyService

router = APIRouter(prefix="/skill-bounty", tags=["Skill Bounty Network"])


# --- Challenge Discovery & Management ---

@router.post(
    "/challenges",
    response_model=ChallengeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new draft challenge"
)
def create_challenge(
    challenge_in: ChallengeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new real-world challenge.
    Restricted to Alumni, Founders, Recruiters, and Faculty.
    Initially created in DRAFT status.
    """
    return SkillBountyService.create_challenge(db, challenge_in, current_user)


@router.get(
    "/challenges",
    response_model=ChallengeListResponse,
    summary="Discover and filter challenges"
)
def list_challenges(
    category: Optional[str] = Query(None, description="Filter by category"),
    required_skill: Optional[str] = Query(None, description="Filter by required skill"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    creator_id: Optional[int] = Query(None, description="Filter by creator user ID"),
    status: Optional[str] = Query(None, description="Filter by status (DRAFT, OPEN, CLOSED, etc.)"),
    organization_name: Optional[str] = Query(None, description="Filter by organization name"),
    search: Optional[str] = Query(None, description="Search query matching title and problem statement"),
    only_available: bool = Query(False, description="Only show OPEN challenges before deadline"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Discover challenges with database-backed filtering, full-text search, and pagination.
    """
    return SkillBountyService.list_challenges(
        db=db,
        category=category,
        required_skill=required_skill,
        difficulty=difficulty,
        creator_id=creator_id,
        status_filter=status,
        organization_name=organization_name,
        search_query=search,
        only_available=only_available,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/challenges/{challenge_id}",
    response_model=ChallengeResponse,
    summary="Get challenge details"
)
def get_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch full challenge details including rubrics and submission instructions.
    """
    return SkillBountyService.get_challenge(db, challenge_id)


@router.patch(
    "/challenges/{challenge_id}",
    response_model=ChallengeResponse,
    summary="Update challenge details"
)
def update_challenge(
    challenge_id: int,
    challenge_update: ChallengeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Modify an existing challenge. Only the challenge creator can edit.
    Cannot edit completed or cancelled challenges.
    """
    return SkillBountyService.update_challenge(db, challenge_id, challenge_update, current_user)


@router.post(
    "/challenges/{challenge_id}/publish",
    response_model=ChallengeResponse,
    summary="Publish a draft challenge"
)
def publish_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Transitions a challenge from DRAFT to OPEN so students can submit solutions.
    """
    return SkillBountyService.publish_challenge(db, challenge_id, current_user)


@router.post(
    "/challenges/{challenge_id}/close",
    response_model=ChallengeResponse,
    summary="Close an open challenge"
)
def close_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Transitions an OPEN challenge to CLOSED. No further submissions will be accepted.
    """
    return SkillBountyService.close_challenge(db, challenge_id, current_user)


@router.post(
    "/challenges/{challenge_id}/cancel",
    response_model=ChallengeResponse,
    summary="Cancel a challenge"
)
def cancel_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Transitions a challenge to CANCELLED.
    """
    return SkillBountyService.cancel_challenge(db, challenge_id, current_user)


@router.post(
    "/challenges/{challenge_id}/complete",
    response_model=ChallengeResponse,
    summary="Complete a closed challenge"
)
def complete_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Transitions a CLOSED challenge to COMPLETED after evaluation and outcome recording.
    """
    return SkillBountyService.complete_challenge(db, challenge_id, current_user)


# --- Submissions & Reviews ---

@router.get(
    "/challenges/{challenge_id}/submissions",
    response_model=List[SubmissionResponse],
    summary="List submissions for a challenge (creator only)"
)
def list_challenge_submissions(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    View all submissions for a challenge. Restricted to the challenge creator.
    """
    return SkillBountyService.list_submissions_for_challenge(db, challenge_id, current_user)


@router.post(
    "/challenges/{challenge_id}/submissions",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a solution to an open challenge"
)
def submit_solution(
    challenge_id: int,
    submission_in: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit evidence of work (repository link, demo URL, writeup).
    Only valid for OPEN, non-expired challenges.
    Prevents duplicate active submissions.
    """
    return SkillBountyService.create_submission(db, challenge_id, submission_in, current_user)


@router.get(
    "/submissions/me",
    response_model=List[SubmissionResponse],
    summary="List all submissions made by the authenticated student"
)
def list_my_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all challenge submissions made by the currently authenticated user.
    """
    return SkillBountyService.list_my_submissions(db, current_user)


@router.get(
    "/submissions/{submission_id}",
    response_model=SubmissionResponse,
    summary="Get single submission details"
)
def get_submission(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Inspect a specific submission.
    Authorized only for the student submitter or the challenge creator.
    """
    return SkillBountyService.get_submission(db, submission_id, current_user)


@router.patch(
    "/submissions/{submission_id}",
    response_model=SubmissionResponse,
    summary="Update submission details"
)
def update_submission(
    submission_id: int,
    submission_update: SubmissionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update an active submission before deadline.
    Only the student submitter can modify their submission.
    """
    return SkillBountyService.update_submission(db, submission_id, submission_update, current_user)


@router.post(
    "/submissions/{submission_id}/withdraw",
    response_model=SubmissionResponse,
    summary="Withdraw an active submission"
)
def withdraw_submission(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Withdraw a submission. Allows the student to resubmit or step down.
    """
    return SkillBountyService.withdraw_submission(db, submission_id, current_user)


# --- Reviews & Evaluation ---

@router.post(
    "/submissions/{submission_id}/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Review and evaluate a submission"
)
def create_review(
    submission_id: int,
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Review a submission with technical feedback, rubric scores, strengths, and areas for improvement.
    Only authorized for the challenge creator.
    Self-reviews are strictly forbidden.
    """
    return SkillBountyService.create_review(db, submission_id, review_in, current_user)


@router.get(
    "/submissions/{submission_id}/reviews",
    response_model=List[ReviewResponse],
    summary="List reviews for a submission"
)
def list_submission_reviews(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    View technical reviews for a submission.
    Accessible by the submission owner and the challenge creator.
    """
    return SkillBountyService.list_reviews_for_submission(db, submission_id, current_user)


# --- Professional Outcomes ---

@router.post(
    "/challenges/{challenge_id}/outcomes",
    response_model=OutcomeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record an explicit professional outcome"
)
def record_outcome(
    challenge_id: int,
    outcome_in: OutcomeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Explicitly award a verified professional outcome
    (feedback received, portfolio piece, mentorship offered, collaboration, interview, referral).
    Only the challenge creator can award outcomes.
    """
    return SkillBountyService.record_outcome(db, challenge_id, outcome_in, current_user)


# --- AI-Ready Recommendations ---

@router.get(
    "/recommendations/me",
    response_model=ChallengeRecommendationsResponse,
    summary="Get explainable challenge recommendations"
)
def get_challenge_recommendations(
    limit: int = Query(10, ge=1, le=50, description="Max recommendations to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Compute explainable, deterministic challenge matches based on profile skills,
    domain interests, experience compatibility, and deadline runway.
    """
    return SkillBountyService.get_recommendations_for_user(db, current_user, limit=limit)
