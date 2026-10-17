from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.features.social.schemas import (
    SocialUserSummary,
    SocialProfileDetail,
    UserSearchResponse,
    SocialConnectionRequestCreate,
    SocialConnectionRequestResponse,
    ConnectionsListResponse,
    MutualConnectionsResponse,
    ConnectionStatusResponse,
    ConnectionDegreeResponse,
    UserBlockItem,
    BlockResponse,
    NotificationsListResponse,
    NotificationResponse,
    UnreadCountResponse,
    SuggestionsResponse,
)
from app.features.social.service import SocialService

router = APIRouter(prefix="/social", tags=["Social Networking & Connections"])


# ==================================================
# 1. USER DISCOVERY & SEARCH
# ==================================================

@router.get(
    "/users/search",
    response_model=UserSearchResponse,
    summary="Search for professionals across the network"
)
def search_users(
    q: Optional[str] = Query(None, description="General search query across name, skills, headline, company"),
    name: Optional[str] = Query(None, description="Filter by full or partial name"),
    role: Optional[str] = Query(None, description="Filter by role (Student, Alumni, Faculty, Founder, Recruiter)"),
    institution: Optional[str] = Query(None, description="Filter by university or college"),
    company: Optional[str] = Query(None, description="Filter by current company or organization"),
    job_title: Optional[str] = Query(None, description="Filter by job title or headline"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    skill: Optional[str] = Query(None, description="Filter by skill"),
    graduation_year: Optional[int] = Query(None, description="Filter by graduation year"),
    sort_by: str = Query("relevance", description="Sort by 'relevance', 'name', or 'experience'"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search and discover alumni, students, and professionals with multi-attribute filtering.
    Excludes blocked accounts and returns connection status with the current user.
    """
    return SocialService.search_users(
        db=db,
        current_user=current_user,
        q=q,
        name=name,
        role=role,
        institution=institution,
        company=company,
        job_title=job_title,
        industry=industry,
        skill=skill,
        graduation_year=graduation_year,
        sort_by=sort_by,
        page=page,
        page_size=page_size
    )


@router.get(
    "/users/suggestions",
    response_model=SuggestionsResponse,
    summary="People You May Know recommendations"
)
def get_user_suggestions(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deterministic, explainable recommendation engine suggesting people to connect with
    based on mutual connections, shared institutions, shared skills, and shared industry.
    """
    offset = (page - 1) * page_size
    return SocialService.get_suggestions(db, current_user, limit=page_size, offset=offset)


@router.get(
    "/users/{user_id}",
    response_model=SocialProfileDetail,
    summary="View a user's public profile"
)
def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve another user's public profile, total connections, mutual connections count,
    connection degree (1st/2nd), and connection status.
    """
    return SocialService.get_user_public_profile(db, current_user, user_id)


# ==================================================
# 2. CONNECTION REQUEST LIFECYCLE
# ==================================================

@router.post(
    "/requests/{recipient_id}",
    response_model=SocialConnectionRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send a connection request"
)
def send_connection_request(
    recipient_id: int,
    body: Optional[SocialConnectionRequestCreate] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a connection request with an optional note. Prevents self-requests, duplicate requests,
    and requests between already connected or blocked users. If recipient has an active
    qualification policy with auto-accept enabled and sender qualifies, connects immediately!
    """
    msg = body.message if body else None
    return SocialService.send_connection_request(db, current_user, recipient_id, msg)


@router.get(
    "/requests/incoming",
    response_model=List[SocialConnectionRequestResponse],
    summary="List received pending connection requests"
)
def get_incoming_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all pending connection requests awaiting current user's review.
    """
    offset = (page - 1) * page_size
    items, _ = SocialService.get_incoming_requests(db, current_user, limit=page_size, offset=offset)
    return items


@router.get(
    "/requests/outgoing",
    response_model=List[SocialConnectionRequestResponse],
    summary="List sent pending connection requests"
)
def get_outgoing_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all pending connection requests sent by the current user.
    """
    offset = (page - 1) * page_size
    items, _ = SocialService.get_outgoing_requests(db, current_user, limit=page_size, offset=offset)
    return items


@router.post(
    "/requests/{request_id}/accept",
    response_model=SocialConnectionRequestResponse,
    summary="Accept an incoming connection request"
)
def accept_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accept a pending connection request. Atomically updates request and creates connection.
    Only the recipient is authorized.
    """
    return SocialService.accept_request(db, current_user, request_id)


@router.post(
    "/requests/{request_id}/reject",
    response_model=SocialConnectionRequestResponse,
    summary="Reject an incoming connection request"
)
def reject_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reject a pending connection request. Only the recipient is authorized.
    """
    return SocialService.reject_request(db, current_user, request_id)


@router.delete(
    "/requests/{request_id}",
    response_model=SocialConnectionRequestResponse,
    summary="Cancel / withdraw an outgoing connection request"
)
def cancel_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Withdraw a pending outgoing request. Only the original sender is authorized.
    """
    return SocialService.cancel_request(db, current_user, request_id)


# ==================================================
# 3. CONNECTION MANAGEMENT & NETWORK GRAPH
# ==================================================

@router.get(
    "/connections",
    response_model=ConnectionsListResponse,
    summary="List my direct (1st-degree) connections"
)
def get_my_connections(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all direct 1st-degree connections of the authenticated user with pagination.
    """
    return SocialService.get_my_connections(
        db=db,
        current_user=current_user,
        page=page,
        page_size=page_size
    )


@router.get(
    "/connections/search",
    response_model=ConnectionsListResponse,
    summary="Search within my connections"
)
def search_my_connections(
    q: Optional[str] = Query(None, description="Search query across name, skills, company"),
    role: Optional[str] = Query(None, description="Filter by role"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    company: Optional[str] = Query(None, description="Filter by company"),
    skill: Optional[str] = Query(None, description="Filter by skill"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search and filter specifically within the authenticated user's direct connections.
    """
    return SocialService.get_my_connections(
        db=db,
        current_user=current_user,
        search_query=q,
        role=role,
        industry=industry,
        company=company,
        skill=skill,
        page=page,
        page_size=page_size
    )


@router.get(
    "/connections/mutual/{user_id}",
    response_model=MutualConnectionsResponse,
    summary="Retrieve mutual connections with another user"
)
def get_mutual_connections(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate the intersection of direct connections between current user and target user.
    """
    return SocialService.get_mutual_connections(db, current_user, user_id)


@router.get(
    "/connections/{user_id}/status",
    response_model=ConnectionStatusResponse,
    summary="Check connection status with a user"
)
def get_connection_status(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if connected, pending, blocked, or not connected, with mutual connection count.
    """
    return SocialService.get_connection_status(db, current_user, user_id)


@router.delete(
    "/connections/{user_id}",
    summary="Remove an existing connection"
)
def remove_connection(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disconnect from a user. Removes the connection edge atomically.
    """
    return SocialService.remove_connection(db, current_user, user_id)


@router.get(
    "/connections/{user_id}/degree",
    response_model=ConnectionDegreeResponse,
    summary="Get network degree of separation (1st or 2nd degree)"
)
def get_connection_degree(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns 1 for direct connections, 2 for connections of connections, or null for beyond.
    """
    return SocialService.get_connection_degree(db, current_user, user_id)


# ==================================================
# 4. BLOCKING & PRIVACY
# ==================================================

@router.post(
    "/blocks/{user_id}",
    response_model=BlockResponse,
    summary="Block a user"
)
def block_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Block a user. Automatically dissolves any existing connection and cancels pending requests.
    """
    return SocialService.block_user(db, current_user, user_id)


@router.delete(
    "/blocks/{user_id}",
    response_model=BlockResponse,
    summary="Unblock a user"
)
def unblock_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Unblock a previously blocked user. Only the blocker can unblock.
    """
    return SocialService.unblock_user(db, current_user, user_id)


@router.get(
    "/blocks",
    response_model=List[UserBlockItem],
    summary="List all blocked users"
)
def get_blocked_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all users blocked by the authenticated user.
    """
    return SocialService.get_blocked_users(db, current_user)


# ==================================================
# 5. NOTIFICATIONS
# ==================================================

@router.get(
    "/notifications",
    response_model=NotificationsListResponse,
    summary="List in-app notifications"
)
def get_notifications(
    unread_only: bool = Query(False, description="Filter for unread notifications only"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve persistent in-app notifications (connection requests received, accepted, etc.).
    """
    return SocialService.get_notifications(
        db=db,
        current_user=current_user,
        unread_only=unread_only,
        page=page,
        page_size=page_size
    )


@router.get(
    "/notifications/unread-count",
    response_model=UnreadCountResponse,
    summary="Get count of unread notifications"
)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns total number of unread notifications for the current user.
    """
    return SocialService.get_unread_count(db, current_user)


@router.patch(
    "/notifications/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark a notification as read"
)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a single notification as read. Owner only.
    """
    return SocialService.mark_notification_read(db, current_user, notification_id)


@router.patch(
    "/notifications/read-all",
    summary="Mark all notifications as read"
)
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all unread notifications for the authenticated user as read.
    """
    return SocialService.mark_all_notifications_read(db, current_user)
