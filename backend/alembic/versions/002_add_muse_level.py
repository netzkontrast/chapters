"""Add muse level to users

Revision ID: 002
Revises: 001
Create Date: 2025-12-24

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add muse_level column to users table
    op.add_column('users', sa.Column('muse_level', sa.String(), nullable=False, server_default='spark'))
    op.add_column('users', sa.Column('muse_xp', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('users', 'muse_xp')
    op.drop_column('users', 'muse_level')
