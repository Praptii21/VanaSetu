import hashlib
import json
import base64
import qrcode
from io import BytesIO
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from db.database import engine, Base, get_db
from db.models import Batch, LabReport, Product
from models.schemas import HarvestSubmit, LabReportSubmit, ProductCreate

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VanSetu API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def seed_data():
    db = next(get_db())
    try:
        # Seed only if empty
        if db.query(Batch).count() == 0:
            b1 = Batch(
                herb_name="Tulsi",
                collector_name="Ramesh",
                weight_kg=12.5,
                gps_lat=12.2958,
                gps_lng=76.6394,
                gps_place_name="Mysuru, Karnataka",
                ai_confidence=96.0,
                time_of_collection=datetime.utcnow(),
                status="pending",
                tx_hash="0xabc123456789"
            )
            b2 = Batch(
                herb_name="Brahmi",
                collector_name="Suresh",
                weight_kg=8.5,
                gps_lat=13.0068,
                gps_lng=76.1004,
                gps_place_name="Hassan, Karnataka",
                ai_confidence=91.0,
                time_of_collection=datetime.utcnow(),
                status="pending",
                tx_hash="0xdef456789012"
            )
            db.add(b1)
            db.add(b2)
            db.commit()
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/submit-harvest")
def submit_harvest(harvest: HarvestSubmit, db: Session = Depends(get_db)):
    data_str = f"{harvest.herb_name}{harvest.collector_name}{harvest.time_of_collection}{datetime.utcnow().isoformat()}"
    tx_hash = "0x" + hashlib.sha256(data_str.encode()).hexdigest()[:12] # fake short hash
    
    new_batch = Batch(
        herb_name=harvest.herb_name,
        collector_name=harvest.collector_name,
        weight_kg=harvest.weight_kg,
        gps_lat=harvest.gps_lat,
        gps_lng=harvest.gps_lng,
        gps_place_name=harvest.gps_place_name,
        ai_confidence=harvest.ai_confidence,
        time_of_collection=datetime.utcnow(),
        status="pending",
        tx_hash=tx_hash
    )
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return {"success": True, "data": {"batch_id": new_batch.id, "tx_hash": tx_hash}}

@app.get("/batches/pending")
def get_pending_batches(db: Session = Depends(get_db)):
    batches = db.query(Batch).filter(Batch.status == "pending").all()
    return {"success": True, "data": batches}

@app.post("/submit-lab-report/{batch_id}")
def submit_lab_report(batch_id: int, report: LabReportSubmit, db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        return {"success": False, "error": "Batch not found"}
        
    weight_match = abs(batch.weight_kg - report.weight_verified_kg) <= 0.5 # True if within 0.5kg diff
    
    data_str = f"{batch_id}{report.ph_level}{report.overall_status}{datetime.utcnow().isoformat()}"
    report_hash = "0x" + hashlib.sha256(data_str.encode()).hexdigest()[:12]
    
    new_report = LabReport(
        batch_id=batch_id,
        ph_level=report.ph_level,
        purity_percentage=report.purity_percentage,
        heavy_metals_pass=report.heavy_metals_pass,
        contamination_pass=report.contamination_pass,
        weight_verified_kg=report.weight_verified_kg,
        weight_match=weight_match,
        overall_status=report.overall_status,
        report_hash=report_hash,
        time_tested=datetime.utcnow()
    )
    
    batch.status = "lab verified"
    db.add(new_report)
    db.commit()
    return {"success": True, "data": {"report_hash": report_hash, "weight_match": weight_match}}

@app.get("/batches/lab-verified")
def get_lab_verified_batches(db: Session = Depends(get_db)):
    batches = db.query(Batch).filter(Batch.status == "lab verified").all()
    res = []
    for b in batches:
        b_dict = {c.name: getattr(b, c.name) for c in b.__table__.columns}
        if b.lab_report:
            b_dict['lab_report'] = {c.name: getattr(b.lab_report, c.name) for c in b.lab_report.__table__.columns}
        res.append(b_dict)
    return {"success": True, "data": res}

@app.post("/create-product")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    batches = db.query(Batch).filter(Batch.id.in_(product.batch_ids)).all()
    if not batches:
        return {"success": False, "error": "No valid batches found"}
        
    total_weight = sum(b.weight_kg for b in batches)
    
    # Trust Score calculation
    # AI confidence (20%), Lab Purity (30%), Weight Match (20%), Heavy metals (15%), Contamination (15%)
    avg_ai = sum(b.ai_confidence for b in batches) / len(batches) if batches else 0
    
    lab_reports = [b.lab_report for b in batches if b.lab_report]
    avg_purity = sum(r.purity_percentage for r in lab_reports) / len(lab_reports) if lab_reports else 0
    all_weight_match = all(r.weight_match for r in lab_reports)
    all_hm_pass = all(r.heavy_metals_pass for r in lab_reports)
    all_contam_pass = all(r.contamination_pass for r in lab_reports)
    
    trust_score = (avg_ai * 0.20) + (avg_purity * 0.30)
    if all_weight_match: trust_score += 20
    if all_hm_pass: trust_score += 15
    if all_contam_pass: trust_score += 15
    
    data_str = f"{product.product_name}{total_weight}{datetime.utcnow().isoformat()}"
    product_hash = "0x" + hashlib.sha256(data_str.encode()).hexdigest()[:12]
    
    new_product = Product(
        product_name=product.product_name,
        batch_ids=product.batch_ids,
        total_input_weight=total_weight,
        output_units=product.output_units,
        manufacturing_date=datetime.utcnow(),
        expiry_date=product.expiry_date,
        product_hash=product_hash,
        trust_score=round(trust_score, 2),
        qr_data="" # Will update later
    )
    db.add(new_product)
    db.flush() # To get ID
    
    # Generate QR Code
    qr_url = f"https://vanasetu.app/product/{new_product.id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_url)
    qr.make(fit=True)
    img = qr.make_image(fill='black', back_color='white')
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    new_product.qr_data = qr_base64
    db.commit()
    
    # Update batches to 'with manufacturer'
    for b in batches:
        b.status = "with manufacturer"
    db.commit()
    
    return {"success": True, "data": {"product_id": new_product.id, "qr_code": qr_base64, "trust_score": new_product.trust_score}}

@app.get("/product/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"success": False, "error": "Product not found"}
        
    batches = db.query(Batch).filter(Batch.id.in_(product.batch_ids)).all()
    
    res_batches = []
    for b in batches:
        b_dict = {c.name: getattr(b, c.name) for c in b.__table__.columns}
        if b.lab_report:
            b_dict['lab_report'] = {c.name: getattr(b.lab_report, c.name) for c in b.lab_report.__table__.columns}
        res_batches.append(b_dict)
        
    product_dict = {c.name: getattr(product, c.name) for c in product.__table__.columns}
    product_dict['ingredients'] = res_batches
    
    return {"success": True, "data": product_dict}
