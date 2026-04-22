from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from .base import Base

def utcnow():
    return datetime.now(timezone.utc)

class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_review_user_product"),)

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    rating     = Column(Integer, nullable=False)
    title      = Column(String(255), nullable=True)
    body       = Column(Text, nullable=True)
    is_approved= Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user    = relationship("User",    back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
