"""
Core Service Orchestrator for Unclaimed Talent Radar.

Orchestrates:
1. User Profile Evidence Analysis (rigorously categorizes self-declared, project-evidenced, verified, and inferred skills).
2. Cross-Industry Opportunity Discovery & Matching.
3. Personalized Recommendations Feed.
4. Explainable Reasoning & Learning Path Generation.
5. Recommendation Feedback & Ranking Personalization.
"""

from typing import List, Dict, Any, Optional, Tuple, Set
import math
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.profile import Profile
from app.features.career_time_machine.models import CareerJourney, JourneyVerificationStatus
from app.features.unclaimed_talent_radar.models import Opportunity
from app.features.unclaimed_talent_radar.schemas import (
    UserProfileAnalysisResponse,
    ProfileSkillItem,
    SkillEvidenceType,
    RadarRecommendationResponse,
    RadarDiscoverResponse,
    RadarPersonalizedDashboardResponse,
    DiscoveryMode,
    MatchType,
    EligibilityStatus,
    RadarFeedbackCreate,
    RadarFeedbackResponse,
    SkillMapResponse,
    SkillMapNode,
    SkillMapEdge,
    OpportunityCreate,
    OpportunityResponse,
)
from app.features.unclaimed_talent_radar.repository import OpportunityRepository
from app.features.unclaimed_talent_radar.skill_graph import skill_graph, TransferableSkillGraph
from app.features.unclaimed_talent_radar.matching import (
    CrossIndustryMatchingEngine,
    UserEvidenceProfile,
    MatchingEvaluationResult,
)
from app.features.unclaimed_talent_radar.explanations import DeterministicExplanationEngine
from app.features.unclaimed_talent_radar.feedback import FeedbackManager


