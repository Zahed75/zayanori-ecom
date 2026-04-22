import sys
import os

# Add backend directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import Product, Category

def seed():
    db = SessionLocal()
    
    # Create default category if not exists
    cat = db.query(Category).first()
    if not cat:
        cat = Category(name="General", slug="general", emoji="📦")
        db.add(cat)
        db.commit()
        db.refresh(cat)

    if db.query(Product).count() > 0:
        print("Database already seeded.")
        return

    products = [
        { "name": 'Organic Whole Milk', "slug": 'organic-whole-milk', "price": 12.99, "old_price": 18.99, "discount": 32, "badge": 'Organic', "stock_count": 42, "is_new_arrival": True, "image_url": 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800' },
        { "name": 'Fresh Strawberries', "slug": 'fresh-strawberries', "price":  9.99, "old_price": 14.99, "discount": 33, "stock_count": 28, "is_best_seller": True, "image_url": 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800' },
        { "name": 'Sourdough Bread',    "slug": 'sourdough-bread',    "price":  5.99, "old_price":  8.50, "discount": 30, "stock_count": 15, "is_new_arrival": True, "image_url": 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&q=80&w=800' },
        { "name": 'Almond Butter',      "slug": 'almond-butter',      "price": 14.99, "old_price": 22.00, "discount": 32, "stock_count": 33, "is_best_seller": True, "image_url": 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=800' },
        { "name": 'Greek Yogurt',       "slug": 'greek-yogurt',       "price":  7.99, "old_price": 12.00, "discount": 33, "badge": 'Cold Sale', "badge_color": 'blue', "stock_count": 60, "is_featured": True, "image_url": 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800' },
        { "name": 'Frozen Berries Mix', "slug": 'frozen-berries-mix', "price": 10.99, "old_price": 16.99, "discount": 35, "stock_count": 50, "is_best_seller": True, "image_url": 'https://images.unsplash.com/photo-1596646399672-0056eb72f108?auto=format&fit=crop&q=80&w=800' },
        { "name": 'Fresh Salmon Fillet', "slug": 'fresh-salmon-fillet', "price": 27.99, "old_price": 56.67, "discount": 51, "badge": 'Featured', "stock_count": 12, "is_featured": True, "image_url": 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800' },
        { "name": 'Avocado Hass x4',    "slug": 'avocado-hass',       "price":  9.99, "old_price": 18.00, "discount": 44, "badge": 'Organic', "stock_count": 40, "is_featured": True, "image_url": 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800' },
        { "name": 'Premium Ribeye 1kg', "slug": 'premium-ribeye',     "price": 49.99, "old_price": 79.99, "discount": 37, "badge": 'Featured', "stock_count": 8, "is_featured": True, "image_url": 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800' },
    ]

    for p_data in products:
        p = Product(**p_data, category_id=cat.id)
        db.add(p)
    
    db.commit()
    print("Database seeded with mock products!")

if __name__ == "__main__":
    seed()
