from datetime import datetime
from decimal import Decimal
from typing import List
from pydantic import BaseModel, ConfigDict
from .product import ProductOut

class CartAddRequest(BaseModel):
    product_id: int
    quantity: int = 1

class CartUpdateRequest(BaseModel):
    quantity: int

class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    product: ProductOut
    added_at: datetime

class CartResponse(BaseModel):
    items: List[CartItemOut]
    subtotal: Decimal
    shipping: Decimal
    total: Decimal
    item_count: int
