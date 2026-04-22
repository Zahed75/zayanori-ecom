import math
import os
import uuid
from typing import Optional

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.api import deps
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


# ─────────────────────────────────────────────────────────────
# Products — public
# ─────────────────────────────────────────────────────────────

@router.get("", response_model=schemas.DataResponse[schemas.ProductListResponse])
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    new_arrival: Optional[bool] = None,
    best_seller: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: str = Query("newest", pattern="^(newest|price_asc|price_desc|rating)$"),
    db: Session = Depends(deps.get_db),
):
    q = db.query(models.Product).options(joinedload(models.Product.category)).filter(
        models.Product.is_active == True
    )

    if search:
        q = q.filter(or_(
            models.Product.name.ilike(f"%{search}%"),
            models.Product.description.ilike(f"%{search}%"),
        ))
    if category:
        q = q.join(models.Category).filter(models.Category.slug == category)
    if featured is not None:
        q = q.filter(models.Product.is_featured == featured)
    if new_arrival is not None:
        q = q.filter(models.Product.is_new_arrival == new_arrival)
    if best_seller is not None:
        q = q.filter(models.Product.is_best_seller == best_seller)
    if min_price is not None:
        q = q.filter(models.Product.price >= min_price)
    if max_price is not None:
        q = q.filter(models.Product.price <= max_price)

    sort_map = {
        "newest":     models.Product.created_at.desc(),
        "price_asc":  models.Product.price.asc(),
        "price_desc": models.Product.price.desc(),
        "rating":     models.Product.rating.desc(),
    }
    q = q.order_by(sort_map.get(sort, models.Product.created_at.desc()))

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "success": True,
        "message": "Products fetched successfully",
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": math.ceil(total / page_size) if total else 1,
        }
    }


@router.get("/{product_id}", response_model=schemas.DataResponse[schemas.ProductOut])
def get_product(product_id: int, db: Session = Depends(deps.get_db)):
    p = db.query(models.Product).options(joinedload(models.Product.category)).filter(
        models.Product.id == product_id,
        models.Product.is_active == True,
    ).first()
    if not p:
        raise HTTPException(404, "Product not found")
    return {
        "success": True,
        "message": "Product fetched successfully",
        "data": p
    }


@router.get("/slug/{slug}", response_model=schemas.DataResponse[schemas.ProductOut])
def get_product_by_slug(slug: str, db: Session = Depends(deps.get_db)):
    p = db.query(models.Product).options(joinedload(models.Product.category)).filter(
        models.Product.slug == slug,
        models.Product.is_active == True,
    ).first()
    if not p:
        raise HTTPException(404, "Product not found")
    return {
        "success": True,
        "message": "Product fetched successfully",
        "data": p
    }


@router.get("/{product_id}/reviews", response_model=schemas.DataResponse[list[schemas.ReviewOut]])
def get_reviews(product_id: int, db: Session = Depends(deps.get_db)):
    reviews = db.query(models.Review).options(joinedload(models.Review.user)).filter(
        models.Review.product_id == product_id,
        models.Review.is_approved == True,
    ).order_by(models.Review.created_at.desc()).all()
    return {
        "success": True,
        "message": "Reviews fetched successfully",
        "data": reviews
    }


@router.post("/{product_id}/reviews", response_model=schemas.DataResponse[schemas.ReviewOut], status_code=201)
def create_review(
    product_id: int,
    body: schemas.ReviewCreate,
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    existing = db.query(models.Review).filter(
        models.Review.user_id == current.id,
        models.Review.product_id == product_id,
    ).first()
    if existing:
        raise HTTPException(400, "You have already reviewed this product")
    review = models.Review(user_id=current.id, product_id=product_id, **body.model_dump())
    db.add(review)

    # Update product rating
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product:
        all_ratings = db.query(func.avg(models.Review.rating)).filter(
            models.Review.product_id == product_id
        ).scalar() or 0
        product.rating = round(all_ratings, 2)
        product.review_count = db.query(func.count(models.Review.id)).filter(
            models.Review.product_id == product_id
        ).scalar()

    db.commit()
    db.refresh(review)
    return {
        "success": True,
        "message": "Review submitted successfully",
        "data": review
    }


# ─────────────────────────────────────────────────────────────
# Products — admin CRUD
# ─────────────────────────────────────────────────────────────

@router.post("", response_model=schemas.DataResponse[schemas.ProductOut], status_code=201)
def create_product(
    body: schemas.ProductCreate,
    db: Session = Depends(deps.get_db),
    _: models.User = Depends(deps.get_admin_user),
):
    if db.query(models.Product).filter(models.Product.slug == body.slug).first():
        raise HTTPException(400, "Slug already exists")
    product = models.Product(**body.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return {
        "success": True,
        "message": "Product created successfully",
        "data": product
    }


@router.put("/{product_id}", response_model=schemas.DataResponse[schemas.ProductOut])
def update_product(
    product_id: int,
    body: schemas.ProductUpdate,
    db: Session = Depends(deps.get_db),
    _: models.User = Depends(deps.get_admin_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return {
        "success": True,
        "message": "Product updated successfully",
        "data": product
    }


@router.delete("/{product_id}", response_model=schemas.MessageResponse)
def delete_product(
    product_id: int,
    db: Session = Depends(deps.get_db),
    _: models.User = Depends(deps.get_admin_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product deactivated", "success": True}


@router.post("/{product_id}/image", response_model=schemas.DataResponse[schemas.ProductOut])
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    _: models.User = Depends(deps.get_admin_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")

    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image files are allowed")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(400, f"File too large (max {settings.MAX_UPLOAD_SIZE // 1024 // 1024} MB)")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    filename = f"product_{product_id}_{uuid.uuid4().hex[:8]}.{ext}"
    upload_path = os.path.join(settings.UPLOAD_DIR, filename)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    async with aiofiles.open(upload_path, "wb") as f:
        await f.write(content)

    product.image_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(product)
    return {
        "success": True,
        "message": "Image uploaded successfully",
        "data": product
    }
