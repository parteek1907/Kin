from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.features.qualification_connections.schemas import (
    ConnectionPolicyCreate,
    ConnectionPolicyUpdate,
    ConnectionPolicyResponse,
    EvaluationResult,
    EvaluateCandidateRequest,
    ConnectionRequestCreate,
    ConnectionRequestResponse,
    ConnectionRequestAction,
    ConnectionResponse,
)
from app.features.qualification_connections.service import QualificationConnectionsService

router = APIRouter(prefix="/qualification-connections", tags=["Qualification Connections"])


# --- CONNECTION POLICIES ---

@router.post(
    "/policies",
    response_model=ConnectionPolicyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a connection acceptance policy"
)
def create_policy(
    policy_in: ConnectionPolicyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Define criteria for accepting connection requests.
    Automatic acceptance must be explicitly enabled (defaults to False).
    """
    return QualificationConnectionsService.create_policy(db, current_user, policy_in)


@router.get(
    "/policies/me",
    response_model=List[ConnectionPolicyResponse],
    summary="Get all policies owned by the authenticated user"
)
def get_my_policies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all connection acceptance policies created by the current user.
    """
    return QualificationConnectionsService.get_my_policies(db, current_user)


@router.get(
    "/policies/{policy_id}",
    response_model=ConnectionPolicyResponse,
    summary="Get a specific connection policy by ID"
)
def get_policy(
    policy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve details of a policy. Only the policy owner is authorized.
    """
    return QualificationConnectionsService.get_policy_by_id(db, current_user, policy_id)


@router.patch(
    "/policies/{policy_id}",
    response_model=ConnectionPolicyResponse,
    summary="Update a connection policy"
)
def update_policy(
    policy_id: int,
    policy_in: ConnectionPolicyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update criteria, active status, or auto-acceptance settings. Owner only.
    """
    return QualificationConnectionsService.update_policy(db, current_user, policy_id, policy_in)


@router.delete(
    "/policies/{policy_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a connection policy"
)
def delete_policy(
    policy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a connection policy. Owner only.
    """
    QualificationConnectionsService.delete_policy(db, current_user, policy_id)
    return None


# --- EVALUATION ENGINE ---

@router.post(
    "/evaluate",
    response_model=EvaluationResult,
    summary="Evaluate candidate against a connection policy"
)
def evaluate_candidate(
    req: EvaluateCandidateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run the deterministic evaluation engine against a candidate profile and policy.
    Returns criteria satisfied/not satisfied, missing information, and match score.
    """
    return QualificationConnectionsService.evaluate_candidate(db, current_user, req)


@router.get(
    "/evaluations/me",
    response_model=List[Dict[str, Any]],
    summary="View evaluation history for current user"
)
def get_my_evaluations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve evaluation logs where the current user was the evaluator or candidate.
    """
    return QualificationConnectionsService.get_my_evaluations(db, current_user)


# --- CONNECTION REQUESTS & AUTOMATIC ACCEPTANCE ---

@router.post(
    "/requests",
    response_model=ConnectionRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send a connection request with automatic qualification evaluation"
)
def send_connection_request(
    req_in: ConnectionRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a connection request to an alumni or professional.
    Evaluates sender against recipient's active policy. If all mandatory criteria are met
    and recipient explicitly enabled auto-acceptance, the request is automatically accepted
    and the connection is established immediately. Otherwise, it is queued for manual review.
    """
    return QualificationConnectionsService.send_connection_request(db, current_user, req_in)


@router.get(
    "/requests/received",
    response_model=List[ConnectionRequestResponse],
    summary="List received connection requests"
)
def get_received_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all connection requests received by the current user, along with evaluation summaries.
    """
    return QualificationConnectionsService.get_received_requests(db, current_user)


@router.get(
    "/requests/sent",
    response_model=List[ConnectionRequestResponse],
    summary="List sent connection requests"
)
def get_sent_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all connection requests sent by the current user.
    """
    return QualificationConnectionsService.get_sent_requests(db, current_user)


@router.post(
    "/requests/{request_id}/respond",
    response_model=ConnectionRequestResponse,
    summary="Manually accept or reject a pending connection request"
)
def respond_to_request(
    request_id: int,
    action_in: ConnectionRequestAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually review and accept/reject a pending connection request. Recipient only.
    """
    return QualificationConnectionsService.respond_to_request(db, current_user, request_id, action_in.action)


@router.get(
    "/connections/me",
    response_model=List[ConnectionResponse],
    summary="List current active connections"
)
def get_my_connections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all established mutual connections of the authenticated user.
    """
    return QualificationConnectionsService.get_my_connections(db, current_user)
