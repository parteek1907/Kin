"""
Skill Bounty Network Feature Package.
Connects students with alumni, founders, recruiters, and faculty through real-world challenges.
"""

from app.features.skill_bounty.models import (
    Challenge,
    ChallengeSubmission,
    SubmissionReview,
    ChallengeOutcome,
    ChallengeCategory,
    ChallengeDifficulty,
    ChallengeStatus,
    SubmissionStatus,
    ReviewStatus,
    OutcomeType,
)
from app.features.skill_bounty.router import router as skill_bounty_router

__all__ = [
    "Challenge",
    "ChallengeSubmission",
    "SubmissionReview",
    "ChallengeOutcome",
    "ChallengeCategory",
    "ChallengeDifficulty",
    "ChallengeStatus",
    "SubmissionStatus",
    "ReviewStatus",
    "OutcomeType",
    "skill_bounty_router",
]
