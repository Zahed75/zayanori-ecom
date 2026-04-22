"""
Cart routes — server-side cart for authenticated users
"""
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.api import deps

router = APIRouter()

FREE_SHIPPING_THRESHOLD = Decimal("50.00")
SHIPPING_COST = Decimal("4.99")


def _cart_response(items: list, db: Session) -> schemas.CartResponse:
    subtotal = sum(i.product.price * i.quantity for i in items)
    shipping = Decimal("0.00") if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_COST
    return schemas.CartResponse(
        items=items,
        subtotal=subtotal,
        shipping=shipping,
        total=subtotal + shipping,
        item_count=sum(i.quantity for i in items),
    )


@router.get("", response_model=schemas.DataResponse[schemas.CartResponse])
def get_cart(
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    items = db.query(models.CartItem).options(
        joinedload(models.CartItem.product).joinedload(models.Product.category)
    ).filter(models.CartItem.user_id == current.id).all()
    return {
        "success": True,
        "message": "Cart fetched successfully",
        "data": _cart_response(items, db)
    }


@router.post("", response_model=schemas.DataResponse[schemas.CartResponse], status_code=201)
def add_to_cart(
    body: schemas.CartAddRequest,
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    product = db.query(models.Product).filter(
        models.Product.id == body.product_id,
        models.Product.is_active == True,
    ).first()
    if not product:
        raise HTTPException(404, "Product not found")
    if product.stock_count < body.quantity:
        raise HTTPException(400, f"Only {product.stock_count} in stock")

    existing = db.query(models.CartItem).filter(
        models.CartItem.user_id == current.id,
        models.CartItem.product_id == body.product_id,
    ).first()

    if existing:
        new_qty = min(existing.quantity + body.quantity, product.stock_count)
        existing.quantity = new_qty
    else:
        item = models.CartItem(
            user_id=current.id,
            product_id=body.product_id,
            quantity=min(body.quantity, product.stock_count),
        )
        db.add(item)

    db.commit()

    items = db.query(models.CartItem).options(
        joinedload(models.CartItem.product).joinedload(models.Product.category)
    ).filter(models.CartItem.user_id == current.id).all()
    return {
        "success": True,
        "message": "Item added to cart",
        "data": _cart_response(items, db)
    }


@router.put("/{item_id}", response_model=schemas.DataResponse[schemas.CartResponse])
def update_cart_item(
    item_id: int,
    body: schemas.CartUpdateRequest,
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current.id,
    ).first()
    if not item:
        raise HTTPException(404, "Cart item not found")

    if body.quantity <= 0:
        db.delete(item)
    else:
        item.quantity = min(body.quantity, item.product.stock_count)

    db.commit()

    items = db.query(models.CartItem).options(
        joinedload(models.CartItem.product).joinedload(models.Product.category)
    ).filter(models.CartItem.user_id == current.id).all()
    return {
        "success": True,
        "message": "Cart updated successfully",
        "data": _cart_response(items, db)
    }


@router.delete("/{item_id}", response_model=schemas.DataResponse[schemas.CartResponse])
def remove_cart_item(
    item_id: int,
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current.id,
    ).first()
    if not item:
        raise HTTPException(404, "Cart item not found")
    db.delete(item)
    db.commit()

    items = db.query(models.CartItem).options(
        joinedload(models.CartItem.product).joinedload(models.Product.category)
    ).filter(models.CartItem.user_id == current.id).all()
    return {
        "success": True,
        "message": "Item removed from cart",
        "data": _cart_response(items, db)
    }


@router.delete("", response_model=schemas.MessageResponse)
def clear_cart(
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    db.query(models.CartItem).filter(models.CartItem.user_id == current.id).delete()
    db.commit()
    return {"message": "Cart cleared", "success": True}
