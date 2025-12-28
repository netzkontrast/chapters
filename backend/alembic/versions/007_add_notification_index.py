"""add notification composite index

Revision ID: 007
Revises: 006
Create Date: 2025-12-28

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create composite index for efficient fetching of sorted notifications
    op.create_index(
        'ix_notifications_user_id_created_at',
        'notifications',
        ['user_id', 'created_at'],
        unique=False
    )


def downgrade() -> None:
    op.drop_index('ix_notifications_user_id_created_at', table_name='notifications')
