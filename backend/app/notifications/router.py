"""Notification routes - Rare, human, meaningful"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.models import User, Notification, NotificationType
from app.auth.security import get_current_user
from app.notifications.schemas import NotificationResponse, UnreadCountResponse
from app.services.notification_service import mark_as_read, mark_all_as_read, get_unread_count

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
async def get_notifications(
    type: NotificationType = None,
    unread_only: bool = False,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's notifications.
    
    Notifications are:
    - Rare (only meaningful events)
    - Human (contextual, not demanding)
    - Respectful (no guilt, no rush)
    """
    query = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).options(
        joinedload(Notification.actor),
        joinedload(Notification.chapter)
    )
    
    if type:
        query = query.filter(Notification.type == type)
    
    if unread_only:
        query = query.filter(Notification.read == False)
    
    notifications = query.order_by(
        Notification.created_at.desc()
    ).limit(limit).all()
    
    return [
        NotificationResponse(
            id=n.id,
            type=n.type,
            message=n.message,
            read=n.read,
            created_at=n.created_at,
            chapter_id=n.chapter_id,
            chapter_title=n.chapter.title if n.chapter else None,
            margin_id=n.margin_id,
            btl_thread_id=n.btl_thread_id,
            btl_invite_id=n.btl_invite_id,
            actor_id=n.actor_id,
            actor_username=n.actor.username if n.actor else None
        )
        for n in notifications
    ]


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_notifications_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications"""
    count = get_unread_count(db, current_user.id)
    return UnreadCountResponse(count=count)


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read"""
    success = mark_as_read(db, notification_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}


@router.post("/mark-all-read")
async def mark_all_notifications_read(
    type: NotificationType = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read (optionally filtered by type)"""
    mark_all_as_read(db, current_user.id, type)
    return {"message": "All notifications marked as read"}


@router.post("/quiet-mode")
async def toggle_quiet_mode(
    enabled: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Toggle Quiet Mode.
    
    When Quiet Mode is on:
    - No push notifications
    - No Muse nudges
    - App becomes read/write only
    
    Copy: "Quiet Mode is on. Nothing will interrupt you."
    """
    current_user.quiet_mode = enabled
    db.commit()
    
    return {
        "quiet_mode": enabled,
        "message": "Quiet Mode is on. Nothing will interrupt you." if enabled else "Quiet Mode is off."
    }


@router.get("/quiet-mode")
async def get_quiet_mode(
    current_user: User = Depends(get_current_user)
):
    """Get current Quiet Mode status"""
    return {
        "quiet_mode": current_user.quiet_mode,
        "message": "Quiet Mode is on. Nothing will interrupt you." if current_user.quiet_mode else "Quiet Mode is off."
    }
