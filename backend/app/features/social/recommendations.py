from typing import List, Set, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User
from app.models.profile import Profile
from app.features.social.repository import SocialRepository
from app.features.social.schemas import UserSuggestionItem, SocialUserSummary


class PeopleRecommendationEngine:
    @staticmethod
    def _normalize(val: str) -> str:
        return val.strip().lower() if val else ""

    @staticmethod
    def _extract_institutions(profile: Optional[Profile]) -> Set[str]:
        insts = set()
        if not profile:
            return insts
        if profile.current_organization and any(kw in profile.current_organization.lower() for kw in ["university", "college", "institute", "iiit", "iit", "nit", "bits"]):
            insts.add(PeopleRecommendationEngine._normalize(profile.current_organization))
        if profile.education:
            for edu in profile.education:
                if isinstance(edu, str):
                    insts.add(PeopleRecommendationEngine._normalize(edu))
                elif isinstance(edu, dict):
                    for k in ["institution", "university", "college", "school"]:
                        if k in edu and edu[k]:
                            insts.add(PeopleRecommendationEngine._normalize(str(edu[k])))
        return insts

    @staticmethod
    def _extract_skills(profile: Optional[Profile]) -> Set[str]:
        if not profile or not profile.skills:
            return set()
        return {PeopleRecommendationEngine._normalize(s) for s in profile.skills if isinstance(s, str) and s.strip()}

    @classmethod
    def get_suggestions(
        cls,
        db: Session,
        current_user: User,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List[UserSuggestionItem], int]:
        current_id = current_user.id
        my_profile = current_user.profile

        # 1. Determine exclusion set
        blocked_ids = SocialRepository.get_blocked_user_ids(db, current_id)
        connected_ids = SocialRepository.get_direct_connection_ids(db, current_id)

        # Get pending request IDs (both outgoing and incoming)
        from app.features.qualification_connections.models import ConnectionRequest
        pending_requests = db.query(ConnectionRequest).filter(
            or_(
                ConnectionRequest.sender_id == current_id,
                ConnectionRequest.recipient_id == current_id
            ),
            ConnectionRequest.status == "pending"
        ).all()
        pending_ids = set()
        for r in pending_requests:
            pending_ids.add(r.recipient_id if r.sender_id == current_id else r.sender_id)

        exclude_ids = {current_id}.union(blocked_ids).union(connected_ids).union(pending_ids)

        # 2. Extract current user's profile attributes
        my_skills = cls._extract_skills(my_profile)
        my_institutions = cls._extract_institutions(my_profile)
        my_industry = cls._normalize(my_profile.industry) if my_profile and my_profile.industry else ""
        my_company = cls._normalize(my_profile.current_organization) if my_profile and my_profile.current_organization else ""

        # 3. Fetch candidate users
        candidates = db.query(User).join(Profile, User.id == Profile.user_id).filter(
            User.id.notin_(exclude_ids),
            User.is_active == True
        ).all()

        scored_candidates: List[Tuple[float, User, List[str], List[str], List[str], List[str], int]] = []

        for cand in candidates:
            cand_profile = cand.profile
            cand_skills = cls._extract_skills(cand_profile)
            cand_institutions = cls._extract_institutions(cand_profile)
            cand_industry = cls._normalize(cand_profile.industry) if cand_profile and cand_profile.industry else ""
            cand_company = cls._normalize(cand_profile.current_organization) if cand_profile and cand_profile.current_organization else ""

            # Check mutual connections
            mutual_ids = SocialRepository.get_mutual_connection_ids(db, current_id, cand.id)
            mutual_count = len(mutual_ids)

            # Check shared skills
            shared_skills = list(my_skills.intersection(cand_skills))

            # Check shared institutions
            shared_institutions = []
            for inst_a in my_institutions:
                for inst_b in cand_institutions:
                    if inst_a in inst_b or inst_b in inst_a:
                        shared_institutions.append(cand_profile.current_organization or inst_a)
                        break

            # Check shared industries
            shared_industries = []
            if my_industry and cand_industry and (my_industry in cand_industry or cand_industry in my_industry):
                shared_industries.append(cand_profile.industry or my_industry)

            # Check shared company
            shared_company = bool(my_company and cand_company and (my_company in cand_company or cand_company in my_company))

            # SCORING ALGORITHM:
            # - Mutual connections: up to 40 pts (15 pts per mutual, max 40)
            # - Shared institutions: 25 pts
            # - Shared skills: up to 20 pts (5 pts per shared skill, max 20)
            # - Shared industry/domain: 10 pts
            # - Shared company: 15 pts
            score = 10.0  # Base score for active alumni in network
            score += min(40.0, mutual_count * 15.0)
            if shared_institutions:
                score += 25.0
            score += min(20.0, len(shared_skills) * 5.0)
            if shared_industries:
                score += 10.0
            if shared_company:
                score += 15.0

            final_score = round(min(100.0, score), 1)

            # Human-readable reasons
            reasons = []
            if mutual_count > 0:
                reasons.append(f"{mutual_count} mutual connection{'s' if mutual_count > 1 else ''}")
            if shared_institutions:
                reasons.append(f"Studied at {shared_institutions[0].title()}")
            if shared_skills:
                disp_skills = [s.title() for s in shared_skills[:3]]
                reasons.append(f"Shares skills in {', '.join(disp_skills)}")
            if shared_company:
                reasons.append(f"Both associated with {(cand_profile.current_organization or my_company).title()}")
            if shared_industries:
                reasons.append(f"Works in {shared_industries[0].title()}")

            if not reasons:
                reasons.append(f"Active professional in the {cand_profile.role} community")

            scored_candidates.append((
                final_score,
                cand,
                reasons,
                [s.title() for s in shared_skills],
                [i.title() for i in shared_institutions],
                [ind.title() for ind in shared_industries],
                mutual_count
            ))

        # Sort by score descending
        scored_candidates.sort(key=lambda x: x[0], reverse=True)
        total = len(scored_candidates)
        paginated = scored_candidates[offset:offset + limit]

        items: List[UserSuggestionItem] = []
        for score, cand, reasons, s_skills, s_insts, s_inds, m_count in paginated:
            p = cand.profile
            user_summary = SocialUserSummary(
                id=cand.id,
                full_name=p.full_name if p else "User",
                role=p.role if p else "Member",
                headline=p.headline if p else None,
                industry=p.industry if p else None,
                current_organization=p.current_organization if p else None,
                skills=p.skills if p and p.skills else [],
                years_of_experience=p.years_of_experience if p else 0.0,
                connection_status="none",
                mutual_connections_count=m_count,
                degree=2 if m_count > 0 else None
            )
            items.append(
                UserSuggestionItem(
                    user=user_summary,
                    relevance_score=score,
                    reasons=reasons,
                    shared_skills=s_skills,
                    shared_institutions=s_insts,
                    shared_industries=s_inds,
                    mutual_connections_count=m_count
                )
            )

        return items, total