class UnclaimedTalentRadarService:
    """
    Main business logic service for Unclaimed Talent Radar.
    """

    def __init__(
        self,
        graph: Optional[TransferableSkillGraph] = None,
        matching_engine: Optional[CrossIndustryMatchingEngine] = None,
    ):
        self.skill_graph = graph or skill_graph
        self.matching_engine = matching_engine or CrossIndustryMatchingEngine(self.skill_graph)

    # --- 1. User Profile Analysis ---

    def analyze_user_profile(
        self,
        db: Session,
        user_id: int,
    ) -> UserProfileAnalysisResponse:
        """
        Build a rigorous structured representation of demonstrated skills and interests.
        Separates self-declared skills, project-evidenced skills, and verified work.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

        profile = user.profile
        evidence_profile = self._build_user_evidence_profile(db, user, profile)

        # Categorize counts
        declared_cnt = sum(1 for s in evidence_profile.skills if s.evidence_type == SkillEvidenceType.SELF_DECLARED)
        project_cnt = sum(1 for s in evidence_profile.skills if s.evidence_type == SkillEvidenceType.PROJECT_EVIDENCED)
        verified_cnt = sum(1 for s in evidence_profile.skills if s.evidence_type == SkillEvidenceType.VERIFIED_EVIDENCE)
        inferred_cnt = sum(1 for s in evidence_profile.skills if s.evidence_type == SkillEvidenceType.INFERRED)

        return UserProfileAnalysisResponse(
            user_id=user.id,
            full_name=profile.full_name if profile else "Anonymous User",
            role=profile.role if profile else "Student",
            headline=profile.headline if profile else None,
            primary_industry=profile.industry if profile else None,
            years_of_experience=profile.years_of_experience if profile else 0.0,
            skills=evidence_profile.skills,
            declared_skills_count=declared_cnt,
            project_skills_count=project_cnt,
            verified_skills_count=verified_cnt,
            inferred_skills_count=inferred_cnt,
            recorded_projects=evidence_profile.projects,
            education=evidence_profile.education,
        )

    def _build_user_evidence_profile(
        self,
        db: Session,
        user: User,
        profile: Optional[Profile],
    ) -> UserEvidenceProfile:
        """
        Compile empirical profile evidence from Profile and CareerJourney tables.
        """
        # Fetch user's career journeys
        journeys = (
            db.query(CareerJourney)
            .filter(CareerJourney.user_id == user.id)
            .order_by(CareerJourney.start_date.desc())
            .all()
        )

        skill_items_map: Dict[str, ProfileSkillItem] = {}
        recorded_projects: List[str] = []
        verified_count = 0

        # Step A: Process Career Journeys for Project & Verified Evidence
        for j in journeys:
            is_verified = (
                j.verification_status in [
                    JourneyVerificationStatus.ALUMNI_VERIFIED.value,
                    JourneyVerificationStatus.OFFICIAL_VERIFIED.value,
                ]
            )
            if is_verified:
                verified_count += 1

            # Collect projects
            for p in (j.projects_or_achievements or []):
                p_clean = str(p).strip()
                if p_clean and p_clean not in recorded_projects:
                    recorded_projects.append(f"{p_clean} (at {j.company})")

            # Collect skills from journey
            for s in (j.skills_used or []):
                canon = self.skill_graph.normalize_skill(s)
                if not canon:
                    continue

                if is_verified:
                    evidence_type = SkillEvidenceType.VERIFIED_EVIDENCE
                    source = f"Verified work history at {j.company} ({j.job_title})"
                elif j.projects_or_achievements:
                    evidence_type = SkillEvidenceType.PROJECT_EVIDENCED
                    source = f"Demonstrated in project at {j.company} ({j.job_title})"
                else:
                    evidence_type = SkillEvidenceType.SELF_DECLARED
                    source = f"Recorded in journey at {j.company}"

                # Higher evidence tiers take precedence
                if canon not in skill_items_map or evidence_type == SkillEvidenceType.VERIFIED_EVIDENCE:
                    skill_items_map[canon] = ProfileSkillItem(
                        skill=s.strip(),
                        canonical_name=canon,
                        evidence_type=evidence_type,
                        source_evidence=source,
                        is_verified=is_verified,
                        context_role=j.job_title,
                        context_company=j.company,
                    )

        # Step B: Process Profile Skills (Self-declared if not already evidenced)
        if profile and profile.skills:
            for s in profile.skills:
                canon = self.skill_graph.normalize_skill(s)
                if not canon:
                    continue
                if canon not in skill_items_map:
                    skill_items_map[canon] = ProfileSkillItem(
                        skill=s.strip(),
                        canonical_name=canon,
                        evidence_type=SkillEvidenceType.SELF_DECLARED,
                        source_evidence="Self-declared in platform user profile",
                        is_verified=False,
                    )

        # Step C: Infer Transferable Potentials (explicitly marked as INFERRED)
        # We never present inferred skills as verified facts
        inferred_candidates: List[ProfileSkillItem] = []
        for canon, item in list(skill_items_map.items()):
            edges = self.skill_graph.get_transferable_edges(canon)
            for edge in edges:
                target_canon = self.skill_graph.normalize_skill(edge.target_skill_or_domain)
                if target_canon not in skill_items_map and target_canon.lower() != canon.lower():
                    inferred_candidates.append(
                        ProfileSkillItem(
                            skill=target_canon,
                            canonical_name=target_canon,
                            evidence_type=SkillEvidenceType.INFERRED,
                            source_evidence=f"Inferred via transferable skill bridge from {canon} ({edge.related_domain})",
                            is_verified=False,
                        )
                    )

        # Append top non-duplicate inferred skills
        seen_inferred: Set[str] = set()
        for inf in inferred_candidates:
            if inf.canonical_name not in skill_items_map and inf.canonical_name not in seen_inferred:
                seen_inferred.add(inf.canonical_name)
                skill_items_map[f"_inf_{inf.canonical_name}"] = inf

        education_data = profile.education if profile and profile.education else []
        if isinstance(education_data, dict):
            education_data = [education_data]

        return UserEvidenceProfile(
            user_id=user.id,
            full_name=profile.full_name if profile else "Anonymous User",
            role=profile.role if profile else "Student",
            headline=profile.headline if profile else None,
            biography=profile.biography if profile else None,
            primary_industry=profile.industry if profile else None,
            years_of_experience=profile.years_of_experience if profile else 0.0,
            skills=list(skill_items_map.values()),
            education=education_data,
            projects=recorded_projects,
            verified_journeys_count=verified_count,
        )

    # --- 2. Opportunity Discovery & Recommendation ---

    def discover_opportunities(
        self,
        db: Session,
        current_user: User,
        opportunity_type: Optional[str] = None,
        industry: Optional[str] = None,
        discovery_mode: DiscoveryMode = DiscoveryMode.ALL,
        min_score: float = 0.0,
        page: int = 1,
        page_size: int = 10,
        sort_by: str = "relevance",
    ) -> RadarDiscoverResponse:
        """
        Discover relevant opportunities outside or inside user's preferred industry.
        Supports pagination, filtering, and deterministic sorting.
        """
        page = max(1, page)
        page_size = max(1, min(100, page_size))

        # 1. Build User Evidence Profile
        user_evidence = self._build_user_evidence_profile(db, current_user, current_user.profile)

        # 2. Extract User Feedback Signals
        opp_fb_map, ind_fb_map = FeedbackManager.extract_feedback_signals(db, current_user.id)

        # 3. Query Active Opportunities
        # If in cross_industry_only discovery mode, do not restrict database query to one industry
        include_all = (discovery_mode == DiscoveryMode.CROSS_INDUSTRY_ONLY)
        opportunities = OpportunityRepository.list_active_opportunities(
            db=db,
            user_id=current_user.id,
            opportunity_type=opportunity_type,
            industry=industry if not include_all else None,
            include_all_for_discovery=include_all,
        )

        recommendations: List[RadarRecommendationResponse] = []

        for opp in opportunities:
            user_fb = opp_fb_map.get(opp.id)
            eval_res = self.matching_engine.evaluate_opportunity(
                user_evidence=user_evidence,
                opportunity=opp,
                user_feedback=user_fb,
                industry_feedback=ind_fb_map,
            )

            # Apply discovery mode filtering
            if discovery_mode == DiscoveryMode.CROSS_INDUSTRY_ONLY and eval_res.match_type == MatchType.DIRECT_MATCH:
                continue
            if discovery_mode == DiscoveryMode.DIRECT_ONLY and eval_res.match_type != MatchType.DIRECT_MATCH:
                continue

            # Apply min score filter
            if eval_res.relevance_score < min_score:
                continue

            # Generate explainable reasons & learning suggestions
            reasons = DeterministicExplanationEngine.generate_reasons(
                user_evidence=user_evidence,
                opportunity=opp,
                eval_result=eval_res,
            )
            learning = DeterministicExplanationEngine.generate_learning_suggestions(
                user_evidence=user_evidence,
                opportunity=opp,
                eval_result=eval_res,
            )

            recommendations.append(
                RadarRecommendationResponse(
                    opportunity_id=opp.id,
                    title=opp.title,
                    organization=opp.organization,
                    industry=opp.industry,
                    opportunity_type=opp.opportunity_type,
                    location=opp.location,
                    workplace_type=opp.workplace_type,
                    deadline=opp.deadline,
                    match_type=eval_res.match_type,
                    relevance_score=eval_res.relevance_score,
                    matched_skills=eval_res.matched_skills,
                    transferable_skills=eval_res.transferable_skills,
                    missing_skills=eval_res.missing_skills,
                    eligibility_status=eval_res.eligibility_status,
                    eligibility_details=eval_res.eligibility_details,
                    recommendation_reasons=reasons,
                    learning_suggestions=learning,
                    user_feedback=user_fb,
                )
            )

        # Deterministic Sorting
        if sort_by == "deadline":
            # Null deadlines placed at the end
            def _dl_sort_key(r):
                if r.deadline is None:
                    return (True, datetime.max.replace(tzinfo=timezone.utc))
                dl = r.deadline if r.deadline.tzinfo else r.deadline.replace(tzinfo=timezone.utc)
                return (False, dl)
            recommendations.sort(key=_dl_sort_key)
        elif sort_by == "created_at":
            # Already ordered by created_at desc from database query
            pass
        else:  # default "relevance"
            recommendations.sort(key=lambda r: r.relevance_score, reverse=True)

        # Pagination
        total = len(recommendations)
        total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_items = recommendations[start_idx:end_idx]

        return RadarDiscoverResponse(
            items=paginated_items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            discovery_mode=discovery_mode.value,
        )

    # --- 3. Personalized Recommendations Feed ---

    def get_personalized_recommendations(
        self,
        db: Session,
        current_user: User,
    ) -> RadarPersonalizedDashboardResponse:
        """
        Return personalized radar feed organized into Direct, Adjacent-Industry,
        and Exploratory matches, plus profile evidence analysis and learning priorities.
        """
        analysis = self.analyze_user_profile(db, current_user.id)
        user_evidence = self._build_user_evidence_profile(db, current_user, current_user.profile)
        opp_fb_map, ind_fb_map = FeedbackManager.extract_feedback_signals(db, current_user.id)

        all_opps = OpportunityRepository.list_active_opportunities(
            db=db,
            user_id=current_user.id,
        )

        direct_list: List[RadarRecommendationResponse] = []
        adjacent_list: List[RadarRecommendationResponse] = []
        exploratory_list: List[RadarRecommendationResponse] = []
        unique_learning: Dict[str, Any] = {}

        for opp in all_opps:
            user_fb = opp_fb_map.get(opp.id)
            eval_res = self.matching_engine.evaluate_opportunity(
                user_evidence=user_evidence,
                opportunity=opp,
                user_feedback=user_fb,
                industry_feedback=ind_fb_map,
            )

            # Skip explicitly ineligible opportunities from personalized top feed
            if eval_res.eligibility_status == EligibilityStatus.INELIGIBLE:
                continue

            reasons = DeterministicExplanationEngine.generate_reasons(
                user_evidence=user_evidence,
                opportunity=opp,
                eval_result=eval_res,
            )
            learning = DeterministicExplanationEngine.generate_learning_suggestions(
                user_evidence=user_evidence,
                opportunity=opp,
                eval_result=eval_res,
            )

            rec = RadarRecommendationResponse(
                opportunity_id=opp.id,
                title=opp.title,
                organization=opp.organization,
                industry=opp.industry,
                opportunity_type=opp.opportunity_type,
                location=opp.location,
                workplace_type=opp.workplace_type,
                deadline=opp.deadline,
                match_type=eval_res.match_type,
                relevance_score=eval_res.relevance_score,
                matched_skills=eval_res.matched_skills,
                transferable_skills=eval_res.transferable_skills,
                missing_skills=eval_res.missing_skills,
                eligibility_status=eval_res.eligibility_status,
                eligibility_details=eval_res.eligibility_details,
                recommendation_reasons=reasons,
                learning_suggestions=learning,
                user_feedback=user_fb,
            )

            for item in learning:
                if item.missing_skill not in unique_learning:
                    unique_learning[item.missing_skill] = item

            if eval_res.match_type == MatchType.DIRECT_MATCH:
                direct_list.append(rec)
            elif eval_res.match_type == MatchType.ADJACENT_INDUSTRY:
                adjacent_list.append(rec)
            else:
                exploratory_list.append(rec)

        # Sort each tier by relevance score descending
        direct_list.sort(key=lambda r: r.relevance_score, reverse=True)
        adjacent_list.sort(key=lambda r: r.relevance_score, reverse=True)
        exploratory_list.sort(key=lambda r: r.relevance_score, reverse=True)

        return RadarPersonalizedDashboardResponse(
            user_profile_analysis=analysis,
            total_recommendations=len(direct_list) + len(adjacent_list) + len(exploratory_list),
            direct_matches=direct_list[:10],
            adjacent_industry_matches=adjacent_list[:10],
            exploratory_matches=exploratory_list[:10],
            top_learning_priorities=list(unique_learning.values())[:5],
        )

    # --- 4. Single Opportunity Detailed Recommendation ---

    def get_opportunity_recommendation_details(
        self,
        db: Session,
        opportunity_id: int,
        current_user: User,
    ) -> RadarRecommendationResponse:
        """
        Return detailed recommendation reasoning for a specific opportunity.
        Respects visibility permissions and rejects expired or closed records.
        """
        opp = OpportunityRepository.get_opportunity_for_user(
            db=db,
            opportunity_id=opportunity_id,
            user_id=current_user.id,
        )
        if not opp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Opportunity {opportunity_id} not found or you lack permission to access it."
            )

        if opp.status != "open":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Opportunity is {opp.status} and no longer accepting recommendations."
            )

        if opp.deadline:
            dl = opp.deadline if opp.deadline.tzinfo else opp.deadline.replace(tzinfo=timezone.utc)
            if dl < datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Opportunity deadline has expired."
                )

        user_evidence = self._build_user_evidence_profile(db, current_user, current_user.profile)
        opp_fb_map, ind_fb_map = FeedbackManager.extract_feedback_signals(db, current_user.id)
        user_fb = opp_fb_map.get(opp.id)

        eval_res = self.matching_engine.evaluate_opportunity(
            user_evidence=user_evidence,
            opportunity=opp,
            user_feedback=user_fb,
            industry_feedback=ind_fb_map,
        )

        reasons = DeterministicExplanationEngine.generate_reasons(
            user_evidence=user_evidence,
            opportunity=opp,
            eval_result=eval_res,
        )
        learning = DeterministicExplanationEngine.generate_learning_suggestions(
            user_evidence=user_evidence,
            opportunity=opp,
            eval_result=eval_res,
        )

        return RadarRecommendationResponse(
            opportunity_id=opp.id,
            title=opp.title,
            organization=opp.organization,
            industry=opp.industry,
            opportunity_type=opp.opportunity_type,
            location=opp.location,
            workplace_type=opp.workplace_type,
            deadline=opp.deadline,
            match_type=eval_res.match_type,
            relevance_score=eval_res.relevance_score,
            matched_skills=eval_res.matched_skills,
            transferable_skills=eval_res.transferable_skills,
            missing_skills=eval_res.missing_skills,
            eligibility_status=eval_res.eligibility_status,
            eligibility_details=eval_res.eligibility_details,
            recommendation_reasons=reasons,
            learning_suggestions=learning,
            user_feedback=user_fb,
        )

    # --- 5. Skill Map Inspection ---

    def get_skill_map(
        self,
        skill: Optional[str] = None,
        domain: Optional[str] = None,
    ) -> SkillMapResponse:
        """
        Inspect the skill relationship graph for a skill or domain.
        """
        data = self.skill_graph.get_skill_map(skill=skill, domain=domain)
        nodes = [SkillMapNode(**n) for n in data["skills"]]
        edges = [SkillMapEdge(**e) for e in data["transferable_edges"]]

        return SkillMapResponse(
            queried_skill=data["queried_skill"],
            queried_domain=data["queried_domain"],
            total_skills=data["total_skills"],
            total_relationships=data["total_relationships"],
            skills=nodes,
            transferable_edges=edges,
        )

    # --- 6. Feedback Recording ---

    def record_feedback(
        self,
        db: Session,
        current_user: User,
        feedback_in: RadarFeedbackCreate,
    ) -> RadarFeedbackResponse:
        """Record user feedback."""
        record = FeedbackManager.record_feedback(
            db=db,
            user_id=current_user.id,
            feedback_in=feedback_in,
        )
        return RadarFeedbackResponse.model_validate(record)

    # --- 7. Opportunity Management (Platform Administration / Seeding) ---

    def create_opportunity(
        self,
        db: Session,
        opp_in: OpportunityCreate,
        current_user: User,
    ) -> OpportunityResponse:
        """Create a new opportunity record in the platform database."""
        record = OpportunityRepository.create_opportunity(
            db=db,
            opp_in=opp_in,
            creator_user_id=current_user.id,
        )
        return OpportunityResponse.model_validate(record)


# Singleton Service Instance
radar_service = UnclaimedTalentRadarService()
