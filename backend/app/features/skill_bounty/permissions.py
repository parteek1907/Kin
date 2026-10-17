"""
Permissions and Access Control Layer for Skill Bounty Network.
Enforces role-based permissions, challenge ownership, submission ownership,
and prevents self-reviews and unauthorized access.
"""

from datetime import datetime, timezone
from fastapi import HTTPException, status

from app.models.user import User
from app.models.profile import PlatformRole
from app.features.skill_bounty.models import (
    Challenge,
    ChallengeSubmission,
    ChallengeStatus,
    SubmissionStatus,
)


class SkillBountyPermissions:
    """
    Enforces authorization rules on backend endpoints.
    """

    ALLOWED_CREATOR_ROLES = {
        PlatformRole.ALUMNI.value.lower(),
        PlatformRole.FOUNDER.value.lower(),
        PlatformRole.RECRUITER.value.lower(),
        PlatformRole.FACULTY.value.lower(),
    }

    @classmethod
    def require_challenge_creation_permission(cls, user: User) -> None:
        """
        Only Alumni, Founders, Recruiters, and Faculty can publish challenges.
        Students participate as submitters.
        """
        role = user.profile.role if user.profile else PlatformRole.STUDENT.value
        if role.lower() not in cls.ALLOWED_CREATOR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Alumni, Founders, Recruiters, and Faculty are authorized to create challenges."
            )

    @classmethod
    def require_challenge_ownership(cls, user: User, challenge: Challenge) -> None:
        """Verify the authenticated user is the challenge creator."""
        if challenge.creator_user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to modify or manage this challenge."
            )

    @classmethod
    def require_submissions_view_permission(cls, user: User, challenge: Challenge) -> None:
        """Only the challenge creator can inspect submissions submitted to their challenge."""
        if challenge.creator_user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view submissions for this challenge."
            )

    @classmethod
    def require_submission_access(cls, user: User, submission: ChallengeSubmission, challenge: Challenge) -> None:
        """
        Only the submission owner (student) or the challenge creator can access a single submission.
        """
        is_owner = (submission.student_user_id == user.id)
        is_creator = (challenge.creator_user_id == user.id)
        if not (is_owner or is_creator):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this submission."
            )

    @classmethod
    def require_submission_modification_permission(cls, user: User, submission: ChallengeSubmission) -> None:
        """Only the student who authored the submission can modify or withdraw it."""
        if submission.student_user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit or withdraw your own submissions."
            )

    @classmethod
    def require_submittable_challenge(cls, user: User, challenge: Challenge) -> None:
        """
        Validate that challenge is accepting submissions:
        - Must be OPEN status.
        - Deadline must not be expired.
        - Challenge creator cannot submit to their own challenge.
        """
        if challenge.creator_user_id == user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge creators cannot submit solutions to their own challenges."
            )

        if challenge.status != ChallengeStatus.OPEN.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Challenge is {challenge.status} and not accepting submissions."
            )

        deadline = challenge.deadline
        if deadline and deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)

        if deadline and deadline < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge deadline has expired."
            )

    @classmethod
    def require_review_permission(
        cls,
        user: User,
        submission: ChallengeSubmission,
        challenge: Challenge,
    ) -> None:
        """
        Only challenge creator can review submissions.
        Self-review is strictly rejected.
        """
        if submission.student_user_id == user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Self-review is strictly prohibited. You cannot review your own submission."
            )

        if challenge.creator_user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the challenge creator or authorized reviewer can submit a review."
            )

    @classmethod
    def require_outcome_grant_permission(cls, user: User, challenge: Challenge) -> None:
        """Only the challenge creator can award explicit professional outcomes."""
        if challenge.creator_user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the challenge creator is authorized to award professional outcomes."
            )
