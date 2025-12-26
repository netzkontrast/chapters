"""
Professional database seeding script for Chapters.

Creates realistic demo data including:
- Users with diverse profiles
- Published chapters with rich content
- Drafts and notes
- Engagement (follows, hearts, bookmarks)
- Comments (margins)

Run with: poetry run python scripts/seed_database.py
Or in Docker: docker exec chapters-backend python scripts/seed_database.py
"""

import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User
from app.models.chapter import Chapter
from app.models.study import Draft, Note
from app.models.engagement import Follow, Heart, Bookmark
from app.models.margin import Margin
from app.auth.security import get_password_hash


# Sample data for realistic content
USERS = [
    {
        "username": "maya_writes",
        "email": "maya@example.com",
        "display_name": "Maya Chen",
        "bio": "Writer, poet, and coffee enthusiast. Exploring the quiet moments between words.",
    },
    {
        "username": "alex_creates",
        "email": "alex@example.com",
        "display_name": "Alex Rivera",
        "bio": "Visual storyteller. Finding beauty in the mundane.",
    },
    {
        "username": "sam_reflects",
        "email": "sam@example.com",
        "display_name": "Sam Taylor",
        "bio": "Philosopher at heart. Writing about life, love, and everything in between.",
    },
    {
        "username": "jordan_dreams",
        "email": "jordan@example.com",
        "display_name": "Jordan Lee",
        "bio": "Dreamer and doer. Sharing fragments of thought and feeling.",
    },
    {
        "username": "riley_wanders",
        "email": "riley@example.com",
        "display_name": "Riley Morgan",
        "bio": "Wanderer with a notebook. Collecting stories from the road.",
    },
    {
        "username": "casey_observes",
        "email": "casey@example.com",
        "display_name": "Casey Park",
        "bio": "Quiet observer. Writing what I see, feel, and wonder about.",
    },
    {
        "username": "avery_muses",
        "email": "avery@example.com",
        "display_name": "Avery Stone",
        "bio": "Musing on the human condition, one chapter at a time.",
    },
    {
        "username": "morgan_ponders",
        "email": "morgan@example.com",
        "display_name": "Morgan Blake",
        "bio": "Pondering life's big questions through small stories.",
    },
    {
        "username": "quinn_captures",
        "email": "quinn@example.com",
        "display_name": "Quinn Rivers",
        "bio": "Capturing fleeting moments before they disappear.",
    },
    {
        "username": "sage_whispers",
        "email": "sage@example.com",
        "display_name": "Sage Winter",
        "bio": "Whispering truths into the void, hoping someone hears.",
    },
    {
        "username": "rowan_explores",
        "email": "rowan@example.com",
        "display_name": "Rowan Fields",
        "bio": "Exploring inner landscapes through words and wonder.",
    },
    {
        "username": "phoenix_rises",
        "email": "phoenix@example.com",
        "display_name": "Phoenix Dawn",
        "bio": "Rising from the ashes, again and again. Writing about resilience.",
    },
    {
        "username": "luna_dreams",
        "email": "luna@example.com",
        "display_name": "Luna Night",
        "bio": "Dreaming in words, waking in stories.",
    },
    {
        "username": "river_flows",
        "email": "river@example.com",
        "display_name": "River Song",
        "bio": "Flowing through life, collecting stories along the way.",
    },
    {
        "username": "echo_listens",
        "email": "echo@example.com",
        "display_name": "Echo Vale",
        "bio": "Listening to the echoes of what was and what could be.",
    },
    {
        "username": "iris_paints",
        "email": "iris@example.com",
        "display_name": "Iris Bloom",
        "bio": "Painting with words, one brushstroke at a time.",
    },
    {
        "username": "jasper_wonders",
        "email": "jasper@example.com",
        "display_name": "Jasper Stone",
        "bio": "Wondering about the universe and our place in it.",
    },
    {
        "username": "willow_sways",
        "email": "willow@example.com",
        "display_name": "Willow Grace",
        "bio": "Swaying with the winds of change, rooted in truth.",
    },
    {
        "username": "atlas_carries",
        "email": "atlas@example.com",
        "display_name": "Atlas Strong",
        "bio": "Carrying stories of strength and vulnerability.",
    },
    {
        "username": "nova_shines",
        "email": "nova@example.com",
        "display_name": "Nova Star",
        "bio": "Shining light on the darkness within and without.",
    },
    {
        "username": "cedar_stands",
        "email": "cedar@example.com",
        "display_name": "Cedar Woods",
        "bio": "Standing tall through storms, writing about resilience.",
    },
    {
        "username": "ember_glows",
        "email": "ember@example.com",
        "display_name": "Ember Flame",
        "bio": "Glowing softly in the darkness, keeping hope alive.",
    },
    {
        "username": "ocean_depths",
        "email": "ocean@example.com",
        "display_name": "Ocean Blue",
        "bio": "Diving deep into emotions, surfacing with stories.",
    },
    {
        "username": "sky_soars",
        "email": "sky@example.com",
        "display_name": "Sky High",
        "bio": "Soaring above limitations, writing about freedom.",
    },
    {
        "username": "meadow_blooms",
        "email": "meadow@example.com",
        "display_name": "Meadow Green",
        "bio": "Blooming where I'm planted, sharing growth stories.",
    },
]

