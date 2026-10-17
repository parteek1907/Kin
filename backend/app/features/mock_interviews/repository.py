from typing import Optional, List, Tuple, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app.models.user import User
from app.models.profile import Profile
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
from app.features.mock_interviews.rubrics import DEFAULT_RUBRICS, DEFAULT_CURATED_QUESTIONS


class MockInterviewRepository:

    # ==========================================
    # 1. Interviewer Profile Operations
    # ==========================================

    @staticmethod
    def get_interviewer_by_user_id(db: Session, user_id: int) -> Optional[InterviewerProfile]:
        return db.query(InterviewerProfile).filter(InterviewerProfile.user_id == user_id).first()

    @staticmethod
    def get_interviewer_by_id(db: Session, interviewer_profile_id: int) -> Optional[InterviewerProfile]:
        return db.query(InterviewerProfile).filter(InterviewerProfile.id == interviewer_profile_id).first()

    @staticmethod
    def create_or_update_interviewer_profile(
        db: Session,
        user_id: int,
        data: Dict[str, Any]
    ) -> InterviewerProfile:
        profile = MockInterviewRepository.get_interviewer_by_user_id(db, user_id)
        if not profile:
            profile = InterviewerProfile(user_id=user_id, **data)
            db.add(profile)
        else:
            for k, v in data.items():
                setattr(profile, k, v)
            # Re-submitting application resets status to pending review
            profile.verification_status = VerificationStatus.PENDING.value
            profile.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def verify_interviewer(
        db: Session,
        profile: InterviewerProfile,
        status: str,
        verification_notes: Optional[str],
        admin_user_id: int
    ) -> InterviewerProfile:
        profile.verification_status = status
        profile.verification_notes = verification_notes
        profile.verified_by_user_id = admin_user_id
        if status == VerificationStatus.APPROVED.value:
            profile.verified_at = datetime.now(timezone.utc)
        profile.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def search_interviewers(
        db: Session,
        category: Optional[str] = None,
        domain: Optional[str] = None,
        company: Optional[str] = None,
        is_available: Optional[bool] = None,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List[InterviewerProfile], int]:
        # Only verified/approved interviewers appear in discovery
        query = db.query(InterviewerProfile).filter(
            InterviewerProfile.verification_status == VerificationStatus.APPROVED.value
        )

        if is_available is not None:
            query = query.filter(InterviewerProfile.is_available == is_available)

        if domain:
            query = query.filter(InterviewerProfile.primary_domain.ilike(f"%{domain.strip()}%"))

        if company:
            query = query.filter(InterviewerProfile.current_company.ilike(f"%{company.strip()}%"))

        # Filter by category within JSON list
        if category:
            # PostgreSQL / SQLite json string matching
            query = query.filter(func.cast(InterviewerProfile.categories, String).ilike(f"%{category.strip()}%"))

        total = query.count()
        # Sort by active availability and average rating
        items = (
            query.order_by(
                InterviewerProfile.is_available.desc(),
                InterviewerProfile.average_rating.desc(),
                InterviewerProfile.total_completed_interviews.desc()
            )
            .offset(offset)
            .limit(limit)
            .all()
        )
        return items, total

    # ==========================================
    # 2. Question Operations
    # ==========================================

    @staticmethod
    def seed_default_questions_if_empty(db: Session) -> None:
        count = db.query(InterviewQuestion).count()
        if count == 0:
            for q_data in DEFAULT_CURATED_QUESTIONS:
                q = InterviewQuestion(
                    title=q_data["title"],
                    question_text=q_data["question_text"],
                    category=q_data["category"],
                    target_role=q_data.get("target_role"),
                    experience_level=q_data.get("experience_level", "entry_level"),
                    suggested_duration_seconds=q_data.get("suggested_duration_seconds", 90),
                    author_type=q_data.get("author_type", QuestionAuthorType.SYSTEM.value),
                    is_approved=True,
                    evaluation_rubric_template=q_data.get("evaluation_rubric_template", {}),
                    expected_answer_hints=q_data.get("expected_answer_hints", [])
                )
                db.add(q)
            db.commit()

    @staticmethod
    def get_approved_questions(
        db: Session,
        category: Optional[str] = None,
        target_role: Optional[str] = None,
        experience_level: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Tuple[List[InterviewQuestion], int]:
        MockInterviewRepository.seed_default_questions_if_empty(db)

        query = db.query(InterviewQuestion).filter(InterviewQuestion.is_approved == True)

        if category:
            query = query.filter(InterviewQuestion.category == category)

        if target_role:
            query = query.filter(InterviewQuestion.target_role.ilike(f"%{target_role.strip()}%"))

        if experience_level and experience_level != "all":
            query = query.filter(
                or_(
                    InterviewQuestion.experience_level == experience_level,
                    InterviewQuestion.experience_level == "all"
                )
            )

        total = query.count()
        items = query.order_by(InterviewQuestion.times_used.desc(), InterviewQuestion.id.asc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_question_by_id(db: Session, question_id: int) -> Optional[InterviewQuestion]:
        return db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()

    @staticmethod
    def create_question(
        db: Session,
        author_id: Optional[int],
        data: Dict[str, Any],
        author_type: str = QuestionAuthorType.ALUMNI.value
    ) -> InterviewQuestion:
        cat = data.get("category", "technical_fundamentals")
        rubric = data.get("rubric_override") or DEFAULT_RUBRICS.get(cat, DEFAULT_RUBRICS["technical_fundamentals"])

        q = InterviewQuestion(
            author_user_id=author_id,
            title=data["title"],
            question_text=data["question_text"],
            category=cat,
            target_role=data.get("target_role"),
            experience_level=data.get("experience_level", "entry_level"),
            suggested_duration_seconds=data.get("suggested_duration_seconds", 90),
            author_type=author_type,
            is_approved=True,
            evaluation_rubric_template=rubric,
            expected_answer_hints=data.get("expected_answer_hints", [])
        )
        db.add(q)
        db.commit()
        db.refresh(q)
        return q

    # ==========================================
    # 3. Session Lifecycle Operations
    # ==========================================

    @staticmethod
    def create_session(
        db: Session,
        student_id: int,
        interviewer_id: int,
        interview_category: str,
        target_role: str,
        experience_level: str = "entry_level",
        question_id: Optional[int] = None,
        scheduled_at: Optional[datetime] = None,
        student_note: Optional[str] = None,
        recording_consent: bool = False
    ) -> InterviewSession:
        session = InterviewSession(
            student_id=student_id,
            interviewer_id=interviewer_id,
            question_id=question_id,
            status=SessionStatus.REQUESTED.value,
            interview_category=interview_category,
            target_role=target_role,
            experience_level=experience_level,
            scheduled_at=scheduled_at,
            student_note=student_note,
            student_consent=True,
            recording_consent=recording_consent
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def get_session_by_id(db: Session, session_id: int) -> Optional[InterviewSession]:
        return db.query(InterviewSession).filter(InterviewSession.id == session_id).first()

    @staticmethod
    def get_active_session_between(db: Session, student_id: int, interviewer_id: int) -> Optional[InterviewSession]:
        """Returns any active (non-terminal) session between student and interviewer."""
        active_statuses = [
            SessionStatus.REQUESTED.value,
            SessionStatus.ACCEPTED.value,
            SessionStatus.SCHEDULED.value,
            SessionStatus.IN_PROGRESS.value,
            SessionStatus.COMPLETED.value
        ]
        return db.query(InterviewSession).filter(
            InterviewSession.student_id == student_id,
            InterviewSession.interviewer_id == interviewer_id,
            InterviewSession.status.in_(active_statuses)
        ).first()

    @staticmethod
    def get_user_sessions(
        db: Session,
        user_id: int,
        role: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List[InterviewSession], int]:
        query = db.query(InterviewSession)

        if role == "student":
            query = query.filter(InterviewSession.student_id == user_id)
        elif role == "interviewer":
            query = query.filter(InterviewSession.interviewer_id == user_id)
        else:
            query = query.filter(or_(InterviewSession.student_id == user_id, InterviewSession.interviewer_id == user_id))

        if status:
            query = query.filter(InterviewSession.status == status)

        total = query.count()
        items = query.order_by(InterviewSession.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    # ==========================================
    # 4. Feedback & Student Review Operations
    # ==========================================

    @staticmethod
    def create_feedback(
        db: Session,
        session: InterviewSession,
        interviewer_id: int,
        student_id: int,
        rubric_scores: Dict[str, float],
        overall_score: float,
        strengths: List[str],
        areas_for_improvement: List[str],
        actionable_recommendations: str,
        interviewer_private_notes: Optional[str] = None,
        ai_assisted: bool = False,
        ai_assistance_summary: Optional[str] = None
    ) -> InterviewFeedback:
        feedback = InterviewFeedback(
            session_id=session.id,
            interviewer_id=interviewer_id,
            student_id=student_id,
            rubric_scores=rubric_scores,
            overall_score=overall_score,
            strengths=strengths,
            areas_for_improvement=areas_for_improvement,
            actionable_recommendations=actionable_recommendations,
            interviewer_private_notes=interviewer_private_notes,
            ai_assisted=ai_assisted,
            ai_assistance_summary=ai_assistance_summary
        )
        db.add(feedback)

        # Transition session status to FEEDBACK_SUBMITTED
        session.status = SessionStatus.FEEDBACK_SUBMITTED.value

        # Award community Karma to alumnus for credible mentoring
        if not session.karma_awarded:
            session.karma_awarded = True
            session.karma_points = 50

        # Increment question usage count if set
        if session.question_id:
            db.query(InterviewQuestion).filter(InterviewQuestion.id == session.question_id).update(
                {InterviewQuestion.times_used: InterviewQuestion.times_used + 1}
            )

        db.commit()
        db.refresh(feedback)
        db.refresh(session)

        # Update interviewer profile metrics
        MockInterviewRepository.recompute_interviewer_metrics(db, interviewer_id)

        return feedback

    @staticmethod
    def create_student_review(
        db: Session,
        session: InterviewSession,
        student_id: int,
        interviewer_id: int,
        rating: int,
        usefulness_feedback: Optional[str],
        would_recommend: bool,
        reported_issue: bool,
        dispute_reason: Optional[str]
    ) -> InterviewStudentReview:
        review = InterviewStudentReview(
            session_id=session.id,
            student_id=student_id,
            interviewer_id=interviewer_id,
            rating=rating,
            usefulness_feedback=usefulness_feedback,
            would_recommend=would_recommend,
            reported_issue=reported_issue,
            dispute_reason=dispute_reason
        )
        db.add(review)

        if reported_issue:
            session.status = SessionStatus.DISPUTED.value

        db.commit()
        db.refresh(review)
        db.refresh(session)

        # Recompute interviewer metrics
        MockInterviewRepository.recompute_interviewer_metrics(db, interviewer_id)

        return review

    @staticmethod
    def recompute_interviewer_metrics(db: Session, interviewer_user_id: int) -> None:
        profile = MockInterviewRepository.get_interviewer_by_user_id(db, interviewer_user_id)
        if not profile:
            return

        completed_count = db.query(InterviewSession).filter(
            InterviewSession.interviewer_id == interviewer_user_id,
            InterviewSession.status.in_([SessionStatus.COMPLETED.value, SessionStatus.FEEDBACK_SUBMITTED.value])
        ).count()

        total_sessions = db.query(InterviewSession).filter(
            InterviewSession.interviewer_id == interviewer_user_id
        ).count()

        cancelled_count = db.query(InterviewSession).filter(
            InterviewSession.interviewer_id == interviewer_user_id,
            InterviewSession.status == SessionStatus.CANCELLED.value
        ).count()

        # Reviews
        reviews = db.query(InterviewStudentReview).filter(
            InterviewStudentReview.interviewer_id == interviewer_user_id
        ).all()

        profile.total_completed_interviews = completed_count
        if total_sessions > 0:
            profile.cancellation_rate = round((cancelled_count / total_sessions) * 100, 1)

        if reviews:
            profile.total_reviews_count = len(reviews)
            profile.average_rating = round(sum(r.rating for r in reviews) / len(reviews), 2)

        db.commit()
