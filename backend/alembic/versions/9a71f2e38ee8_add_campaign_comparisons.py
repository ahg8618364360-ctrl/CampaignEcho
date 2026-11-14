"""add_campaign_comparisons

Revision ID: 9a71f2e38ee8
Revises: 4df819c50e11
Create Date: 2026-11-07 23:35:58.397854

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a71f2e38ee8'
down_revision: Union[str, Sequence[str], None] = '4df819c50e11'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create campaign_comparisons table."""
    op.create_table(
        'campaign_comparisons',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('brand_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('campaign_brief', sa.JSON(), nullable=False),
        sa.Column('baseline_strategy', sa.JSON(), nullable=False),
        sa.Column('memory_strategy', sa.JSON(), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('model', sa.String(length=100), nullable=False),
        sa.Column('generation_parameters', sa.JSON(), nullable=False),
        sa.Column('prompt_version', sa.String(length=50), server_default='v1.0', nullable=False),
        sa.Column('baseline_status', sa.String(length=30), server_default='COMPLETED', nullable=False),
        sa.Column('memory_status', sa.String(length=30), server_default='COMPLETED', nullable=False),
        sa.Column('retrieved_memory_references', sa.JSON(), nullable=True),
        sa.Column('reflection_metadata', sa.JSON(), nullable=True),
        sa.Column('comparison_summary', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['brand_id'], ['brands.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_campaign_comparisons_brand_id'), 'campaign_comparisons', ['brand_id'], unique=False)


def downgrade() -> None:
    """Drop campaign_comparisons table."""
    op.drop_index(op.f('ix_campaign_comparisons_brand_id'), table_name='campaign_comparisons')
    op.drop_table('campaign_comparisons')
