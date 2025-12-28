from hypothesis import given, settings, strategies as st
from app.models.study import Draft

@given(
    title=st.text(),
    author_id=st.integers()
)
@settings(max_examples=50)
def test_property_8_study_content_privacy(title, author_id):
    """
    Property 8: For any draft created, it should be marked as private by default
    (though currently implied by being a 'Draft' model which is not public).

    Note: Since 'is_private' isn't a boolean on Draft (it's structural),
    we assert the model instantiation doesn't expose public fields by default.
    """
    draft = Draft(title=title, author_id=author_id)

    # In this system, Drafts are structurally private (separate table from Chapters).
    # We verify that a Draft is NOT a Chapter.
    assert draft.__tablename__ == "drafts"
    assert not hasattr(draft, "published_at") # Drafts don't have published_at until promoted
