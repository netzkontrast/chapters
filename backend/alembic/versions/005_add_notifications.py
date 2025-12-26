"""add notifications

Revision ID: 005
Revises: 004
Create Date: 2025-12-24

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime, timezone


# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add quiet_mode to users table
    op.add_column('users', sa.Column('quiet_mode', sa.Boolean(), nullable=False, server_default='false'))
    
    # Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.Enum('margin', 'shelf_add', 'btl_reply', 'btl_invite', 'bookmark', name='notificationtype'), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('chapter_id', sa.Integer(), nullable=True),
        sa.Column('margin_id', sa.Integer(), nullable=True),
        sa.Column('btl_thread_id', sa.Integer(), nullable=True),
        sa.Column('btl_invite_id', sa.Integer(), nullable=True),
        sa.Column('actor_id', sa.Integer(), nullable=True),
        sa.Column('read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['chapter_id'], ['chapters.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['margin_id'], ['margins.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['btl_thread_id'], ['btl_threads.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['btl_invite_id'], ['btl_invites.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='CASCADE'),
    )
    
    # Create indexes
    op.create_index('ix_notifications_id', 'notifications', ['id'])
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_read', 'notifications', ['read'])


def downgrade() -> None:
    op.drop_index('ix_notifications_read', 'notifications')
    op.drop_index('ix_notifications_user_id', 'notifications')
    op.drop_index('ix_notifications_id', 'notifications')
    op.drop_table('notifications')
    op.drop_column('users', 'quiet_mode')
    
    # Drop enum type
    op.execute('DROP TYPE notificationtype')
