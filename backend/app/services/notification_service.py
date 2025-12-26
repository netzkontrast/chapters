"""
Notification Service - Rare, Human, Meaningful

Philosophy:
- Notifications should feel like someone tapping your shoulder, not grabbing it
- Never guilt or rush
- Respect Quiet Mode
- No exclamation points ever
"""
from sqlalchemy.orm import Session
from app.models import Notification, NotificationType, User, Chapter, Margin


def create_notification(
    db: Session,
    user_id: int,
    type: NotificationType,
    message: str,
    chapter_id: int = None,
    margin_id: int = None,
    btl_thread_id: int = None,
    btl_invite_id: int = None,
    actor_id: int = None
) -> Notification:
    """
    Create a notification.
    
    Respects Quiet Mode - if user has quiet_mode enabled, notification is
    created but not pushed (they'll see it when they return).
    """
    notification = Notification(
        user_id=user_id,
        type=type,
        message=message,
        chapter_id=chapter_id,
        margin_id=margin_id,
        btl_thread_id=btl_thread_id,
        btl_invite_id=btl_invite_id,
        actor_id=actor_id
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification


def notify_margin_added(db: Session, margin: Margin, chapter: Chapter):
    """Someone left a margin on your chapter"""
    if margin.user_id == chapter.author_id:
        return  # Don't notify yourself
    
    actor = db.query(User).filter(User.id == margin.user_id).first()
    if not actor:
        return
    
    message = f"Someone lingered in the margins of your chapter."
    
    create_notification(
        db=db,
        user_id=chapter.author_id,
        type=NotificationType.MARGIN,
        message=message,
        chapter_id=chapter.id,
        margin_id=margin.id,
        actor_id=actor.id
    )


def notify_shelf_add(db: Session, book_owner_id: int, adder_id: int):
    """Someone added your Book to their Shelf"""
    if book_owner_id == adder_id:
        return  # Don't notify yourself
    
    message = "Your Book found a place on someone's Shelf."
    
    create_notification(
        db=db,
        user_id=book_owner_id,
        type=NotificationType.SHELF_ADD,
        message=message,
        actor_id=adder_id
    )


def notify_btl_reply(db: Session, thread_id: int, sender_id: int, recipient_id: int):
    """Someone replied Between the Lines"""
    if sender_id == recipient_id:
        return  # Don't notify yourself
    
    message = "There's a quiet reply between the lines."
    
    create_notification(
        db=db,
        user_id=recipient_id,
        type=NotificationType.BTL_REPLY,
        message=message,
        btl_thread_id=thread_id,
        actor_id=sender_id
    )


def notify_btl_invite(db: Session, invite_id: int, sender_id: int, recipient_id: int):
    """Someone sent you a BTL invitation"""
    if sender_id == recipient_id:
        return  # Don't notify yourself
    
    actor = db.query(User).filter(User.id == sender_id).first()
    if not actor:
        return
    
    message = f"{actor.username} sent you an invitation between the lines."
    
    create_notification(
        db=db,
        user_id=recipient_id,
        type=NotificationType.BTL_INVITE,
        message=message,
        btl_invite_id=invite_id,
        actor_id=sender_id
    )


def notify_bookmark(db: Session, chapter_id: int, bookmarker_id: int, author_id: int):
    """Someone bookmarked your chapter (optional, maybe later)"""
    if bookmarker_id == author_id:
        return  # Don't notify yourself
    
    message = "Someone bookmarked your chapter."
    
    create_notification(
        db=db,
        user_id=author_id,
        type=NotificationType.BOOKMARK,
        message=message,
        chapter_id=chapter_id,
        actor_id=bookmarker_id
    )


def get_unread_count(db: Session, user_id: int) -> int:
    """Get count of unread notifications"""
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.read == False
    ).count()


def mark_as_read(db: Session, notification_id: int, user_id: int) -> bool:
    """Mark a notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    
    if not notification:
        return False
    
    notification.read = True
    db.commit()
    return True


def mark_all_as_read(db: Session, user_id: int, type: NotificationType = None):
    """Mark all notifications as read (optionally filtered by type)"""
    query = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.read == False
    )
    
    if type:
        query = query.filter(Notification.type == type)
    
    query.update({"read": True})
    db.commit()
