from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from db.database import get_db
from db.models import Batch, User
from models.schemas import HarvestSubmit, HarvestSubmitRequest, HarvestSubmitResponse
from utils.auth_utils import require_role
from utils.hash_utils import generate_hash
from fraud_detection import run_fraud_detection
import hashlib
import json

router = APIRouter(tags=["Collector"])


@router.post("/submit-harvest", response_model=HarvestSubmitResponse)
async def submit_harvest(
    harvest: HarvestSubmitRequest,
    db: Session = Depends(get_db),
    # current_user: User = Depends(require_role("collector")) # Optional for demo
):
    # 1. Run fraud detection first
    fraud_result = run_fraud_detection(
        lat=harvest.gps_lat,
        lng=harvest.gps_lng,
        herb_name=harvest.herb_name,
        collected_at=harvest.collected_at,
        ai_confidence=harvest.ai_confidence
    )
    
    # 2. Generate tx_hash
    hash_input = json.dumps({
        "herb": harvest.herb_name,
        "collector": harvest.collector_name,
        "gps": f"{harvest.gps_lat},{harvest.gps_lng}",
        "time": str(harvest.collected_at)
    })
    tx_hash = "0x" + hashlib.sha256(
        hash_input.encode()
    ).hexdigest()[:16]
    
    # 3. Save to DB including fraud results
    new_batch = Batch(
        herb_name=harvest.herb_name,
        collector_name=harvest.collector_name,
        weight_kg=harvest.weight_kg,
        gps_lat=harvest.gps_lat,
        gps_lng=harvest.gps_lng,
        ai_confidence=harvest.ai_confidence,
        time_of_collection=harvest.collected_at,
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
    db.refresh(new_batch)
    
    # 4. Return full response
    return {
        "success": True,
        "data": {
            "batch_id": new_batch.id,
            "tx_hash": tx_hash,
            "herb_name": harvest.herb_name,
            "collector_name": harvest.collector_name,
            "weight_kg": harvest.weight_kg,
            "collected_at": str(harvest.collected_at),
            "fraud_detection": fraud_result.model_dump()
        }
    }


@router.get("/collector/my-batches")
def my_batches(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("collector"))
):
    # Match by collector_name == user's name (since Android sends name in payload)
    batches = db.query(Batch).filter(
        Batch.collector_name == current_user.name
    ).order_by(Batch.created_at.desc()).all()

    return {"success": True, "data": batches}
