"""Shelf model - Curated Book collection"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, ForeignKey, DateTime, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Shelf(Base):
    """
    Shelf - User's curated collection of Books
    
    Higher commitment than follow - Books you want to keep close
    """
    __tablename__ = "shelves"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    book_owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="shelf_items")
    book_owner = relationship("User", foreign_keys=[book_owner_id])
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'book_owner_id', name='uq_shelf_user_book'),
        CheckConstraint('user_id != book_owner_id', name='no_self_shelf'),
    )
    
    def __repr__(self):
        return f"<Shelf(user_id={self.user_id}, book_owner_id={self.book_owner_id})>"
