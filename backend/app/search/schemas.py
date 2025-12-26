"""Search schemas"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ThemeResponse(BaseModel):
    """Theme response"""
    id: int
    name: str
    slug: str
    description: Optional[str]
    emoji: Optional[str]
    chapter_count: int = 0
    
    class Config:
        from_attributes = True


class ChapterSearchResult(BaseModel):
    """Chapter in search results"""
    id: int
    title: Optional[str]
    mood: Optional[str]
    cover_url: Optional[str]
    heart_count: int
    published_at: datetime
    author_id: int
    author_username: str
    author_book_id: int
    excerpt: Optional[str] = None  # Text snippet for context
    themes: List[str] = []  # Theme names
    
    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    """Search results"""
    query: str
    chapters: List[ChapterSearchResult]
    total: int
    page: int
    per_page: int
    has_more: bool


class ThemeChaptersResponse(BaseModel):
    """Chapters for a theme"""
    theme: ThemeResponse
    chapters: List[ChapterSearchResult]
    page: int
    per_page: int
    has_more: bool
