from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime

from db.database import get_db
from db.models import Batch, LabReport, User
from models.schemas import LabReportSubmit
from utils.auth_utils import require_role, get_current_user
from utils.hash_utils import generate_hash
from utils.pdf_utils import generate_lab_report_pdf

router = APIRouter(tags=["Lab"])


@router.get("/batches/pending")
def get_pending_batches(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lab"))
):
    batches = db.query(Batch).filter(Batch.status == "pending").order_by(Batch.created_at.desc()).all()
    return {"success": True, "data": batches}


@router.post("/submit-lab-report/{batch_id}")
def submit_lab_report(
    batch_id: int,
    body: LabReportSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lab"))
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    if db.query(LabReport).filter(LabReport.batch_id == batch_id).first():
        raise HTTPException(status_code=409, detail="Lab report already submitted for this batch")

    weight_difference = round(abs(batch.weight_kg - body.weight_verified_kg), 3)
    weight_match = weight_difference <= 0.5  # within 500g tolerance

    report_hash = generate_hash(batch_id, body.overall_status, body.purity_percentage)

    report = LabReport(
        batch_id=batch_id,
        ph_level=body.ph_level,
        purity_percentage=body.purity_percentage,
        heavy_metals_pass=body.heavy_metals_pass,
        contamination_pass=body.contamination_pass,
        weight_verified_kg=body.weight_verified_kg,
        weight_match=weight_match,
        overall_status=body.overall_status,
        report_hash=report_hash,
        tested_by=body.tested_by,
        time_tested=datetime.utcnow(),
    )
    db.add(report)

    batch.status = "lab_verified"
    db.commit()
    db.refresh(report)

    return {
        "success": True,
        "data": {
            "report_hash": report_hash,
            "weight_match": weight_match,
            "weight_difference": weight_difference
        }
    }


@router.get("/lab-report/{batch_id}")
def get_lab_report(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # any authenticated user
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    report = db.query(LabReport).filter(LabReport.batch_id == batch_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found for this batch")

    batch_data = {c.name: getattr(batch, c.name) for c in batch.__table__.columns}
    report_data = {c.name: getattr(report, c.name) for c in report.__table__.columns}

    return {"success": True, "data": {**batch_data, "lab_report": report_data}}


@router.get("/lab-report/{batch_id}/pdf")
def download_lab_report_pdf(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lab"))
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    report = db.query(LabReport).filter(LabReport.batch_id == batch_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found")

    pdf_bytes = generate_lab_report_pdf(batch, report)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=lab_report_batch_{batch_id}.pdf"}
    )
