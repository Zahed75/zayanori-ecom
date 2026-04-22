import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import models
from app.core.database import SessionLocal

def seed_products():
    db = SessionLocal()
    try:
        # Get categories
        categories = db.query(models.Category).all()
        if not categories:
            print("No categories found. Please run initial seed first.")
            return

        print(f"Found {len(categories)} categories. Seeding products...")

        for cat in categories:
            print(f"Seeding category: {cat.name}")
            for i in range(1, 151):  # Add 150 products per category
                product = models.Product(
                    name=f"{cat.name} Product {i}",
                    slug=f"{cat.slug}-product-{i}-{datetime.now().timestamp()}",
                    description=f"High quality {cat.name} product for your e-commerce needs. This is product number {i}.",
                    price=10.0 + (i * 0.5),
                    stock_count=100,
                    category_id=cat.id,
                    image_url=f"https://picsum.photos/seed/{cat.id}_{i}/400/400"
                )
                db.add(product)
            db.commit()
            print(f"Added 150 products to {cat.name}")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()
