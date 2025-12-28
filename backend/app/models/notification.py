"""Notification model - rare, human, meaningful"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from app.database import Base


class NotificationType(str, enum.Enum):
    """Allowed notification types - intentionally limited"""
    MARGIN = "margin"  # Someone left a margin on your chapter
    SHELF_ADD = "shelf_add"  # Someone added your Book to their Shelf
    BTL_REPLY = "btl_reply"  # Someone replied Between the Lines
    BTL_INVITE = "btl_invite"  # Someone sent you a BTL invitation
    BOOKMARK = "bookmark"  # Someone bookmarked your chapter (optional, maybe later)


class Notification(Base):
    """
    Notifications are rare and human.
    
    Philosophy:
    - Feel like someone tapping your shoulder, not grabbing it
    - Never guilt or rush
    - Respect Quiet Mode
    - No hearts, no follower changes, no performance stats
    """
    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_user_id_created_at", "user_id", "created_at"),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(SQLEnum(NotificationType), nullable=False)
    
    # Human-readable message (pre-formatted)
    message = Column(Text, nullable=False)
    
    # Related entity IDs (for linking)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=True)
    margin_id = Column(Integer, ForeignKey("margins.id", ondelete="CASCADE"), nullable=True)
    btl_thread_id = Column(Integer, ForeignKey("btl_threads.id", ondelete="CASCADE"), nullable=True)
    btl_invite_id = Column(Integer, ForeignKey("btl_invites.id", ondelete="CASCADE"), nullable=True)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # Who triggered it
    
    # State
    read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="notifications")
    actor = relationship("User", foreign_keys=[actor_id])
    chapter = relationship("Chapter", foreign_keys=[chapter_id])
    margin = relationship("Margin", foreign_keys=[margin_id])
    btl_thread = relationship("BetweenTheLinesThread", foreign_keys=[btl_thread_id])
    btl_invite = relationship("BetweenTheLinesInvite", foreign_keys=[btl_invite_id])
