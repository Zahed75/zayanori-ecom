from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict

class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal

class OrderCreate(BaseModel):
    shipping_name: str
    shipping_email: EmailStr
    shipping_phone: Optional[str] = None
    shipping_address: str
    shipping_city: str
    shipping_country: str = "Bangladesh"
    payment_method: str = "cod"
    coupon_code: Optional[str] = None
    notes: Optional[str] = None

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    subtotal: Decimal
    shipping: Decimal
    discount_amount: Decimal
    total: Decimal
    coupon_code: Optional[str] = None
    shipping_name: Optional[str] = None
    shipping_email: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_country: Optional[str] = None
    payment_method: str
    notes: Optional[str] = None
    items: List[OrderItemOut] = []
    created_at: datetime
    updated_at: datetime

class OrderStatusUpdate(BaseModel):
    status: str
