from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.features.mock_interviews.schemas import (
    InterviewerApplicationRequest,
    InterviewerVerificationUpdateRequest,
    InterviewerPublicProfileResponse,
    InterviewerSearchResponse,
    QuestionCreateRequest,
    QuestionResponse,
    AIQuestionGenerateRequest,
    SessionRequestCreate,
    SessionRespondRequest,
    SessionScheduleRequest,
    SessionCancelRequest,
    SessionDisputeRequest,
    InterviewFeedbackSubmitRequest,
    InterviewFeedbackResponse,
    StudentReviewSubmitRequest,
    StudentReviewResponse,
    SessionDetailResponse,
    SessionListResponse
)
from app.features.mock_interviews.service import MockInterviewService

router = APIRouter(
    prefix="/mock-interviews",
    tags=["Wisdom Capsule - 90-Second Mock Interviews"]
)


# ==========================================
# 1. Interviewer Verification & Discovery
# ==========================================

@router.post(
    "/interviewers/apply",
    response_model=InterviewerPublicProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Apply for alumni mock interviewer verification"
)
def apply_as_interviewer(
    payload: InterviewerApplicationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows an alumnus, faculty member, or founder to apply for verified mock interviewer status.
    Requires institutional affiliation and evidence-based credentials.
    """
    return MockInterviewService.apply_as_interviewer(db, current_user, payload)


@router.patch(
    "/interviewers/{interviewer_profile_id}/verify",
    response_model=InterviewerPublicProfileResponse,
    summary="Admin review: approve, suspend, or revoke interviewer eligibility"
)
def verify_interviewer(
    payload: InterviewerVerificationUpdateRequest,
    interviewer_profile_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows authorized administrators (Faculty or Admin) to review submitted evidence
    and update verification status. Students cannot access this endpoint.
    """
    return MockInterviewService.verify_interviewer(db, current_user, interviewer_profile_id, payload)


@router.get(
    "/interviewers",
    response_model=InterviewerSearchResponse,
    summary="Search verified alumni interviewers by expertise & availability"
)
def search_interviewers(
    category: Optional[str] = Query(None, description="Interview category filter"),
    domain: Optional[str] = Query(None, description="Primary domain of expertise"),
    company: Optional[str] = Query(None, description="Company filter"),
    is_available: Optional[bool] = Query(None, description="Filter by current availability"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Discover approved, vetted alumni interviewers. Only exposes safe public credentials
    and verified status indicators. Confidential notes are strictly omitted.
    """
    return MockInterviewService.search_interviewers(
        db=db,
        category=category,
        domain=domain,
        company=company,
        is_available=is_available,
        page=page,
        page_size=page_size
    )


@router.get(
    "/interviewers/me",
    response_model=InterviewerPublicProfileResponse,
    summary="Get current user's interviewer profile"
)
def get_my_interviewer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the authenticated user's interviewer profile and verification status.
    """
    return MockInterviewService.get_interviewer_profile_by_user_id(db, current_user.id)


@router.get(
    "/interviewers/{interviewer_profile_id}",
    response_model=InterviewerPublicProfileResponse,
    summary="Get public profile of a verified alumni interviewer"
)
def get_interviewer_profile(
    interviewer_profile_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    """
    Retrieve public details, ratings, and covered interview categories for a verified interviewer.
    """
    return MockInterviewService.get_interviewer_profile(db, interviewer_profile_id)


# ==========================================
# 2. Interview Questions & Rubrics
# ==========================================

@router.get(
    "/questions",
    summary="Browse approved 90-second mock interview questions and rubrics"
)
def get_questions(
    category: Optional[str] = Query(None, description="Interview category"),
    target_role: Optional[str] = Query(None, description="Role filter"),
    experience_level: Optional[str] = Query(None, description="Experience level"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Browse approved 90-second interview capsules with category-specific evaluation rubrics.
    """
    items, total = MockInterviewService.get_questions(
        db=db,
        category=category,
        target_role=target_role,
        experience_level=experience_level,
        page=page,
        page_size=page_size
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.post(
    "/questions",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Author an alumni-crafted 90-second interview question"
)
def create_question(
    payload: QuestionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows alumni interviewers to design and publish focused 90-second question capsules.
    """
    return MockInterviewService.create_question(db, current_user, payload)


@router.post(
    "/questions/generate-ai",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate an AI-assisted 90-second interview question capsule"
)
def generate_ai_question(
    payload: AIQuestionGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Suggests a focused 90-second interview prompt using Google Gemini AI,
    clearly labeled as author_type 'ai_assisted'.
    """
    return MockInterviewService.generate_ai_question(
        db=db,
        current_user=current_user,
        category=payload.category,
        target_role=payload.target_role,
        experience_level=payload.experience_level,
        topic_focus=payload.topic_focus
    )


# ==========================================
# 3. Session Lifecycle Endpoints
# ==========================================

@router.post(
    "/sessions/request",
    response_model=SessionDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Request a 90-second mock interview with an alumnus"
)
def request_session(
    payload: SessionRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Student submits a mock interview request to a verified alumnus.
    Prevents self-requests and duplicate active sessions.
    """
    return MockInterviewService.request_session(db, current_user, payload)


@router.get(
    "/sessions/my",
    response_model=SessionListResponse,
    summary="View authenticated user's mock interview history"
)
def get_my_sessions(
    role: Optional[str] = Query(None, description="'student' or 'interviewer'"),
    status: Optional[str] = Query(None, description="Filter by session status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists the authenticated user's interview sessions with status filtering and pagination.
    """
    return MockInterviewService.get_my_sessions(
        db=db,
        current_user=current_user,
        role=role,
        status=status,
        page=page,
        page_size=page_size
    )


@router.get(
    "/sessions/{session_id}",
    response_model=SessionDetailResponse,
    summary="Get interview session details, rubric scores, and review"
)
def get_session_detail(
    session_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns complete session information, including interviewer feedback and scores.
    Enforces participant ownership access control.
    """
    return MockInterviewService.get_session_detail(db, current_user, session_id)


@router.post(
    "/sessions/{session_id}/respond",
    response_model=SessionDetailResponse,
    summary="Interviewer: accept or decline a session request"
)
def respond_to_session(
    payload: SessionRespondRequest,
    session_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows the assigned alumni interviewer to accept or decline the session request.
    """
    return MockInterviewService.respond_to_session(db, current_user, session_id, payload)


@router.post(
    "/sessions/{session_id}/schedule",
    response_model=SessionDetailResponse,
    summary="Confirm scheduled date and format for the session"
)
def schedule_session(
    payload: SessionScheduleRequest,
    session_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sets the scheduled timestamp and capsule format ('virtual_capsule', 'audio_capsule').
    """
    return MockInterviewService.schedule_session(db, current_user, session_id, payload)


@router.post(
    "/sessions/{session_id}/start",
    response_model=SessionDetailResponse,
    summary="Start the 90-second mock interview capsule"
)
def start_session(
    session_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Transitions session to IN_PROGRESS and records started_at timestamp.
    """
    return MockInterviewService.start_session(db, current_user, session_id)


@router.post(
    "/sessions/{session_id}/complete",
    response_model=SessionDetailResponse,
    summary="Complete the 90-second mock interview segment"
)
def complete_session(
    session_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Concludes the interview segment and transitions status to COMPLETED.
    Enables subsequent human feedback submission.
    """
    return MockInterviewService.complete_session(db, current_user, session_id)


@router.post(
    "/sessions/{session_id}/feedback",
    response_model=InterviewFeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Interviewer: submit structured rubric scores and credible feedback"
)
def submit_feedback(
    payload: InterviewFeedbackSubmitRequest,
    session_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Interviewer evaluates the 90-second capsule across rubric dimensions, provides strengths,
    improvement areas, and actionable recommendations. Awards 50 community Karma points.
    """
    return MockInterviewService.submit_feedback(db, current_user, session_id, payload)


@router.post(
    "/sessions/{session_id}/student-review",
    response_model=StudentReviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Student: submit post-session rating and feedback"
)
def submit_student_review(
    payload: StudentReviewSubmitRequest,
    session_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Student rates the interviewer's usefulness (1-5 stars) and optionally reports issues.
    """
    return MockInterviewService.submit_student_review(db, current_user, session_id, payload)


@router.post(
    "/sessions/{session_id}/cancel",
    response_model=SessionDetailResponse,
    summary="Cancel a requested or scheduled interview session"
)
def cancel_session(
    payload: SessionCancelRequest,
    session_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancels the session with a documented reason before it starts.
    """
    return MockInterviewService.cancel_session(db, current_user, session_id, payload)


@router.post(
    "/sessions/{session_id}/dispute",
    response_model=SessionDetailResponse,
    summary="Dispute a session or report inappropriate conduct"
)
def dispute_session(
    payload: SessionDisputeRequest,
    session_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Flags the session for administrator quality review.
    """
    return MockInterviewService.dispute_session(db, current_user, session_id, payload)