CHAPTER_TITLES = [
    "Morning Light Through Kitchen Windows",
    "The Weight of Unspoken Words",
    "Coffee Shops and Quiet Conversations",
    "Letters I'll Never Send",
    "The Art of Letting Go",
    "Midnight Thoughts on Paper",
    "Finding Home in Strange Places",
    "The Space Between Breaths",
    "Autumn Leaves and Old Memories",
    "Dancing in Empty Rooms",
    "The Sound of Rain on Glass",
    "Conversations with Myself",
    "The Color of Longing",
    "Small Moments, Big Feelings",
    "The Poetry of Ordinary Days",
    "Silence Speaks Louder",
    "Fragments of Yesterday",
    "The Comfort of Solitude",
    "When Words Fail",
    "Echoes in Empty Hallways",
    "The Taste of Nostalgia",
    "Unfinished Sentences",
    "The Weight of Waiting",
    "Soft Edges and Sharp Corners",
    "Between Sleep and Waking",
]

CHAPTER_CONTENTS = [
    "There's something sacred about morning light. The way it filters through kitchen windows, catching dust motes in its beam, turning the ordinary into something worth noticing.\n\nI've been thinking about how we rush through these moments, always chasing the next thing, the next achievement, the next milestone. But what if the point is right here? In the warmth of a coffee cup, the quiet before the world wakes up, the gentle start of a new day.\n\nMaybe that's what I'm learning: to be present. To notice. To appreciate the small, beautiful things that make up a life.",
    
    "Some words sit heavy on your tongue, too afraid to be spoken. They gather there, building weight, until you're not sure if you're protecting someone else or just yourself.\n\nI've carried these words for months now. They're simple, really. Just three syllables that could change everything or nothing at all. But the fear of knowing which one keeps them locked away.\n\nTonight, I'm writing them down instead. Maybe that's enough. Maybe some truths are meant to live on paper, not in the air between us.",
    
    "Coffee shops are my favorite kind of church. The ritual of ordering, finding a corner table, opening a notebook. The ambient noise that somehow makes it easier to think.\n\nI come here to write, but mostly I come here to watch. The couple by the window, having the same argument they've had a hundred times. The student with headphones, drowning in textbooks. The old man who comes every Tuesday at 3pm, always orders black coffee, always sits alone.\n\nWe're all here together, separately. Finding solace in shared solitude.",
    
    "Dear You,\n\nI'm writing this knowing you'll never read it. Maybe that's what makes it easier to be honest.\n\nI want to tell you about the way your laugh sounds like home. How I notice when you're tired, even when you try to hide it. The small things you do that you think no one sees—I see them all.\n\nBut I also want to tell you that I'm learning to be okay with the distance between us. That some feelings are meant to be felt, not acted upon. That loving someone doesn't always mean being with them.\n\nI hope you're happy. I really do.\n\nAlways,\nMe",
    
    "Letting go is not a single moment. It's a thousand small releases, spread across days and weeks and months.\n\nIt's deleting their number, then memorizing it anyway. It's boxing up their things, then keeping one shirt that still smells like them. It's saying you're over it, then crying in the shower where no one can hear.\n\nBut slowly, imperceptibly, the grip loosens. The memories lose their sharp edges. You wake up one day and realize you didn't think about them first thing in the morning.\n\nThat's when you know: you're not there yet, but you're getting closer.",
    
    "Silence has a texture. It's not empty—it's full of all the things we're not saying.\n\nI've been sitting with silence lately. Learning its contours, its weight, its meaning. Sometimes it's comfortable, like an old sweater. Sometimes it's suffocating, like a room with no windows.\n\nBut always, always, it's saying something. We just have to learn how to listen.",
    
    "Memory is a strange curator. It keeps the oddest things: the smell of rain on hot pavement, the sound of your grandmother's laugh, the exact shade of blue the sky was on a random Tuesday in July.\n\nBut it discards the important stuff. Faces blur. Voices fade. Entire years compress into a single feeling.\n\nI'm trying to hold onto the details while I still can. Writing them down, as if that will make them permanent. As if words can stop time.",
    
    "Solitude is not the same as loneliness. One is chosen, the other imposed. One is peaceful, the other painful.\n\nI've been learning to love solitude. To see it not as absence but as presence—my own presence, fully felt. No performance, no pretense, no need to be anything other than what I am.\n\nIn solitude, I find myself. In loneliness, I lose myself. The difference is everything.",
]

