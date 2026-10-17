"""
Cross-Industry Matching and Recommendation Engine for Unclaimed Talent Radar.

Evaluates transparent signals:
- Direct Skill Match (weighted by evidence level)
- Transferable Skill Match (via Transferable Skill Graph)
- Project Evidence & Verified Work History
- Industry Exploration & Adjacent-Domain Opportunity
- Experience Compatibility
- Stated Interest Relevance
- Eligibility Verification (eligible / ineligible / unknown)
- Feedback Signals (deterministic personalization)

Scores are normalized between 0 and 100. Never presented as hiring guarantees.
"""

from typing import List, Dict, Any, Optional, Tuple, Set
from dataclasses import dataclass, field
import re

from app.features.unclaimed_talent_radar.models import Opportunity
from app.features.unclaimed_talent_radar.schemas import (
    MatchType,
    EligibilityStatus,
    SkillEvidenceType,
    ProfileSkillItem,
    TransferableSkillDetail,
)
from app.features.unclaimed_talent_radar.skill_graph import (
    TransferableSkillGraph,
    TransferableMatch,
    skill_graph as default_skill_graph,
)


@dataclass
class MatchingWeights:
    """Configurable scoring weights for transparent recommendation evaluation."""
    direct_skills: float = 0.35
    transferable_skills: float = 0.25
    project_evidence: float = 0.15
    industry_exploration: float = 0.10
    experience_compatibility: float = 0.10
    interest_relevance: float = 0.05


@dataclass
class UserEvidenceProfile:
    """Structured representation of a user's demonstrated profile evidence."""
    user_id: int
    full_name: str
    role: str
    headline: Optional[str]
    biography: Optional[str]
    primary_industry: Optional[str]
    years_of_experience: float
    skills: List[ProfileSkillItem]
    education: List[Dict[str, Any]]
    projects: List[str]
    verified_journeys_count: int


@dataclass
class MatchingEvaluationResult:
    """Full evaluation breakdown for an opportunity recommendation."""
    opportunity_id: int
    match_type: MatchType
    relevance_score: float
    matched_skills: List[str]
    transferable_skills: List[TransferableSkillDetail]
    missing_skills: List[str]
    eligibility_status: EligibilityStatus
    eligibility_details: str
    evidence_breakdown: Dict[str, float]
    raw_score: float


