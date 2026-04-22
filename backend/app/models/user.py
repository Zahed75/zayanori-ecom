import enum
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import relationship
from .base import Base

def utcnow():
    return datetime.now(timezone.utc)

class UserRole(str, enum.Enum):
    customer = "customer"
    admin    = "admin"

class User(Base):
    __tablename__ = "users"

    id                  = Column(Integer, primary_key=True, index=True)
    name                = Column(String(120), nullable=False)
    email               = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password     = Column(String(255), nullable=False)
    role                = Column(Enum(UserRole), default=UserRole.customer, nullable=False)
    is_active           = Column(Boolean, default=True)
    is_email_verified   = Column(Boolean, default=False)
    email_verify_token  = Column(String(255), nullable=True)
    reset_token         = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    phone               = Column(String(30), nullable=True)
    address             = Column(Text, nullable=True)
    avatar_url          = Column(String(500), nullable=True)
    created_at          = Column(DateTime(timezone=True), default=utcnow)
    updated_at          = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    orders    = relationship("Order",    back_populates="user", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    wishlist  = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    reviews   = relationship("Review",   back_populates="user", cascade="all, delete-orphan")