DRAFT_TITLES = [
    "Untitled Thoughts",
    "Work in Progress",
    "Half-Formed Ideas",
    "Notes to Self",
    "Maybe Someday",
]

NOTE_CONTENTS = [
    "Remember: vulnerability is not weakness. It's the most honest thing we can offer.",
    "Idea: Write about the difference between loneliness and solitude.",
    "Quote to explore: 'We read to know we're not alone.' - C.S. Lewis",
    "Observation: The way people hold their coffee cups says a lot about them.",
    "Reminder: Not every thought needs to be a chapter. Some are just for me.",
]

MARGIN_COMMENTS = [
    "This resonates so deeply. Thank you for sharing.",
    "Beautiful. I felt this in my bones.",
    "Your words always find me when I need them most.",
    "This is exactly what I needed to read today.",
    "The way you capture these moments is incredible.",
    "I've been feeling this too. Thank you for putting it into words.",
    "This made me cry (in the best way).",
    "Saving this to read again and again.",
    "Your perspective on this is so refreshing.",
    "I keep coming back to this line.",
    "This chapter speaks to my soul.",
    "Thank you for being vulnerable and honest.",
    "Your writing has such a calming effect.",
    "I needed to hear this today. Perfect timing.",
    "The imagery here is stunning.",
    "This captures something I've never been able to express.",
    "Your voice is so unique and authentic.",
    "I'm bookmarking this for hard days.",
    "This is poetry in prose form.",
    "You have a gift for finding beauty in the ordinary.",
]


def create_users(db: Session) -> list[User]:
    """Create demo users."""
    print("Creating users...")
    users = []
    
    for user_data in USERS:
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            password_hash=get_password_hash("password123"),  # Demo password
            open_pages=3,
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    print(f"✓ Created {len(users)} users")
    return users


def create_chapters(db: Session, users: list[User]) -> list[Chapter]:
    """Create published chapters."""
    print("Creating chapters...")
    chapters = []
    
    # Import ChapterBlock and BlockType here
    from app.models.chapter import ChapterBlock, BlockType
    
    # Each user publishes 4-8 chapters (increased from 3-6)
    for user in users:
        num_chapters = random.randint(4, 8)
        
        for i in range(num_chapters):
            # Random publish date in the last 90 days (increased from 60)
            days_ago = random.randint(1, 90)
            published_at = datetime.utcnow() - timedelta(days=days_ago)
            edit_window_expires = published_at + timedelta(hours=24)
            
            chapter = Chapter(
                author_id=user.id,
                title=random.choice(CHAPTER_TITLES),
                published_at=published_at,
                edit_window_expires=edit_window_expires,
            )
            db.add(chapter)
            db.flush()  # Get the chapter ID
            
            # Add a text block with content
            block = ChapterBlock(
                chapter_id=chapter.id,
                position=0,
                block_type=BlockType.TEXT,
                content={"text": random.choice(CHAPTER_CONTENTS)}
            )
            db.add(block)
            
            chapters.append(chapter)
    
    db.commit()
    print(f"✓ Created {len(chapters)} chapters")
    return chapters


def create_drafts(db: Session, users: list[User]):
    """Create drafts for users."""
    print("Creating drafts...")
    draft_count = 0
    
    for user in users:
        # Each user has 1-3 drafts
        num_drafts = random.randint(1, 3)
        
        for i in range(num_drafts):
            draft = Draft(
                author_id=user.id,
                title=random.choice(DRAFT_TITLES) if random.random() > 0.3 else None,
            )
            db.add(draft)
            draft_count += 1
    
    db.commit()
    print(f"✓ Created {draft_count} drafts")


def create_notes(db: Session, users: list[User]):
    """Create notes for users."""
    print("Creating notes...")
    note_count = 0
    
    for user in users:
        # Each user has 2-5 notes
        num_notes = random.randint(2, 5)
        
        for i in range(num_notes):
            note = Note(
                author_id=user.id,
                title=f"Note {i+1}",
                content=random.choice(NOTE_CONTENTS),
                tags=random.sample(["ideas", "quotes", "observations", "reminders", "inspiration"], k=random.randint(1, 3)),
            )
            db.add(note)
            note_count += 1
    
    db.commit()
    print(f"✓ Created {note_count} notes")


def create_follows(db: Session, users: list[User]):
    """Create follow relationships."""
    print("Creating follows...")
    follow_count = 0
    
    for user in users:
        # Each user follows 3-8 other users (increased from 2-4)
        other_users = [u for u in users if u.id != user.id]
        num_follows = min(random.randint(3, 8), len(other_users))
        followed_users = random.sample(other_users, num_follows)
        
        for followed in followed_users:
            follow = Follow(
                follower_id=user.id,
                followed_id=followed.id,
            )
            db.add(follow)
            follow_count += 1
    
    db.commit()
    print(f"✓ Created {follow_count} follows")


def create_hearts(db: Session, users: list[User], chapters: list[Chapter]):
    """Create hearts on chapters."""
    print("Creating hearts...")
    heart_count = 0
    
    for chapter in chapters:
        # Each chapter gets 1-6 hearts from random users (increased from 0-3)
        other_users = [u for u in users if u.id != chapter.author_id]
        num_hearts = random.randint(1, min(6, len(other_users)))
        hearting_users = random.sample(other_users, num_hearts)
        
        for user in hearting_users:
            heart = Heart(
                user_id=user.id,
                chapter_id=chapter.id,
            )
            db.add(heart)
            heart_count += 1
            # Update heart count on chapter
            chapter.heart_count += 1
    
    db.commit()
    print(f"✓ Created {heart_count} hearts")


def create_bookmarks(db: Session, users: list[User], chapters: list[Chapter]):
    """Create bookmarks."""
    print("Creating bookmarks...")
    bookmark_count = 0
    
    for user in users:
        # Each user bookmarks 2-5 chapters (increased from 1-3)
        other_chapters = [c for c in chapters if c.author_id != user.id]
        num_bookmarks = min(random.randint(2, 5), len(other_chapters))
        bookmarked_chapters = random.sample(other_chapters, num_bookmarks)
        
        for chapter in bookmarked_chapters:
            bookmark = Bookmark(
                user_id=user.id,
                chapter_id=chapter.id,
            )
            db.add(bookmark)
            bookmark_count += 1
    
    db.commit()
    print(f"✓ Created {bookmark_count} bookmarks")


def create_margins(db: Session, users: list[User], chapters: list[Chapter]):
    """Create margin comments."""
    print("Creating margins...")
    margin_count = 0
    
    for chapter in chapters:
        # Each chapter gets 1-5 comments (increased from 0-3)
        other_users = [u for u in users if u.id != chapter.author_id]
        num_comments = random.randint(1, min(5, len(other_users)))
        commenting_users = random.sample(other_users, num_comments)
        
        for user in commenting_users:
            margin = Margin(
                author_id=user.id,
                chapter_id=chapter.id,
                content=random.choice(MARGIN_COMMENTS),
            )
            db.add(margin)
            margin_count += 1
    
    db.commit()
    print(f"✓ Created {margin_count} margins")


