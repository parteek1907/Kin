"""
Service layer for Skill Bounty Network.
Implements business workflows, state transitions, validation, and domain logic.
"""

from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.features.skill_bounty.models import (
    Challenge,
    ChallengeSubmission,
    SubmissionReview,
    ChallengeOutcome,
    ChallengeStatus,
    SubmissionStatus,
    ReviewStatus,
    OutcomeType,
    ChallengeCategory,
    ChallengeDifficulty,
)
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
from app.features.skill_bounty.repository import SkillBountyRepository
from app.features.skill_bounty.permissions import SkillBountyPermissions
from app.features.skill_bounty.matching import challenge_matcher


class SkillBountyService:
    """
    Coordinates repository operations, permission checks, and domain rules.
    """

    # --- Challenges ---

    @staticmethod
    def create_challenge(db: Session, challenge_in: ChallengeCreate, user: User) -> ChallengeResponse:
        """Create a new challenge in draft status after verifying creator role."""
        SkillBountyPermissions.require_challenge_creation_permission(user)

        # Validate deadline is in the future
        now = datetime.now(timezone.utc)
        dl = challenge_in.deadline
        if dl.tzinfo is None:
            dl = dl.replace(tzinfo=timezone.utc)
        if dl <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge deadline must be in the future."
            )

        challenge = SkillBountyRepository.create_challenge(
            db=db,
            challenge_in=challenge_in,
            creator_user_id=user.id,
        )
        return SkillBountyService._to_challenge_response(challenge)

    @staticmethod
    def get_challenge(db: Session, challenge_id: int) -> ChallengeResponse:
        """Get challenge details by ID."""
        challenge = SkillBountyRepository.get_challenge_by_id(db, challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Challenge with ID {challenge_id} not found."
            )
        return SkillBountyService._to_challenge_response(challenge)

    @staticmethod
    def list_challenges(
        db: Session,
        category: Optional[str] = None,
        required_skill: Optional[str] = None,
        difficulty: Optional[str] = None,
        creator_id: Optional[int] = None,
        status_filter: Optional[str] = None,
        organization_name: Optional[str] = None,
        search_query: Optional[str] = None,
        only_available: bool = False,
        page: int = 1,
        page_size: int = 10,
    ) -> ChallengeListResponse:
        """Query challenges with filters, search, and pagination."""
        records, total = SkillBountyRepository.list_challenges(
            db=db,
            category=category,
            required_skill=required_skill,
            difficulty=difficulty,
            creator_id=creator_id,
            status=status_filter,
            organization_name=organization_name,
            search_query=search_query,
            only_available=only_available,
            page=page,
            page_size=page_size,
        )

        items = [SkillBountyService._to_challenge_response(c) for c in records]
        total_pages = (total + page_size - 1) // page_size if total > 0 else 1

        return ChallengeListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    @staticmethod
    def update_challenge(
        db: Session,
        challenge_id: int,
        challenge_update: ChallengeUpdate,
        user: User,
    ) -> ChallengeResponse:
        """Update an existing challenge (creator only)."""
        challenge = SkillBountyRepository.get_challenge_by_id(db, challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Challenge with ID {challenge_id} not found."
            )

        SkillBountyPermissions.require_challenge_ownership(user, challenge)

        if challenge.status in [ChallengeStatus.COMPLETED.value, ChallengeStatus.CANCELLED.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot edit challenge in {challenge.status} state."
            )

        if challenge_update.deadline:
            dl = challenge_update.deadline
            if dl.tzinfo is None:
                dl = dl.replace(tzinfo=timezone.utc)
            if dl <= datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Updated deadline must be in the future."
                )

        updated = SkillBountyRepository.update_challenge(db, challenge, challenge_update)
        return SkillBountyService._to_challenge_response(updated)

    @staticmethod
    def publish_challenge(db: Session, challenge_id: int, user: User) -> ChallengeResponse:
        """Publish a challenge (DRAFT -> OPEN)."""
        challenge = SkillBountyRepository.get_challenge_by_id(db, challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Challenge with ID {challenge_id} not found."
            )

        SkillBountyPermissions.require_challenge_ownership(user, challenge)

        if challenge.status != ChallengeStatus.DRAFT.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot publish challenge in '{challenge.status}' status. Only DRAFT challenges can be published."
            )

        dl = challenge.deadline
        if dl.tzinfo is None:
            dl = dl.replace(tzinfo=timezone.utc)
        if dl <= datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot publish a challenge with an expired deadline."
            )

        updated = SkillBountyRepository.set_challenge_status(db, challenge, ChallengeStatus.OPEN)
        return SkillBountyService._to_challenge_response(updated)

    @staticmethod
    def close_challenge(db: Session, challenge_id: int, user: User) -> ChallengeResponse:
        """Close an open challenge (OPEN -> CLOSED)."""
        challenge = SkillBountyRepository.get_challenge_by_id(db, challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Challenge with ID {challenge_id} not found."
            )

        SkillBountyPermissions.require_challenge_ownership(user, challenge)

        if challenge.status != ChallengeStatus.OPEN.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot close challenge with status '{challenge.status}'. Only OPEN challenges can be closed."
            )

        updated = SkillBountyRepository.set_challenge_status(db, challenge, ChallengeStatus.CLOSED)
        return SkillBountyService._to_challenge_response(updated)

    @staticmethod
    def cancel_challenge(db: Session, challenge_id: int, user: User) -> ChallengeResponse:
        """Cancel a challenge (DRAFT or OPEN -> CANCELLED)."""
        challenge = SkillBountyRepository.get_challenge_by_id(db, challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Challenge with ID {challenge_id} not found."
            )

        SkillBountyPermissions.require_challenge_ownership(user, challenge)

        if challenge.status in [ChallengeStatus.COMPLETED.value, ChallengeStatus.CANCELLED.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Challenge is already {challenge.status}."
            )

        updated = SkillBountyRepository.set_challenge_status(db, challenge, ChallengeStatus.CANCELLED)
        return SkillBountyService._to_challenge_response(updated)

    @staticmethod
    def complete_challenge(db: Session, challenge_id: int, user: User) -> ChallengeResponse:
        """Complete a challenge (CLOSED -> COMPLETED)."""
        challenge = SkillBountyRepository.get_challenge_by_id(db, challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Challenge with ID {challenge_id} not found."
            )

        SkillBountyPermissions.require_challenge_ownership(user, challenge)

        if challenge.status not in [ChallengeStatus.CLOSED.value, ChallengeStatus.OPEN.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete challenge from status '{challenge.status}'."
            )

        updated = SkillBountyRepository.set_challenge_status(db, challenge, ChallengeStatus.COMPLETED)
        return SkillBountyService._to_challenge_response(updated)

    # --- Submissions ---

    @staticmethod
    def create_submission(
        db: Session,
        challenge_id: int,
        submission_in: SubmissionCreate,
        user: User,
    ) -> SubmissionResponse:
        """Submit a solution to an open challenge."""
        challenge = SkillBountyRepository.get_challenge_by_id(db, challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Challenge with ID {challenge_id} not found."
            )

        # Enforce submittable criteria (open status, not expired, creator cannot submit)
        SkillBountyPermissions.require_submittable_challenge(user, challenge)

        # Check for existing active submission
        existing = SkillBountyRepository.get_user_active_submission(
            db=db,
            challenge_id=challenge_id,
            student_user_id=user.id,
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active submission for this challenge. You may update your existing submission or withdraw it first."
            )

        submission = SkillBountyRepository.create_submission(
            db=db,
            submission_in=submission_in,
            challenge_id=challenge_id,
            student_user_id=user.id,
        )
        return SkillBountyService._to_submission_response(submission)

    @staticmethod
    def list_submissions_for_challenge(
        db: Session,
        challenge_id: int,
        user: User,
    ) -> List[SubmissionResponse]:
        """List all submissions for a challenge (creator only)."""
        challenge = SkillBountyRepository.get_challenge_by_id(db, challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Challenge with ID {challenge_id} not found."
            )

        SkillBountyPermissions.require_submissions_view_permission(user, challenge)

        records = SkillBountyRepository.list_submissions_for_challenge(db, challenge_id)
        return [SkillBountyService._to_submission_response(s) for s in records]

    @staticmethod
    def list_my_submissions(db: Session, user: User) -> List[SubmissionResponse]:
        """List all submissions submitted by the authenticated student."""
        records = SkillBountyRepository.list_submissions_for_student(db, user.id)
        return [SkillBountyService._to_submission_response(s) for s in records]

    @staticmethod
    def get_submission(db: Session, submission_id: int, user: User) -> SubmissionResponse:
        """Get single submission details (owner or challenge creator only)."""
        submission = SkillBountyRepository.get_submission_by_id(db, submission_id)
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Submission with ID {submission_id} not found."
            )

        challenge = SkillBountyRepository.get_challenge_by_id(db, submission.challenge_id)
        assert challenge is not None
        SkillBountyPermissions.require_submission_access(user, submission, challenge)

        return SkillBountyService._to_submission_response(submission)

    @staticmethod
    def update_submission(
        db: Session,
        submission_id: int,
        submission_update: SubmissionUpdate,
        user: User,
    ) -> SubmissionResponse:
        """Update student's own submission."""
        submission = SkillBountyRepository.get_submission_by_id(db, submission_id)
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Submission with ID {submission_id} not found."
            )

        SkillBountyPermissions.require_submission_modification_permission(user, submission)

        if submission.status == SubmissionStatus.WITHDRAWN.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot edit a withdrawn submission."
            )

        challenge = SkillBountyRepository.get_challenge_by_id(db, submission.challenge_id)
        if challenge:
            dl = challenge.deadline
            if dl.tzinfo is None:
                dl = dl.replace(tzinfo=timezone.utc)
            if dl <= datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot edit submission after challenge deadline has passed."
                )

        updated = SkillBountyRepository.update_submission(db, submission, submission_update)
        return SkillBountyService._to_submission_response(updated)

    @staticmethod
    def withdraw_submission(db: Session, submission_id: int, user: User) -> SubmissionResponse:
        """Withdraw student's own submission."""
        submission = SkillBountyRepository.get_submission_by_id(db, submission_id)
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Submission with ID {submission_id} not found."
            )

        SkillBountyPermissions.require_submission_modification_permission(user, submission)

        if submission.status == SubmissionStatus.WITHDRAWN.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Submission is already withdrawn."
            )

        withdrawn = SkillBountyRepository.withdraw_submission(db, submission)
        return SkillBountyService._to_submission_response(withdrawn)

    # --- Reviews ---

    @staticmethod
    def create_review(
        db: Session,
        submission_id: int,
        review_in: ReviewCreate,
        user: User,
    ) -> ReviewResponse:
        """Create a technical review and score for a submission."""
        submission = SkillBountyRepository.get_submission_by_id(db, submission_id)
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Submission with ID {submission_id} not found."
            )

        challenge = SkillBountyRepository.get_challenge_by_id(db, submission.challenge_id)
        assert challenge is not None

        # Check permissions: challenge creator or authorized reviewer, strictly no self-review
        SkillBountyPermissions.require_review_permission(user, submission, challenge)

        review = SkillBountyRepository.create_review(
            db=db,
            review_in=review_in,
            submission=submission,
            reviewer_user_id=user.id,
        )
        return SkillBountyService._to_review_response(review)

    @staticmethod
    def list_reviews_for_submission(
        db: Session,
        submission_id: int,
        user: User,
    ) -> List[ReviewResponse]:
        """List reviews for a submission (accessible by submission student or challenge creator)."""
        submission = SkillBountyRepository.get_submission_by_id(db, submission_id)
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Submission with ID {submission_id} not found."
            )

        challenge = SkillBountyRepository.get_challenge_by_id(db, submission.challenge_id)
        assert challenge is not None

        SkillBountyPermissions.require_submission_access(user, submission, challenge)

        reviews = SkillBountyRepository.list_reviews_for_submission(db, submission_id)
        return [SkillBountyService._to_review_response(r) for r in reviews]

    # --- Professional Outcomes ---

    @staticmethod
    def record_outcome(
        db: Session,
        challenge_id: int,
        outcome_in: OutcomeCreate,
        user: User,
    ) -> OutcomeResponse:
        """Explicitly record a verified professional outcome for a challenge submission."""
        challenge = SkillBountyRepository.get_challenge_by_id(db, challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Challenge with ID {challenge_id} not found."
            )

        SkillBountyPermissions.require_outcome_grant_permission(user, challenge)

        submission = SkillBountyRepository.get_submission_by_id(db, outcome_in.submission_id)
        if not submission or submission.challenge_id != challenge_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Submission {outcome_in.submission_id} does not belong to challenge {challenge_id}."
            )

        if submission.student_user_id != outcome_in.student_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specified student_user_id does not match the submission author."
            )

        outcome = SkillBountyRepository.create_outcome(
            db=db,
            outcome_in=outcome_in,
            challenge_id=challenge_id,
            granted_by_user_id=user.id,
        )
        return SkillBountyService._to_outcome_response(outcome)

    # --- Recommendations ---

    @staticmethod
    def get_recommendations_for_user(
        db: Session,
        user: User,
        limit: int = 10,
    ) -> ChallengeRecommendationsResponse:
        """Generate explainable, deterministic challenge recommendations for the current user."""
        all_challenges, _ = SkillBountyRepository.list_challenges(
            db=db,
            only_available=True,
            page=1,
            page_size=100,
        )

        ranked = challenge_matcher.rank_challenges(user, all_challenges, limit=limit)

        return ChallengeRecommendationsResponse(
            user_id=user.id,
            total=len(ranked),
            recommendations=ranked,
        )

    # --- Helper Serializers ---

    @staticmethod
    def _to_challenge_response(ch: Challenge) -> ChallengeResponse:
        creator_name = ch.creator.profile.full_name if (ch.creator and ch.creator.profile) else None
        creator_role = ch.creator.profile.role if (ch.creator and ch.creator.profile) else None
        subs_count = len(ch.submissions) if hasattr(ch, "submissions") and ch.submissions is not None else 0

        # Safely convert category
        category_enum = ch.category
        if isinstance(category_enum, str):
            cat_norm = category_enum.strip().lower().replace("_", " ")
            for c in ChallengeCategory:
                if c.value.lower() == cat_norm or c.name.lower() == category_enum.strip().lower():
                    category_enum = c
                    break

        # Safely convert difficulty
        diff_enum = ch.difficulty_level
        if isinstance(diff_enum, str):
            diff_norm = diff_enum.strip().lower()
            for d in ChallengeDifficulty:
                if d.value.lower() == diff_norm or d.name.lower() == diff_norm:
                    diff_enum = d
                    break

        # Safely convert status
        status_enum = ch.status
        if isinstance(status_enum, str):
            status_norm = status_enum.strip().lower()
            for s in ChallengeStatus:
                if s.value.lower() == status_norm or s.name.lower() == status_norm:
                    status_enum = s
                    break

        return ChallengeResponse(
            id=ch.id,
            creator_user_id=ch.creator_user_id,
            title=ch.title,
            short_summary=ch.short_summary,
            problem_statement=ch.problem_statement,
            category=category_enum,
            required_skills=ch.required_skills or [],
            difficulty_level=diff_enum,
            estimated_effort=ch.estimated_effort,
            submission_instructions=ch.submission_instructions,
            evaluation_criteria=ch.evaluation_criteria or [],
            deadline=ch.deadline,
            organization_name=ch.organization_name,
            reward_description=ch.reward_description,
            mentorship_available=ch.mentorship_available,
            opportunity_type_offered=ch.opportunity_type_offered,
            opportunity_details=ch.opportunity_details,
            status=status_enum,
            published_at=ch.published_at,
            closed_at=ch.closed_at,
            completed_at=ch.completed_at,
            created_at=ch.created_at,
            updated_at=ch.updated_at,
            submissions_count=subs_count,
            creator_name=creator_name,
            creator_role=creator_role,
        )

    @staticmethod
    def _to_submission_response(sub: ChallengeSubmission) -> SubmissionResponse:
        student_name = sub.student.profile.full_name if (sub.student and sub.student.profile) else None
        challenge_title = sub.challenge.title if sub.challenge else None
        reviews = sub.reviews or []
        avg_score = (sum(r.score for r in reviews) / len(reviews)) if reviews else None

        status_enum = sub.status
        if isinstance(status_enum, str):
            status_norm = status_enum.strip().lower()
            for s in SubmissionStatus:
                if s.value.lower() == status_norm or s.name.lower() == status_norm:
                    status_enum = s
                    break

        return SubmissionResponse(
            id=sub.id,
            challenge_id=sub.challenge_id,
            student_user_id=sub.student_user_id,
            submission_description=sub.submission_description,
            repository_url=sub.repository_url,
            demo_url=sub.demo_url,
            supporting_evidence_urls=sub.supporting_evidence_urls or [],
            attachment_references=sub.attachment_references or [],
            status=status_enum,
            created_at=sub.created_at,
            updated_at=sub.updated_at,
            student_name=student_name,
            challenge_title=challenge_title,
            reviews_count=len(reviews),
            average_score=round(avg_score, 1) if avg_score is not None else None,
        )

    @staticmethod
    def _to_review_response(rev: SubmissionReview) -> ReviewResponse:
        reviewer_name = rev.reviewer.profile.full_name if (rev.reviewer and rev.reviewer.profile) else None

        status_enum = rev.status
        if isinstance(status_enum, str):
            status_norm = status_enum.strip().lower()
            for s in ReviewStatus:
                if s.value.lower() == status_norm or s.name.lower() == status_norm:
                    status_enum = s
                    break

        return ReviewResponse(
            id=rev.id,
            submission_id=rev.submission_id,
            reviewer_user_id=rev.reviewer_user_id,
            technical_feedback=rev.technical_feedback,
            score=rev.score,
            evaluation_criterion_results=rev.evaluation_criterion_results or [],
            strengths=rev.strengths or [],
            areas_for_improvement=rev.areas_for_improvement or [],
            status=status_enum,
            created_at=rev.created_at,
            updated_at=rev.updated_at,
            reviewer_name=reviewer_name,
        )

    @staticmethod
    def _to_outcome_response(out: ChallengeOutcome) -> OutcomeResponse:
        challenge_title = out.challenge.title if out.challenge else None

        outcome_enum = out.outcome_type
        if isinstance(outcome_enum, str):
            outcome_norm = outcome_enum.strip().lower()
            for o in OutcomeType:
                if o.value.lower() == outcome_norm or o.name.lower() == outcome_norm:
                    outcome_enum = o
                    break

        return OutcomeResponse(
            id=out.id,
            challenge_id=out.challenge_id,
            submission_id=out.submission_id,
            student_user_id=out.student_user_id,
            granted_by_user_id=out.granted_by_user_id,
            outcome_type=outcome_enum,
            title=out.title,
            details=out.details,
            skills_demonstrated=out.skills_demonstrated or [],
            challenge_title=challenge_title,
            created_at=out.created_at,
            updated_at=out.updated_at,
        )
