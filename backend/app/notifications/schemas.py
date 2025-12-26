"""Notification schemas"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: int
    type: NotificationType
    message: str
    read: bool
    created_at: datetime
    
    # Related entities
    chapter_id: Optional[int] = None
    chapter_title: Optional[str] = None
    margin_id: Optional[int] = None
    btl_thread_id: Optional[int] = None
    btl_invite_id: Optional[int] = None
    
    # Actor (who triggered it)
    actor_id: Optional[int] = None
    actor_username: Optional[str] = None
    
    class Config:
        from_attributes = True


class UnreadCountResponse(BaseModel):
    count: int
