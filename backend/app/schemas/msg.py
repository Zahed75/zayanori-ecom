from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")

class MessageResponse(BaseModel):
    message: str
    success: bool = True

class DataResponse(BaseModel, Generic[T]):
    message: str
    success: bool = True
    data: T
