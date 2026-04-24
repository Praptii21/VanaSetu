import base64
import qrcode
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime

from db.database import get_db
from db.models import Batch, LabReport, Product, User
from models.schemas import ProductCreate
from utils.auth_utils import require_role
from utils.hash_utils import generate_hash
from utils.pdf_utils import generate_manufacturing_pdf

router = APIRouter(tags=["Manufacturer"])


def _calc_trust_score(batches: list, lab_reports: list) -> float:
    """
    AI confidence   → 20%
    Lab purity      → 30%
    Weight match    → 20%
    Heavy metals    → 15%
    Contamination   → 15%
    Max             = 100
    """
    if not batches:
        return 0.0

    avg_ai = sum(b.ai_confidence for b in batches) / len(batches)
    avg_purity = sum(r.purity_percentage for r in lab_reports) / len(lab_reports) if lab_reports else 0
    all_weight_match = all(r.weight_match for r in lab_reports)
    all_hm_pass = all(r.heavy_metals_pass for r in lab_reports)
    all_contam_pass = all(r.contamination_pass for r in lab_reports)

    score = (avg_ai / 100) * 20 + (avg_purity / 100) * 30
    if all_weight_match:
        score += 20
    if all_hm_pass:
        score += 15
    if all_contam_pass:
        score += 15

    return round(score, 2)


def _generate_qr_base64(product_id: int) -> str:
    url = f"https://vanasetu.app/product/{product_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


@router.get("/batches/lab-verified")
def get_lab_verified_batches(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("manufacturer", "lab"))
):
    batches = db.query(Batch).filter(Batch.status == "lab_verified").order_by(Batch.created_at.desc()).all()
    result = []
    for b in batches:
        b_dict = {c.name: getattr(b, c.name) for c in b.__table__.columns}
        if b.lab_report:
            b_dict["lab_report"] = {c.name: getattr(b.lab_report, c.name) for c in b.lab_report.__table__.columns}
        result.append(b_dict)
    return {"success": True, "data": result}


@router.post("/create-product")
def create_product(
    body: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("manufacturer", "lab"))
):
    batches = db.query(Batch).filter(Batch.id.in_(body.batch_ids)).all()
    if not batches:
        raise HTTPException(status_code=404, detail="No valid batches found")

    lab_reports = [b.lab_report for b in batches if b.lab_report]
    total_weight = round(sum(
        r.weight_verified_kg for r in lab_reports
    ), 3)
    trust_score = _calc_trust_score(batches, lab_reports)
    product_hash = generate_hash(body.product_name, total_weight, body.output_units)

    product = Product(
        product_name=body.product_name,
        batch_ids=body.batch_ids,
        total_input_weight=total_weight,
        output_units=body.output_units,
        manufacturing_date=datetime.utcnow(),
        expiry_date=body.expiry_date,
        product_hash=product_hash,
        trust_score=trust_score,
        qr_data="",  # placeholder until we get the ID
    )
    db.add(product)
    db.flush()  # assigns product.id without committing

    # Store just the consumer URL — the frontend generates the actual QR image
    # client-side via canvas which is much faster than server-side PIL rendering.
    consumer_url = f"https://vanasetu.app/product/{product.id}"
    product.qr_data = consumer_url

    # Move batches to "with_manufacturer"
    for b in batches:
        b.status = "with_manufacturer"

    db.commit()
    db.refresh(product)

    # Return the full product details for the frontend (especially for PDF generation)
    ingredients = []
    for b in batches:
        b_dict = {c.name: getattr(b, c.name) for c in b.__table__.columns}
        if b.lab_report:
            b_dict["lab_report"] = {c.name: getattr(b.lab_report, c.name) for c in b.lab_report.__table__.columns}
        ingredients.append(b_dict)

    result = {
        "id": product.id,
        "product_name": product.product_name,
        "trust_score": product.trust_score,
        "qr_data": consumer_url,
        "product_hash": product_hash,
        "manufacturing_date": product.manufacturing_date,
        "expiry_date": product.expiry_date,
        "total_input_weight": product.total_input_weight,
        "output_units": product.output_units,
        "ingredients": ingredients
    }

    return {
        "success": True,
        "data": result
    }


@router.get("/manufacturer/products")
def get_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("manufacturer", "lab"))
):
    products = db.query(Product).order_by(Product.created_at.desc()).all()
    return {"success": True, "data": products}


@router.get("/product/{product_id}/pdf")
def download_manufacturing_pdf(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("manufacturer", "lab"))
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    batches = db.query(Batch).filter(Batch.id.in_(product.batch_ids)).all()
    batches_with_reports = [(b, b.lab_report) for b in batches]

    pdf_bytes = generate_manufacturing_pdf(product, batches_with_reports)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=manufacturing_report_product_{product_id}.pdf"}
    )
