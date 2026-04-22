from datetime import datetime
from pydantic import BaseModel, ConfigDict
from .product import ProductOut

class WishlistToggleRequest(BaseModel):
    product_id: int

class WishlistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product: ProductOut
    added_at: datetime
