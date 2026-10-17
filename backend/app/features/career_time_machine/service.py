from typing import Optional, List, Dict, Tuple
from datetime import date
from collections import Counter
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.features.career_time_machine.models import CareerJourney, JourneyVisibility
from app.features.career_time_machine.schemas import (
    CareerJourneyCreate,
    CareerJourneyUpdate,
    CareerJourneyResponse,
    CareerExploreResponse,
    CareerTimelineResponse,
    CareerTimelineStage,
    SkillGapRequest,
    SkillGapResponse,
    SkillPriorityItem,
    ProjectEvidenceItem,
)
from app.features.career_time_machine.repository import CareerJourneyRepository
from app.models.user import User


class CareerTimeMachineService:
    @staticmethod
    def _format_journey_response(journey: CareerJourney) -> CareerJourneyResponse:
        author_name = None
        author_role = None
        author_headline = None
        if journey.user and journey.user.profile:
            author_name = journey.user.profile.full_name
            author_role = journey.user.profile.role
            author_headline = journey.user.profile.headline

        data = {
            "id": journey.id,
            "user_id": journey.user_id,
            "job_title": journey.job_title,
            "company": journey.company,
            "industry": journey.industry,
            "start_date": journey.start_date,
            "end_date": journey.end_date,
            "is_current": journey.is_current,
            "description": journey.description,
            "skills_used": journey.skills_used or [],
            "projects_or_achievements": journey.projects_or_achievements or [],
            "career_transition_notes": journey.career_transition_notes,
            "visibility": journey.visibility,
            "verification_status": journey.verification_status,
            "created_at": journey.created_at,
            "updated_at": journey.updated_at,
            "author_name": author_name,
            "author_role": author_role,
            "author_headline": author_headline,
        }
        return CareerJourneyResponse(**data)

    @staticmethod
    def create_journey(db: Session, user: User, obj_in: CareerJourneyCreate) -> CareerJourneyResponse:
        created = CareerJourneyRepository.create(db, obj_in, user.id)
        return CareerTimeMachineService._format_journey_response(created)

    @staticmethod
    def get_my_journeys(db: Session, user: User) -> List[CareerJourneyResponse]:
        journeys = CareerJourneyRepository.get_user_journeys(db, user.id)
        return [CareerTimeMachineService._format_journey_response(j) for j in journeys]

    @staticmethod
    def get_journey_by_id(
        db: Session,
        journey_id: int,
        requesting_user: Optional[User] = None
    ) -> CareerJourneyResponse:
        journey = CareerJourneyRepository.get_by_id(db, journey_id)
        if not journey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Career journey with ID {journey_id} was not found"
            )

        # Access check
        is_owner = requesting_user is not None and requesting_user.id == journey.user_id
        if not is_owner:
            if journey.visibility == JourneyVisibility.PRIVATE.value:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="This career journey record is marked as private by its author"
                )
            if journey.visibility == JourneyVisibility.NETWORK_ONLY.value and requesting_user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="You must be logged in to view network-only career journeys",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        return CareerTimeMachineService._format_journey_response(journey)

    @staticmethod
    def update_journey(
        db: Session,
        user: User,
        journey_id: int,
        obj_in: CareerJourneyUpdate
    ) -> CareerJourneyResponse:
        journey = CareerJourneyRepository.get_by_id(db, journey_id)
        if not journey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Career journey with ID {journey_id} was not found"
            )

        # Ownership authorization check
        if journey.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this career journey record"
            )

        updated = CareerJourneyRepository.update(db, journey, obj_in)
        return CareerTimeMachineService._format_journey_response(updated)

    @staticmethod
    def delete_journey(db: Session, user: User, journey_id: int) -> None:
        journey = CareerJourneyRepository.get_by_id(db, journey_id)
        if not journey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Career journey with ID {journey_id} was not found"
            )

        # Ownership authorization check
        if journey.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this career journey record"
            )

        CareerJourneyRepository.delete(db, journey)

    @staticmethod
    def explore_journeys(
        db: Session,
        requesting_user: Optional[User] = None,
        target_title: Optional[str] = None,
        industry: Optional[str] = None,
        skill: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ) -> CareerExploreResponse:
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 10

        offset = (page - 1) * page_size
        items, total = CareerJourneyRepository.explore(
            db=db,
            requesting_user=requesting_user,
            target_title=target_title,
            industry=industry,
            skill=skill,
            limit=page_size,
            offset=offset
        )
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0

        return CareerExploreResponse(
            items=[CareerTimeMachineService._format_journey_response(j) for j in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def get_timeline(
        db: Session,
        journey_id: int,
        requesting_user: Optional[User] = None
    ) -> CareerTimelineResponse:
        """
        Returns full chronological journey timeline for the professional who owns journey_id.
        """
        seed_journey = CareerJourneyRepository.get_by_id(db, journey_id)
        if not seed_journey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Career journey with ID {journey_id} was not found"
            )

        target_user_id = seed_journey.user_id
        journeys = CareerJourneyRepository.get_user_timeline_journeys(
            db=db,
            target_user_id=target_user_id,
            requesting_user=requesting_user
        )

        professional_name = "Unknown Alumni"
        professional_headline = None
        current_role = None

        if seed_journey.user:
            if seed_journey.user.profile:
                professional_name = seed_journey.user.profile.full_name
                professional_headline = seed_journey.user.profile.headline
                current_role = seed_journey.user.profile.headline

        stages: List[CareerTimelineStage] = []
        for index, j in enumerate(journeys, start=1):
            if j.is_current:
                current_role = f"{j.job_title} at {j.company}"

            # Calculate duration in months
            duration_months = None
            ref_end = j.end_date if j.end_date else date.today()
            if j.start_date:
                months = (ref_end.year - j.start_date.year) * 12 + (ref_end.month - j.start_date.month)
                duration_months = max(1, months)

            stages.append(
                CareerTimelineStage(
                    stage_number=index,
                    journey_id=j.id,
                    job_title=j.job_title,
                    company=j.company,
                    industry=j.industry,
                    start_date=j.start_date,
                    end_date=j.end_date,
                    is_current=j.is_current,
                    duration_months=duration_months,
                    skills_used=j.skills_used or [],
                    projects_or_achievements=j.projects_or_achievements or [],
                    career_transition_notes=j.career_transition_notes,
                    verification_status=j.verification_status,
                )
            )

        return CareerTimelineResponse(
            user_id=target_user_id,
            professional_name=professional_name,
            professional_headline=professional_headline,
            current_role=current_role,
            total_stages=len(stages),
            stages=stages,
        )

    @staticmethod
    def analyze_skill_gap(db: Session, request: SkillGapRequest) -> SkillGapResponse:
        """
        Deterministic, database-backed skill gap analysis using real alumni records.
        """
        records = CareerJourneyRepository.find_records_for_skill_gap(
            db=db,
            target_role=request.target_role,
            industry_preference=request.industry_preference
        )

        if not records:
            return SkillGapResponse(
                target_role=request.target_role,
                current_skills=request.current_skills,
                matching_skills=[],
                potential_skill_gaps=[],
                suggested_priorities=[],
                relevant_projects_or_experiences=[],
                observed_transition_notes=[],
                analyzed_records_count=0,
                disclaimer=(
                    "No matching historical career records were found for this role in our database. "
                    "Recommendations are never fabricated; as more alumni submit career journeys, "
                    "empirical insights will become available."
                )
            )

        # Normalize user current skills (lowercase map)
        normalized_user_skills = {s.strip().lower(): s.strip() for s in request.current_skills if s.strip()}

        # Aggregate skills observed in matching alumni career records
        skill_counter: Counter = Counter()
        skill_display_names: Dict[str, str] = {}
        project_evidence: List[ProjectEvidenceItem] = []
        transition_notes: List[str] = []

        for record in records:
            record_skills = record.skills_used or []
            for sk in record_skills:
                cleaned = sk.strip()
                if cleaned:
                    norm = cleaned.lower()
                    skill_counter[norm] += 1
                    if norm not in skill_display_names:
                        skill_display_names[norm] = cleaned

            # Extract real projects/achievements as evidence
            for proj in (record.projects_or_achievements or []):
                if isinstance(proj, str) and proj.strip():
                    project_evidence.append(
                        ProjectEvidenceItem(
                            project_or_achievement=proj.strip(),
                            context_role=record.job_title,
                            context_company=record.company
                        )
                    )

            if record.career_transition_notes and record.career_transition_notes.strip():
                transition_notes.append(record.career_transition_notes.strip())

        total_records = len(records)
        matching_skills: List[str] = []
        skill_gap_items: List[SkillPriorityItem] = []
        potential_gaps: List[str] = []

        for norm_skill, count in skill_counter.most_common():
            display_name = skill_display_names[norm_skill]
            percentage = round((count / total_records) * 100, 1)

            if norm_skill in normalized_user_skills:
                matching_skills.append(display_name)
            else:
                potential_gaps.append(display_name)
                # Assign priority based on empirical frequency in alumni records
                if percentage >= 60.0:
                    priority = "High"
                    reason = f"Essential core skill observed in {percentage}% ({count}/{total_records}) of alumni records in this role."
                elif percentage >= 30.0:
                    priority = "Medium"
                    reason = f"Commonly required skill observed in {percentage}% ({count}/{total_records}) of alumni records."
                else:
                    priority = "Low"
                    reason = f"Complementary or niche skill observed in {percentage}% ({count}/{total_records}) of alumni records."

                skill_gap_items.append(
                    SkillPriorityItem(
                        skill=display_name,
                        priority=priority,
                        reason=reason,
                        frequency_in_target_records=count,
                        percentage_of_profiles=percentage
                    )
                )

        return SkillGapResponse(
            target_role=request.target_role,
            current_skills=request.current_skills,
            matching_skills=matching_skills,
            potential_skill_gaps=potential_gaps,
            suggested_priorities=skill_gap_items,
            relevant_projects_or_experiences=project_evidence[:10],
            observed_transition_notes=transition_notes[:5],
            analyzed_records_count=total_records,
            disclaimer=(
                f"Analysis derived from {total_records} verified or alumni-submitted record(s) matching '{request.target_role}'. "
                "These suggestions highlight observed historical trends and are not guarantees of career outcomes."
            )
        )
