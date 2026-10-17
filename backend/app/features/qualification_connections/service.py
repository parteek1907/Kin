from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.features.qualification_connections.models import ConnectionPolicy, ConnectionRequest, Connection, PolicyEvaluationLog
from app.features.qualification_connections.schemas import (
    ConnectionPolicyCreate,
    ConnectionPolicyUpdate,
    ConnectionPolicyResponse,
    EvaluationResult,
    EvaluateCandidateRequest,
    ConnectionRequestCreate,
    ConnectionRequestResponse,
    ConnectionResponse,
)
from app.features.qualification_connections.repository import QualificationConnectionsRepository
from app.features.qualification_connections.evaluator import PolicyEvaluator
from app.features.qualification_connections.permissions import ConnectionPermissions
from app.models.user import User


class QualificationConnectionsService:
    # --- POLICY MANAGEMENT ---

    @staticmethod
    def create_policy(
        db: Session,
        current_user: User,
        obj_in: ConnectionPolicyCreate
    ) -> ConnectionPolicyResponse:
        created = QualificationConnectionsRepository.create_policy(db, obj_in, current_user.id)
        return ConnectionPolicyResponse.model_validate(created)

    @staticmethod
    def get_my_policies(db: Session, current_user: User) -> List[ConnectionPolicyResponse]:
        policies = QualificationConnectionsRepository.get_user_policies(db, current_user.id)
        return [ConnectionPolicyResponse.model_validate(p) for p in policies]

    @staticmethod
    def get_policy_by_id(
        db: Session,
        current_user: User,
        policy_id: int
    ) -> ConnectionPolicyResponse:
        policy = QualificationConnectionsRepository.get_policy_by_id(db, policy_id)
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection policy with ID {policy_id} was not found"
            )
        ConnectionPermissions.ensure_policy_owner(policy, current_user)
        return ConnectionPolicyResponse.model_validate(policy)

    @staticmethod
    def update_policy(
        db: Session,
        current_user: User,
        policy_id: int,
        obj_in: ConnectionPolicyUpdate
    ) -> ConnectionPolicyResponse:
        policy = QualificationConnectionsRepository.get_policy_by_id(db, policy_id)
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection policy with ID {policy_id} was not found"
            )
        ConnectionPermissions.ensure_policy_owner(policy, current_user)
        updated = QualificationConnectionsRepository.update_policy(db, policy, obj_in)
        return ConnectionPolicyResponse.model_validate(updated)

    @staticmethod
    def delete_policy(db: Session, current_user: User, policy_id: int) -> None:
        policy = QualificationConnectionsRepository.get_policy_by_id(db, policy_id)
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection policy with ID {policy_id} was not found"
            )
        ConnectionPermissions.ensure_policy_owner(policy, current_user)
        QualificationConnectionsRepository.delete_policy(db, policy)

    # --- EVALUATION ENGINE ---

    @staticmethod
    def evaluate_candidate(
        db: Session,
        current_user: User,
        req: EvaluateCandidateRequest
    ) -> EvaluationResult:
        # Determine candidate
        candidate_id = req.candidate_user_id or current_user.id
        candidate = db.query(User).filter(User.id == candidate_id).first()
        if not candidate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate with ID {candidate_id} was not found"
            )

        # Determine policy
        policy = None
        if req.policy_id:
            policy = QualificationConnectionsRepository.get_policy_by_id(db, req.policy_id)
            if not policy:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Policy with ID {req.policy_id} was not found"
                )
        elif req.recipient_id:
            policy = QualificationConnectionsRepository.get_active_policy_for_user(db, req.recipient_id)
            if not policy:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Recipient user {req.recipient_id} has no active connection policy configured"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must specify either policy_id or recipient_id for evaluation"
            )

        result = PolicyEvaluator.evaluate(policy, candidate)
        QualificationConnectionsRepository.log_evaluation(db, result)
        return result

    # --- CONNECTION REQUESTS & AUTOMATIC ACCEPTANCE ---

    @staticmethod
    def _format_request_response(db: Session, req: ConnectionRequest) -> ConnectionRequestResponse:
        sender_name = None
        sender_headline = None
        recipient_name = None

        if req.sender and req.sender.profile:
            sender_name = req.sender.profile.full_name
            sender_headline = req.sender.profile.headline
        if req.recipient and req.recipient.profile:
            recipient_name = req.recipient.profile.full_name

        return ConnectionRequestResponse(
            id=req.id,
            sender_id=req.sender_id,
            recipient_id=req.recipient_id,
            policy_id=req.policy_id,
            status=req.status,
            auto_accepted=req.auto_accepted,
            message=req.message,
            evaluation_summary=req.evaluation_summary,
            created_at=req.created_at,
            updated_at=req.updated_at,
            sender_name=sender_name,
            sender_headline=sender_headline,
            recipient_name=recipient_name,
        )

    @staticmethod
    def send_connection_request(
        db: Session,
        current_user: User,
        req_in: ConnectionRequestCreate
    ) -> ConnectionRequestResponse:
        sender_id = current_user.id
        recipient_id = req_in.recipient_id

        # 1. Prevent self-connection
        ConnectionPermissions.ensure_not_self(sender_id, recipient_id)

        # 2. Verify recipient exists and is active
        recipient = db.query(User).filter(User.id == recipient_id, User.is_active == True).first()
        if not recipient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recipient user with ID {recipient_id} was not found or is inactive"
            )

        # 3. Check if already connected
        if QualificationConnectionsRepository.are_users_connected(db, sender_id, recipient_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You are already connected with this user"
            )

        # 4. Check for existing pending request in either direction
        existing_sent = QualificationConnectionsRepository.get_pending_request_between(db, sender_id, recipient_id)
        if existing_sent:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A pending connection request to this user already exists"
            )

        existing_received = QualificationConnectionsRepository.get_pending_request_between(db, recipient_id, sender_id)
        if existing_received:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This user has already sent you a connection request. Please accept or reject it directly."
            )

        # 5. Look up recipient's active policy
        policy = QualificationConnectionsRepository.get_active_policy_for_user(db, recipient_id)

        status_decision = "pending"
        auto_accepted = False
        eval_summary = None
        matched_policy_id = None

        if policy:
            matched_policy_id = policy.id
            eval_result = PolicyEvaluator.evaluate(policy, current_user)
            eval_summary = eval_result.model_dump()
            QualificationConnectionsRepository.log_evaluation(db, eval_result)

            # AUTOMATIC ACCEPTANCE CONDITIONS:
            # 1. Recipient explicitly enabled auto_accept_enabled
            # 2. Policy is active
            # 3. Policy belongs to intended recipient
            # 4. All mandatory criteria are satisfied (auto_accept_eligible is True)
            # 5. Users are not already connected (verified above)
            # 6. Request is not a duplicate (verified above)
            if (
                policy.auto_accept_enabled and
                policy.is_active and
                policy.user_id == recipient_id and
                eval_result.auto_accept_eligible
            ):
                status_decision = "accepted"
                auto_accepted = True

        # 6. Persist connection request within transaction
        created_req = QualificationConnectionsRepository.create_connection_request(
            db=db,
            sender_id=sender_id,
            recipient_id=recipient_id,
            policy_id=matched_policy_id,
            status=status_decision,
            auto_accepted=auto_accepted,
            message=req_in.message,
            evaluation_summary=eval_summary
        )

        # 7. If auto-accepted, create the established connection immediately in DB
        if auto_accepted:
            QualificationConnectionsRepository.create_connection(
                db=db,
                user_a=sender_id,
                user_b=recipient_id,
                policy_id=matched_policy_id
            )

        return QualificationConnectionsService._format_request_response(db, created_req)

    @staticmethod
    def respond_to_request(
        db: Session,
        current_user: User,
        request_id: int,
        action: str
    ) -> ConnectionRequestResponse:
        conn_req = QualificationConnectionsRepository.get_request_by_id(db, request_id)
        if not conn_req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection request with ID {request_id} was not found"
            )

        ConnectionPermissions.ensure_recipient(conn_req, current_user)

        if conn_req.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This connection request has already been {conn_req.status}"
            )

        if action == "accept":
            conn_req.status = "accepted"
            # Establish the mutual connection
            QualificationConnectionsRepository.create_connection(
                db=db,
                user_a=conn_req.sender_id,
                user_b=conn_req.recipient_id,
                policy_id=conn_req.policy_id
            )
        elif action == "reject":
            conn_req.status = "rejected"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action must be 'accept' or 'reject'"
            )

        db.commit()
        db.refresh(conn_req)
        return QualificationConnectionsService._format_request_response(db, conn_req)

    @staticmethod
    def get_received_requests(db: Session, current_user: User) -> List[ConnectionRequestResponse]:
        requests = QualificationConnectionsRepository.get_received_requests(db, current_user.id)
        return [QualificationConnectionsService._format_request_response(db, r) for r in requests]

    @staticmethod
    def get_sent_requests(db: Session, current_user: User) -> List[ConnectionRequestResponse]:
        requests = QualificationConnectionsRepository.get_sent_requests(db, current_user.id)
        return [QualificationConnectionsService._format_request_response(db, r) for r in requests]

    @staticmethod
    def get_my_connections(db: Session, current_user: User) -> List[ConnectionResponse]:
        connections = QualificationConnectionsRepository.get_user_connections(db, current_user.id)
        results: List[ConnectionResponse] = []
        for conn in connections:
            other_id = conn.user_id_2 if conn.user_id_1 == current_user.id else conn.user_id_1
            other_user = db.query(User).filter(User.id == other_id).first()
            if other_user and other_user.profile:
                results.append(
                    ConnectionResponse(
                        id=conn.id,
                        connected_user_id=other_id,
                        connected_name=other_user.profile.full_name,
                        connected_headline=other_user.profile.headline,
                        connected_role=other_user.profile.role,
                        established_at=conn.established_at,
                    )
                )
        return results

    @staticmethod
    def get_my_evaluations(db: Session, current_user: User) -> List[Dict[str, Any]]:
        logs = QualificationConnectionsRepository.get_evaluations_for_user(db, current_user.id)
        return [
            {
                "id": log.id,
                "policy_id": log.policy_id,
                "evaluator_user_id": log.evaluator_user_id,
                "candidate_user_id": log.candidate_user_id,
                "eligibility_status": log.eligibility_status,
                "auto_accept_eligible": log.auto_accept_eligible,
                "manual_review_required": log.manual_review_required,
                "match_score": log.match_score,
                "criteria_satisfied": log.criteria_satisfied,
                "criteria_not_satisfied": log.criteria_not_satisfied,
                "missing_information": log.missing_information,
                "explanation": log.explanation,
                "created_at": log.created_at,
            }
            for log in logs
        ]
