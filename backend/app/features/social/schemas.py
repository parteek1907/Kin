from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class SocialUserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    role: str
    headline: Optional[str] = None
    industry: Optional[str] = None
    current_organization: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    years_of_experience: float = 0.0
    connection_status: str = Field(default="none", description="'connected', 'pending_sent', 'pending_received', 'blocked', 'self', or 'none'")
    mutual_connections_count: int = 0
    degree: Optional[int] = Field(None, description="1 for 1st-degree, 2 for 2nd-degree, null otherwise")


class SocialProfileDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    role: str
    headline: Optional[str] = None
    biography: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    education: List[Any] = Field(default_factory=list)
    industry: Optional[str] = None
    current_organization: Optional[str] = None
    years_of_experience: float = 0.0
    visibility: str = "public"
    total_connections_count: int = 0
    mutual_connections_count: int = 0
    connection_status: str = "none"
    degree: Optional[int] = None
    career_stages_count: int = 0


class UserSearchResponse(BaseModel):
    items: List[SocialUserSummary]
    total: int
    page: int
    page_size: int
    total_pages: int


class UserSuggestionItem(BaseModel):
    user: SocialUserSummary
    relevance_score: float = Field(..., ge=0.0, le=100.0)
    reasons: List[str] = Field(default_factory=list)
    shared_skills: List[str] = Field(default_factory=list)
    shared_institutions: List[str] = Field(default_factory=list)
    shared_industries: List[str] = Field(default_factory=list)
    mutual_connections_count: int = 0


class SuggestionsResponse(BaseModel):
    items: List[UserSuggestionItem]
    total: int


class SocialConnectionRequestCreate(BaseModel):
    message: Optional[str] = Field(None, max_length=1000, description="Optional personalized note for connection request")


class SocialConnectionRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    recipient_id: int
    status: str
    auto_accepted: bool = False
    message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    sender: Optional[SocialUserSummary] = None
    recipient: Optional[SocialUserSummary] = None
    mutual_connections_count: int = 0


class ConnectedUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    connection_id: int
    user_id: int
    full_name: str
    role: str
    headline: Optional[str] = None
    current_organization: Optional[str] = None
    industry: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    connected_since: datetime
    mutual_connections_count: int = 0


class ConnectionsListResponse(BaseModel):
    items: List[ConnectedUserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class MutualConnectionsResponse(BaseModel):
    target_user_id: int
    target_user_name: str
    total_mutual_count: int
    mutual_connections: List[SocialUserSummary]


class ConnectionStatusResponse(BaseModel):
    target_user_id: int
    status: str = Field(..., description="'connected', 'pending_sent', 'pending_received', 'blocked', 'self', or 'none'")
    mutual_connections_count: int = 0
    degree: Optional[int] = None
    request_id: Optional[int] = None


class ConnectionDegreeResponse(BaseModel):
    target_user_id: int
    degree: Optional[int]
    description: str
    path_length: Optional[int] = None


class UserBlockItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    blocked_user_id: int
    blocked_user_name: str
    blocked_user_role: Optional[str] = None
    created_at: datetime


class BlockResponse(BaseModel):
    status: str
    blocked_user_id: int
    message: str


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    actor_id: Optional[int] = None
    actor_name: Optional[str] = None
    type: str
    title: str
    message: str
    is_read: bool
    data: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class NotificationsListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    page_size: int


class UnreadCountResponse(BaseModel):
    unread_count: int
