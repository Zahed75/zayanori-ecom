import os
import requests
import random
from decimal import Decimal

# Replace with your production API URL
API_BASE_URL = "https://zayanoriapi.syscomatic.cloud/api/v1"

# The admin credentials you created on the production server
ADMIN_EMAIL = "admin@syscomatic.com"
ADMIN_PASSWORD = "your_admin_password_here"

CATEGORIES = [
    ("Electronics", "📱"), ("Clothing", "👕"), ("Home & Garden", "🏡"), 
    ("Sports", "⚽"), ("Beauty", "💄"), ("Toys", "🧸"), ("Books", "📚"),
    ("Automotive", "🚗"), ("Health", "💊"), ("Jewelry", "💍"), ("Pets", "🐶"),
    ("Office Supplies", "📎"), ("Tools", "🛠️"), ("Music", "🎵"), ("Video Games", "🎮"),
    ("Movies", "🎬"), ("Shoes", "👟"), ("Grocery", "🍎"), ("Furniture", "🛋️")
]

def seed_remote():
    print(f"Connecting to {API_BASE_URL}...")
    
    # 1. Login as Admin to get JWT token
    try:
        login_response = requests.post(
            f"{API_BASE_URL}/auth/login",
            data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        login_response.raise_for_status()
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Successfully logged in as admin.")
    except Exception as e:
        print(f"Failed to log in. Have you created the admin account on the VPS? Error: {e}")
        return

    # 2. Create Categories
    print("Creating categories...")
    category_ids = []
    for name, emoji in CATEGORIES:
        slug = name.lower().replace(" ", "-").replace("&", "and")
        res = requests.post(
            f"{API_BASE_URL}/categories",
            headers=headers,
            json={"name": name, "slug": slug, "emoji": emoji, "is_active": True}
        )
        if res.status_code == 201:
            category_ids.append(res.json()["data"]["id"])
            print(f"Created category: {name}")
        elif res.status_code == 400 and "already exists" in res.text:
            # Try to fetch it
            cat_list = requests.get(f"{API_BASE_URL}/categories").json()["data"]
            for c in cat_list:
                if c["slug"] == slug:
                    category_ids.append(c["id"])
                    break
        else:
            print(f"Failed to create category {name}: {res.text}")

    if not category_ids:
        print("No categories available to attach products to.")
        return

    # 3. Create 500 Dummy Products
    print("Creating 500 dummy products...")
    for i in range(1, 501):
        cat_id = random.choice(category_ids)
        price = float(Decimal(random.uniform(10.0, 1000.0)).quantize(Decimal("0.00")))
        old_price = float(Decimal(price * random.uniform(1.1, 1.5)).quantize(Decimal("0.00")))
        
        product_data = {
            "name": f"Premium Zayanori Item {i}",
            "slug": f"zayanori-item-{i}-{random.randint(1000, 9999)}",
            "description": f"This is a high-quality product from Zayanori. Model number {i}. Perfect for everyday use.",
            "price": price,
            "old_price": old_price if random.choice([True, False]) else None,
            "stock_count": random.randint(10, 1000),
            "category_id": cat_id,
            "image_url": f"https://picsum.photos/seed/zay_{i}/600/600",
            "is_featured": random.choice([True, False, False, False]),
            "is_new_arrival": random.choice([True, False]),
            "is_best_seller": random.choice([True, False, False]),
            "is_active": True
        }

        res = requests.post(f"{API_BASE_URL}/products", headers=headers, json=product_data)
        if res.status_code == 201:
            if i % 50 == 0:
                print(f"Created {i}/500 products...")
        else:
            print(f"Failed to create product {i}: {res.text}")

    print("Successfully seeded 500 products to the remote production database!")

if __name__ == "__main__":
    seed_remote()
