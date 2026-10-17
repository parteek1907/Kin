"""
Repository and Data Access Layer for Unclaimed Talent Radar.

Provides database queries for Opportunity records and User Feedback,
enforces visibility constraints, filters expired/closed opportunities,
and defines modular interfaces for future integrations (e.g. Skill Bounty).
"""

from typing import List, Optional, Tuple, Protocol, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.features.unclaimed_talent_radar.models import (
    Opportunity,
    OpportunityStatus,
    OpportunityVisibility,
    TalentRadarFeedback,
)
from app.features.unclaimed_talent_radar.schemas import (
    OpportunityCreate,
    OpportunityUpdate,
)


class OpportunitySourceInterface(Protocol):
    """Protocol for modular opportunity sources."""
    def get_active_opportunities(
        self,
        db: Session,
        opportunity_type: Optional[str] = None,
        industry: Optional[str] = None,
    ) -> List[Opportunity]:
        ...


class SkillBountyIntegrationInterface(Protocol):
    """Protocol for external Skill Bounty challenge platforms."""
    def get_user_bounties(self, db: Session, user_id: int) -> List[Dict[str, Any]]:
        ...


class SkillBountyAdapter:
    """
    Modular integration adapter for Skill Bounty challenges.
    Queries verified challenge outcomes and completed bounties for the user.
    """
    def get_user_bounties(self, db: Session, user_id: int) -> List[Dict[str, Any]]:
        try:
            from app.features.skill_bounty.models import ChallengeOutcome
            outcomes = db.query(ChallengeOutcome).filter(ChallengeOutcome.student_user_id == user_id).all()
            return [
                {
                    "challenge_id": o.challenge_id,
                    "submission_id": o.submission_id,
                    "outcome_type": o.outcome_type,
                    "title": o.title,
                    "skills_demonstrated": o.skills_demonstrated or [],
                }
                for o in outcomes
            ]
        except Exception:
            return []


