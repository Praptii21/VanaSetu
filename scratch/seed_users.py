import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv(dotenv_path='backend/.env')
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

users = [
    ("Lab Technician", "lab@vansetu.com", "password123", "lab"),
    ("Priya Manufacturer", "maker@vansetu.com", "password123", "manufacturer"),
    ("Ramesh Collector", "collector@vansetu.com", "password123", "collector"),
]

with engine.connect() as conn:
    # Clear existing demo users if any
    conn.execute(text("DELETE FROM users WHERE email IN ('lab@vansetu.com', 'maker@vansetu.com', 'collector@vansetu.com')"))
    
    for name, email, password, role in users:
        hashed = hash_password(password)
        query = text("""
            INSERT INTO users (name, email, hashed_password, role)
            VALUES (:name, :email, :password, :role)
        """)
        conn.execute(query, {
            "name": name,
            "email": email,
            "password": hashed,
            "role": role
        })
    conn.commit()

print("Successfully seeded demo accounts!")
