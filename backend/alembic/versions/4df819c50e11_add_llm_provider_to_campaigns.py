"""add llm_provider and llm_model to campaigns

Revision ID: 4df819c50e11
Revises: 3ce719b48f02
Create Date: 2026-11-07 11:25:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4df819c50e11'
down_revision: Union[str, None] = '3ce719b48f02'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('campaigns', sa.Column('llm_provider', sa.String(length=50), nullable=True))
    op.add_column('campaigns', sa.Column('llm_model', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('campaigns', 'llm_model')
    op.drop_column('campaigns', 'llm_provider')

