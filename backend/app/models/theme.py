"""Theme models - Curated themes for discovery"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table, Index
from sqlalchemy.orm import relationship

from app.database import Base

# Association table for chapter-theme many-to-many relationship
chapter_themes = Table(
    'chapter_themes',
    Base.metadata,
    Column('chapter_id', Integer, ForeignKey('chapters.id', ondelete='CASCADE'), primary_key=True),
    Column('theme_id', Integer, ForeignKey('themes.id', ondelete='CASCADE'), primary_key=True),
    Column('created_at', DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False),
    Index('ix_chapter_themes_chapter_id', 'chapter_id'),
    Index('ix_chapter_themes_theme_id', 'theme_id'),
)


class Theme(Base):
    """Curated theme for discovery - NOT hashtags"""
    __tablename__ = "themes"
    __table_args__ = (
        Index("ix_themes_slug", "slug", unique=True),
        Index("ix_themes_name", "name"),
    )

    id = Column(Integer, primary_key=True, index=True)
    
    # Theme identity
    name = Column(String(50), nullable=False, unique=True)  # "Grief", "Joy", "Memory"
    slug = Column(String(50), nullable=False, unique=True)  # "grief", "joy", "memory"
    description = Column(Text, nullable=True)  # Brief description of the theme
    
    # Emoji/icon for visual identity
    emoji = Column(String(10), nullable=True)  # "🌊", "✨", "🕯️"
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    chapters = relationship(
        "Chapter",
        secondary=chapter_themes,
        back_populates="themes",
        lazy="dynamic"
    )
    
    def __repr__(self):
        return f"<Theme(id={self.id}, name='{self.name}', slug='{self.slug}')>"
