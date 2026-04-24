import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv(dotenv_path='backend/.env')
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

batches = [
    ("Ashwagandha", "Rajesh Kumar", 15.5, 24.45, 74.88, "Neemuch, MP", 95.2),
    ("Tulsi (Holy Basil)", "Amit Sharma", 5.2, 29.94, 78.16, "Haridwar, UK", 98.1),
    ("Brahmi", "Sunita Devi", 8.4, 11.66, 76.25, "Wayanad, KL", 92.4),
    ("Shatavari", "Vikram Singh", 12.0, 17.68, 73.99, "Satara, MH", 89.7),
    ("Neem Leaves", "Meena Bai", 25.3, 26.23, 73.01, "Jodhpur, RJ", 96.5),
    ("Amla (Gooseberry)", "Suresh Prasad", 30.1, 25.91, 81.96, "Pratapgarh, UP", 94.8),
    ("Giloy", "Anjali Negi", 7.8, 29.59, 79.64, "Almora, UK", 91.2),
    ("Aloe Vera", "Rahul Gadhavi", 45.0, 23.37, 69.66, "Kutch, GJ", 97.3),
    ("Turmeric (Raw)", "Kavita Patil", 18.2, 16.85, 74.55, "Sangli, MH", 99.0),
    ("Ginger", "Deepak Thakur", 10.5, 31.10, 77.17, "Shimla, HP", 88.6),
]

with engine.connect() as conn:
    # Clear existing demo batches if any (optional, but keeps it clean for pitch)
    # conn.execute(text("DELETE FROM batches WHERE status = 'pending'"))
    
    for i, (herb, collector, weight, lat, lng, place, conf) in enumerate(batches):
        collected_at = datetime.utcnow() - timedelta(hours=i*2)
        query = text("""
            INSERT INTO batches (herb_name, collector_name, weight_kg, gps_lat, gps_lng, gps_place_name, ai_confidence, status, created_at)
            VALUES (:herb, :collector, :weight, :lat, :lng, :place, :conf, 'pending', :created)
        """)
        conn.execute(query, {
            "herb": herb,
            "collector": collector,
            "weight": weight,
            "lat": lat,
            "lng": lng,
            "place": place,
            "conf": conf,
            "created": collected_at
        })
    conn.commit()

print("Successfully seeded 10 pitch-ready batches!")
