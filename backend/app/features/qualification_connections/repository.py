from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.features.qualification_connections.models import (
    ConnectionPolicy, ConnectionRequest, Connection, PolicyEvaluationLog
)
from app.features.qualification_connections.schemas import (
    ConnectionPolicyCreate, ConnectionPolicyUpdate, EvaluationResult
)


class QualificationConnectionsRepository:
    # --- POLICIES ---

    @staticmethod
    def create_policy(db: Session, obj_in: ConnectionPolicyCreate, user_id: int) -> ConnectionPolicy:
        policy = ConnectionPolicy(
            user_id=user_id,
            policy_name=obj_in.policy_name.strip(),
            required_skills=obj_in.required_skills,
            preferred_skills=obj_in.preferred_skills,
            relevant_industries=obj_in.relevant_industries,
            min_project_count=obj_in.min_project_count,
            min_years_experience=obj_in.min_years_experience,
            qualification_requirements=obj_in.qualification_requirements,
            auto_accept_enabled=obj_in.auto_accept_enabled,
            is_active=obj_in.is_active,
        )
        db.add(policy)
        db.commit()
        db.refresh(policy)
        return policy

    @staticmethod
    def get_policy_by_id(db: Session, policy_id: int) -> Optional[ConnectionPolicy]:
        return db.query(ConnectionPolicy).filter(ConnectionPolicy.id == policy_id).first()

    @staticmethod
    def get_user_policies(db: Session, user_id: int) -> List[ConnectionPolicy]:
        return (
            db.query(ConnectionPolicy)
            .filter(ConnectionPolicy.user_id == user_id)
            .order_by(ConnectionPolicy.created_at.desc())
            .all()
        )

    @staticmethod
    def get_active_policy_for_user(db: Session, user_id: int) -> Optional[ConnectionPolicy]:
        """Fetch the primary active connection policy for the specified user."""
        return (
            db.query(ConnectionPolicy)
            .filter(ConnectionPolicy.user_id == user_id, ConnectionPolicy.is_active == True)
            .order_by(ConnectionPolicy.updated_at.desc())
            .first()
        )

    @staticmethod
    def update_policy(
        db: Session,
        policy: ConnectionPolicy,
        obj_in: ConnectionPolicyUpdate
    ) -> ConnectionPolicy:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "policy_name" and value is not None:
                setattr(policy, field, value.strip())
            else:
                setattr(policy, field, value)

        db.commit()
        db.refresh(policy)
        return policy

    @staticmethod
    def delete_policy(db: Session, policy: ConnectionPolicy) -> None:
        db.delete(policy)
        db.commit()

    # --- CONNECTIONS ---

    @staticmethod
    def are_users_connected(db: Session, user_a: int, user_b: int) -> bool:
        low, high = (user_a, user_b) if user_a < user_b else (user_b, user_a)
        return db.query(Connection).filter(
            Connection.user_id_1 == low,
            Connection.user_id_2 == high
        ).first() is not None

    @staticmethod
    def create_connection(
        db: Session,
        user_a: int,
        user_b: int,
        policy_id: Optional[int] = None
    ) -> Connection:
        low, high = (user_a, user_b) if user_a < user_b else (user_b, user_a)
        existing = db.query(Connection).filter(
            Connection.user_id_1 == low,
            Connection.user_id_2 == high
        ).first()
        if existing:
            return existing

        conn = Connection(
            user_id_1=low,
            user_id_2=high,
            policy_id=policy_id
        )
        db.add(conn)
        db.commit()
        db.refresh(conn)
        return conn

    @staticmethod
    def get_user_connections(db: Session, user_id: int) -> List[Connection]:
        return (
            db.query(Connection)
            .filter(or_(Connection.user_id_1 == user_id, Connection.user_id_2 == user_id))
            .order_by(Connection.established_at.desc())
            .all()
        )

    # --- CONNECTION REQUESTS ---

    @staticmethod
    def get_pending_request_between(
        db: Session,
        sender_id: int,
        recipient_id: int
    ) -> Optional[ConnectionRequest]:
        return db.query(ConnectionRequest).filter(
            ConnectionRequest.sender_id == sender_id,
            ConnectionRequest.recipient_id == recipient_id,
            ConnectionRequest.status == "pending"
        ).first()

    @staticmethod
    def create_connection_request(
        db: Session,
        sender_id: int,
        recipient_id: int,
        policy_id: Optional[int],
        status: str,
        auto_accepted: bool,
        message: Optional[str] = None,
        evaluation_summary: Optional[dict] = None
    ) -> ConnectionRequest:
        req = ConnectionRequest(
            sender_id=sender_id,
            recipient_id=recipient_id,
            policy_id=policy_id,
            status=status,
            auto_accepted=auto_accepted,
            message=message.strip() if message else None,
            evaluation_summary=evaluation_summary
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return req

    @staticmethod
    def get_request_by_id(db: Session, request_id: int) -> Optional[ConnectionRequest]:
        return db.query(ConnectionRequest).filter(ConnectionRequest.id == request_id).first()

    @staticmethod
    def get_received_requests(db: Session, user_id: int) -> List[ConnectionRequest]:
        return (
            db.query(ConnectionRequest)
            .filter(ConnectionRequest.recipient_id == user_id)
            .order_by(ConnectionRequest.created_at.desc())
            .all()
        )

    @staticmethod
    def get_sent_requests(db: Session, user_id: int) -> List[ConnectionRequest]:
        return (
            db.query(ConnectionRequest)
            .filter(ConnectionRequest.sender_id == user_id)
            .order_by(ConnectionRequest.created_at.desc())
            .all()
        )

    # --- LOGS ---

    @staticmethod
    def log_evaluation(
        db: Session,
        result: EvaluationResult
    ) -> PolicyEvaluationLog:
        log = PolicyEvaluationLog(
            policy_id=result.policy_id,
            evaluator_user_id=result.evaluator_user_id,
            candidate_user_id=result.candidate_user_id,
            eligibility_status=result.eligibility_status,
            auto_accept_eligible=result.auto_accept_eligible,
            manual_review_required=result.manual_review_required,
            match_score=result.match_score,
            criteria_satisfied=result.criteria_satisfied,
            criteria_not_satisfied=result.criteria_not_satisfied,
            missing_information=result.missing_information,
            explanation=result.explanation
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def get_evaluations_for_user(db: Session, user_id: int) -> List[PolicyEvaluationLog]:
        return (
            db.query(PolicyEvaluationLog)
            .filter(or_(
                PolicyEvaluationLog.evaluator_user_id == user_id,
                PolicyEvaluationLog.candidate_user_id == user_id
            ))
            .order_by(PolicyEvaluationLog.created_at.desc())
            .all()
        )
