"""Test Chapter Permissions with Mocking"""
import sys
import os
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from datetime import datetime, timezone

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from app.main import app
from app.database import get_db
from app.auth.security import get_current_user
from app.models import User, Book, Follow, Chapter, ChapterBlock, Heart, Bookmark

client = TestClient(app)

# Test Data
AUTHOR_ID = 100
FOLLOWER_ID = 200
STRANGER_ID = 300
CHAPTER_ID = 500

@pytest.fixture
def mock_db():
    return MagicMock()

@pytest.fixture
def mock_current_user():
    user = MagicMock(spec=User)
    user.id = STRANGER_ID # Default to stranger
    return user

@pytest.fixture
def mock_chapter():
    chapter = MagicMock(spec=Chapter)
    chapter.id = CHAPTER_ID
    chapter.author_id = AUTHOR_ID
    chapter.title = "Test Chapter"
    chapter.cover_url = None
    chapter.mood = "test"
    chapter.theme = "test"
    chapter.time_period = "now"
    chapter.heart_count = 0
    chapter.published_at = datetime.now(timezone.utc)
    chapter.edit_window_expires = datetime.now(timezone.utc)
    chapter.blocks = []

    chapter.author.username = "author"
    chapter.author.id = AUTHOR_ID

    return chapter

@pytest.fixture
def setup_overrides(mock_db, mock_current_user):
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_current_user] = lambda: mock_current_user
    yield
    app.dependency_overrides = {}

def test_access_own_private_chapter(mock_db, mock_current_user, mock_chapter, setup_overrides):
    """Test that author can access their own private chapter"""
    mock_current_user.id = AUTHOR_ID

    # Mock Book Query
    mock_book = MagicMock(spec=Book)
    mock_book.user_id = AUTHOR_ID
    mock_book.is_private = True

    # Define query side effects
    def query_side_effect(model):
        query = MagicMock()
        if model == Chapter:
            # Return chapter if ID matches
            query.filter.return_value.first.return_value = mock_chapter
        elif model == Book:
            query.filter.return_value.first.return_value = mock_book
        elif model == Heart:
             query.filter.return_value.first.return_value = None
        elif model == Bookmark:
             query.filter.return_value.first.return_value = None
        else:
            query.filter.return_value.first.return_value = None
        return query

    mock_db.query.side_effect = query_side_effect

    response = client.get(f"/chapters/{CHAPTER_ID}")

    assert response.status_code == 200
    assert response.json()["id"] == CHAPTER_ID

def test_access_private_chapter_as_follower(mock_db, mock_current_user, mock_chapter, setup_overrides):
    """Test that follower can access private chapter"""
    mock_current_user.id = FOLLOWER_ID

    # Mock Book (Private)
    mock_book = MagicMock(spec=Book)
    mock_book.user_id = AUTHOR_ID
    mock_book.is_private = True

    # Mock Follow (Exists)
    mock_follow = MagicMock(spec=Follow)

    def query_side_effect(model):
        query = MagicMock()
        if model == Chapter:
            query.filter.return_value.first.return_value = mock_chapter
        elif model == Book:
            query.filter.return_value.first.return_value = mock_book
        elif model == Follow:
            query.filter.return_value.first.return_value = mock_follow # Follow exists
        elif model == Heart:
             query.filter.return_value.first.return_value = None
        elif model == Bookmark:
             query.filter.return_value.first.return_value = None
        return query

    mock_db.query.side_effect = query_side_effect

    response = client.get(f"/chapters/{CHAPTER_ID}")

    assert response.status_code == 200

def test_access_private_chapter_as_stranger(mock_db, mock_current_user, mock_chapter, setup_overrides):
    """Test that stranger cannot access private chapter"""
    mock_current_user.id = STRANGER_ID

    # Mock Book (Private)
    mock_book = MagicMock(spec=Book)
    mock_book.user_id = AUTHOR_ID
    mock_book.is_private = True

    def query_side_effect(model):
        query = MagicMock()
        if model == Chapter:
            query.filter.return_value.first.return_value = mock_chapter
        elif model == Book:
            query.filter.return_value.first.return_value = mock_book
        elif model == Follow:
            # Ensure follow query returns nothing
            query.filter.return_value.first.return_value = None
        elif model == Heart:
             query.filter.return_value.first.return_value = None
        elif model == Bookmark:
             query.filter.return_value.first.return_value = None
        return query

    mock_db.query.side_effect = query_side_effect

    response = client.get(f"/chapters/{CHAPTER_ID}")

    # Expect 403 Forbidden
    assert response.status_code == 403, f"Expected 403, got {response.status_code}"
