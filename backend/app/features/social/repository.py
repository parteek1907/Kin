from typing import List, Optional, Set, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, cast, String, func, desc, asc
from app.models.user import User
from app.models.profile import Profile
from app.features.qualification_connections.models import Connection, ConnectionRequest
from app.features.social.models import UserBlock, Notification


class SocialRepository:
    # --- BLOCKING & SAFETY ---

    @staticmethod
    def is_blocked(db: Session, blocker_id: int, blocked_id: int) -> bool:
        return db.query(UserBlock).filter(
            UserBlock.blocker_id == blocker_id,
            UserBlock.blocked_id == blocked_id
        ).first() is not None

    @staticmethod
    def are_mutually_blocked(db: Session, user_a: int, user_b: int) -> bool:
        return db.query(UserBlock).filter(
            or_(
                and_(UserBlock.blocker_id == user_a, UserBlock.blocked_id == user_b),
                and_(UserBlock.blocker_id == user_b, UserBlock.blocked_id == user_a),
            )
        ).first() is not None

    @staticmethod
    def get_blocked_user_ids(db: Session, user_id: int) -> Set[int]:
        """Returns all IDs of users that this user blocked, or who blocked this user."""
        blocks = db.query(UserBlock).filter(
            or_(UserBlock.blocker_id == user_id, UserBlock.blocked_id == user_id)
        ).all()
        ids = set()
        for b in blocks:
            ids.add(b.blocked_id if b.blocker_id == user_id else b.blocker_id)
        return ids

    @staticmethod
    def block_user(db: Session, blocker_id: int, blocked_id: int) -> UserBlock:
        existing = db.query(UserBlock).filter(
            UserBlock.blocker_id == blocker_id,
            UserBlock.blocked_id == blocked_id
        ).first()
        if existing:
            return existing

        block = UserBlock(blocker_id=blocker_id, blocked_id=blocked_id)
        db.add(block)
        db.commit()
        db.refresh(block)
        return block

    @staticmethod
    def unblock_user(db: Session, blocker_id: int, blocked_id: int) -> bool:
        block = db.query(UserBlock).filter(
            UserBlock.blocker_id == blocker_id,
            UserBlock.blocked_id == blocked_id
        ).first()
        if not block:
            return False
        db.delete(block)
        db.commit()
        return True

    @staticmethod
    def get_user_blocks(db: Session, blocker_id: int) -> List[UserBlock]:
        return db.query(UserBlock).filter(UserBlock.blocker_id == blocker_id).all()

    # --- NETWORK GRAPH & CONNECTIONS ---

    @staticmethod
    def get_direct_connection_ids(db: Session, user_id: int) -> Set[int]:
        """Fetch all user IDs directly connected (1st-degree) to user_id."""
        connections = db.query(Connection).filter(
            or_(Connection.user_id_1 == user_id, Connection.user_id_2 == user_id)
        ).all()
        conn_ids = set()
        for c in connections:
            conn_ids.add(c.user_id_2 if c.user_id_1 == user_id else c.user_id_1)
        return conn_ids

    @staticmethod
    def count_connections(db: Session, user_id: int) -> int:
        return db.query(Connection).filter(
            or_(Connection.user_id_1 == user_id, Connection.user_id_2 == user_id)
        ).count()

    @staticmethod
    def get_mutual_connection_ids(db: Session, user_a: int, user_b: int) -> Set[int]:
        """Compute the set of mutual direct connections between two users."""
        if user_a == user_b:
            return set()
        conns_a = SocialRepository.get_direct_connection_ids(db, user_a)
        conns_b = SocialRepository.get_direct_connection_ids(db, user_b)
        return conns_a.intersection(conns_b)

    @staticmethod
    def get_connection_between(db: Session, user_a: int, user_b: int) -> Optional[Connection]:
        low, high = (user_a, user_b) if user_a < user_b else (user_b, user_a)
        return db.query(Connection).filter(
            Connection.user_id_1 == low,
            Connection.user_id_2 == high
        ).first()

    @staticmethod
    def remove_connection(db: Session, user_a: int, user_b: int) -> bool:
        conn = SocialRepository.get_connection_between(db, user_a, user_b)
        if not conn:
            return False
        db.delete(conn)
        db.commit()
        return True

    @staticmethod
    def get_connection_degree(db: Session, user_a: int, user_b: int) -> Optional[int]:
        if user_a == user_b:
            return 0
        if SocialRepository.get_connection_between(db, user_a, user_b):
            return 1
        mutual = SocialRepository.get_mutual_connection_ids(db, user_a, user_b)
        if mutual:
            return 2
        return None

    @staticmethod
    def get_paginated_connections(
        db: Session,
        user_id: int,
        search_query: Optional[str] = None,
        role: Optional[str] = None,
        industry: Optional[str] = None,
        company: Optional[str] = None,
        skill: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List[Tuple[Connection, User]], int]:
        """Returns direct connections joined with other User and Profile with search filters."""
        direct_ids = SocialRepository.get_direct_connection_ids(db, user_id)
        if not direct_ids:
            return [], 0

        query = db.query(User).join(Profile, User.id == Profile.user_id).filter(
            User.id.in_(direct_ids),
            User.is_active == True
        )

        if search_query and search_query.strip():
            pat = f"%{search_query.strip()}%"
            query = query.filter(
                or_(
                    Profile.full_name.ilike(pat),
                    Profile.headline.ilike(pat),
                    Profile.current_organization.ilike(pat),
                    Profile.industry.ilike(pat),
                    cast(Profile.skills, String).ilike(pat),
                )
            )

        if role:
            query = query.filter(Profile.role == role)
        if industry:
            query = query.filter(Profile.industry.ilike(f"%{industry.strip()}%"))
        if company:
            query = query.filter(Profile.current_organization.ilike(f"%{company.strip()}%"))
        if skill:
            query = query.filter(cast(Profile.skills, String).ilike(f"%{skill.strip()}%"))

        total = query.count()
        users = query.order_by(Profile.full_name.asc()).offset(offset).limit(limit).all()

        results = []
        for u in users:
            conn = SocialRepository.get_connection_between(db, user_id, u.id)
            if conn:
                results.append((conn, u))

        return results, total

    # --- CONNECTION REQUESTS ---

    @staticmethod
    def get_active_pending_request_between(db: Session, user_a: int, user_b: int) -> Optional[ConnectionRequest]:
        return db.query(ConnectionRequest).filter(
            or_(
                and_(ConnectionRequest.sender_id == user_a, ConnectionRequest.recipient_id == user_b),
                and_(ConnectionRequest.sender_id == user_b, ConnectionRequest.recipient_id == user_a),
            ),
            ConnectionRequest.status == "pending"
        ).first()

    @staticmethod
    def get_request_by_id(db: Session, request_id: int) -> Optional[ConnectionRequest]:
        return db.query(ConnectionRequest).filter(ConnectionRequest.id == request_id).first()

    @staticmethod
    def create_request(
        db: Session,
        sender_id: int,
        recipient_id: int,
        message: Optional[str] = None,
        status: str = "pending",
        auto_accepted: bool = False
    ) -> ConnectionRequest:
        req = ConnectionRequest(
            sender_id=sender_id,
            recipient_id=recipient_id,
            status=status,
            auto_accepted=auto_accepted,
            message=message.strip() if message else None,
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return req

    @staticmethod
    def update_request_status(db: Session, req: ConnectionRequest, status: str) -> ConnectionRequest:
        req.status = status
        db.commit()
        db.refresh(req)
        return req

    @staticmethod
    def cancel_pending_requests_between(db: Session, user_a: int, user_b: int) -> None:
        db.query(ConnectionRequest).filter(
            or_(
                and_(ConnectionRequest.sender_id == user_a, ConnectionRequest.recipient_id == user_b),
                and_(ConnectionRequest.sender_id == user_b, ConnectionRequest.recipient_id == user_a),
            ),
            ConnectionRequest.status == "pending"
        ).update({"status": "cancelled"}, synchronize_session=False)
        db.commit()

    @staticmethod
    def get_incoming_requests(
        db: Session,
        recipient_id: int,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List[ConnectionRequest], int]:
        query = db.query(ConnectionRequest).filter(
            ConnectionRequest.recipient_id == recipient_id,
            ConnectionRequest.status == "pending"
        )
        total = query.count()
        items = query.order_by(ConnectionRequest.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_outgoing_requests(
        db: Session,
        sender_id: int,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List[ConnectionRequest], int]:
        query = db.query(ConnectionRequest).filter(
            ConnectionRequest.sender_id == sender_id,
            ConnectionRequest.status == "pending"
        )
        total = query.count()
        items = query.order_by(ConnectionRequest.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    # --- USER SEARCH & DISCOVERY ---

    @staticmethod
    def search_users(
        db: Session,
        current_user_id: int,
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
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List[User], int]:
        blocked_ids = SocialRepository.get_blocked_user_ids(db, current_user_id)
        # Exclude self and blocked users
        exclude_ids = blocked_ids.union({current_user_id})

        query = db.query(User).join(Profile, User.id == Profile.user_id).filter(
            User.id.notin_(exclude_ids),
            User.is_active == True
        )

        if q and q.strip():
            pat = f"%{q.strip()}%"
            query = query.filter(
                or_(
                    Profile.full_name.ilike(pat),
                    Profile.headline.ilike(pat),
                    Profile.biography.ilike(pat),
                    Profile.industry.ilike(pat),
                    Profile.current_organization.ilike(pat),
                    cast(Profile.skills, String).ilike(pat),
                    cast(Profile.education, String).ilike(pat),
                )
            )

        if name and name.strip():
            query = query.filter(Profile.full_name.ilike(f"%{name.strip()}%"))

        if role and role.strip():
            query = query.filter(Profile.role.ilike(f"%{role.strip()}%"))

        if institution and institution.strip():
            pat = f"%{institution.strip()}%"
            query = query.filter(
                or_(
                    Profile.current_organization.ilike(pat),
                    cast(Profile.education, String).ilike(pat),
                )
            )

        if company and company.strip():
            query = query.filter(Profile.current_organization.ilike(f"%{company.strip()}%"))

        if job_title and job_title.strip():
            query = query.filter(Profile.headline.ilike(f"%{job_title.strip()}%"))

        if industry and industry.strip():
            query = query.filter(Profile.industry.ilike(f"%{industry.strip()}%"))

        if skill and skill.strip():
            query = query.filter(cast(Profile.skills, String).ilike(f"%{skill.strip()}%"))

        if graduation_year:
            query = query.filter(cast(Profile.education, String).ilike(f"%{graduation_year}%"))

        # Sorting
        if sort_by == "name":
            query = query.order_by(Profile.full_name.asc())
        elif sort_by == "experience":
            query = query.order_by(Profile.years_of_experience.desc())
        else:
            # Relevance / default
            query = query.order_by(User.id.desc())

        total = query.count()
        users = query.offset(offset).limit(limit).all()
        return users, total

    # --- NOTIFICATIONS ---

    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        actor_id: Optional[int],
        type: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            actor_id=actor_id,
            type=type,
            title=title.strip(),
            message=message.strip(),
            data=data or {},
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    @staticmethod
    def get_notifications(
        db: Session,
        user_id: int,
        unread_only: bool = False,
        limit: int = 20,
        offset: int = 0
    ) -> Tuple[List[Notification], int, int]:
        query = db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)

        unread_count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()

        total = query.count()
        items = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
        return items, total, unread_count

    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()

    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
        notif = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        if not notif:
            return None
        notif.is_read = True
        db.commit()
        db.refresh(notif)
        return notif

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True}, synchronize_session=False)
        db.commit()
        return count
