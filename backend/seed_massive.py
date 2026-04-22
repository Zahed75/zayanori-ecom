import sys
import os
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from decimal import Decimal

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import models
from app.core.database import SessionLocal

CATEGORIES = [
    ("Electronics", "📱"), ("Clothing", "👕"), ("Home & Garden", "🏡"), 
    ("Sports", "⚽"), ("Beauty", "💄"), ("Toys", "🧸"), ("Books", "📚"),
    ("Automotive", "🚗"), ("Health", "💊"), ("Jewelry", "💍"), ("Pets", "🐶"),
    ("Office Supplies", "📎"), ("Tools", "🛠️"), ("Music", "🎵"), ("Video Games", "🎮"),
    ("Movies", "🎬"), ("Shoes", "👟"), ("Grocery", "🍎"), ("Furniture", "🛋️"),
    ("Outdoor", "🚵"), ("Industrial", "🏭"), ("Art", "🎨"), ("Baby", "🍼"),
    ("Software", "💿"), ("Kitchen", "🍳"), ("Luggage", "🧳"), ("Watches", "⌚"),
    ("Handbags", "👜"), ("Computers", "💻"), ("Camera", "📷"), ("Audio", "🎧"),
    ("Network", "🌐"), ("Mobile", "🤳"), ("Tablets", "📱"), ("Storage", "💾"),
    ("Printers", "🖨️"), ("Monitors", "🖥️"), ("Keyboard", "⌨️"), ("Mouse", "🖱️"),
    ("Accessories", "🎒")
]

def seed_massive():
    db = SessionLocal()
    try:
        print("Cleaning up old data (Categories, Products, Orders)...")
        db.query(models.OrderItem).delete()
        db.query(models.Order).delete()
        db.query(models.Review).delete()
        db.query(models.CartItem).delete()
        db.query(models.WishlistItem).delete()
        db.query(models.Product).delete()
        db.query(models.Category).delete()
        db.commit()

        print(f"Seeding {len(CATEGORIES)} categories...")
        cat_objects = []
        for name, emoji in CATEGORIES:
            slug = name.lower().replace(" ", "-").replace("&", "and")
            cat = models.Category(name=name, slug=slug, emoji=emoji)
            db.add(cat)
            cat_objects.append(cat)
        db.commit()

        print("Seeding 500 products per category (Total 20,000)...")
        for cat in cat_objects:
            print(f"  -> Seeding {cat.name}...")
            products = []
            for i in range(1, 501):
                price = Decimal(random.uniform(10.0, 1000.0)).quantize(Decimal("0.00"))
                p = models.Product(
                    name=f"{cat.name} Premium Item {i}",
                    slug=f"{cat.slug}-item-{i}-{random.randint(1000, 9999)}",
                    description=f"This is a high-quality product from the {cat.name} category. Model number {i}.",
                    price=price,
                    stock_count=random.randint(0, 1000),
                    category_id=cat.id,
                    image_url=f"https://picsum.photos/seed/p_{cat.id}_{i}/600/600",
                    is_featured=random.choice([True, False, False, False]),
                    is_new_arrival=random.choice([True, False]),
                    is_best_seller=random.choice([True, False, False]),
                    rating=random.uniform(3.0, 5.0),
                    review_count=random.randint(0, 100)
                )
                products.append(p)
            db.bulk_save_objects(products)
            db.commit()

        print("Seeding 500 dummy orders...")
        users = db.query(models.User).all()
        if not users:
            print("No users found to assign orders to.")
        else:
            all_products = db.query(models.Product).limit(1000).all()
            for i in range(1, 501):
                user = random.choice(users)
                order_date = datetime.now() - timedelta(days=random.randint(0, 90))
                order = models.Order(
                    user_id=user.id,
                    status=random.choice(list(models.OrderStatus)),
                    subtotal=0,
                    shipping=Decimal("4.99"),
                    total=0,
                    shipping_name=user.name,
                    shipping_email=user.email,
                    shipping_address="123 Test St",
                    shipping_city="Dhaka",
                    shipping_country="Bangladesh",
                    payment_method="cod",
                    created_at=order_date
                )
                db.add(order)
                db.flush()

                # Add 1-5 items per order
                subtotal = Decimal("0.00")
                for _ in range(random.randint(1, 5)):
                    p = random.choice(all_products)
                    qty = random.randint(1, 3)
                    oi = models.OrderItem(
                        order_id=order.id,
                        product_id=p.id,
                        quantity=qty,
                        unit_price=p.price,
                        product_name=p.name
                    )
                    db.add(oi)
                    subtotal += p.price * qty
                
                order.subtotal = subtotal
                order.total = subtotal + order.shipping
            db.commit()
            print("Seeded 500 orders successfully.")

    except Exception as e:
        print(f"Error during massive seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_massive()
