from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Batch

router = APIRouter(tags=["Batches"])

@router.get("/batches/alerts")
async def get_batches_by_alert(
    db: Session = Depends(get_db)
):
    batches = db.query(Batch).order_by(Batch.created_at.desc()).all()
    
    return {
        "success": True,
        "data": {
            "red": [b for b in batches if b.alert_level == "RED"],
            "yellow": [b for b in batches if b.alert_level == "YELLOW"],
            "green": [b for b in batches if b.alert_level == "GREEN"]
        }
    }

@router.get("/health")
async def health():
    return {
        "status": "ok",
        "fraud_engine": "active",
        "checks": [
            "location_fraud",
            "seasonal_fraud",
            "visual_confidence"
        ]
    }
