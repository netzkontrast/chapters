"""add theme_count to chapters

Revision ID: 006
Revises: 005
Create Date: 2025-12-25

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add theme_count column to chapters table
    op.add_column('chapters', sa.Column('theme_count', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('chapters', 'theme_count')
