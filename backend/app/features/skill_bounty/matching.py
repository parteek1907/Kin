"""
AI-Ready Deterministic Challenge Matching and Recommendation Engine for Skill Bounty Network.

Evaluates transparent signals:
- Direct Skill Overlap (user profile skills vs challenge requirements)
- Domain / Interest Relevance (industry, biography, headline keywords vs challenge category)
- Difficulty Compatibility (years of experience vs challenge difficulty tier)
- Deadline Runway (sufficient remaining time to complete the challenge)

Includes an extensible ChallengeAIExplanationInterface allowing future LLM explanation
integration without modifying the matching engine.
"""

from typing import List, Dict, Any, Optional, Protocol, Tuple, Set
from dataclasses import dataclass, field
from datetime import datetime, timezone
import re

from app.models.user import User
from app.features.skill_bounty.models import (
    Challenge,
    ChallengeCategory,
    ChallengeDifficulty,
    ChallengeStatus,
)
from app.features.skill_bounty.schemas import (
    ChallengeResponse,
    ChallengeRecommendationItem,
)


def _normalize_skill(skill: str) -> str:
    """Normalize skill string for case-insensitive and punctuation-agnostic comparison."""
    if not skill:
        return ""
    cleaned = re.sub(r"[^a-zA-Z0-9+#]", "", skill.strip().lower())
    return cleaned


@dataclass
class ChallengeMatchScore:
    """Breakdown of deterministic matching signals."""
    challenge_id: int
    relevance_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    match_reasons: List[str]
    difficulty_fit: str
    skill_score: float
    domain_score: float
    difficulty_score: float
    deadline_score: float


class ChallengeAIExplanationInterface(Protocol):
    """
    Protocol for AI explanation layers.
    Allows LLM synthesis to be plugged in seamlessly without rewriting the recommendation core.
    """
    def generate_explanation(
        self,
        user_skills: List[str],
        challenge: Challenge,
        matched_skills: List[str],
        missing_skills: List[str],
        relevance_score: float,
    ) -> List[str]:
        ...


class DeterministicExplanationGenerator:
    """
    Default deterministic explanation generator.
    Produces transparent, non-hallucinatory reasons for challenge matches.
    """
    def generate_explanation(
        self,
        user_skills: List[str],
        challenge: Challenge,
        matched_skills: List[str],
        missing_skills: List[str],
        relevance_score: float,
    ) -> List[str]:
        reasons: List[str] = []

        if matched_skills:
            skills_str = ", ".join(matched_skills[:3])
            reasons.append(f"Demonstrates your experience in {skills_str}.")
        elif not user_skills:
            reasons.append(
                "Great opportunity to build foundational proof of skill (profile skills not yet listed)."
            )
        else:
            reasons.append(f"Broadens your portfolio in {challenge.category.replace('_', ' ').title()}.")

        if challenge.difficulty_level:
            reasons.append(f"Calibrated for {challenge.difficulty_level.lower()} level builders.")

        if challenge.mentorship_available:
            reasons.append("Creator offers 1-on-1 mentorship for top submissions.")

        if challenge.opportunity_type_offered:
            reasons.append(f"Opportunity for: {challenge.opportunity_type_offered}.")

        return reasons


