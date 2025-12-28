from hypothesis import strategies as st
from app.models.chapter import BlockType

# --- User Strategies ---
def user_strategy():
    return st.fixed_dictionaries({
        "email": st.emails(),
        "username": st.text(min_size=3, max_size=20, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))),
        "password": st.text(min_size=8, max_size=30),
        "open_pages": st.integers(min_value=0, max_value=3)
    })

# --- Chapter Strategies ---

# Strategy for creating individual content blocks
# We generate different JSON structures based on the block type
def text_block_content():
    return st.fixed_dictionaries({
        "text": st.text(min_size=1, max_size=500),
        "formatting": st.sampled_from(["markdown", "plain"])
    })

def media_block_content(media_type):
    strategies = {
        "image": st.fixed_dictionaries({
            "url": st.just("https://example.com/image.jpg"),
            "alt": st.text(max_size=50)
        }),
        "audio": st.fixed_dictionaries({
            "url": st.just("https://example.com/audio.mp3"),
            "duration": st.integers(min_value=1, max_value=600)
        }),
        "video": st.fixed_dictionaries({
            "url": st.just("https://example.com/video.mp4"),
            "duration": st.integers(min_value=1, max_value=600)
        }),
        "quote": st.fixed_dictionaries({
            "text": st.text(min_size=1, max_size=200),
            "source": st.text(max_size=50)
        })
    }
    return strategies.get(media_type, st.none())

# Strategy for a list of blocks
def chapter_blocks_strategy(min_size=1, max_size=15): # Max 15 to test the limit of 12
    return st.lists(
        st.one_of(
            st.tuples(st.just(BlockType.TEXT), text_block_content()),
            st.tuples(st.just(BlockType.IMAGE), media_block_content("image")),
            st.tuples(st.just(BlockType.AUDIO), media_block_content("audio")),
            st.tuples(st.just(BlockType.VIDEO), media_block_content("video")),
             st.tuples(st.just(BlockType.QUOTE), media_block_content("quote"))
        ).map(lambda x: {"block_type": x[0], "content": x[1]}),
        min_size=min_size,
        max_size=max_size
    )

def chapter_data_strategy():
    return st.fixed_dictionaries({
        "title": st.text(min_size=1, max_size=100),
        "mood": st.one_of(st.none(), st.text(max_size=20)),
        "blocks": chapter_blocks_strategy()
    })
