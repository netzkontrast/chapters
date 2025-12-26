"""Search routes - Chapters and Themes"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_
from typing import List, Optional

from app.database import get_db
from app.models import User, Chapter, Theme, Book, chapter_themes
from app.auth.security import get_current_user
from app.search.schemas import (
    ThemeResponse,
    ChapterSearchResult,
    SearchResponse,
    ThemeChaptersResponse
)

router = APIRouter(prefix="/search", tags=["Search"])


# ============================================================================
# THEMES
# ============================================================================

@router.get("/themes", response_model=List[ThemeResponse])
async def list_themes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all curated themes with chapter counts.
    
    Themes are curated, not user-generated. They represent universal
    human experiences and emotions, not trending topics.
    """
    # Get themes with chapter counts
    themes = db.query(
        Theme,
        func.count(chapter_themes.c.chapter_id).label('chapter_count')
    ).outerjoin(
        chapter_themes, Theme.id == chapter_themes.c.theme_id
    ).group_by(Theme.id).order_by(Theme.name).all()
    
    return [
        ThemeResponse(
            id=theme.id,
            name=theme.name,
            slug=theme.slug,
            description=theme.description,
            emoji=theme.emoji,
            chapter_count=count
        )
        for theme, count in themes
    ]


@router.get("/themes/{slug}", response_model=ThemeChaptersResponse)
async def get_theme_chapters(
    slug: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get chapters for a theme.
    
    Shows "chapters where people lingered" - no metrics, no trending.
    Ordered by recency to show living, breathing work.
    """
    # Get theme
    theme = db.query(Theme).filter(Theme.slug == slug).first()
    
    if not theme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Theme not found"
        )
    
    # Get chapters with this theme
    query = db.query(Chapter).join(
        chapter_themes, Chapter.id == chapter_themes.c.chapter_id
    ).filter(
        chapter_themes.c.theme_id == theme.id
    ).options(
        joinedload(Chapter.author).joinedload(User.book),
        joinedload(Chapter.themes)
    ).order_by(Chapter.published_at.desc())
    
    # Pagination
    total = query.count()
    chapters = query.offset((page - 1) * per_page).limit(per_page).all()
    
    # Format results
    chapter_results = []
    for chapter in chapters:
        # Get first text block for excerpt
        excerpt = None
        for block in chapter.blocks:
            if block.block_type == 'text' and block.content.get('text'):
                text = block.content['text']
                excerpt = text[:200] + '...' if len(text) > 200 else text
                break
        
        chapter_results.append(ChapterSearchResult(
            id=chapter.id,
            title=chapter.title,
            mood=chapter.mood,
            cover_url=chapter.cover_url,
            heart_count=chapter.heart_count,
            published_at=chapter.published_at,
            author_id=chapter.author_id,
            author_username=chapter.author.username,
            author_book_id=chapter.author.book.id if chapter.author.book else 0,
            excerpt=excerpt,
            themes=[t.name for t in chapter.themes]
        ))
    
    return ThemeChaptersResponse(
        theme=ThemeResponse(
            id=theme.id,
            name=theme.name,
            slug=theme.slug,
            description=theme.description,
            emoji=theme.emoji,
            chapter_count=total
        ),
        chapters=chapter_results,
        page=page,
        per_page=per_page,
        has_more=total > page * per_page
    )


# ============================================================================
# SEARCH
# ============================================================================

@router.get("", response_model=SearchResponse)
async def search_chapters(
    q: str = Query(..., min_length=2, max_length=100),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search for chapters by title, mood, or content.
    
    Philosophy: "People don't search for people. They search for ideas,
    moods, and themes." Results show chapters first, not profiles.
    
    No popularity sorting - just relevance and recency.
    """
    search_term = f"%{q.lower()}%"
    
    # Search in:
    # 1. Chapter titles
    # 2. Chapter moods
    # 3. Chapter block content (text blocks only)
    # 4. Theme names
    
    query = db.query(Chapter).distinct().outerjoin(
        chapter_themes, Chapter.id == chapter_themes.c.chapter_id
    ).outerjoin(
        Theme, chapter_themes.c.theme_id == Theme.id
    ).filter(
        or_(
            func.lower(Chapter.title).like(search_term),
            func.lower(Chapter.mood).like(search_term),
            func.lower(Theme.name).like(search_term)
        )
    ).options(
        joinedload(Chapter.author).joinedload(User.book),
        joinedload(Chapter.themes),
        joinedload(Chapter.blocks)
    ).order_by(Chapter.published_at.desc())
    
    # Pagination
    total = query.count()
    chapters = query.offset((page - 1) * per_page).limit(per_page).all()
    
    # Format results
    chapter_results = []
    for chapter in chapters:
        # Get first text block for excerpt
        excerpt = None
        for block in chapter.blocks:
            if block.block_type == 'text' and block.content.get('text'):
                text = block.content['text']
                # Try to find search term in text for context
                text_lower = text.lower()
                if q.lower() in text_lower:
                    # Find position and extract context
                    pos = text_lower.find(q.lower())
                    start = max(0, pos - 100)
                    end = min(len(text), pos + 100)
                    excerpt = ('...' if start > 0 else '') + text[start:end] + ('...' if end < len(text) else '')
                else:
                    excerpt = text[:200] + '...' if len(text) > 200 else text
                break
        
        chapter_results.append(ChapterSearchResult(
            id=chapter.id,
            title=chapter.title,
            mood=chapter.mood,
            cover_url=chapter.cover_url,
            heart_count=chapter.heart_count,
            published_at=chapter.published_at,
            author_id=chapter.author_id,
            author_username=chapter.author.username,
            author_book_id=chapter.author.book.id if chapter.author.book else 0,
            excerpt=excerpt,
            themes=[t.name for t in chapter.themes]
        ))
    
    return SearchResponse(
        query=q,
        chapters=chapter_results,
        total=total,
        page=page,
        per_page=per_page,
        has_more=total > page * per_page
    )


# ============================================================================
# MUSE THEME SUGGESTIONS
# ============================================================================

@router.post("/suggest-themes/{chapter_id}")
async def suggest_themes_for_chapter(
    chapter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Muse suggests themes for a chapter (max 3).
    
    This is a placeholder for AI-powered theme suggestion.
    For now, returns empty list - implement with embeddings later.
    """
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id,
        Chapter.author_id == current_user.id
    ).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found or not yours"
        )
    
    # TODO: Implement AI theme suggestion using embeddings
    # For now, return empty suggestions
    return {
        "chapter_id": chapter_id,
        "suggested_themes": [],
        "message": "Theme suggestions coming soon with Muse AI"
    }


@router.post("/chapters/{chapter_id}/themes")
async def add_theme_to_chapter(
    chapter_id: int,
    theme_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a theme to a chapter (max 3 themes per chapter).
    
    Themes are manually selected by the author, never auto-tagged.
    Muse can suggest, but the author always chooses.
    """
    # Get chapter
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id,
        Chapter.author_id == current_user.id
    ).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found or not yours"
        )
    
    # Check theme exists
    theme = db.query(Theme).filter(Theme.id == theme_id).first()
    
    if not theme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Theme not found"
        )
    
    # Check max 3 themes
    current_theme_count = db.query(chapter_themes).filter(
        chapter_themes.c.chapter_id == chapter_id
    ).count()
    
    if current_theme_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 3 themes per chapter"
        )
    
    # Check if already added
    existing = db.query(chapter_themes).filter(
        chapter_themes.c.chapter_id == chapter_id,
        chapter_themes.c.theme_id == theme_id
    ).first()
    
    if existing:
        return {"message": "Theme already added"}
    
    # Add theme
    db.execute(
        chapter_themes.insert().values(
            chapter_id=chapter_id,
            theme_id=theme_id
        )
    )
    db.commit()
    
    return {"message": f"Theme '{theme.name}' added to chapter"}


@router.delete("/chapters/{chapter_id}/themes/{theme_id}")
async def remove_theme_from_chapter(
    chapter_id: int,
    theme_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a theme from a chapter"""
    # Get chapter
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id,
        Chapter.author_id == current_user.id
    ).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found or not yours"
        )
    
    # Remove theme
    result = db.execute(
        chapter_themes.delete().where(
            and_(
                chapter_themes.c.chapter_id == chapter_id,
                chapter_themes.c.theme_id == theme_id
            )
        )
    )
    
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Theme not found on this chapter"
        )
    
    db.commit()
    
    return {"message": "Theme removed from chapter"}
