from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from .base import Base

def utcnow():
    return datetime.now(timezone.utc)

class Product(Base):
    __tablename__ = "products"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(255), nullable=False, index=True)
    slug          = Column(String(280), unique=True, nullable=False, index=True)
    description   = Column(Text, nullable=True)
    price         = Column(Numeric(10, 2), nullable=False)
    old_price     = Column(Numeric(10, 2), nullable=True)
    discount      = Column(Integer, nullable=True)
    stock_count   = Column(Integer, default=0)
    emoji         = Column(String(10), nullable=True)
    image_url     = Column(String(500), nullable=True)
    badge         = Column(String(50), nullable=True)
    badge_color   = Column(String(20), nullable=True)
    rating        = Column(Numeric(3, 2), default=Decimal("0.0"))
    review_count  = Column(Integer, default=0)
    is_featured   = Column(Boolean, default=False)
    is_new_arrival= Column(Boolean, default=False)
    is_best_seller= Column(Boolean, default=False)
    is_active     = Column(Boolean, default=True)
    category_id   = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at    = Column(DateTime(timezone=True), default=utcnow)
    updated_at    = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    category      = relationship("Category",  back_populates="products")
    order_items   = relationship("OrderItem", back_populates="product")
    cart_items    = relationship("CartItem",  back_populates="product")
    wishlist_items= relationship("WishlistItem", back_populates="product")
    reviews       = relationship("Review",    back_populates="product")
