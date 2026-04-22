import sys
import os

# Add backend directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User, UserRole
from app.auth import hash_password

def seed_admin():
    db = SessionLocal()
    
    admin_email = "admin@zayanori.com"
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    
    if existing_admin:
        print("Admin user already exists!")
        return

    admin = User(
        name="Super Admin",
        email=admin_email,
        hashed_password=hash_password("admin123"),
        role=UserRole.admin,
        is_active=True,
        is_email_verified=True
    )
    
    db.add(admin)
    db.commit()
    print("Admin user created! (Email: admin@zayanori.com, Password: admin123)")

if __name__ == "__main__":
    seed_admin()
