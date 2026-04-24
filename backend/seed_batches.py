from db.database import SessionLocal
from db.models import Batch
import hashlib
import json
from datetime import datetime, timedelta
import random

db = SessionLocal()

herbs = ["Ashwagandha", "Brahmi", "Shatavari", "Neem Bark", "Tulsi"]
collectors = ["Ravi Kumar", "Anita Devi", "Kiran Das", "Rahul Sharma"]

print("Seeding database with 5 new batches...")

for i in range(5):
    herb = random.choice(herbs)
    collector = random.choice(collectors)
    weight = round(random.uniform(5.0, 25.0), 1)
    lat = round(random.uniform(20.0, 30.0), 4)
    lng = round(random.uniform(70.0, 85.0), 4)
    time_coll = datetime.utcnow() - timedelta(minutes=random.randint(10, 120))
    
    # Generate fake tx_hash
    hash_input = json.dumps({"herb": herb, "collector": collector, "gps": f"{lat},{lng}", "time": str(time_coll)})
    tx_hash = "0x" + hashlib.sha256(hash_input.encode()).hexdigest()[:16]
    
    # Random risk profile
    is_high_risk = random.random() < 0.2
    
    batch = Batch(
        herb_name=herb,
        collector_name=collector,
        weight_kg=weight,
        gps_lat=lat,
        gps_lng=lng,
        gps_place_name="Generated Location",
        ai_confidence=random.randint(40, 98) if is_high_risk else random.randint(85, 99),
        time_of_collection=time_coll,
        tx_hash=tx_hash,
        alert_level="RED" if is_high_risk else "GREEN",
        fraud_alerts=[{"type": "score", "reason": "Low AI confidence"}] if is_high_risk else [],
        fraud_probability=random.randint(60, 90) if is_high_risk else random.randint(0, 15),
        trust_score=random.randint(20, 50) if is_high_risk else random.randint(85, 98),
        ai_status="flagged" if is_high_risk else "verified",
        status="pending"
    )
    db.add(batch)

db.commit()
print("Success! 5 new batches added to the database.")
db.close()
