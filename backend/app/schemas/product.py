from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from .category import CategoryOut

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: Decimal
    old_price: Optional[Decimal] = None
    discount: Optional[int] = None
    stock_count: int = 0
    emoji: Optional[str] = None
    badge: Optional[str] = None
    badge_color: Optional[str] = None
    is_featured: bool = False
    is_new_arrival: bool = False
    is_best_seller: bool = False
    category_id: Optional[int] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    old_price: Optional[Decimal] = None
    discount: Optional[int] = None
    stock_count: Optional[int] = None
    emoji: Optional[str] = None
    badge: Optional[str] = None
    badge_color: Optional[str] = None
    is_featured: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    is_best_seller: Optional[bool] = None
    is_active: Optional[bool] = None
    category_id: Optional[int] = None

class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: Optional[str] = None
    price: Decimal
    old_price: Optional[Decimal] = None
    discount: Optional[int] = None
    stock_count: int
    emoji: Optional[str] = None
    image_url: Optional[str] = None
    badge: Optional[str] = None
    badge_color: Optional[str] = None
    rating: Decimal
    review_count: int
    is_featured: bool
    is_new_arrival: bool
    is_best_seller: bool
    is_active: bool
    category_id: Optional[int] = None
    category: Optional[CategoryOut] = None
    created_at: datetime

class ProductListResponse(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    page_size: int
    pages: int
