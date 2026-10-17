"""
Repository and Database Access Layer for Skill Bounty Network.
Handles challenges, submissions, reviews, and outcomes with robust queries,
state transitions, and database filtering.
"""

from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc

from app.features.skill_bounty.models import (
    Challenge,
    ChallengeSubmission,
    SubmissionReview,
    ChallengeOutcome,
    ChallengeStatus,
    SubmissionStatus,
    ChallengeCategory,
    ChallengeDifficulty,
)
from app.features.skill_bounty.schemas import (
    ChallengeCreate,
    ChallengeUpdate,
    SubmissionCreate,
    SubmissionUpdate,
    ReviewCreate,
    OutcomeCreate,
)


class SkillBountyRepository:
    """
    SQLAlchemy query operations for Skill Bounty Network.
    """

    # --- Challenges ---

    @staticmethod
    def get_challenge_by_id(db: Session, challenge_id: int) -> Optional[Challenge]:
        """Fetch challenge by ID."""
        return db.query(Challenge).filter(Challenge.id == challenge_id).first()

    @staticmethod
    def list_challenges(
        db: Session,
        category: Optional[str] = None,
        required_skill: Optional[str] = None,
        difficulty: Optional[str] = None,
        creator_id: Optional[int] = None,
        status: Optional[str] = None,
        organization_name: Optional[str] = None,
        search_query: Optional[str] = None,
        only_available: bool = False,
        page: int = 1,
        page_size: int = 10,
    ) -> Tuple[List[Challenge], int]:
        """
        Database-backed filtering, full-text search, and pagination for challenges.
        """
        query = db.query(Challenge)

        now = datetime.now(timezone.utc)
        if only_available:
            query = query.filter(
                Challenge.status == ChallengeStatus.OPEN.value,
                Challenge.deadline >= now,
            )
        elif status:
            status_val = status
            status_norm = status.strip().lower()
            for s in ChallengeStatus:
                if s.value.lower() == status_norm or s.name.lower() == status_norm:
                    status_val = s.value
                    break
            query = query.filter(Challenge.status == status_val)

        if category:
            cat_val = category
            cat_norm = category.strip().lower().replace("_", " ")
            for c in ChallengeCategory:
                if c.value.lower() == cat_norm or c.name.lower() == category.strip().lower():
                    cat_val = c.value
                    break
            query = query.filter(Challenge.category == cat_val)

        if difficulty:
            diff_val = difficulty
            diff_norm = difficulty.strip().lower()
            for d in ChallengeDifficulty:
                if d.value.lower() == diff_norm or d.name.lower() == diff_norm:
                    diff_val = d.value
                    break
            query = query.filter(Challenge.difficulty_level == diff_val)

        if creator_id:
            query = query.filter(Challenge.creator_user_id == creator_id)

        if organization_name:
            query = query.filter(Challenge.organization_name.ilike(f"%{organization_name.strip()}%"))

        if search_query:
            term = f"%{search_query.strip()}%"
            query = query.filter(
                or_(
                    Challenge.title.ilike(term),
                    Challenge.short_summary.ilike(term),
                    Challenge.problem_statement.ilike(term),
                )
            )

        # Pre-count before pagination
        total = query.count()

        # Deterministic ordering by deadline ascending, then created_at descending
        records = (
            query.order_by(Challenge.deadline.asc(), Challenge.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        # If filtering by required skill, filter in-memory for JSON list safely
        if required_skill:
            req_lower = required_skill.strip().lower()
            filtered_records = [
                c for c in records
                if any(req_lower in s.lower() for s in (c.required_skills or []))
            ]
            return filtered_records, len(filtered_records)

        return records, total

    @staticmethod
    def create_challenge(
        db: Session,
        challenge_in: ChallengeCreate,
        creator_user_id: int,
    ) -> Challenge:
        """Create a new challenge in draft status."""
        now = datetime.now(timezone.utc)
        record = Challenge(
            creator_user_id=creator_user_id,
            title=challenge_in.title.strip(),
            short_summary=challenge_in.short_summary.strip(),
            problem_statement=challenge_in.problem_statement.strip(),
            category=challenge_in.category.value,
            required_skills=challenge_in.required_skills or [],
            difficulty_level=challenge_in.difficulty_level.value,
            estimated_effort=challenge_in.estimated_effort,
            submission_instructions=challenge_in.submission_instructions,
            evaluation_criteria=challenge_in.evaluation_criteria or [],
            deadline=challenge_in.deadline,
            status=ChallengeStatus.DRAFT.value,
            organization_name=challenge_in.organization_name,
            reward_description=challenge_in.reward_description,
            mentorship_available=challenge_in.mentorship_available,
            opportunity_type_offered=challenge_in.opportunity_type_offered,
            opportunity_details=challenge_in.opportunity_details,
            created_at=now,
            updated_at=now,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def update_challenge(
        db: Session,
        challenge: Challenge,
        challenge_update: ChallengeUpdate,
    ) -> Challenge:
        """Update fields of an existing challenge."""
        update_dict = challenge_update.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            if hasattr(challenge, key):
                if hasattr(val, "value"):
                    setattr(challenge, key, val.value)
                else:
                    setattr(challenge, key, val)

        challenge.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(challenge)
        return challenge

    @staticmethod
    def set_challenge_status(
        db: Session,
        challenge: Challenge,
        new_status: ChallengeStatus,
    ) -> Challenge:
        """Update status and record lifecycle timestamps."""
        now = datetime.now(timezone.utc)
        challenge.status = new_status.value
        challenge.updated_at = now

        if new_status == ChallengeStatus.OPEN and not challenge.published_at:
            challenge.published_at = now
        elif new_status == ChallengeStatus.CLOSED:
            challenge.closed_at = now
        elif new_status == ChallengeStatus.COMPLETED:
            challenge.completed_at = now

        db.commit()
        db.refresh(challenge)
        return challenge

    # --- Submissions ---

    @staticmethod
    def get_submission_by_id(db: Session, submission_id: int) -> Optional[ChallengeSubmission]:
        """Fetch submission by ID."""
        return db.query(ChallengeSubmission).filter(ChallengeSubmission.id == submission_id).first()

    @staticmethod
    def get_user_active_submission(
        db: Session,
        challenge_id: int,
        student_user_id: int,
    ) -> Optional[ChallengeSubmission]:
        """Fetch active non-withdrawn submission for a student on a challenge."""
        return (
            db.query(ChallengeSubmission)
            .filter(
                ChallengeSubmission.challenge_id == challenge_id,
                ChallengeSubmission.student_user_id == student_user_id,
                ChallengeSubmission.status != SubmissionStatus.WITHDRAWN.value,
            )
            .first()
        )

    @staticmethod
    def list_submissions_for_challenge(
        db: Session,
        challenge_id: int,
    ) -> List[ChallengeSubmission]:
        """List all submissions for a challenge (for the creator)."""
        return (
            db.query(ChallengeSubmission)
            .filter(ChallengeSubmission.challenge_id == challenge_id)
            .order_by(ChallengeSubmission.created_at.desc())
            .all()
        )

    @staticmethod
    def list_submissions_for_student(
        db: Session,
        student_user_id: int,
    ) -> List[ChallengeSubmission]:
        """List all submissions submitted by a student."""
        return (
            db.query(ChallengeSubmission)
            .filter(ChallengeSubmission.student_user_id == student_user_id)
            .order_by(ChallengeSubmission.created_at.desc())
            .all()
        )

    @staticmethod
    def create_submission(
        db: Session,
        submission_in: SubmissionCreate,
        challenge_id: int,
        student_user_id: int,
    ) -> ChallengeSubmission:
        """Record a student submission."""
        now = datetime.now(timezone.utc)
        record = ChallengeSubmission(
            challenge_id=challenge_id,
            student_user_id=student_user_id,
            submission_description=submission_in.submission_description.strip(),
            repository_url=submission_in.repository_url.strip(),
            demo_url=submission_in.demo_url.strip() if submission_in.demo_url else None,
            supporting_evidence_urls=submission_in.supporting_evidence_urls or [],
            attachment_references=submission_in.attachment_references or [],
            status=SubmissionStatus.SUBMITTED.value,
            created_at=now,
            updated_at=now,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def update_submission(
        db: Session,
        submission: ChallengeSubmission,
        submission_update: SubmissionUpdate,
    ) -> ChallengeSubmission:
        """Update student's own submission."""
        update_dict = submission_update.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            if hasattr(submission, key):
                setattr(submission, key, val)

        submission.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def withdraw_submission(db: Session, submission: ChallengeSubmission) -> ChallengeSubmission:
        """Withdraw a submission."""
        submission.status = SubmissionStatus.WITHDRAWN.value
        submission.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(submission)
        return submission

    # --- Reviews ---

    @staticmethod
    def get_review_by_id(db: Session, review_id: int) -> Optional[SubmissionReview]:
        """Fetch review by ID."""
        return db.query(SubmissionReview).filter(SubmissionReview.id == review_id).first()

    @staticmethod
    def list_reviews_for_submission(
        db: Session,
        submission_id: int,
    ) -> List[SubmissionReview]:
        """Fetch reviews for a submission."""
        return (
            db.query(SubmissionReview)
            .filter(SubmissionReview.submission_id == submission_id)
            .order_by(SubmissionReview.created_at.desc())
            .all()
        )

    @staticmethod
    def create_review(
        db: Session,
        review_in: ReviewCreate,
        submission: ChallengeSubmission,
        reviewer_user_id: int,
    ) -> SubmissionReview:
        """Record review and update submission status to reviewed."""
        now = datetime.now(timezone.utc)
        review = SubmissionReview(
            submission_id=submission.id,
            reviewer_user_id=reviewer_user_id,
            technical_feedback=review_in.technical_feedback.strip(),
            score=review_in.score,
            evaluation_criterion_results=review_in.evaluation_criterion_results or [],
            strengths=review_in.strengths or [],
            areas_for_improvement=review_in.areas_for_improvement or [],
            status=review_in.status.value,
            created_at=now,
            updated_at=now,
        )
        db.add(review)

        # Update submission status
        submission.status = SubmissionStatus.REVIEWED.value
        submission.updated_at = now

        db.commit()
        db.refresh(review)
        return review

    # --- Outcomes ---

    @staticmethod
    def get_outcome_by_id(db: Session, outcome_id: int) -> Optional[ChallengeOutcome]:
        """Fetch outcome by ID."""
        return db.query(ChallengeOutcome).filter(ChallengeOutcome.id == outcome_id).first()

    @staticmethod
    def list_outcomes_for_student(
        db: Session,
        student_user_id: int,
    ) -> List[ChallengeOutcome]:
        """List all verified challenge outcomes earned by a student."""
        return (
            db.query(ChallengeOutcome)
            .filter(ChallengeOutcome.student_user_id == student_user_id)
            .order_by(ChallengeOutcome.created_at.desc())
            .all()
        )

    @staticmethod
    def create_outcome(
        db: Session,
        outcome_in: OutcomeCreate,
        challenge_id: int,
        granted_by_user_id: int,
    ) -> ChallengeOutcome:
        """Award an explicit professional outcome."""
        now = datetime.now(timezone.utc)
        record = ChallengeOutcome(
            challenge_id=challenge_id,
            submission_id=outcome_in.submission_id,
            student_user_id=outcome_in.student_user_id,
            granted_by_user_id=granted_by_user_id,
            outcome_type=outcome_in.outcome_type.value,
            title=outcome_in.title.strip(),
            details=outcome_in.details,
            skills_demonstrated=outcome_in.skills_demonstrated or [],
            created_at=now,
            updated_at=now,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
