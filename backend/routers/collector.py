from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from db.database import get_db
from db.models import Batch, User
from models.schemas import HarvestSubmit
from utils.auth_utils import require_role
from utils.hash_utils import generate_hash

router = APIRouter(tags=["Collector"])


@router.post("/submit-harvest")
def submit_harvest(
    body: HarvestSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("collector"))
):
    tx_hash = generate_hash(body.herb_name, body.collector_name, body.weight_kg)

    batch = Batch(
        herb_name=body.herb_name,
        collector_name=body.collector_name,
        weight_kg=body.weight_kg,
        gps_lat=body.gps_lat,
        gps_lng=body.gps_lng,
        gps_place_name=body.gps_place_name,
        ai_confidence=body.ai_confidence,
        time_of_collection=body.collected_at or datetime.utcnow(),
        status="pending",
        tx_hash=tx_hash,
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    return {
        "success": True,
        "data": {
            "batch_id": batch.id,
            "tx_hash": tx_hash
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
