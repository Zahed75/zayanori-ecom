from fastapi import APIRouter
from .endpoints import auths, products, cart, orders, wishlist, admin, categories

api_router = APIRouter()

api_router.include_router(auths.router, prefix="/auth", tags=["auth"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
