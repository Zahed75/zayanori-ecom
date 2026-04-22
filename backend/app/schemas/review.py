from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator
from .user import UserOut

class ReviewCreate(BaseModel):
    rating: int
    title: Optional[str] = None
    body: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v

class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rating: int
    title: Optional[str] = None
    body: Optional[str] = None
    is_approved: bool
    created_at: datetime
    user: UserOut
