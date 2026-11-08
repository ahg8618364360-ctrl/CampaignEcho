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

    # Extended business profile metadata
    website: Optional[str] = None
    instagram_handle: Optional[str] = None
    products_or_services: Optional[str] = None
    unique_selling_points: Optional[str] = None
    price_range: Optional[str] = None
    key_offers: Optional[str] = None
    competitors: Optional[str] = None


class BrandUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    target_audience: Optional[str] = None
    market_region: Optional[str] = None
    brand_voice: Optional[str] = None
    preferred_language: Optional[str] = None
    restrictions: Optional[str] = None
    is_archived: Optional[bool] = None
    website: Optional[str] = None
    instagram_handle: Optional[str] = None
    products_or_services: Optional[str] = None
    unique_selling_points: Optional[str] = None
    price_range: Optional[str] = None
    key_offers: Optional[str] = None
    competitors: Optional[str] = None


class BrandResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
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
    is_archived: bool = False
    website: Optional[str] = None
    instagram_handle: Optional[str] = None
    products_or_services: Optional[str] = None
    unique_selling_points: Optional[str] = None
    price_range: Optional[str] = None
    key_offers: Optional[str] = None
    competitors: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