class CrossIndustryMatchingEngine:
    """
    Deterministic cross-industry recommendation engine.
    Matches talent with direct and adjacent-industry opportunities.
    """

    def __init__(
        self,
        skill_graph: Optional[TransferableSkillGraph] = None,
        weights: Optional[MatchingWeights] = None,
    ):
        self.skill_graph = skill_graph or default_skill_graph
        self.weights = weights or MatchingWeights()

    def evaluate_opportunity(
        self,
        user_evidence: UserEvidenceProfile,
        opportunity: Opportunity,
        user_feedback: Optional[str] = None,
        industry_feedback: Optional[Dict[str, str]] = None,
    ) -> MatchingEvaluationResult:
        """
        Evaluate an opportunity against user profile evidence.
        Produces explainable signals, scores, and missing skill analysis.
        """
        # 1. Analyze Required Skills
        raw_required = opportunity.required_skills or []
        canonical_required = [self.skill_graph.normalize_skill(s) for s in raw_required if s]
        required_set = set(canonical_required)

        # Build user skill lookup maps by evidence tier (excluding inferred from direct matches)
        user_direct_skills: Set[str] = set()
        user_verified_skills: Set[str] = set()
        user_project_skills: Set[str] = set()
        user_declared_skills: Set[str] = set()

        for item in user_evidence.skills:
            if item.evidence_type == SkillEvidenceType.INFERRED:
                continue  # Never treat inferred skills as direct facts
            norm_name = item.canonical_name
            user_direct_skills.add(norm_name)
            if item.evidence_type == SkillEvidenceType.VERIFIED_EVIDENCE:
                user_verified_skills.add(norm_name)
            elif item.evidence_type == SkillEvidenceType.PROJECT_EVIDENCED:
                user_project_skills.add(norm_name)
            elif item.evidence_type == SkillEvidenceType.SELF_DECLARED:
                user_declared_skills.add(norm_name)

        # 2. Direct Skill Match (Signal A)
        matched_direct: List[str] = []
        direct_evidence_score = 0.0

        for req in canonical_required:
            if req in user_direct_skills:
                matched_direct.append(req)
                if req in user_verified_skills:
                    direct_evidence_score += 1.0
                elif req in user_project_skills:
                    direct_evidence_score += 0.90
                else:
                    direct_evidence_score += 0.75

        direct_match_ratio = 1.0 if not canonical_required else len(matched_direct) / len(canonical_required)
        direct_score = 100.0 * (direct_evidence_score / max(1, len(canonical_required)))

        # 3. Transferable Skill Match (Signal B)
        unmatched_requirements = [r for r in canonical_required if r not in matched_direct]
        transferable_matches = self.skill_graph.find_transferable_matches(
            user_skills=list(user_direct_skills),
            required_skills=unmatched_requirements if unmatched_requirements else canonical_required,
        )

        transferable_details: List[TransferableSkillDetail] = []
        transferable_score_accum = 0.0

        for tm in transferable_matches:
            transferable_details.append(
                TransferableSkillDetail(
                    user_skill=tm.user_skill,
                    related_domain=tm.related_domain,
                    reason=tm.reason,
                    limits=tm.limits,
                    confidence=tm.confidence,
                )
            )
            transferable_score_accum += (tm.confidence * 100.0)

        transferable_count = len(transferable_matches)
        target_denom = max(1, len(unmatched_requirements) if unmatched_requirements else len(canonical_required))
        transferable_score = min(100.0, (transferable_score_accum / target_denom))

        # 4. Project Evidence (Signal C)
        project_text = " ".join(user_evidence.projects).lower()
        project_hits = 0
        total_eval_skills = matched_direct + [tm.user_skill for tm in transferable_matches]
        for sk in total_eval_skills:
            if sk.lower() in project_text:
                project_hits += 1

        project_evidence_score = min(100.0, (project_hits / max(1, len(total_eval_skills))) * 100.0) if total_eval_skills else 50.0

        # 5. Industry Exploration (Signal D)
        user_industry = (user_evidence.primary_industry or "").strip().lower()
        opp_industry = (opportunity.industry or "").strip().lower()
        is_same_industry = bool(user_industry and user_industry == opp_industry)

        # Match Type Classification
        if is_same_industry:
            match_type = MatchType.DIRECT_MATCH
            industry_exploration_score = 65.0
        elif len(transferable_matches) > 0:
            match_type = MatchType.ADJACENT_INDUSTRY
            industry_exploration_score = 95.0
        else:
            match_type = MatchType.EXPLORATORY
            industry_exploration_score = 75.0

        # 6. Experience Compatibility (Signal E)
        user_exp = user_evidence.years_of_experience
        min_exp = opportunity.min_years_experience or 0.0
        exp_level = (opportunity.experience_level or "All").lower()

        if user_exp >= min_exp:
            exp_diff = user_exp - min_exp
            # Optimal band: within 3 years of requirement
            if exp_diff <= 3.0:
                experience_score = 100.0
            else:
                experience_score = 85.0
        else:
            # Under-experienced
            gap = min_exp - user_exp
            if gap <= 1.0 and exp_level in ["entry", "student", "all"]:
                experience_score = 75.0
            else:
                experience_score = max(20.0, 100.0 - (gap * 30.0))

        # 7. Stated Interest Relevance (Signal F)
        interest_score = 50.0
        user_context = f"{user_evidence.headline or ''} {user_evidence.biography or ''}".lower()
        opp_context = f"{opportunity.title} {opportunity.description or ''} {opportunity.industry}".lower()

        # Check keyword overlaps
        opp_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", opp_context))
        user_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", user_context))
        common_words = opp_words.intersection(user_words)

        if common_words:
            interest_score = min(100.0, 50.0 + (len(common_words) * 10.0))

        # 8. Eligibility Verification (Signal G)
        eligibility_status, eligibility_details = self._evaluate_eligibility(
            user_evidence=user_evidence,
            eligibility_criteria=opportunity.eligibility_criteria or {},
        )

        # 9. Missing Skills Identification
        matched_and_transferred = set(matched_direct).union({tm.required_skill for tm in transferable_matches})
        missing_skills = [r for r in canonical_required if r not in matched_and_transferred]

        # 10. Compute Weighted Base Score
        base_score = (
            (direct_score * self.weights.direct_skills) +
            (transferable_score * self.weights.transferable_skills) +
            (project_evidence_score * self.weights.project_evidence) +
            (industry_exploration_score * self.weights.industry_exploration) +
            (experience_score * self.weights.experience_compatibility) +
            (interest_score * self.weights.interest_relevance)
        )

        # 11. Feedback Signal Adjustments (Deterministic Personalization)
        feedback_adjustment = 0.0
        if user_feedback:
            fb = user_feedback.lower()
            if fb == "relevant":
                feedback_adjustment += 8.0
            elif fb == "not_relevant":
                feedback_adjustment -= 35.0
            elif fb == "already_skilled":
                feedback_adjustment -= 12.0

        if industry_feedback and opportunity.industry in industry_feedback:
            ind_fb = industry_feedback[opportunity.industry].lower()
            if ind_fb == "interested_in_industry":
                feedback_adjustment += 10.0
            elif ind_fb == "not_interested_in_industry":
                feedback_adjustment -= 25.0

        final_raw = base_score + feedback_adjustment

        # Strictly enforce eligibility: Ineligible candidates receive heavy penalty
        if eligibility_status == EligibilityStatus.INELIGIBLE:
            final_raw = min(final_raw, 25.0)

        normalized_score = round(max(0.0, min(100.0, final_raw)), 1)

        return MatchingEvaluationResult(
            opportunity_id=opportunity.id,
            match_type=match_type,
            relevance_score=normalized_score,
            matched_skills=matched_direct,
            transferable_skills=transferable_details,
            missing_skills=missing_skills,
            eligibility_status=eligibility_status,
            eligibility_details=eligibility_details,
            evidence_breakdown={
                "direct_skill_score": round(direct_score, 1),
                "transferable_skill_score": round(transferable_score, 1),
                "project_evidence_score": round(project_evidence_score, 1),
                "industry_exploration_score": round(industry_exploration_score, 1),
                "experience_compatibility_score": round(experience_score, 1),
                "interest_relevance_score": round(interest_score, 1),
                "feedback_adjustment": round(feedback_adjustment, 1),
            },
            raw_score=final_raw,
        )

    def _evaluate_eligibility(
        self,
        user_evidence: UserEvidenceProfile,
        eligibility_criteria: Dict[str, Any],
    ) -> Tuple[EligibilityStatus, str]:
        """
        Evaluate explicit eligibility requirements.
        Distinguishes ELIGIBLE, INELIGIBLE, and UNKNOWN when information is missing.
        """
        if not eligibility_criteria:
            return EligibilityStatus.ELIGIBLE, "No special restrictions specified."

        # Check 1: Allowed Platform Roles (e.g. Student, Alumni, Faculty)
        allowed_roles = eligibility_criteria.get("allowed_roles")
        if allowed_roles:
            if not isinstance(allowed_roles, list):
                allowed_roles = [allowed_roles]
            norm_roles = [r.lower() for r in allowed_roles]
            if user_evidence.role.lower() not in norm_roles:
                return (
                    EligibilityStatus.INELIGIBLE,
                    f"Requires role in {allowed_roles}; user profile role is '{user_evidence.role}'."
                )

        # Check 2: Minimum Education Qualification
        min_education = eligibility_criteria.get("min_education")
        if min_education:
            if not user_evidence.education:
                return (
                    EligibilityStatus.UNKNOWN,
                    "Requires verification of education credentials, which are not listed in user profile."
                )

            # Check if any listed education matches or satisfies
            edu_str = " ".join([str(e) for e in user_evidence.education]).lower()
            if min_education.lower() not in edu_str and "bachelor" not in edu_str and "master" not in edu_str:
                return (
                    EligibilityStatus.INELIGIBLE,
                    f"Requires {min_education}; profile education does not match."
                )

        # Check 3: Allowed Degree Majors / Disciplines
        allowed_majors = eligibility_criteria.get("allowed_majors")
        if allowed_majors:
            if not user_evidence.education:
                return (
                    EligibilityStatus.UNKNOWN,
                    "Degree discipline could not be confirmed because profile education is unrecorded."
                )
            edu_str = " ".join([str(e) for e in user_evidence.education]).lower()
            major_matched = any(m.lower() in edu_str for m in allowed_majors)
            if not major_matched:
                return (
                    EligibilityStatus.INELIGIBLE,
                    f"Requires major in {allowed_majors}; not found in profile."
                )

        return EligibilityStatus.ELIGIBLE, "Satisfies all specified eligibility criteria."
