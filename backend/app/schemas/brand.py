from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class BrandCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    industry: str = Field(..., max_length=100)
    description: str
    target_audience: str
    market_region: str = Field(..., max_length=100)
    brand_voice: str = Field(..., max_length=100)
    preferred_language: str = Field("en", max_length=20)
    restrictions: Optional[str] = None
    is_synthetic: bool = False


class BrandResponse(BaseModel):
    id: str
    name: str
    industry: str
    description: str
    target_audience: str
    market_region: str
    brand_voice: str
    preferred_language: str
    restrictions: Optional[str]
    hindsight_bank_id: Optional[str]
    is_synthetic: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