class OpportunityRepository:
    """
    Primary repository managing Opportunity records and Feedback in PostgreSQL/SQLite.
    """

    @staticmethod
    def get_opportunity_by_id(db: Session, opportunity_id: int) -> Optional[Opportunity]:
        """Fetch opportunity by ID without visibility check (internal lookup)."""
        return db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()

    @staticmethod
    def get_opportunity_for_user(
        db: Session,
        opportunity_id: int,
        user_id: Optional[int] = None,
    ) -> Optional[Opportunity]:
        """
        Fetch opportunity by ID respecting visibility and access permissions.
        - Public: visible to anyone
        - Network_only: visible to authenticated users
        - Private: visible only to creator
        """
        query = db.query(Opportunity).filter(Opportunity.id == opportunity_id)

        if user_id is None:
            # Unauthenticated requests only see public
            query = query.filter(Opportunity.visibility == OpportunityVisibility.PUBLIC.value)
        else:
            # Authenticated users see public, network_only, or their own private records
            query = query.filter(
                or_(
                    Opportunity.visibility.in_([
                        OpportunityVisibility.PUBLIC.value,
                        OpportunityVisibility.NETWORK_ONLY.value,
                    ]),
                    and_(
                        Opportunity.visibility == OpportunityVisibility.PRIVATE.value,
                        Opportunity.created_by_user_id == user_id,
                    ),
                )
            )

        return query.first()

    @staticmethod
    def list_active_opportunities(
        db: Session,
        user_id: Optional[int] = None,
        opportunity_type: Optional[str] = None,
        industry: Optional[str] = None,
        experience_level: Optional[str] = None,
        location: Optional[str] = None,
        workplace_type: Optional[str] = None,
        required_skill: Optional[str] = None,
        include_all_for_discovery: bool = False,
    ) -> List[Opportunity]:
        """
        Query all active, unexpired, and accessible opportunities.
        Strictly excludes closed, draft, and expired opportunities.
        """
        now = datetime.now(timezone.utc)
        query = db.query(Opportunity).filter(
            Opportunity.status == OpportunityStatus.OPEN.value,
            or_(
                Opportunity.deadline.is_(None),
                Opportunity.deadline >= now,
            ),
        )

        # Visibility Filter
        if user_id is None:
            query = query.filter(Opportunity.visibility == OpportunityVisibility.PUBLIC.value)
        else:
            query = query.filter(
                or_(
                    Opportunity.visibility.in_([
                        OpportunityVisibility.PUBLIC.value,
                        OpportunityVisibility.NETWORK_ONLY.value,
                    ]),
                    and_(
                        Opportunity.visibility == OpportunityVisibility.PRIVATE.value,
                        Opportunity.created_by_user_id == user_id,
                    ),
                )
            )

        # Additional criteria filters
        if opportunity_type:
            query = query.filter(Opportunity.opportunity_type == opportunity_type)

        if industry and not include_all_for_discovery:
            query = query.filter(Opportunity.industry.ilike(f"%{industry.strip()}%"))

        if experience_level and experience_level.lower() != "all":
            query = query.filter(Opportunity.experience_level.in_([experience_level, "All"]))

        if location:
            query = query.filter(Opportunity.location.ilike(f"%{location.strip()}%"))

        if workplace_type:
            query = query.filter(Opportunity.workplace_type == workplace_type)

        records = query.order_by(Opportunity.created_at.desc()).all()

        # If a required skill filter was provided, filter in-memory for JSON list safety
        if required_skill:
            req_lower = required_skill.strip().lower()
            records = [
                opp for opp in records
                if any(req_lower in s.lower() for s in (opp.required_skills or []))
            ]

        return records

    @staticmethod
    def create_opportunity(
        db: Session,
        opp_in: OpportunityCreate,
        creator_user_id: Optional[int] = None,
    ) -> Opportunity:
        """Store a new verified platform opportunity."""
        record = Opportunity(
            title=opp_in.title.strip(),
            organization=opp_in.organization.strip(),
            opportunity_type=opp_in.opportunity_type.value,
            industry=opp_in.industry.strip(),
            description=opp_in.description,
            required_skills=opp_in.required_skills or [],
            preferred_skills=opp_in.preferred_skills or [],
            experience_level=opp_in.experience_level,
            min_years_experience=opp_in.min_years_experience,
            location=opp_in.location,
            workplace_type=opp_in.workplace_type.value,
            eligibility_criteria=opp_in.eligibility_criteria or {},
            deadline=opp_in.deadline,
            status=opp_in.status.value,
            visibility=opp_in.visibility.value,
            learning_resources=opp_in.learning_resources or [],
            created_by_user_id=creator_user_id,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def update_opportunity(
        db: Session,
        opportunity_id: int,
        opp_update: OpportunityUpdate,
    ) -> Optional[Opportunity]:
        """Update fields of an existing opportunity."""
        record = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
        if not record:
            return None

        update_dict = opp_update.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            if hasattr(record, key):
                if hasattr(val, "value"):
                    setattr(record, key, val.value)
                else:
                    setattr(record, key, val)

        record.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def delete_opportunity(db: Session, opportunity_id: int) -> bool:
        """Delete an opportunity by ID."""
        record = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
        if not record:
            return False
        db.delete(record)
        db.commit()
        return True

    # --- Feedback Data Access ---

    @staticmethod
    def get_user_feedback(db: Session, user_id: int) -> List[TalentRadarFeedback]:
        """Retrieve all radar recommendation feedback for a user."""
        return (
            db.query(TalentRadarFeedback)
            .filter(TalentRadarFeedback.user_id == user_id)
            .order_by(TalentRadarFeedback.updated_at.desc())
            .all()
        )

    @staticmethod
    def get_user_feedback_for_opportunity(
        db: Session,
        user_id: int,
        opportunity_id: int,
    ) -> Optional[TalentRadarFeedback]:
        """Retrieve feedback for a specific user and opportunity pair."""
        return (
            db.query(TalentRadarFeedback)
            .filter(
                TalentRadarFeedback.user_id == user_id,
                TalentRadarFeedback.opportunity_id == opportunity_id,
            )
            .first()
        )

    @staticmethod
    def upsert_user_feedback(
        db: Session,
        user_id: int,
        opportunity_id: int,
        feedback_type: str,
        notes: Optional[str] = None,
    ) -> TalentRadarFeedback:
        """
        Record user feedback. Prevents duplicate rows via upsert logic
        matching the unique constraint on (user_id, opportunity_id).
        """
        existing = (
            db.query(TalentRadarFeedback)
            .filter(
                TalentRadarFeedback.user_id == user_id,
                TalentRadarFeedback.opportunity_id == opportunity_id,
            )
            .first()
        )

        now = datetime.now(timezone.utc)
        if existing:
            existing.feedback_type = feedback_type
            existing.notes = notes
            existing.updated_at = now
            db.commit()
            db.refresh(existing)
            return existing

        feedback = TalentRadarFeedback(
            user_id=user_id,
            opportunity_id=opportunity_id,
            feedback_type=feedback_type,
            notes=notes,
            created_at=now,
            updated_at=now,
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback
