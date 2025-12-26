"""add themes

Revision ID: 004
Revises: 003
Create Date: 2025-12-24

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime, timezone


# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create themes table
    op.create_table(
        'themes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('slug', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('emoji', sa.String(length=10), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug')
    )
    op.create_index('ix_themes_id', 'themes', ['id'])
    op.create_index('ix_themes_slug', 'themes', ['slug'], unique=True)
    op.create_index('ix_themes_name', 'themes', ['name'])
    
    # Create chapter_themes association table
    op.create_table(
        'chapter_themes',
        sa.Column('chapter_id', sa.Integer(), nullable=False),
        sa.Column('theme_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)),
        sa.ForeignKeyConstraint(['chapter_id'], ['chapters.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['theme_id'], ['themes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('chapter_id', 'theme_id')
    )
    op.create_index('ix_chapter_themes_chapter_id', 'chapter_themes', ['chapter_id'])
    op.create_index('ix_chapter_themes_theme_id', 'chapter_themes', ['theme_id'])
    
    # Seed curated themes
    themes_data = [
        # Core emotional themes
        {'name': 'Grief', 'slug': 'grief', 'emoji': '🌊', 'description': 'Loss, mourning, and the weight of absence'},
        {'name': 'Joy', 'slug': 'joy', 'emoji': '✨', 'description': 'Moments of light, celebration, and wonder'},
        {'name': 'Longing', 'slug': 'longing', 'emoji': '🌙', 'description': 'Desire, yearning, and the ache of distance'},
        {'name': 'Anger', 'slug': 'anger', 'emoji': '🔥', 'description': 'Rage, frustration, and the fire within'},
        {'name': 'Hope', 'slug': 'hope', 'emoji': '🌱', 'description': 'Possibility, resilience, and looking forward'},
        {'name': 'Fear', 'slug': 'fear', 'emoji': '🌑', 'description': 'Anxiety, dread, and facing the unknown'},
        
        # Identity & self
        {'name': 'Identity', 'slug': 'identity', 'emoji': '🪞', 'description': 'Who we are, who we become'},
        {'name': 'Belonging', 'slug': 'belonging', 'emoji': '🏠', 'description': 'Finding your place, or searching for it'},
        {'name': 'Solitude', 'slug': 'solitude', 'emoji': '🕯️', 'description': 'Being alone, chosen or not'},
        {'name': 'Transformation', 'slug': 'transformation', 'emoji': '🦋', 'description': 'Change, growth, becoming'},
        
        # Memory & time
        {'name': 'Memory', 'slug': 'memory', 'emoji': '📸', 'description': 'What we remember, what we forget'},
        {'name': 'Nostalgia', 'slug': 'nostalgia', 'emoji': '🍂', 'description': 'Looking back with longing'},
        {'name': 'Time', 'slug': 'time', 'emoji': '⏳', 'description': 'Passing, waiting, running out'},
        {'name': 'Childhood', 'slug': 'childhood', 'emoji': '🎈', 'description': 'Early years, innocence, growing up'},
        
        # Relationships
        {'name': 'Love', 'slug': 'love', 'emoji': '💫', 'description': 'Connection, devotion, intimacy'},
        {'name': 'Family', 'slug': 'family', 'emoji': '🌳', 'description': 'Blood ties, chosen family, lineage'},
        {'name': 'Friendship', 'slug': 'friendship', 'emoji': '🤝', 'description': 'Bonds beyond romance'},
        {'name': 'Betrayal', 'slug': 'betrayal', 'emoji': '💔', 'description': 'Broken trust, wounds that linger'},
        {'name': 'Forgiveness', 'slug': 'forgiveness', 'emoji': '🕊️', 'description': 'Letting go, making peace'},
        
        # Place & nature
        {'name': 'Home', 'slug': 'home', 'emoji': '🏡', 'description': 'Where we return, where we rest'},
        {'name': 'Journey', 'slug': 'journey', 'emoji': '🧭', 'description': 'Travel, quest, the road itself'},
        {'name': 'Nature', 'slug': 'nature', 'emoji': '🌿', 'description': 'The wild, the earth, the elements'},
        {'name': 'City', 'slug': 'city', 'emoji': '🌆', 'description': 'Urban life, crowds, concrete'},
        {'name': 'Seasons', 'slug': 'seasons', 'emoji': '🍃', 'description': 'Cycles, change, weather'},
        
        # Existential
        {'name': 'Death', 'slug': 'death', 'emoji': '🥀', 'description': 'Mortality, endings, what comes after'},
        {'name': 'Faith', 'slug': 'faith', 'emoji': '🙏', 'description': 'Belief, spirituality, the sacred'},
        {'name': 'Doubt', 'slug': 'doubt', 'emoji': '❓', 'description': 'Uncertainty, questioning, not knowing'},
        {'name': 'Purpose', 'slug': 'purpose', 'emoji': '🎯', 'description': 'Meaning, calling, why we are here'},
        {'name': 'Freedom', 'slug': 'freedom', 'emoji': '🦅', 'description': 'Liberation, choice, breaking free'},
        
        # Creative & artistic
        {'name': 'Art', 'slug': 'art', 'emoji': '🎨', 'description': 'Creation, expression, beauty'},
        {'name': 'Music', 'slug': 'music', 'emoji': '🎵', 'description': 'Sound, rhythm, melody'},
        {'name': 'Words', 'slug': 'words', 'emoji': '✍️', 'description': 'Language, writing, what we say'},
        {'name': 'Silence', 'slug': 'silence', 'emoji': '🤫', 'description': 'Quiet, the unsaid, stillness'},
        
        # Social & cultural
        {'name': 'Justice', 'slug': 'justice', 'emoji': '⚖️', 'description': 'Fairness, rights, standing up'},
        {'name': 'Power', 'slug': 'power', 'emoji': '👑', 'description': 'Control, influence, who has it'},
        {'name': 'Resistance', 'slug': 'resistance', 'emoji': '✊', 'description': 'Fighting back, refusing, rebellion'},
        {'name': 'Community', 'slug': 'community', 'emoji': '🌍', 'description': 'Collective, together, we'},
        
        # Abstract & poetic
        {'name': 'Dreams', 'slug': 'dreams', 'emoji': '💭', 'description': 'Sleep visions, aspirations, the surreal'},
        {'name': 'Shadows', 'slug': 'shadows', 'emoji': '🌓', 'description': 'Darkness, what lurks, the hidden'},
        {'name': 'Light', 'slug': 'light', 'emoji': '💡', 'description': 'Illumination, clarity, dawn'},
        {'name': 'Mystery', 'slug': 'mystery', 'emoji': '🔮', 'description': 'The unknown, secrets, enigma'},
    ]
    
    # Insert themes
    op.bulk_insert(
        sa.table('themes',
            sa.column('name', sa.String),
            sa.column('slug', sa.String),
            sa.column('emoji', sa.String),
            sa.column('description', sa.Text),
            sa.column('created_at', sa.DateTime)
        ),
        [
            {
                'name': theme['name'],
                'slug': theme['slug'],
                'emoji': theme['emoji'],
                'description': theme['description'],
                'created_at': datetime.now(timezone.utc)
            }
            for theme in themes_data
        ]
    )


def downgrade() -> None:
    op.drop_index('ix_chapter_themes_theme_id', 'chapter_themes')
    op.drop_index('ix_chapter_themes_chapter_id', 'chapter_themes')
    op.drop_table('chapter_themes')
    
    op.drop_index('ix_themes_name', 'themes')
    op.drop_index('ix_themes_slug', 'themes')
    op.drop_index('ix_themes_id', 'themes')
    op.drop_table('themes')
