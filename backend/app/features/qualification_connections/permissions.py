from fastapi import HTTPException, status
from app.features.qualification_connections.models import ConnectionPolicy, ConnectionRequest, Connection
from app.models.user import User


class ConnectionPermissions:
    @staticmethod
    def ensure_policy_owner(policy: ConnectionPolicy, user: User) -> None:
        """Verify that the current user owns the policy."""
        if policy.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access or modify this connection policy."
            )

    @staticmethod
    def ensure_not_self(sender_id: int, recipient_id: int) -> None:
        """Prevent users from sending connection requests to themselves."""
        if sender_id == recipient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot send a connection request to yourself."
            )

    @staticmethod
    def ensure_recipient(request: ConnectionRequest, user: User) -> None:
        """Verify that only the intended recipient can accept or reject a request."""
        if request.recipient_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to respond to this connection request."
            )