def create_shelf_additions(db: Session, users: list[User]):
    """Create Shelf additions (curated book collections)."""
    print("Creating Shelf additions...")
    from app.models.shelf import Shelf
    
    shelf_count = 0
    
    for user in users:
        # Each user adds 2-5 Books to their Shelf
        other_users = [u for u in users if u.id != user.id]
        num_shelf_adds = min(random.randint(2, 5), len(other_users))
        shelf_books = random.sample(other_users, num_shelf_adds)
        
        for book_owner in shelf_books:
            shelf = Shelf(
                user_id=user.id,
                book_owner_id=book_owner.id,
            )
            db.add(shelf)
            shelf_count += 1
    
    db.commit()
    print(f"✓ Created {shelf_count} Shelf additions")


def create_btl_connections(db: Session, users: list[User]):
    """Create Between the Lines connections."""
    print("Creating BTL connections...")
    from app.models.btl import (
        BetweenTheLinesThread, 
        BetweenTheLinesInvite, 
        BetweenTheLinesMessage,
        BTLThreadStatus,
        BTLInviteStatus
    )
    
    thread_count = 0
    invite_count = 0
    message_count = 0
    
    # Create 5-8 active threads between random users (increased from 3-5)
    num_threads = random.randint(5, 8)
    
    for _ in range(num_threads):
        # Pick two random users
        user1, user2 = random.sample(users, 2)
        
        # Create accepted invite
        invite = BetweenTheLinesInvite(
            sender_id=user1.id,
            recipient_id=user2.id,
            note="I really resonated with your recent chapter. Would love to connect.",
            quoted_line=random.choice([
                "The way you capture silence is beautiful.",
                "Your words found me at the right time.",
                "I've been feeling this too.",
                "This line has been living in my head.",
                "Your perspective opened my eyes.",
                "I see myself in your writing.",
            ]),
            status=BTLInviteStatus.ACCEPTED,
        )
        db.add(invite)
        db.flush()
        invite_count += 1
        
        # Create thread
        thread = BetweenTheLinesThread(
            participant1_id=user1.id,
            participant2_id=user2.id,
            status=BTLThreadStatus.OPEN,
        )
        db.add(thread)
        db.flush()
        thread_count += 1
        
        # Link invite to thread
        invite.thread_id = thread.id
        
        # Add 3-8 messages to the thread (increased from 2-5)
        num_messages = random.randint(3, 8)
        for i in range(num_messages):
            sender = user1 if i % 2 == 0 else user2
            message = BetweenTheLinesMessage(
                thread_id=thread.id,
                sender_id=sender.id,
                content=random.choice([
                    "Thank you for reaching out. Your writing speaks to me too.",
                    "I've been thinking about what you said in your last chapter.",
                    "It's rare to find someone who understands this feeling.",
                    "Your perspective on solitude really resonated with me.",
                    "I'm glad we connected. This conversation means a lot.",
                    "Your words have been a comfort during difficult times.",
                    "I love how you see the world through such a unique lens.",
                    "This exchange has been so meaningful to me.",
                    "Your honesty is refreshing and inspiring.",
                    "I feel like I've found a kindred spirit.",
                ]),
            )
            db.add(message)
            message_count += 1
    
    # Create 3-5 pending invites (increased from 2-3)
    num_pending = random.randint(3, 5)
    for _ in range(num_pending):
        sender, recipient = random.sample(users, 2)
        invite = BetweenTheLinesInvite(
            sender_id=sender.id,
            recipient_id=recipient.id,
            note="Your recent chapter moved me. I'd love to talk more.",
            quoted_line="This line stayed with me.",
            status=BTLInviteStatus.PENDING,
        )
        db.add(invite)
        invite_count += 1
    
    db.commit()
    print(f"✓ Created {thread_count} BTL threads, {invite_count} invites, {message_count} messages")


def seed_database():
    """Main seeding function."""
    print("\n" + "="*50)
    print("🌱 Seeding Chapters Database")
    print("="*50 + "\n")
    
    db = SessionLocal()
    
    try:
        # Create all data
        users = create_users(db)
        chapters = create_chapters(db, users)
        create_drafts(db, users)
        create_notes(db, users)
        create_follows(db, users)
        create_hearts(db, users, chapters)
        create_bookmarks(db, users, chapters)
        create_margins(db, users, chapters)
        create_shelf_additions(db, users)
        create_btl_connections(db, users)
        
        print("\n" + "="*50)
        print("✅ Database seeded successfully!")
        print("="*50)
        print("\nDemo accounts (all use password: password123):")
        for user_data in USERS:
            print(f"  • {user_data['username']} ({user_data['display_name']})")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
