from typing import List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, cast, String
from app.features.career_time_machine.models import CareerJourney, JourneyVisibility
from app.features.career_time_machine.schemas import CareerJourneyCreate, CareerJourneyUpdate
from app.models.user import User


class CareerJourneyRepository:
    @staticmethod
    def create(db: Session, obj_in: CareerJourneyCreate, user_id: int) -> CareerJourney:
        db_obj = CareerJourney(
            user_id=user_id,
            job_title=obj_in.job_title.strip(),
            company=obj_in.company.strip(),
            industry=obj_in.industry.strip(),
            start_date=obj_in.start_date,
            end_date=obj_in.end_date,
            is_current=obj_in.is_current,
            description=obj_in.description,
            skills_used=obj_in.skills_used,
            projects_or_achievements=obj_in.projects_or_achievements,
            career_transition_notes=obj_in.career_transition_notes,
            visibility=obj_in.visibility.value if hasattr(obj_in.visibility, "value") else str(obj_in.visibility),
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def get_by_id(db: Session, journey_id: int) -> Optional[CareerJourney]:
        return db.query(CareerJourney).filter(CareerJourney.id == journey_id).first()

    @staticmethod
    def get_user_journeys(db: Session, user_id: int) -> List[CareerJourney]:
        return (
            db.query(CareerJourney)
            .filter(CareerJourney.user_id == user_id)
            .order_by(CareerJourney.start_date.desc())
            .all()
        )

    @staticmethod
    def get_user_timeline_journeys(
        db: Session,
        target_user_id: int,
        requesting_user: Optional[User] = None
    ) -> List[CareerJourney]:
        """
        Retrieve all career journey stages for a user in chronological order (oldest to newest),
        strictly filtering by access visibility.
        """
        query = db.query(CareerJourney).filter(CareerJourney.user_id == target_user_id)

        is_owner = requesting_user is not None and requesting_user.id == target_user_id
        if not is_owner:
            if requesting_user is not None:
                # Logged in users can see public and network_only
                query = query.filter(
                    CareerJourney.visibility.in_([JourneyVisibility.PUBLIC.value, JourneyVisibility.NETWORK_ONLY.value])
                )
            else:
                # Unauthenticated users can only see public
                query = query.filter(CareerJourney.visibility == JourneyVisibility.PUBLIC.value)

        return query.order_by(CareerJourney.start_date.asc()).all()

    @staticmethod
    def update(db: Session, db_obj: CareerJourney, obj_in: CareerJourneyUpdate) -> CareerJourney:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "visibility" and value is not None:
                setattr(db_obj, field, value.value if hasattr(value, "value") else str(value))
            elif field in ("job_title", "company", "industry") and value is not None:
                setattr(db_obj, field, value.strip())
            else:
                setattr(db_obj, field, value)

        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete(db: Session, db_obj: CareerJourney) -> None:
        db.delete(db_obj)
        db.commit()

    @staticmethod
    def explore(
        db: Session,
        requesting_user: Optional[User] = None,
        target_title: Optional[str] = None,
        industry: Optional[str] = None,
        skill: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List[CareerJourney], int]:
        """
        Query public/network visible career journeys with multi-attribute filtering
        and deterministic pagination.
        """
        query = db.query(CareerJourney)

        # Visibility rules
        if requesting_user is not None:
            # Can see own records, plus public and network_only from others
            query = query.filter(
                or_(
                    CareerJourney.user_id == requesting_user.id,
                    CareerJourney.visibility.in_([
                        JourneyVisibility.PUBLIC.value,
                        JourneyVisibility.NETWORK_ONLY.value
                    ])
                )
            )
        else:
            query = query.filter(CareerJourney.visibility == JourneyVisibility.PUBLIC.value)

        # Filters
        if target_title and target_title.strip():
            pattern = f"%{target_title.strip()}%"
            query = query.filter(CareerJourney.job_title.ilike(pattern))

        if industry and industry.strip():
            pattern = f"%{industry.strip()}%"
            query = query.filter(CareerJourney.industry.ilike(pattern))

        if skill and skill.strip():
            pattern = f"%{skill.strip()}%"
            # Cross-dialect JSON string cast search (works in Postgres and SQLite)
            query = query.filter(cast(CareerJourney.skills_used, String).ilike(pattern))

        total = query.count()
        items = query.order_by(CareerJourney.start_date.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def find_records_for_skill_gap(
        db: Session,
        target_role: str,
        industry_preference: Optional[str] = None
    ) -> List[CareerJourney]:
        """
        Find real career journeys matching target role for deterministic skill analysis.
        Only uses public or network_only records (never private ones).
        """
        pattern = f"%{target_role.strip()}%"
        query = db.query(CareerJourney).filter(
            CareerJourney.job_title.ilike(pattern),
            CareerJourney.visibility.in_([
                JourneyVisibility.PUBLIC.value,
                JourneyVisibility.NETWORK_ONLY.value
            ])
        )
        if industry_preference and industry_preference.strip():
            query = query.filter(CareerJourney.industry.ilike(f"%{industry_preference.strip()}%"))

        return query.all()
