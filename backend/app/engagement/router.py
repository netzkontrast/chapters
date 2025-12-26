"""Engagement routes - Hearts, Follows, Bookmarks"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.database import get_db
from app.models import User, Chapter, Heart, Follow, Bookmark, Book
from app.auth.security import get_current_user
from app.engagement.schemas import HeartResponse, FollowResponse, BookmarkResponse

router = APIRouter(prefix="/engagement", tags=["Engagement"])


# ============================================================================
# HEARTS
# ============================================================================

@router.post("/chapters/{chapter_id}/heart", response_model=HeartResponse, status_code=status.HTTP_201_CREATED)
async def heart_chapter(
    chapter_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Heart a chapter (toggle on)"""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # Check if already hearted
    existing = db.query(Heart).filter(
        Heart.user_id == current_user.id,
        Heart.chapter_id == chapter_id
    ).first()
    
    if existing:
        return existing
    
    # Create heart
    heart = Heart(
        user_id=current_user.id,
        chapter_id=chapter_id
    )
    db.add(heart)
    
    # Increment heart count
    chapter.heart_count += 1
    
    db.commit()
    db.refresh(heart)
    
    # Award XP for hearting
    from app.services.muse_progression import award_xp
    award_xp(db, current_user, 'bookmark')  # Using bookmark XP (3 points)
    
    # Update taste profile in background
    from app.muse.embeddings import update_taste_profile
    background_tasks.add_task(update_taste_profile, current_user, chapter, 'heart', db)
    
    return heart


@router.delete("/chapters/{chapter_id}/heart", status_code=status.HTTP_204_NO_CONTENT)
async def unheart_chapter(
    chapter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove heart from a chapter (toggle off)"""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    heart = db.query(Heart).filter(
        Heart.user_id == current_user.id,
        Heart.chapter_id == chapter_id
    ).first()
    
    if not heart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Heart not found"
        )
    
    db.delete(heart)
    
    # Decrement heart count
    if chapter.heart_count > 0:
        chapter.heart_count -= 1
    
    db.commit()
    return None


# ============================================================================
# FOLLOWS
# ============================================================================

@router.post("/books/{book_id}/follow", response_model=FollowResponse, status_code=status.HTTP_201_CREATED)
async def follow_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Follow a book"""
    book = db.query(Book).filter(Book.id == book_id).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Prevent self-follow
    if book.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow your own book"
        )
    
    # Check if already following
    existing = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == book.user_id
    ).first()
    
    if existing:
        return existing
    
    # Create follow
    follow = Follow(
        follower_id=current_user.id,
        followed_id=book.user_id
    )
    db.add(follow)
    db.commit()
    db.refresh(follow)
    return follow


@router.delete("/books/{book_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unfollow a book"""
    book = db.query(Book).filter(Book.id == book_id).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.followed_id == book.user_id
    ).first()
    
    if not follow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Follow not found"
        )
    
    db.delete(follow)
    db.commit()
    return None


@router.get("/books/{book_id}/followers", response_model=List[FollowResponse])
async def get_followers(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get followers of a book"""
    book = db.query(Book).filter(Book.id == book_id).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    followers = db.query(Follow).filter(
        Follow.followed_id == book.user_id
    ).all()
    
    return followers


@router.get("/books/{book_id}/following", response_model=List[FollowResponse])
async def get_following(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get books that this book's author is following"""
    book = db.query(Book).filter(Book.id == book_id).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    following = db.query(Follow).filter(
        Follow.follower_id == book.user_id
    ).all()
    
    return following


# ============================================================================
# BOOKMARKS
# ============================================================================

@router.post("/chapters/{chapter_id}/bookmark", response_model=BookmarkResponse, status_code=status.HTTP_201_CREATED)
async def bookmark_chapter(
    chapter_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bookmark a chapter (can bookmark from unfollowed books)"""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # Check if already bookmarked
    existing = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.chapter_id == chapter_id
    ).first()
    
    if existing:
        return existing
    
    # Create bookmark
    bookmark = Bookmark(
        user_id=current_user.id,
        chapter_id=chapter_id
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    
    # Update taste profile in background
    from app.muse.embeddings import update_taste_profile
    background_tasks.add_task(update_taste_profile, current_user, chapter, 'bookmark', db)
    
    return bookmark


@router.delete("/bookmarks/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(
    bookmark_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a bookmark"""
    bookmark = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
    
    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found"
        )
    
    if bookmark.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own bookmarks"
        )
    
    db.delete(bookmark)
    db.commit()
    return None


@router.get("/bookmarks", response_model=List[BookmarkResponse])
async def list_bookmarks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's bookmarks in chronological order"""
    bookmarks = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id
    ).order_by(Bookmark.created_at.desc()).all()
    
    return bookmarks


# ============================================================================
# SHELF
# ============================================================================

@router.post("/books/{book_id}/shelf", status_code=status.HTTP_201_CREATED)
async def add_to_shelf(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a Book to your Shelf (curated collection)"""
    from app.models.shelf import Shelf
    
    # Get the book
    book = db.query(Book).filter(Book.id == book_id).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Can't add own book to shelf
    if book.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add your own Book to your Shelf"
        )
    
    # Check if already on shelf
    existing = db.query(Shelf).filter(
        Shelf.user_id == current_user.id,
        Shelf.book_owner_id == book.user_id
    ).first()
    
    if existing:
        return {"message": "Book already on your Shelf", "shelf_id": existing.id}
    
    # Create shelf entry
    shelf_item = Shelf(
        user_id=current_user.id,
        book_owner_id=book.user_id
    )
    db.add(shelf_item)
    db.commit()
    db.refresh(shelf_item)
    
    # Create notification for book owner
    from app.services.notification_service import notify_shelf_add
    notify_shelf_add(db, book.user_id, current_user.id)
    
    return {"message": "Book added to your Shelf", "shelf_id": shelf_item.id}


@router.delete("/books/{book_id}/shelf", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_shelf(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a Book from your Shelf"""
    from app.models.shelf import Shelf
    
    # Get the book
    book = db.query(Book).filter(Book.id == book_id).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Find shelf entry
    shelf_item = db.query(Shelf).filter(
        Shelf.user_id == current_user.id,
        Shelf.book_owner_id == book.user_id
    ).first()
    
    if not shelf_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not on your Shelf"
        )
    
    db.delete(shelf_item)
    db.commit()
    return None


@router.get("/shelf")
async def get_shelf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's Shelf (curated Book collection)"""
    from app.models.shelf import Shelf
    
    shelf_items = db.query(Shelf).filter(
        Shelf.user_id == current_user.id
    ).order_by(Shelf.created_at.desc()).all()
    
    # Get Book details for each shelf item
    books = []
    for item in shelf_items:
        book = db.query(Book).filter(Book.user_id == item.book_owner_id).first()
        if book:
            owner = db.query(User).filter(User.id == book.user_id).first()
            books.append({
                "id": book.id,
                "user_id": book.user_id,
                "username": owner.username if owner else "Unknown",
                "display_name": book.display_name,
                "bio": book.bio,
                "cover_image_url": book.cover_image_url,
                "added_at": item.created_at.isoformat()
            })
    
    return books


@router.get("/books/{book_id}/shelf/status")
async def check_shelf_status(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if a Book is on user's Shelf"""
    from app.models.shelf import Shelf
    
    book = db.query(Book).filter(Book.id == book_id).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    shelf_item = db.query(Shelf).filter(
        Shelf.user_id == current_user.id,
        Shelf.book_owner_id == book.user_id
    ).first()
    
    return {"on_shelf": shelf_item is not None}
