from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db.models import Brand
from backend.app.schemas.brand import BrandCreate, BrandResponse
from backend.app.core.exceptions import ResourceNotFoundException

router = APIRouter(prefix="/brands", tags=["Brands"])


@router.post("", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
def create_brand(payload: BrandCreate, db: Session = Depends(get_db)):
    """Create a new brand profile."""
    brand = Brand(
        name=payload.name,
        industry=payload.industry,
        description=payload.description,
        target_audience=payload.target_audience,
        market_region=payload.market_region,
        brand_voice=payload.brand_voice,
        preferred_language=payload.preferred_language,
        restrictions=payload.restrictions,
        is_synthetic=payload.is_synthetic,
    )
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@router.get("", response_model=List[BrandResponse])
def list_brands(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List all registered brand profiles."""
    return db.query(Brand).offset(skip).limit(limit).all()


@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(brand_id: str, db: Session = Depends(get_db)):
    """Retrieve brand profile by ID."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise ResourceNotFoundException("Brand", brand_id)
    return brand
