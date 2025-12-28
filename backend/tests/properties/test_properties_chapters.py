from hypothesis import given, settings, strategies as st
import pytest
from unittest.mock import MagicMock
from app.services.open_pages import consume_open_page
from app.models.chapter import BlockType
from tests.properties.conftest import user_strategy, chapter_data_strategy
from fastapi import HTTPException

# --- Property 1: Open Page Consumption ---
@given(initial_pages=st.integers(min_value=1, max_value=3))
@settings(max_examples=50)
def test_property_1_open_page_consumption(initial_pages):
    """
    Property 1: For any user with N Open Pages (where N > 0), publishing a chapter
    should result in exactly N-1 Open Pages remaining.
    """
    # Mock user object
    class MockUser:
        def __init__(self, pages):
            self.open_pages = pages
            self.id = 1

    user = MockUser(initial_pages)

    # Mock DB session
    mock_db = MagicMock()

    # Action: Consume open page
    consume_open_page(user, mock_db)

    # Assert
    assert user.open_pages == initial_pages - 1
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once_with(user)

@given(initial_pages=st.integers(max_value=0))
@settings(max_examples=20)
def test_property_6_publishing_without_open_pages(initial_pages):
    """
    Property 6: For any user with <= 0 Open Pages, attempting to publish
    should fail (raise an exception).
    """
    class MockUser:
        def __init__(self, pages):
            self.open_pages = pages
            self.id = 1

    user = MockUser(initial_pages)
    mock_db = MagicMock()

    with pytest.raises(HTTPException) as excinfo:
        consume_open_page(user, mock_db)

    assert excinfo.value.status_code == 400
    assert "No Open Pages available" in excinfo.value.detail

# --- Property 3: Chapter Block Constraints ---
# Note: Since the validation logic is inside `create_chapter` endpoint logic rather than a standalone service function,
# we will extract a mock validation function that mirrors the logic in `backend/app/chapters/router.py` to test the property.
# In a real refactor, this logic should be moved to `backend/app/chapters/service.py`.

def validate_blocks(blocks):
    total_blocks = len(blocks)
    if total_blocks > 12:
        raise ValueError("Too many blocks")

    media_count = 0
    for block in blocks:
        if block["block_type"] in [BlockType.IMAGE, BlockType.AUDIO, BlockType.VIDEO]:
            media_count += 1

    if media_count > 2:
        raise ValueError("Too many media blocks")

@given(chapter_data=chapter_data_strategy())
@settings(max_examples=100)
def test_property_3_chapter_block_constraints(chapter_data):
    """
    Property 3: The system should reject chapters with >12 total blocks
    OR >2 media blocks.
    """
    blocks = chapter_data["blocks"]

    # Calculate expected validity
    total_blocks = len(blocks)
    media_blocks = sum(1 for b in blocks if b["block_type"] in [BlockType.IMAGE, BlockType.AUDIO, BlockType.VIDEO])

    should_be_valid = (total_blocks <= 12) and (media_blocks <= 2)

    if should_be_valid:
        # Should not raise
        validate_blocks(blocks)
    else:
        # Should raise ValueError
        with pytest.raises(ValueError):
            validate_blocks(blocks)
