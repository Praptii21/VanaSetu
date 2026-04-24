from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Batch, LabReport, Product

router = APIRouter(tags=["Consumer"])


@router.get("/product/{product_id}")
def get_product_public(product_id: int, db: Session = Depends(get_db)):
    """Public endpoint — no auth needed. Called when QR is scanned."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    batches = db.query(Batch).filter(Batch.id.in_(product.batch_ids)).all()

    ingredients = []
    for b in batches:
        b_dict = {c.name: getattr(b, c.name) for c in b.__table__.columns}
        if b.lab_report:
            b_dict["lab_report"] = {c.name: getattr(b.lab_report, c.name) for c in b.lab_report.__table__.columns}
        ingredients.append(b_dict)

    product_dict = {c.name: getattr(product, c.name) for c in product.__table__.columns}

    # Trust score breakdown (for transparency on consumer page)
    lab_reports = [b.lab_report for b in batches if b.lab_report]
    avg_ai = round(sum(b.ai_confidence for b in batches) / len(batches), 2) if batches else 0
    avg_purity = round(sum(r.purity_percentage for r in lab_reports) / len(lab_reports), 2) if lab_reports else 0
    all_weight_match = all(r.weight_match for r in lab_reports)
    all_hm_pass = all(r.heavy_metals_pass for r in lab_reports)
    all_contam_pass = all(r.contamination_pass for r in lab_reports)

    trust_breakdown = {
        "ai_confidence_score": round((avg_ai / 100) * 20, 2),
        "lab_purity_score": round((avg_purity / 100) * 30, 2),
        "weight_match_score": 20 if all_weight_match else 0,
        "heavy_metals_score": 15 if all_hm_pass else 0,
        "contamination_score": 15 if all_contam_pass else 0,
        "total": product.trust_score,
    }

    product_dict["ingredients"] = ingredients
    product_dict["trust_breakdown"] = trust_breakdown

    return {"success": True, "data": product_dict}
