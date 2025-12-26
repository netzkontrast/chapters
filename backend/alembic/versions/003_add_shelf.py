"""Add shelf table

Revision ID: 003
Revises: 002
Create Date: 2025-12-24

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create shelves table
    op.create_table(
        'shelves',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('book_owner_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['book_owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('user_id != book_owner_id', name='no_self_shelf')
    )
    op.create_index(op.f('ix_shelves_id'), 'shelves', ['id'])
    op.create_index(op.f('ix_shelves_user_id'), 'shelves', ['user_id'])
    op.create_unique_constraint('uq_shelf_user_book', 'shelves', ['user_id', 'book_owner_id'])


def downgrade() -> None:
    op.drop_table('shelves')
