"""
Wishlist routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.api import deps

router = APIRouter()


@router.get("", response_model=schemas.DataResponse[list[schemas.WishlistItemOut]])
def get_wishlist(
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    items = db.query(models.WishlistItem).options(
        joinedload(models.WishlistItem.product).joinedload(models.Product.category)
    ).filter(models.WishlistItem.user_id == current.id).all()
    return {
        "success": True,
        "message": "Wishlist fetched successfully",
        "data": items
    }


@router.post("/toggle", response_model=schemas.MessageResponse)
def toggle_wishlist(
    body: schemas.WishlistToggleRequest,
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    product = db.query(models.Product).filter(
        models.Product.id == body.product_id,
        models.Product.is_active == True,
    ).first()
    if not product:
        raise HTTPException(404, "Product not found")

    existing = db.query(models.WishlistItem).filter(
        models.WishlistItem.user_id == current.id,
        models.WishlistItem.product_id == body.product_id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Removed from wishlist", "success": True}
    else:
        item = models.WishlistItem(user_id=current.id, product_id=body.product_id)
        db.add(item)
        db.commit()
        return {"message": "Added to wishlist", "success": True}


@router.delete("/{item_id}", response_model=schemas.MessageResponse)
def remove_wishlist_item(
    item_id: int,
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    item = db.query(models.WishlistItem).filter(
        models.WishlistItem.id == item_id,
        models.WishlistItem.user_id == current.id,
    ).first()
    if not item:
        raise HTTPException(404, "Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist", "success": True}
