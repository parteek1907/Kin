import logging
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timezone
import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.models.profile import Profile, PlatformRole
from app.features.social.repository import SocialRepository
from app.features.mock_interviews.models import (
    InterviewerProfile,
    InterviewQuestion,
    InterviewSession,
    InterviewFeedback,
    InterviewStudentReview,
    VerificationStatus,
    SessionStatus,
    QuestionAuthorType
)
from app.features.mock_interviews.schemas import (
    InterviewerApplicationRequest,
    InterviewerVerificationUpdateRequest,
    InterviewerPublicProfileResponse,
    InterviewerSearchResponse,
    QuestionCreateRequest,
    QuestionResponse,
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
from app.features.mock_interviews.repository import MockInterviewRepository
from app.features.mock_interviews.rubrics import DEFAULT_RUBRICS, DEFAULT_CURATED_QUESTIONS

logger = logging.getLogger(__name__)


class MockInterviewService:

    # ==========================================
    # 1. Interviewer Verification & Discovery
    # ==========================================

    @staticmethod
    def apply_as_interviewer(
        db: Session,
        current_user: User,
        data: InterviewerApplicationRequest
    ) -> InterviewerPublicProfileResponse:
        """
        Alumnus, Faculty, or Founder applies to become an approved 90-second mock interviewer.
        Requires evidence of credentials and institutional affiliation.
        """
        profile = MockInterviewRepository.create_or_update_interviewer_profile(
            db=db,
            user_id=current_user.id,
            data=data.model_dump()
        )
        return MockInterviewService._format_interviewer_response(profile)

    @staticmethod
    def verify_interviewer(
        db: Session,
        current_user: User,
        interviewer_profile_id: int,
        data: InterviewerVerificationUpdateRequest
    ) -> InterviewerPublicProfileResponse:
        """
        Authorized administrator reviews evidence and updates verification status.
        Students and regular alumni cannot verify other interviewers.
        """
        # Role guard: User profile must be Faculty or user_id == 1 (Superadmin)
        user_role = current_user.profile.role if current_user.profile else PlatformRole.STUDENT.value
        if user_role not in (PlatformRole.FACULTY.value, "Admin") and current_user.id != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only authorized faculty administrators can verify or moderate interviewers."
            )

        interviewer = MockInterviewRepository.get_interviewer_by_id(db, interviewer_profile_id)
        if not interviewer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interviewer profile #{interviewer_profile_id} was not found."
            )

        updated = MockInterviewRepository.verify_interviewer(
            db=db,
            profile=interviewer,
            status=data.status,
            verification_notes=data.verification_notes,
            admin_user_id=current_user.id
        )

        # Notify the alumnus of their verification status
        recipient_name = interviewer.user.profile.full_name if interviewer.user and interviewer.user.profile else "Interviewer"
        SocialRepository.create_notification(
            db=db,
            user_id=interviewer.user_id,
            actor_id=current_user.id,
            type="interviewer_verification_updated",
            title=f"Interviewer Application {data.status.title()}",
            message=f"Hello {recipient_name}, your interviewer verification status is now {data.status.upper()}.",
            data={"interviewer_profile_id": interviewer.id, "status": data.status}
        )

        return MockInterviewService._format_interviewer_response(updated)

    @staticmethod
    def search_interviewers(
        db: Session,
        category: Optional[str] = None,
        domain: Optional[str] = None,
        company: Optional[str] = None,
        is_available: Optional[bool] = None,
        page: int = 1,
        page_size: int = 10
    ) -> InterviewerSearchResponse:
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 50:
            page_size = 10
        offset = (page - 1) * page_size

        items, total = MockInterviewRepository.search_interviewers(
            db=db,
            category=category,
            domain=domain,
            company=company,
            is_available=is_available,
            limit=page_size,
            offset=offset
        )
        formatted = [MockInterviewService._format_interviewer_response(i) for i in items]
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        return InterviewerSearchResponse(
            items=formatted,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def get_interviewer_profile(db: Session, interviewer_profile_id: int) -> InterviewerPublicProfileResponse:
        interviewer = MockInterviewRepository.get_interviewer_by_id(db, interviewer_profile_id)
        if not interviewer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interviewer profile #{interviewer_profile_id} was not found."
            )
        return MockInterviewService._format_interviewer_response(interviewer)

    @staticmethod
    def get_interviewer_profile_by_user_id(db: Session, user_id: int) -> InterviewerPublicProfileResponse:
        interviewer = MockInterviewRepository.get_interviewer_by_user_id(db, user_id)
        if not interviewer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No interviewer profile found for user #{user_id}."
            )
        return MockInterviewService._format_interviewer_response(interviewer)

    # ==========================================
    # 2. Questions & AI Generation
    # ==========================================

    @staticmethod
    def get_questions(
        db: Session,
        category: Optional[str] = None,
        target_role: Optional[str] = None,
        experience_level: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[QuestionResponse], int]:
        offset = (page - 1) * page_size
        questions, total = MockInterviewRepository.get_approved_questions(
            db=db,
            category=category,
            target_role=target_role,
            experience_level=experience_level,
            limit=page_size,
            offset=offset
        )
        return [MockInterviewService._format_question_response(q) for q in questions], total

    @staticmethod
    def create_question(
        db: Session,
        current_user: User,
        data: QuestionCreateRequest
    ) -> QuestionResponse:
        question = MockInterviewRepository.create_question(
            db=db,
            author_id=current_user.id,
            data=data.model_dump(),
            author_type=QuestionAuthorType.ALUMNI.value
        )
        return MockInterviewService._format_question_response(question)

    @staticmethod
    def generate_ai_question(
        db: Session,
        current_user: User,
        category: str,
        target_role: str,
        experience_level: str = "entry_level",
        topic_focus: Optional[str] = None
    ) -> QuestionResponse:
        """
        Uses Google Gemini AI (if key configured) or deterministic expert templates to suggest
        a high-impact 90-second mock interview capsule prompt.
        """
        title = f"{target_role}: 90s {category.replace('_', ' ').title()} Capsule"
        prompt_text = ""
        hints = []

        if settings.AI_API_KEY and settings.AI_PROVIDER in ("gemini", "google"):
            try:
                model_name = settings.AI_MODEL or "gemini-1.5-flash"
                if model_name.startswith("models/"):
                    model_name = model_name.replace("models/", "")

                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.AI_API_KEY}"
                system_prompt = (
                    f"Create ONE 90-second mock interview question for a university student. "
                    f"Target Role: {target_role}, Category: {category}, Level: {experience_level}. "
                    f"Optional Focus: {topic_focus or 'General'}. "
                    f"Format your response as exactly 3 lines:\n"
                    f"Line 1: Question Title\n"
                    f"Line 2: Question Prompt (must be answerable concisely in 90 seconds)\n"
                    f"Line 3: Three key evaluation hints separated by semicolons"
                )

                payload = {"contents": [{"parts": [{"text": system_prompt}]}]}
                with httpx.Client(timeout=8.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            lines = [line.strip() for line in text.strip().split("\n") if line.strip()]
                            if len(lines) >= 2:
                                title = lines[0].replace("Title:", "").strip()
                                prompt_text = lines[1].replace("Question Prompt:", "").strip()
                                if len(lines) >= 3:
                                    hints = [h.strip() for h in lines[2].replace("Hints:", "").split(";") if h.strip()]
            except Exception as e:
                logger.warning("Gemini AI question generation error: %s. Using expert template.", e)

        # Fallback to curated template if prompt_text is still empty
        if not prompt_text:
            template = DEFAULT_CURATED_QUESTIONS[0]
            for t in DEFAULT_CURATED_QUESTIONS:
                if t["category"] == category:
                    template = t
                    break
            title = f"{target_role}: {template['title']}"
            prompt_text = template["question_text"]
            hints = template["expected_answer_hints"]

        question = MockInterviewRepository.create_question(
            db=db,
            author_id=current_user.id,
            data={
                "title": title,
                "question_text": prompt_text,
                "category": category,
                "target_role": target_role,
                "experience_level": experience_level,
                "suggested_duration_seconds": 90,
                "expected_answer_hints": hints
            },
            author_type=QuestionAuthorType.AI_ASSISTED.value
        )
        return MockInterviewService._format_question_response(question)

    # ==========================================
    # 3. Session Lifecycle Operations
    # ==========================================

    @staticmethod
    def request_session(
        db: Session,
        current_user: User,
        data: SessionRequestCreate
    ) -> SessionDetailResponse:
        student_id = current_user.id
        interviewer_id = data.interviewer_user_id

        if student_id == interviewer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot request a mock interview with yourself."
            )

        interviewer_profile = MockInterviewRepository.get_interviewer_by_user_id(db, interviewer_id)
        if not interviewer_profile or interviewer_profile.verification_status != VerificationStatus.APPROVED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The selected alumni interviewer is not currently verified or approved to conduct interviews."
            )

        if not interviewer_profile.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This interviewer is currently marked as unavailable for new sessions."
            )

        # Check for existing active session
        existing = MockInterviewRepository.get_active_session_between(db, student_id, interviewer_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"You already have an active session (#{existing.id}, status: {existing.status}) with this interviewer."
            )

        # Verify question if provided
        if data.question_id:
            q = MockInterviewRepository.get_question_by_id(db, data.question_id)
            if not q or not q.is_approved:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Interview question #{data.question_id} was not found or is not approved."
                )

        session = MockInterviewRepository.create_session(
            db=db,
            student_id=student_id,
            interviewer_id=interviewer_id,
            interview_category=data.interview_category,
            target_role=data.target_role,
            experience_level=data.experience_level,
            question_id=data.question_id,
            scheduled_at=data.scheduled_at,
            student_note=data.student_note,
            recording_consent=data.recording_consent
        )

        # In-app notification to interviewer
        student_name = current_user.profile.full_name if current_user.profile else "A student"
        SocialRepository.create_notification(
            db=db,
            user_id=interviewer_id,
            actor_id=student_id,
            type="interview_session_requested",
            title="New Mock Interview Requested",
            message=f"{student_name} requested a 90-second {data.interview_category.replace('_', ' ')} capsule for {data.target_role}.",
            data={"session_id": session.id, "category": data.interview_category}
        )

        return MockInterviewService._format_session_response(session)

    @staticmethod
    def respond_to_session(
        db: Session,
        current_user: User,
        session_id: int,
        data: SessionRespondRequest
    ) -> SessionDetailResponse:
        session = MockInterviewRepository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session #{session_id} was not found."
            )

        if session.interviewer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the assigned alumni interviewer can accept or decline this session."
            )

        if session.status != SessionStatus.REQUESTED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot respond to session in '{session.status}' state."
            )

        if data.action == "accept":
            session.status = SessionStatus.ACCEPTED.value
        else:
            session.status = SessionStatus.DECLINED.value
            session.decline_reason = data.decline_reason

        session.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(session)

        # Notify student
        interviewer_name = current_user.profile.full_name if current_user.profile else "Your interviewer"
        SocialRepository.create_notification(
            db=db,
            user_id=session.student_id,
            actor_id=current_user.id,
            type=f"interview_session_{session.status}",
            title=f"Mock Interview {session.status.title()}",
            message=f"{interviewer_name} has {session.status} your 90-second mock interview request.",
            data={"session_id": session.id, "status": session.status}
        )

        return MockInterviewService._format_session_response(session)

    @staticmethod
    def schedule_session(
        db: Session,
        current_user: User,
        session_id: int,
        data: SessionScheduleRequest
    ) -> SessionDetailResponse:
        session = MockInterviewRepository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session #{session_id} was not found."
            )

        if current_user.id not in (session.student_id, session.interviewer_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a participant in this interview session."
            )

        if session.status not in (SessionStatus.ACCEPTED.value, SessionStatus.SCHEDULED.value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot schedule session currently in '{session.status}' state."
            )

        session.scheduled_at = data.scheduled_at
        session.session_format = data.session_format
        session.status = SessionStatus.SCHEDULED.value
        session.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(session)
        return MockInterviewService._format_session_response(session)

    @staticmethod
    def start_session(
        db: Session,
        current_user: User,
        session_id: int
    ) -> SessionDetailResponse:
        session = MockInterviewRepository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session #{session_id} was not found."
            )

        if current_user.id not in (session.student_id, session.interviewer_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a participant in this session."
            )

        if session.status not in (SessionStatus.SCHEDULED.value, SessionStatus.ACCEPTED.value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Session must be scheduled before starting. Current status: '{session.status}'."
            )

        session.status = SessionStatus.IN_PROGRESS.value
        session.started_at = datetime.now(timezone.utc)
        session.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(session)
        return MockInterviewService._format_session_response(session)

    @staticmethod
    def complete_session(
        db: Session,
        current_user: User,
        session_id: int
    ) -> SessionDetailResponse:
        session = MockInterviewRepository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session #{session_id} was not found."
            )

        if current_user.id not in (session.student_id, session.interviewer_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a participant in this session."
            )

        if session.status != SessionStatus.IN_PROGRESS.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete session in '{session.status}' state. Session must be IN_PROGRESS."
            )

        session.status = SessionStatus.COMPLETED.value
        session.completed_at = datetime.now(timezone.utc)
        session.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(session)
        return MockInterviewService._format_session_response(session)

    # ==========================================
    # 4. Feedback & Student Review
    # ==========================================

    @staticmethod
    def submit_feedback(
        db: Session,
        current_user: User,
        session_id: int,
        data: InterviewFeedbackSubmitRequest
    ) -> InterviewFeedbackResponse:
        session = MockInterviewRepository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session #{session_id} was not found."
            )

        if session.interviewer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the alumni interviewer who conducted this session can submit evaluation feedback."
            )

        # Enforce state lifecycle: session must be completed first
        if session.status != SessionStatus.COMPLETED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Session must be marked COMPLETED before submitting feedback. Current status: '{session.status}'."
            )

        # Quality Assurance: Prevent empty or generic evaluations
        if not data.strengths or len(data.strengths) < 1:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="You must specify at least one concrete observed strength."
            )
        if not data.areas_for_improvement or len(data.areas_for_improvement) < 1:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="You must specify at least one actionable improvement area."
            )
        if len(data.actionable_recommendations.strip()) < 15:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Actionable recommendations must contain at least 15 characters of concrete guidance."
            )

        # Check existing feedback
        existing = db.query(InterviewFeedback).filter(InterviewFeedback.session_id == session.id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Feedback has already been submitted for this session."
            )

        feedback = MockInterviewRepository.create_feedback(
            db=db,
            session=session,
            interviewer_id=current_user.id,
            student_id=session.student_id,
            rubric_scores=data.rubric_scores,
            overall_score=data.overall_score,
            strengths=data.strengths,
            areas_for_improvement=data.areas_for_improvement,
            actionable_recommendations=data.actionable_recommendations,
            interviewer_private_notes=data.interviewer_private_notes,
            ai_assisted=data.ai_assisted,
            ai_assistance_summary=data.ai_assistance_summary
        )

        # Dispatch notification to student
        SocialRepository.create_notification(
            db=db,
            user_id=session.student_id,
            actor_id=current_user.id,
            type="interview_feedback_submitted",
            title="Interview Feedback Available",
            message=f"Your mock interview feedback has been submitted. Overall score: {data.overall_score}/5.0.",
            data={"session_id": session.id, "overall_score": data.overall_score}
        )

        return MockInterviewService._format_feedback_response(feedback)

    @staticmethod
    def submit_student_review(
        db: Session,
        current_user: User,
        session_id: int,
        data: StudentReviewSubmitRequest
    ) -> StudentReviewResponse:
        session = MockInterviewRepository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session #{session_id} was not found."
            )

        if session.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the student who participated in this session can submit a usefulness review."
            )

        if session.status not in (SessionStatus.COMPLETED.value, SessionStatus.FEEDBACK_SUBMITTED.value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot review a session that has not reached completion."
            )

        existing = db.query(InterviewStudentReview).filter(InterviewStudentReview.session_id == session.id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already submitted a review for this interview session."
            )

        review = MockInterviewRepository.create_student_review(
            db=db,
            session=session,
            student_id=current_user.id,
            interviewer_id=session.interviewer_id,
            rating=data.rating,
            usefulness_feedback=data.usefulness_feedback,
            would_recommend=data.would_recommend,
            reported_issue=data.reported_issue,
            dispute_reason=data.dispute_reason
        )

        return StudentReviewResponse(
            id=review.id,
            session_id=review.session_id,
            student_id=review.student_id,
            interviewer_id=review.interviewer_id,
            rating=review.rating,
            usefulness_feedback=review.usefulness_feedback,
            would_recommend=review.would_recommend,
            reported_issue=review.reported_issue,
            submitted_at=review.submitted_at
        )

    @staticmethod
    def cancel_session(
        db: Session,
        current_user: User,
        session_id: int,
        data: SessionCancelRequest
    ) -> SessionDetailResponse:
        session = MockInterviewRepository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session #{session_id} was not found."
            )

        if current_user.id not in (session.student_id, session.interviewer_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to cancel this session."
            )

        if session.status in (SessionStatus.IN_PROGRESS.value, SessionStatus.COMPLETED.value, SessionStatus.FEEDBACK_SUBMITTED.value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel a session that is already '{session.status}'."
            )

        session.status = SessionStatus.CANCELLED.value
        session.cancellation_reason = data.reason
        session.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(session)

        # Update cancellation metrics
        MockInterviewRepository.recompute_interviewer_metrics(db, session.interviewer_id)

        return MockInterviewService._format_session_response(session)

    @staticmethod
    def dispute_session(
        db: Session,
        current_user: User,
        session_id: int,
        data: SessionDisputeRequest
    ) -> SessionDetailResponse:
        session = MockInterviewRepository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session #{session_id} was not found."
            )

        if current_user.id not in (session.student_id, session.interviewer_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to dispute this session."
            )

        session.status = SessionStatus.DISPUTED.value
        session.decline_reason = data.reason
        session.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(session)
        return MockInterviewService._format_session_response(session)

    @staticmethod
    def get_session_detail(db: Session, current_user: User, session_id: int) -> SessionDetailResponse:
        session = MockInterviewRepository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session #{session_id} was not found."
            )

        # Access control: only participants or Admin/Faculty can view session details
        is_participant = current_user.id in (session.student_id, session.interviewer_id)
        is_admin = current_user.id == 1 or (current_user.profile and current_user.profile.role == PlatformRole.FACULTY.value)
        if not is_participant and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Private mock interview session records can only be accessed by participants."
            )

        return MockInterviewService._format_session_response(session)

    @staticmethod
    def get_my_sessions(
        db: Session,
        current_user: User,
        role: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ) -> SessionListResponse:
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 50:
            page_size = 10
        offset = (page - 1) * page_size

        sessions, total = MockInterviewRepository.get_user_sessions(
            db=db,
            user_id=current_user.id,
            role=role,
            status=status,
            limit=page_size,
            offset=offset
        )
        items = [MockInterviewService._format_session_response(s) for s in sessions]
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        return SessionListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    # ==========================================
    # Helper Formatters
    # ==========================================

    @staticmethod
    def _format_interviewer_response(profile: InterviewerProfile) -> InterviewerPublicProfileResponse:
        name = profile.user.profile.full_name if profile.user and profile.user.profile else "Alumnus"
        return InterviewerPublicProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            full_name=name,
            headline=profile.headline,
            bio=profile.bio,
            current_company=profile.current_company,
            job_title=profile.job_title,
            years_of_experience=profile.years_of_experience,
            primary_domain=profile.primary_domain,
            institution_affiliation=profile.institution_affiliation,
            categories=profile.categories or [],
            verification_status=profile.verification_status,
            is_available=profile.is_available,
            available_slots=profile.available_slots or [],
            preferred_capsule_duration_seconds=profile.preferred_capsule_duration_seconds,
            total_completed_interviews=profile.total_completed_interviews,
            average_rating=profile.average_rating,
            total_reviews_count=profile.total_reviews_count,
            cancellation_rate=profile.cancellation_rate,
            created_at=profile.created_at
        )

    @staticmethod
    def _format_question_response(q: InterviewQuestion) -> QuestionResponse:
        author_name = q.author.profile.full_name if q.author and q.author.profile else ("System" if q.author_type == "system" else "AI Assistant")
        return QuestionResponse(
            id=q.id,
            author_user_id=q.author_user_id,
            author_name=author_name,
            author_type=q.author_type,
            title=q.title,
            question_text=q.question_text,
            category=q.category,
            target_role=q.target_role,
            experience_level=q.experience_level,
            suggested_duration_seconds=q.suggested_duration_seconds,
            is_approved=q.is_approved,
            evaluation_rubric_template=q.evaluation_rubric_template or {},
            expected_answer_hints=q.expected_answer_hints or [],
            times_used=q.times_used,
            created_at=q.created_at
        )

    @staticmethod
    def _format_feedback_response(fb: InterviewFeedback) -> InterviewFeedbackResponse:
        interviewer_name = fb.interviewer.profile.full_name if fb.interviewer and fb.interviewer.profile else "Interviewer"
        student_name = fb.student.profile.full_name if fb.student and fb.student.profile else "Student"
        return InterviewFeedbackResponse(
            id=fb.id,
            session_id=fb.session_id,
            interviewer_id=fb.interviewer_id,
            student_id=fb.student_id,
            interviewer_name=interviewer_name,
            student_name=student_name,
            rubric_scores=fb.rubric_scores or {},
            overall_score=fb.overall_score,
            strengths=fb.strengths or [],
            areas_for_improvement=fb.areas_for_improvement or [],
            actionable_recommendations=fb.actionable_recommendations,
            interviewer_private_notes=fb.interviewer_private_notes,
            ai_assisted=fb.ai_assisted,
            ai_assistance_summary=fb.ai_assistance_summary,
            submitted_at=fb.submitted_at
        )

    @staticmethod
    def _format_session_response(session: InterviewSession) -> SessionDetailResponse:
        student_name = session.student.profile.full_name if session.student and session.student.profile else "Student"
        student_role = session.student.profile.role if session.student and session.student.profile else "Student"
        interviewer_name = session.interviewer.profile.full_name if session.interviewer and session.interviewer.profile else "Interviewer"
        interviewer_company = session.interviewer.profile.current_organization if session.interviewer and session.interviewer.profile else None
        interviewer_title = session.interviewer.profile.headline if session.interviewer and session.interviewer.profile else None

        question_title = session.question.title if session.question else None
        question_text = session.question.question_text if session.question else None

        feedback_resp = None
        if session.feedback:
            feedback_resp = MockInterviewService._format_feedback_response(session.feedback)

        review_resp = None
        if session.review:
            review_resp = StudentReviewResponse(
                id=session.review.id,
                session_id=session.review.session_id,
                student_id=session.review.student_id,
                interviewer_id=session.review.interviewer_id,
                rating=session.review.rating,
                usefulness_feedback=session.review.usefulness_feedback,
                would_recommend=session.review.would_recommend,
                reported_issue=session.review.reported_issue,
                submitted_at=session.review.submitted_at
            )

        return SessionDetailResponse(
            id=session.id,
            student_id=session.student_id,
            student_name=student_name,
            student_role=student_role,
            interviewer_id=session.interviewer_id,
            interviewer_name=interviewer_name,
            interviewer_company=interviewer_company,
            interviewer_title=interviewer_title,
            interviewer_avatar_url=None,
            question_id=session.question_id,
            question_title=question_title,
            question_text=question_text,
            status=session.status,
            interview_category=session.interview_category,
            target_role=session.target_role,
            experience_level=session.experience_level,
            session_duration_seconds=session.session_duration_seconds,
            session_format=session.session_format,
            scheduled_at=session.scheduled_at,
            student_note=session.student_note,
            decline_reason=session.decline_reason if session.status != SessionStatus.DISPUTED.value else None,
            cancellation_reason=session.cancellation_reason,
            dispute_reason=session.decline_reason if session.status == SessionStatus.DISPUTED.value else None,
            student_consent=session.student_consent,
            recording_consent=session.recording_consent,
            recording_url=session.recording_url,
            started_at=session.started_at,
            completed_at=session.completed_at,
            karma_awarded=session.karma_awarded,
            karma_points=session.karma_points,
            feedback=feedback_resp,
            review=review_resp,
            created_at=session.created_at,
            updated_at=session.updated_at
        )
