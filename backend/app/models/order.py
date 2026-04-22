import enum
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from .base import Base

def utcnow():
    return datetime.now(timezone.utc)

class OrderStatus(str, enum.Enum):
    pending   = "pending"
    confirmed = "confirmed"
    shipped   = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class Order(Base):
    __tablename__ = "orders"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False)
    status           = Column(Enum(OrderStatus), default=OrderStatus.pending)
    subtotal         = Column(Numeric(12, 2), nullable=False)
    shipping         = Column(Numeric(10, 2), default=Decimal("0.00"))
    discount_amount  = Column(Numeric(10, 2), default=Decimal("0.00"))
    total            = Column(Numeric(12, 2), nullable=False)
    coupon_code      = Column(String(50), nullable=True)
    shipping_name    = Column(String(120), nullable=True)
    shipping_email   = Column(String(255), nullable=True)
    shipping_phone   = Column(String(30), nullable=True)
    shipping_address = Column(Text, nullable=True)
    shipping_city    = Column(String(100), nullable=True)
    shipping_country = Column(String(100), nullable=True)
    notes            = Column(Text, nullable=True)
    payment_method   = Column(String(50), default="cod")
    created_at       = Column(DateTime(timezone=True), default=utcnow)
    updated_at       = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user  = relationship("User",      back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id          = Column(Integer, primary_key=True, index=True)
    order_id    = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id  = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity    = Column(Integer, nullable=False)
    unit_price  = Column(Numeric(10, 2), nullable=False)
    product_name= Column(String(255), nullable=False)

    order   = relationship("Order",   back_populates="items")
    product = relationship("Product", back_populates="order_items")
