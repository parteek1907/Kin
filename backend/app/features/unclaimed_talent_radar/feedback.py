"""
Feedback and Personalization Manager for Unclaimed Talent Radar.

Records user reactions to recommendations:
- relevant
- not_relevant
- already_skilled
- interested_in_industry
- not_interested_in_industry

Ensures consistent upserts (no duplicate records) and provides deterministic
ranking adjustments for the matching engine.
"""

from typing import List, Dict, Tuple, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.features.unclaimed_talent_radar.models import Opportunity, TalentRadarFeedback
from app.features.unclaimed_talent_radar.schemas import RadarFeedbackCreate
from app.features.unclaimed_talent_radar.repository import OpportunityRepository


class FeedbackManager:
    """
    Manages feedback recording, retrieval, and translation into deterministic ranking signals.
    """

    @staticmethod
    def record_feedback(
        db: Session,
        user_id: int,
        feedback_in: RadarFeedbackCreate,
    ) -> TalentRadarFeedback:
        """
        Record recommendation feedback for an authenticated user.
        Raises 404 if the opportunity record does not exist.
        """
        opp = OpportunityRepository.get_opportunity_by_id(db, feedback_in.opportunity_id)
        if not opp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Opportunity with ID {feedback_in.opportunity_id} not found."
            )

        return OpportunityRepository.upsert_user_feedback(
            db=db,
            user_id=user_id,
            opportunity_id=feedback_in.opportunity_id,
            feedback_type=feedback_in.feedback_type.value,
            notes=feedback_in.notes,
        )

    @staticmethod
    def get_user_feedback(db: Session, user_id: int) -> List[TalentRadarFeedback]:
        """Fetch all feedback records for a user."""
        return OpportunityRepository.get_user_feedback(db, user_id)

    @staticmethod
    def extract_feedback_signals(
        db: Session,
        user_id: int,
    ) -> Tuple[Dict[int, str], Dict[str, str]]:
        """
        Build lookup maps:
        1. opp_feedback_map: {opportunity_id: feedback_type}
        2. ind_feedback_map: {industry: feedback_type}
        """
        feedbacks = OpportunityRepository.get_user_feedback(db, user_id)
        opp_map: Dict[int, str] = {}
        ind_map: Dict[str, str] = {}

        for fb in feedbacks:
            opp_map[fb.opportunity_id] = fb.feedback_type
            if fb.feedback_type in ["interested_in_industry", "not_interested_in_industry"]:
                opp = OpportunityRepository.get_opportunity_by_id(db, fb.opportunity_id)
                if opp and opp.industry:
                    ind_map[opp.industry] = fb.feedback_type

        return opp_map, ind_map
