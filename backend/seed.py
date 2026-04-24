from sqlalchemy.orm import Session
from datetime import datetime
from db.database import SessionLocal
from db.models import Batch
from fraud_detection import run_fraud_detection
import hashlib
import json

def seed_fraud_data():
    db = SessionLocal()
    try:
        # Check if batches already exist
        if db.query(Batch).count() > 0:
            print("Database already has data, skipping seed.")
            return

        now = datetime.now()
        
        seed_batches = [
            {
                "herb_name": "Tulsi",
                "collector_name": "Ravi Kumar",
                "gps_lat": 12.3456,
                "gps_lng": 76.6413,
                "ai_confidence": 94,
                "collected_at": now.replace(month=8)
            },
            {
                "herb_name": "Neem",
                "collector_name": "Suresh Kumar",
                "gps_lat": 12.3456,
                "gps_lng": 76.6413,
                "ai_confidence": 65,
                "collected_at": now.replace(month=4)
            },
            {
                "herb_name": "Ashwagandha",
                "collector_name": "Unknown Collector",
                "gps_lat": 12.9716,
                "gps_lng": 77.5946,
                "ai_confidence": 45,
                "collected_at": now.replace(month=7)
            }
        ]

        for b_data in seed_batches:
            # Run fraud detection
            fraud_result = run_fraud_detection(
                lat=b_data["gps_lat"],
                lng=b_data["gps_lng"],
                herb_name=b_data["herb_name"],
                collected_at=b_data["collected_at"],
                ai_confidence=b_data["ai_confidence"]
            )

            # Generate tx_hash
            hash_input = json.dumps({
                "herb": b_data["herb_name"],
                "collector": b_data["collector_name"],
                "gps": f"{b_data['gps_lat']},{b_data['gps_lng']}",
                "time": str(b_data["collected_at"])
            })
            tx_hash = "0x" + hashlib.sha256(hash_input.encode()).hexdigest()[:16]

            new_batch = Batch(
                herb_name=b_data["herb_name"],
                collector_name=b_data["collector_name"],
                weight_kg=10.5, # Default weight
                gps_lat=b_data["gps_lat"],
                gps_lng=b_data["gps_lng"],
                ai_confidence=b_data["ai_confidence"],
                time_of_collection=b_data["collected_at"],
                tx_hash=tx_hash,
                alert_level=fraud_result.alert_level,
                fraud_alerts=[a.model_dump() for a in fraud_result.alerts],
                fraud_probability=fraud_result.fraud_probability,
                trust_score=fraud_result.trust_score,
                ai_status=fraud_result.status,
                status="pending"
            )
            db.add(new_batch)
        
        db.commit()
        print("Demo seed data added successfully.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()
