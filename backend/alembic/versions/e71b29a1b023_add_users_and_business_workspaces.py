"""add_users_and_business_workspaces

Revision ID: e71b29a1b023
Revises: 9a71f2e38ee8
Create Date: 2026-11-08 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e71b29a1b023'
down_revision: Union[str, Sequence[str], None] = '9a71f2e38ee8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create users table and extend brands with workspace fields."""
    # 1. Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. Add columns to brands table using batch operations for SQLite compatibility
    with op.batch_alter_table('brands', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.String(length=36), nullable=True))
        batch_op.add_column(sa.Column('is_archived', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('website', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('instagram_handle', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('products_or_services', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('unique_selling_points', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('price_range', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('key_offers', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('competitors', sa.Text(), nullable=True))
        batch_op.create_foreign_key('fk_brands_user_id', 'users', ['user_id'], ['id'], ondelete='CASCADE')
        batch_op.create_index('ix_brands_user_id', ['user_id'], unique=False)


def downgrade() -> None:
    """Revert users table and workspace columns from brands."""
    with op.batch_alter_table('brands', schema=None) as batch_op:
        batch_op.drop_index('ix_brands_user_id')
        batch_op.drop_constraint('fk_brands_user_id', type_='foreignkey')
        batch_op.drop_column('competitors')
        batch_op.drop_column('key_offers')
        batch_op.drop_column('price_range')
        batch_op.drop_column('unique_selling_points')
        batch_op.drop_column('products_or_services')
        batch_op.drop_column('instagram_handle')
        batch_op.drop_column('website')
        batch_op.drop_column('is_archived')
        batch_op.drop_column('user_id')

    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
