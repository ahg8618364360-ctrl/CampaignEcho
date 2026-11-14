"""CampaignEcho — Brand & Business Workspace Endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.db.session import get_db
from backend.app.db.models import Brand, User
from backend.app.schemas.brand import BrandCreate, BrandUpdate, BrandResponse
from backend.app.core.exceptions import ResourceNotFoundException
from backend.app.core.security import get_current_user, get_current_user_optional

router = APIRouter(prefix="/brands", tags=["Brands"])


@router.post("", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
def create_brand(
    payload: BrandCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new business profile / brand workspace (authentication required).
    
    Workspaces created by users are strictly non-synthetic, owned by the user,
    and provisioned with an isolated server-derived Hindsight bank identifier.
    """
    brand = Brand(
        name=payload.name.strip(),
        industry=payload.industry.strip(),
        description=payload.description.strip(),
        target_audience=payload.target_audience.strip(),
        market_region=payload.market_region.strip(),
        brand_voice=payload.brand_voice.strip(),
        preferred_language=payload.preferred_language,
        restrictions=payload.restrictions,
        is_synthetic=False,  # Clients cannot set synthetic benchmark status
        user_id=current_user.id,
        website=payload.website,
        instagram_handle=payload.instagram_handle,
        products_or_services=payload.products_or_services,
        unique_selling_points=payload.unique_selling_points,
        price_range=payload.price_range,
        key_offers=payload.key_offers,
        competitors=payload.competitors,
    )
    db.add(brand)
    db.flush()
    # Server-derived bank identifier; never exposed in public client responses
    brand.hindsight_bank_id = f"campaignecho-brand-{brand.id}"
    db.commit()
    db.refresh(brand)
    return brand


@router.get("", response_model=List[BrandResponse])
def list_brands(
    include_archived: bool = False,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """List business workspaces accessible to the caller.
    
    If authenticated: returns own business workspaces + synthetic benchmark demo brands.
    If unauthenticated: returns only synthetic benchmark demo brands.
    """
    query = db.query(Brand)
    if not include_archived:
        query = query.filter(Brand.is_archived == False)

    if current_user:
        query = query.filter(
            or_(
                Brand.user_id == current_user.id,
                Brand.is_synthetic == True,
            )
        )
    else:
        query = query.filter(Brand.is_synthetic == True)

    return query.order_by(Brand.is_synthetic.desc(), Brand.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Retrieve brand profile by ID with strict tenant boundary enforcement."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise ResourceNotFoundException("Brand", brand_id)

    # Tenant boundary enforcement: user can only see own brand or public synthetic demo
    if current_user:
        if brand.user_id != current_user.id and not brand.is_synthetic:
            raise ResourceNotFoundException("Brand", brand_id)
    else:
        if not brand.is_synthetic:
            raise ResourceNotFoundException("Brand", brand_id)

    return brand


@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(
    brand_id: str,
    payload: BrandUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update business workspace metadata (owner only; benchmark brands are immutable)."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise ResourceNotFoundException("Brand", brand_id)

    if brand.is_synthetic:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Benchmark demo brand profiles are immutable and cannot be modified.",
        )

    if brand.user_id != current_user.id:
        raise ResourceNotFoundException("Brand", brand_id)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(brand, field, value)

    db.commit()
    db.refresh(brand)
    return brand


@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_brand(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Archive a business workspace (owner only; benchmark brands are immutable)."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise ResourceNotFoundException("Brand", brand_id)

    if brand.is_synthetic:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Benchmark demo brand profiles are immutable and cannot be deleted.",
        )

    if brand.user_id != current_user.id:
        raise ResourceNotFoundException("Brand", brand_id)

    brand.is_archived = True
    db.commit()
    return None
