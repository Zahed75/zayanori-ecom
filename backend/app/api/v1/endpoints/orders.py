"""
Orders routes: place order from cart, list orders, update status (admin)
"""
from decimal import Decimal
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.api import deps
from app.services.email import send_order_confirmation_email

router = APIRouter()

FREE_SHIPPING_THRESHOLD = Decimal("50.00")
SHIPPING_COST = Decimal("4.99")

COUPONS = {
    "ZAYANORI10": {"discount": 10, "type": "percent", "min": 0},
    "SAVE20":     {"discount": 20, "type": "percent", "min": 50},
    "FLAT15":     {"discount": 15, "type": "fixed",   "min": 30},
    "WELCOME5":   {"discount": 5,  "type": "fixed",   "min": 0},
    "SYSCOMATIC": {"discount": 25, "type": "percent", "min": 100},
}


@router.post("", response_model=schemas.DataResponse[schemas.OrderOut], status_code=201)
async def create_order(
    body: schemas.OrderCreate,
    bg: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    cart_items = db.query(models.CartItem).options(
        joinedload(models.CartItem.product)
    ).filter(models.CartItem.user_id == current.id).all()

    if not cart_items:
        raise HTTPException(400, "Your cart is empty")

    # Validate stock
    for item in cart_items:
        if item.product.stock_count < item.quantity:
            raise HTTPException(400, f"'{item.product.name}' only has {item.product.stock_count} in stock")

    subtotal = sum(i.product.price * i.quantity for i in cart_items)
    shipping = Decimal("0.00") if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_COST

    # Apply coupon
    discount_amount = Decimal("0.00")
    coupon_code = None
    if body.coupon_code:
        c = COUPONS.get(body.coupon_code.upper())
        if c and subtotal >= c["min"]:
            coupon_code = body.coupon_code.upper()
            if c["type"] == "percent":
                discount_amount = subtotal * c["discount"] / 100
            else:
                discount_amount = Decimal(str(c["discount"]))

    total = subtotal - discount_amount + shipping

    order = models.Order(
        user_id=current.id,
        subtotal=subtotal,
        shipping=shipping,
        discount_amount=discount_amount,
        total=total,
        coupon_code=coupon_code,
        shipping_name=body.shipping_name,
        shipping_email=body.shipping_email,
        shipping_phone=body.shipping_phone,
        shipping_address=body.shipping_address,
        shipping_city=body.shipping_city,
        shipping_country=body.shipping_country,
        payment_method=body.payment_method,
        notes=body.notes,
    )
    db.add(order)
    db.flush()  # Get order.id

    for item in cart_items:
        oi = models.OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.product.price,
            product_name=item.product.name,
        )
        db.add(oi)
        # Reduce stock
        item.product.stock_count = max(0, item.product.stock_count - item.quantity)

    # Clear cart
    db.query(models.CartItem).filter(models.CartItem.user_id == current.id).delete()
    db.commit()
    db.refresh(order)

    # Send confirmation email in background
    bg.add_task(
        send_order_confirmation_email,
        current.email, current.name, order.id, float(total)
    )

    return {
        "message": "Order placed successfully!",
        "success": True,
        "data": order
    }


@router.get("", response_model=schemas.DataResponse[list[schemas.OrderOut]])
def list_my_orders(
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    orders = db.query(models.Order).options(joinedload(models.Order.items)).filter(
        models.Order.user_id == current.id
    ).order_by(models.Order.created_at.desc()).all()
    return {
        "success": True,
        "message": "Orders fetched successfully",
        "data": orders
    }


@router.get("/{order_id}", response_model=schemas.DataResponse[schemas.OrderOut])
def get_order(
    order_id: int,
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    order = db.query(models.Order).options(joinedload(models.Order.items)).filter(
        models.Order.id == order_id,
        models.Order.user_id == current.id,
    ).first()
    if not order:
        raise HTTPException(404, "Order not found")
    return {
        "success": True,
        "message": "Order fetched successfully",
        "data": order
    }


@router.post("/{order_id}/cancel", response_model=schemas.MessageResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current.id,
    ).first()
    if not order:
        raise HTTPException(404, "Order not found")
    if order.status not in (models.OrderStatus.pending, models.OrderStatus.confirmed):
        raise HTTPException(400, "Cannot cancel an order that has been shipped")
    order.status = models.OrderStatus.cancelled
    db.commit()
    return {"message": "Order cancelled", "success": True}


# ── Admin endpoints ────────────────────────────────────────────

@router.get("/admin/all", response_model=list[schemas.OrderOut])
def admin_list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = None,
    db: Session = Depends(deps.get_db),
    _: models.User = Depends(deps.get_admin_user),
):
    q = db.query(models.Order).options(
        joinedload(models.Order.items),
        joinedload(models.Order.user),
    )
    if status:
        q = q.filter(models.Order.status == status)
    return q.order_by(models.Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()


@router.put("/admin/{order_id}/status", response_model=schemas.OrderOut)
def admin_update_status(
    order_id: int,
    body: schemas.OrderStatusUpdate,
    db: Session = Depends(deps.get_db),
    _: models.User = Depends(deps.get_admin_user),
):
    order = db.query(models.Order).options(joinedload(models.Order.items)).filter(
        models.Order.id == order_id
    ).first()
    if not order:
        raise HTTPException(404, "Order not found")
    try:
        order.status = models.OrderStatus(body.status)
    except ValueError:
        raise HTTPException(400, f"Invalid status: {body.status}")
    db.commit()
    db.refresh(order)
    return order
