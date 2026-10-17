from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.user import User
from app.models.profile import Profile
from app.features.qualification_connections.models import Connection, ConnectionRequest, ConnectionPolicy
from app.features.qualification_connections.evaluator import PolicyEvaluator
from app.features.social.models import UserBlock, Notification
from app.features.social.repository import SocialRepository
from app.features.social.recommendations import PeopleRecommendationEngine
from app.features.social.schemas import (
    SocialUserSummary,
    SocialProfileDetail,
    UserSearchResponse,
    SocialConnectionRequestResponse,
    ConnectedUserResponse,
    ConnectionsListResponse,
    MutualConnectionsResponse,
    ConnectionStatusResponse,
    ConnectionDegreeResponse,
    UserBlockItem,
    BlockResponse,
    NotificationResponse,
    NotificationsListResponse,
    UnreadCountResponse,
    SuggestionsResponse,
)


class SocialService:
    @staticmethod
    def _format_user_summary(
        db: Session,
        current_user_id: int,
        target_user: User
    ) -> SocialUserSummary:
        p = target_user.profile
        m_ids = SocialRepository.get_mutual_connection_ids(db, current_user_id, target_user.id)
        degree = SocialRepository.get_connection_degree(db, current_user_id, target_user.id)

        # Connection status determination
        if target_user.id == current_user_id:
            conn_status = "self"
        elif SocialRepository.is_blocked(db, current_user_id, target_user.id) or SocialRepository.is_blocked(db, target_user.id, current_user_id):
            conn_status = "blocked"
        elif SocialRepository.get_connection_between(db, current_user_id, target_user.id):
            conn_status = "connected"
        else:
            req = SocialRepository.get_active_pending_request_between(db, current_user_id, target_user.id)
            if req:
                conn_status = "pending_sent" if req.sender_id == current_user_id else "pending_received"
            else:
                conn_status = "none"

        return SocialUserSummary(
            id=target_user.id,
            full_name=p.full_name if p else "User",
            role=p.role if p else "Member",
            headline=p.headline if p else None,
            industry=p.industry if p else None,
            current_organization=p.current_organization if p else None,
            skills=p.skills if p and p.skills else [],
            years_of_experience=p.years_of_experience if p else 0.0,
            connection_status=conn_status,
            mutual_connections_count=len(m_ids),
            degree=degree
        )

    # --- USER DISCOVERY & SEARCH ---

    @staticmethod
    def search_users(
        db: Session,
        current_user: User,
        q: Optional[str] = None,
        name: Optional[str] = None,
        role: Optional[str] = None,
        institution: Optional[str] = None,
        company: Optional[str] = None,
        job_title: Optional[str] = None,
        industry: Optional[str] = None,
        skill: Optional[str] = None,
        graduation_year: Optional[int] = None,
        sort_by: str = "relevance",
        page: int = 1,
        page_size: int = 10
    ) -> UserSearchResponse:
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 50:
            page_size = 10
        offset = (page - 1) * page_size

        users, total = SocialRepository.search_users(
            db=db,
            current_user_id=current_user.id,
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
            limit=page_size,
            offset=offset
        )

        items = [SocialService._format_user_summary(db, current_user.id, u) for u in users]
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0

        return UserSearchResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def get_user_public_profile(
        db: Session,
        current_user: User,
        target_user_id: int
    ) -> SocialProfileDetail:
        target = db.query(User).filter(User.id == target_user_id).first()
        if not target or not target.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {target_user_id} was not found or is unavailable."
            )

        if SocialRepository.are_mutually_blocked(db, current_user.id, target_user_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {target_user_id} is unavailable."
            )

        p = target.profile
        total_connections = SocialRepository.count_connections(db, target_user_id)
        mutual_ids = SocialRepository.get_mutual_connection_ids(db, current_user.id, target_user_id)
        degree = SocialRepository.get_connection_degree(db, current_user.id, target_user_id)

        # Connection status
        if target_user_id == current_user.id:
            conn_status = "self"
        elif SocialRepository.get_connection_between(db, current_user.id, target_user_id):
            conn_status = "connected"
        else:
            req = SocialRepository.get_active_pending_request_between(db, current_user.id, target_user_id)
            if req:
                conn_status = "pending_sent" if req.sender_id == current_user.id else "pending_received"
            else:
                conn_status = "none"

        stages_count = len(target.career_journeys) if hasattr(target, "career_journeys") else 0

        return SocialProfileDetail(
            id=target.id,
            full_name=p.full_name if p else "User",
            role=p.role if p else "Member",
            headline=p.headline if p else None,
            biography=p.biography if p else None,
            skills=p.skills if p and p.skills else [],
            education=p.education if p and p.education else [],
            industry=p.industry if p else None,
            current_organization=p.current_organization if p else None,
            years_of_experience=p.years_of_experience if p else 0.0,
            visibility=p.visibility if p else "public",
            total_connections_count=total_connections,
            mutual_connections_count=len(mutual_ids),
            connection_status=conn_status,
            degree=degree,
            career_stages_count=stages_count
        )

    # --- CONNECTION REQUEST LIFECYCLE ---

    @staticmethod
    def send_connection_request(
        db: Session,
        current_user: User,
        recipient_id: int,
        message: Optional[str] = None
    ) -> SocialConnectionRequestResponse:
        sender_id = current_user.id

        if sender_id == recipient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot send a connection request to yourself."
            )

        recipient = db.query(User).filter(User.id == recipient_id).first()
        if not recipient or not recipient.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recipient user with ID {recipient_id} was not found or is inactive."
            )

        if SocialRepository.are_mutually_blocked(db, sender_id, recipient_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unable to send connection request to this user."
            )

        if SocialRepository.get_connection_between(db, sender_id, recipient_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You are already connected with this user."
            )

        existing_req = SocialRepository.get_active_pending_request_between(db, sender_id, recipient_id)
        if existing_req:
            if existing_req.sender_id == sender_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A pending connection request to this user already exists."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This user has already sent you a connection request. Please accept or reject it directly."
                )

        # Check if recipient has an active qualification policy with auto_accept enabled
        policy = db.query(ConnectionPolicy).filter(
            ConnectionPolicy.user_id == recipient_id,
            ConnectionPolicy.is_active == True
        ).order_by(ConnectionPolicy.updated_at.desc()).first()

        status_decision = "pending"
        auto_accepted = False

        if policy:
            eval_result = PolicyEvaluator.evaluate(policy, current_user)
            if policy.auto_accept_enabled and eval_result.auto_accept_eligible:
                status_decision = "accepted"
                auto_accepted = True

        # Atomically create connection request
        req = SocialRepository.create_request(
            db=db,
            sender_id=sender_id,
            recipient_id=recipient_id,
            message=message,
            status=status_decision,
            auto_accepted=auto_accepted
        )

        if auto_accepted:
            # Create mutual connection immediately
            low, high = (sender_id, recipient_id) if sender_id < recipient_id else (recipient_id, sender_id)
            conn = Connection(user_id_1=low, user_id_2=high, policy_id=policy.id if policy else None)
            db.add(conn)
            db.commit()

            # Notify sender of auto-acceptance
            recip_name = recipient.profile.full_name if recipient.profile else "Your colleague"
            SocialRepository.create_notification(
                db=db,
                user_id=sender_id,
                actor_id=recipient_id,
                type="connection_request_accepted",
                title="Connection Established",
                message=f"Your connection request to {recip_name} was automatically accepted based on qualifications.",
                data={"connection_id": conn.id, "request_id": req.id}
            )
        else:
            # Create in-app notification for recipient
            sender_name = current_user.profile.full_name if current_user.profile else "Someone"
            SocialRepository.create_notification(
                db=db,
                user_id=recipient_id,
                actor_id=sender_id,
                type="connection_request_received",
                title="New Connection Request",
                message=f"{sender_name} sent you a connection request.",
                data={"request_id": req.id, "sender_id": sender_id}
            )

        return SocialService._format_request_response(db, current_user.id, req)

    @staticmethod
    def _format_request_response(
        db: Session,
        current_user_id: int,
        req: ConnectionRequest
    ) -> SocialConnectionRequestResponse:
        sender_summary = SocialService._format_user_summary(db, current_user_id, req.sender) if req.sender else None
        recipient_summary = SocialService._format_user_summary(db, current_user_id, req.recipient) if req.recipient else None
        m_ids = SocialRepository.get_mutual_connection_ids(db, req.sender_id, req.recipient_id)

        return SocialConnectionRequestResponse(
            id=req.id,
            sender_id=req.sender_id,
            recipient_id=req.recipient_id,
            status=req.status,
            auto_accepted=req.auto_accepted,
            message=req.message,
            created_at=req.created_at,
            updated_at=req.updated_at,
            sender=sender_summary,
            recipient=recipient_summary,
            mutual_connections_count=len(m_ids)
        )

    @staticmethod
    def get_incoming_requests(
        db: Session,
        current_user: User,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List[SocialConnectionRequestResponse], int]:
        requests, total = SocialRepository.get_incoming_requests(db, current_user.id, limit, offset)
        items = [SocialService._format_request_response(db, current_user.id, r) for r in requests]
        return items, total

    @staticmethod
    def get_outgoing_requests(
        db: Session,
        current_user: User,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List[SocialConnectionRequestResponse], int]:
        requests, total = SocialRepository.get_outgoing_requests(db, current_user.id, limit, offset)
        items = [SocialService._format_request_response(db, current_user.id, r) for r in requests]
        return items, total

    @staticmethod
    def accept_request(
        db: Session,
        current_user: User,
        request_id: int
    ) -> SocialConnectionRequestResponse:
        req = SocialRepository.get_request_by_id(db, request_id)
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection request with ID {request_id} was not found."
            )

        if req.recipient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to accept this connection request."
            )

        if req.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This connection request has already been {req.status}."
            )

        # Atomic acceptance & connection creation
        req.status = "accepted"

        low, high = (req.sender_id, req.recipient_id) if req.sender_id < req.recipient_id else (req.recipient_id, req.sender_id)
        existing_conn = db.query(Connection).filter(Connection.user_id_1 == low, Connection.user_id_2 == high).first()
        if not existing_conn:
            conn = Connection(user_id_1=low, user_id_2=high, policy_id=req.policy_id)
            db.add(conn)

        db.commit()
        db.refresh(req)

        # Send notification to sender
        recipient_name = current_user.profile.full_name if current_user.profile else "Your peer"
        SocialRepository.create_notification(
            db=db,
            user_id=req.sender_id,
            actor_id=current_user.id,
            type="connection_request_accepted",
            title="Connection Request Accepted",
            message=f"{recipient_name} accepted your connection request.",
            data={"request_id": req.id, "recipient_id": current_user.id}
        )

        return SocialService._format_request_response(db, current_user.id, req)

    @staticmethod
    def reject_request(
        db: Session,
        current_user: User,
        request_id: int
    ) -> SocialConnectionRequestResponse:
        req = SocialRepository.get_request_by_id(db, request_id)
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection request with ID {request_id} was not found."
            )

        if req.recipient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to reject this connection request."
            )

        if req.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This connection request has already been {req.status}."
            )

        req.status = "rejected"
        db.commit()
        db.refresh(req)
        return SocialService._format_request_response(db, current_user.id, req)

    @staticmethod
    def cancel_request(
        db: Session,
        current_user: User,
        request_id: int
    ) -> SocialConnectionRequestResponse:
        req = SocialRepository.get_request_by_id(db, request_id)
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection request with ID {request_id} was not found."
            )

        if req.sender_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to cancel this connection request."
            )

        if req.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel a request that has already been {req.status}."
            )

        req.status = "cancelled"
        db.commit()
        db.refresh(req)
        return SocialService._format_request_response(db, current_user.id, req)

    # --- CONNECTION MANAGEMENT & NETWORK GRAPH ---

    @staticmethod
    def get_my_connections(
        db: Session,
        current_user: User,
        search_query: Optional[str] = None,
        role: Optional[str] = None,
        industry: Optional[str] = None,
        company: Optional[str] = None,
        skill: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ) -> ConnectionsListResponse:
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 50:
            page_size = 10
        offset = (page - 1) * page_size

        conn_pairs, total = SocialRepository.get_paginated_connections(
            db=db,
            user_id=current_user.id,
            search_query=search_query,
            role=role,
            industry=industry,
            company=company,
            skill=skill,
            limit=page_size,
            offset=offset
        )

        items = []
        for conn, other_user in conn_pairs:
            p = other_user.profile
            m_ids = SocialRepository.get_mutual_connection_ids(db, current_user.id, other_user.id)
            items.append(
                ConnectedUserResponse(
                    connection_id=conn.id,
                    user_id=other_user.id,
                    full_name=p.full_name if p else "User",
                    role=p.role if p else "Member",
                    headline=p.headline if p else None,
                    current_organization=p.current_organization if p else None,
                    industry=p.industry if p else None,
                    skills=p.skills if p and p.skills else [],
                    connected_since=conn.established_at,
                    mutual_connections_count=len(m_ids)
                )
            )

        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        return ConnectionsListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def remove_connection(
        db: Session,
        current_user: User,
        target_user_id: int
    ) -> Dict[str, Any]:
        removed = SocialRepository.remove_connection(db, current_user.id, target_user_id)
        if not removed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No active connection exists between you and user {target_user_id}."
            )
        return {
            "status": "removed",
            "message": f"Successfully disconnected from user {target_user_id}.",
            "target_user_id": target_user_id
        }

    @staticmethod
    def get_mutual_connections(
        db: Session,
        current_user: User,
        target_user_id: int
    ) -> MutualConnectionsResponse:
        target = db.query(User).filter(User.id == target_user_id).first()
        if not target or not target.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {target_user_id} was not found."
            )

        if SocialRepository.are_mutually_blocked(db, current_user.id, target_user_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {target_user_id} is unavailable."
            )

        mutual_ids = SocialRepository.get_mutual_connection_ids(db, current_user.id, target_user_id)
        mutual_users = db.query(User).filter(User.id.in_(mutual_ids)).all() if mutual_ids else []

        summaries = [SocialService._format_user_summary(db, current_user.id, u) for u in mutual_users]
        target_name = target.profile.full_name if target.profile else f"User {target.id}"

        return MutualConnectionsResponse(
            target_user_id=target_user_id,
            target_user_name=target_name,
            total_mutual_count=len(mutual_ids),
            mutual_connections=summaries
        )

    @staticmethod
    def get_connection_status(
        db: Session,
        current_user: User,
        target_user_id: int
    ) -> ConnectionStatusResponse:
        if current_user.id == target_user_id:
            return ConnectionStatusResponse(
                target_user_id=target_user_id,
                status="self",
                mutual_connections_count=0,
                degree=0,
                request_id=None
            )

        target = db.query(User).filter(User.id == target_user_id).first()
        if not target or not target.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {target_user_id} was not found."
            )

        if SocialRepository.are_mutually_blocked(db, current_user.id, target_user_id):
            return ConnectionStatusResponse(
                target_user_id=target_user_id,
                status="blocked",
                mutual_connections_count=0,
                degree=None,
                request_id=None
            )

        mutual_ids = SocialRepository.get_mutual_connection_ids(db, current_user.id, target_user_id)
        degree = SocialRepository.get_connection_degree(db, current_user.id, target_user_id)

        if SocialRepository.get_connection_between(db, current_user.id, target_user_id):
            return ConnectionStatusResponse(
                target_user_id=target_user_id,
                status="connected",
                mutual_connections_count=len(mutual_ids),
                degree=1,
                request_id=None
            )

        req = SocialRepository.get_active_pending_request_between(db, current_user.id, target_user_id)
        if req:
            st = "pending_sent" if req.sender_id == current_user.id else "pending_received"
            return ConnectionStatusResponse(
                target_user_id=target_user_id,
                status=st,
                mutual_connections_count=len(mutual_ids),
                degree=degree,
                request_id=req.id
            )

        return ConnectionStatusResponse(
            target_user_id=target_user_id,
            status="none",
            mutual_connections_count=len(mutual_ids),
            degree=degree,
            request_id=None
        )

    @staticmethod
    def get_connection_degree(
        db: Session,
        current_user: User,
        target_user_id: int
    ) -> ConnectionDegreeResponse:
        degree = SocialRepository.get_connection_degree(db, current_user.id, target_user_id)
        if degree == 0:
            desc = "You (Self)"
        elif degree == 1:
            desc = "1st-degree connection (Direct connection)"
        elif degree == 2:
            m_count = len(SocialRepository.get_mutual_connection_ids(db, current_user.id, target_user_id))
            desc = f"2nd-degree connection (Connected via {m_count} mutual connection{'s' if m_count > 1 else ''})"
        else:
            desc = "Beyond 2nd-degree network"

        return ConnectionDegreeResponse(
            target_user_id=target_user_id,
            degree=degree,
            description=desc,
            path_length=degree
        )

    # --- PEOPLE YOU MAY KNOW / SUGGESTIONS ---

    @staticmethod
    def get_suggestions(
        db: Session,
        current_user: User,
        limit: int = 10,
        offset: int = 0
    ) -> SuggestionsResponse:
        items, total = PeopleRecommendationEngine.get_suggestions(
            db=db,
            current_user=current_user,
            limit=limit,
            offset=offset
        )
        return SuggestionsResponse(items=items, total=total)

    # --- BLOCKING & PRIVACY ---

    @staticmethod
    def block_user(
        db: Session,
        current_user: User,
        target_user_id: int
    ) -> BlockResponse:
        if current_user.id == target_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot block yourself."
            )

        target = db.query(User).filter(User.id == target_user_id).first()
        if not target:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {target_user_id} was not found."
            )

        # Policy: Automatically remove connection if one exists
        SocialRepository.remove_connection(db, current_user.id, target_user_id)

        # Policy: Automatically cancel any pending connection requests
        SocialRepository.cancel_pending_requests_between(db, current_user.id, target_user_id)

        SocialRepository.block_user(db, current_user.id, target_user_id)

        return BlockResponse(
            status="blocked",
            blocked_user_id=target_user_id,
            message=f"User {target_user_id} has been blocked. Any existing connection or pending request has been terminated."
        )

    @staticmethod
    def unblock_user(
        db: Session,
        current_user: User,
        target_user_id: int
    ) -> BlockResponse:
        success = SocialRepository.unblock_user(db, current_user.id, target_user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {target_user_id} was not in your blocked users list."
            )
        return BlockResponse(
            status="unblocked",
            blocked_user_id=target_user_id,
            message=f"User {target_user_id} has been unblocked."
        )

    @staticmethod
    def get_blocked_users(
        db: Session,
        current_user: User
    ) -> List[UserBlockItem]:
        blocks = SocialRepository.get_user_blocks(db, current_user.id)
        results = []
        for b in blocks:
            name = "User"
            role = None
            if b.blocked and b.blocked.profile:
                name = b.blocked.profile.full_name
                role = b.blocked.profile.role
            results.append(
                UserBlockItem(
                    id=b.id,
                    blocked_user_id=b.blocked_id,
                    blocked_user_name=name,
                    blocked_user_role=role,
                    created_at=b.created_at
                )
            )
        return results

    # --- NOTIFICATIONS ---

    @staticmethod
    def get_notifications(
        db: Session,
        current_user: User,
        unread_only: bool = False,
        page: int = 1,
        page_size: int = 20
    ) -> NotificationsListResponse:
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 50:
            page_size = 20
        offset = (page - 1) * page_size

        notifs, total, unread_count = SocialRepository.get_notifications(
            db=db,
            user_id=current_user.id,
            unread_only=unread_only,
            limit=page_size,
            offset=offset
        )

        items = []
        for n in notifs:
            actor_name = None
            if n.actor and n.actor.profile:
                actor_name = n.actor.profile.full_name
            items.append(
                NotificationResponse(
                    id=n.id,
                    user_id=n.user_id,
                    actor_id=n.actor_id,
                    actor_name=actor_name,
                    type=n.type,
                    title=n.title,
                    message=n.message,
                    is_read=n.is_read,
                    data=n.data or {},
                    created_at=n.created_at
                )
            )

        return NotificationsListResponse(
            items=items,
            total=total,
            unread_count=unread_count,
            page=page,
            page_size=page_size
        )

    @staticmethod
    def get_unread_count(db: Session, current_user: User) -> UnreadCountResponse:
        count = SocialRepository.get_unread_count(db, current_user.id)
        return UnreadCountResponse(unread_count=count)

    @staticmethod
    def mark_notification_read(
        db: Session,
        current_user: User,
        notification_id: int
    ) -> NotificationResponse:
        notif = SocialRepository.mark_as_read(db, notification_id, current_user.id)
        if not notif:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification with ID {notification_id} was not found."
            )
        actor_name = notif.actor.profile.full_name if notif.actor and notif.actor.profile else None
        return NotificationResponse(
            id=notif.id,
            user_id=notif.user_id,
            actor_id=notif.actor_id,
            actor_name=actor_name,
            type=notif.type,
            title=notif.title,
            message=notif.message,
            is_read=notif.is_read,
            data=notif.data or {},
            created_at=notif.created_at
        )

    @staticmethod
    def mark_all_notifications_read(
        db: Session,
        current_user: User
    ) -> Dict[str, Any]:
        count = SocialRepository.mark_all_as_read(db, current_user.id)
        return {
            "status": "success",
            "marked_as_read": count
        }

    # Alias for flexibility
    get_connections = get_my_connections

