"""memory_verification_runs

Revision ID: 3ce719b48f02
Revises: 2bd62cd33c50
Create Date: 2026-11-06 20:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3ce719b48f02'
down_revision: Union[str, Sequence[str], None] = '2bd62cd33c50'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add verification_run_id and is_live to memory_logs
    op.add_column('memory_logs', sa.Column('verification_run_id', sa.String(length=64), nullable=True))
    op.add_column('memory_logs', sa.Column('is_live', sa.Boolean(), server_default=sa.true(), nullable=False))
    op.create_index(op.f('ix_memory_logs_verification_run_id'), 'memory_logs', ['verification_run_id'], unique=False)

    # 2. Create memory_verification_runs table
    op.create_table(
        'memory_verification_runs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('verification_run_id', sa.String(length=64), nullable=False),
        sa.Column('brand_id', sa.String(length=36), nullable=False),
        sa.Column('retain_success', sa.Boolean(), nullable=False, default=False),
        sa.Column('recall_success', sa.Boolean(), nullable=False, default=False),
        sa.Column('reflect_success', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_live', sa.Boolean(), nullable=False, default=True),
        sa.Column('status', sa.String(length=30), nullable=False, default='IN_PROGRESS'),
        sa.Column('verified_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['brand_id'], ['brands.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_memory_verification_runs_verification_run_id'), 'memory_verification_runs', ['verification_run_id'], unique=True)
    op.create_index(op.f('ix_memory_verification_runs_brand_id'), 'memory_verification_runs', ['brand_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_memory_verification_runs_brand_id'), table_name='memory_verification_runs')
    op.drop_index(op.f('ix_memory_verification_runs_verification_run_id'), table_name='memory_verification_runs')
    op.drop_table('memory_verification_runs')
    op.drop_index(op.f('ix_memory_logs_verification_run_id'), table_name='memory_logs')
    op.drop_column('memory_logs', 'is_live')
    op.drop_column('memory_logs', 'verification_run_id')