class ChallengeMatchingEngine:
    """
    Deterministic matching service for Skill Bounty challenges.
    Ranks open challenges against user profiles using transparent signals.
    """

    def __init__(
        self,
        explanation_generator: Optional[ChallengeAIExplanationInterface] = None,
    ):
        self.explanation_generator = explanation_generator or DeterministicExplanationGenerator()

    def evaluate_challenge(
        self,
        user: User,
        challenge: Challenge,
    ) -> ChallengeMatchScore:
        """
        Evaluate a single challenge against a user's profile and background.
        """
        profile = user.profile
        now = datetime.now(timezone.utc)

        # 1. Gather User Skills
        raw_user_skills: List[str] = []
        if profile and profile.skills:
            if isinstance(profile.skills, list):
                raw_user_skills.extend([str(s) for s in profile.skills if s])

        # Also pull skills from career journeys if present
        if hasattr(user, "career_journeys") and user.career_journeys:
            for j in user.career_journeys:
                if hasattr(j, "skills_used") and j.skills_used and isinstance(j.skills_used, list):
                    raw_user_skills.extend([str(s) for s in j.skills_used if s])

        user_skills_norm = {_normalize_skill(s): s for s in raw_user_skills if s}

        # 2. Analyze Challenge Required Skills
        req_skills = challenge.required_skills or []
        matched_skills: List[str] = []
        missing_skills: List[str] = []

        for req in req_skills:
            req_norm = _normalize_skill(req)
            if req_norm in user_skills_norm:
                matched_skills.append(req)
            else:
                missing_skills.append(req)

        # 3. Compute Skill Score (0 - 100)
        if req_skills:
            skill_ratio = len(matched_skills) / len(req_skills)
            skill_score = skill_ratio * 100.0
        else:
            # If challenge has no strict required skills, baseline is neutral
            skill_score = 60.0

        # If user has no skills listed in profile, give a reasonable fallback
        if not raw_user_skills:
            if challenge.difficulty_level in [ChallengeDifficulty.BEGINNER.value, ChallengeDifficulty.BEGINNER]:
                skill_score = 65.0
            else:
                skill_score = 40.0

        # 4. Compute Domain / Interest Score (0 - 100)
        domain_score = 50.0
        user_bio = (profile.biography or "") if profile else ""
        user_headline = (profile.headline or "") if profile else ""
        user_industry = (profile.industry or "") if profile else ""
        user_context = f"{user_bio} {user_headline} {user_industry}".lower()

        cat_clean = challenge.category.replace("_", " ").lower()
        if cat_clean in user_context or (user_industry and user_industry.lower() in cat_clean):
            domain_score = 90.0
        elif any(w in user_context for w in cat_clean.split()):
            domain_score = 75.0

        # 5. Compute Difficulty Compatibility Score (0 - 100)
        years_exp = float(profile.years_of_experience) if (profile and profile.years_of_experience) else 0.0
        diff_str = str(challenge.difficulty_level).lower()

        if "beginner" in diff_str:
            if years_exp <= 1.5:
                difficulty_score = 100.0
                difficulty_fit = "Optimal fit for your early-career background."
            elif years_exp <= 3.0:
                difficulty_score = 80.0
                difficulty_fit = "Comfortable difficulty for your experience level."
            else:
                difficulty_score = 65.0
                difficulty_fit = "Introductory challenge; low technical stretch."
        elif "intermediate" in diff_str:
            if 1.0 <= years_exp <= 4.0:
                difficulty_score = 100.0
                difficulty_fit = "Well-aligned with your intermediate experience."
            elif years_exp < 1.0:
                difficulty_score = 70.0
                difficulty_fit = "Moderate stretch challenge to accelerate growth."
            else:
                difficulty_score = 85.0
                difficulty_fit = "Within your established technical competencies."
        elif "advanced" in diff_str:
            if 3.0 <= years_exp <= 6.0:
                difficulty_score = 100.0
                difficulty_fit = "Strong alignment with senior-track competencies."
            elif years_exp < 3.0:
                difficulty_score = 60.0
                difficulty_fit = "Ambitious stretch challenge requiring deep effort."
            else:
                difficulty_score = 90.0
                difficulty_fit = "Direct match for your senior experience."
        else:  # EXPERT
            if years_exp >= 5.0:
                difficulty_score = 100.0
                difficulty_fit = "Targeted for seasoned subject matter experts."
            else:
                difficulty_score = 50.0
                difficulty_fit = "High difficulty stretch challenge."

        # 6. Deadline Runway Score (0 - 100)
        deadline = challenge.deadline
        if deadline and deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)

        if deadline:
            remaining_seconds = (deadline - now).total_seconds()
            if remaining_seconds <= 0:
                deadline_score = 0.0
            else:
                days_left = remaining_seconds / 86400.0
                if days_left >= 7.0:
                    deadline_score = 100.0
                elif days_left >= 3.0:
                    deadline_score = 85.0
                elif days_left >= 1.0:
                    deadline_score = 70.0
                else:
                    deadline_score = 40.0
        else:
            deadline_score = 75.0

        # 7. Weighted Composite Score
        # Weights: Skill Overlap 45%, Domain Relevance 25%, Difficulty Compatibility 20%, Runway 10%
        composite = (
            (skill_score * 0.45) +
            (domain_score * 0.25) +
            (difficulty_score * 0.20) +
            (deadline_score * 0.10)
        )

        # Bonus for mentorship or opportunity
        if challenge.mentorship_available:
            composite = min(100.0, composite + 3.0)
        if challenge.opportunity_type_offered:
            composite = min(100.0, composite + 2.0)

        final_relevance = round(max(0.0, min(100.0, composite)), 1)

        # Generate Explainable Reasons
        match_reasons = self.explanation_generator.generate_explanation(
            user_skills=raw_user_skills,
            challenge=challenge,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            relevance_score=final_relevance,
        )

        return ChallengeMatchScore(
            challenge_id=challenge.id,
            relevance_score=final_relevance,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            match_reasons=match_reasons,
            difficulty_fit=difficulty_fit,
            skill_score=round(skill_score, 1),
            domain_score=round(domain_score, 1),
            difficulty_score=round(difficulty_score, 1),
            deadline_score=round(deadline_score, 1),
        )

    def rank_challenges(
        self,
        user: User,
        challenges: List[Challenge],
        limit: int = 10,
    ) -> List[ChallengeRecommendationItem]:
        """
        Rank a collection of available challenges for a user deterministically.
        Excludes expired challenges and challenges created by the user.
        """
        now = datetime.now(timezone.utc)
        evaluated: List[Tuple[Challenge, ChallengeMatchScore]] = []

        for ch in challenges:
            # Exclude self-created challenges
            if ch.creator_user_id == user.id:
                continue

            # Exclude non-open or expired challenges
            if ch.status != ChallengeStatus.OPEN.value:
                continue

            dl = ch.deadline
            if dl and dl.tzinfo is None:
                dl = dl.replace(tzinfo=timezone.utc)
            if dl and dl < now:
                continue

            score_res = self.evaluate_challenge(user, ch)
            evaluated.append((ch, score_res))

        # Sort descending by relevance_score, then deadline ascending
        def sort_key(item: Tuple[Challenge, ChallengeMatchScore]):
            c, s = item
            dl = c.deadline
            if dl and dl.tzinfo is None:
                dl = dl.replace(tzinfo=timezone.utc)
            deadline_ts = dl.timestamp() if dl else 9999999999.0
            return (-s.relevance_score, deadline_ts)

        evaluated.sort(key=sort_key)
        top_items = evaluated[:limit]

        results: List[ChallengeRecommendationItem] = []
        for ch, sc in top_items:
            creator_name = ch.creator.profile.full_name if (ch.creator and ch.creator.profile) else "Platform Professional"
            creator_role = ch.creator.profile.role if (ch.creator and ch.creator.profile) else "Professional"

            ch_response = ChallengeResponse(
                id=ch.id,
                creator_user_id=ch.creator_user_id,
                title=ch.title,
                short_summary=ch.short_summary,
                problem_statement=ch.problem_statement,
                category=ch.category,
                required_skills=ch.required_skills or [],
                difficulty_level=ch.difficulty_level,
                estimated_effort=ch.estimated_effort,
                submission_instructions=ch.submission_instructions,
                evaluation_criteria=ch.evaluation_criteria or [],
                deadline=ch.deadline,
                organization_name=ch.organization_name,
                reward_description=ch.reward_description,
                mentorship_available=ch.mentorship_available,
                opportunity_type_offered=ch.opportunity_type_offered,
                opportunity_details=ch.opportunity_details,
                status=ch.status,
                published_at=ch.published_at,
                closed_at=ch.closed_at,
                completed_at=ch.completed_at,
                created_at=ch.created_at,
                updated_at=ch.updated_at,
                submissions_count=len(ch.submissions) if hasattr(ch, "submissions") else 0,
                creator_name=creator_name,
                creator_role=creator_role,
            )

            results.append(
                ChallengeRecommendationItem(
                    challenge=ch_response,
                    relevance_score=sc.relevance_score,
                    matched_skills=sc.matched_skills,
                    missing_skills=sc.missing_skills,
                    match_reasons=sc.match_reasons,
                    difficulty_fit=sc.difficulty_fit,
                )
            )

        return results


challenge_matcher = ChallengeMatchingEngine()
