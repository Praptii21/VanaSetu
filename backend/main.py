from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from db.database import engine, Base, get_db
from db.models import Batch  # import all models so tables are created

# Import all routers
from routers import auth, collector, lab, manufacturer, consumer

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VanSetu API",
    description="Blockchain-backed Ayurvedic supply chain traceability platform",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(collector.router)
app.include_router(lab.router)
app.include_router(manufacturer.router)
app.include_router(consumer.router)

# ── Seed Data ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
def seed_demo_data():
    db = next(get_db())
    try:
        if db.query(Batch).count() == 0:
            batches = [
                Batch(
                    herb_name="Tulsi",
                    collector_name="Ramesh",
                    weight_kg=12.5,
                    gps_lat=12.2958,
                    gps_lng=76.6394,
                    gps_place_name="Mysuru, Karnataka",
                    ai_confidence=96.0,
                    time_of_collection=datetime.utcnow(),
                    status="pending",
                    tx_hash="0xabc123456789demo1",
                ),
                Batch(
                    herb_name="Brahmi",
                    collector_name="Suresh",
                    weight_kg=8.5,
                    gps_lat=13.0068,
                    gps_lng=76.1004,
                    gps_place_name="Hassan, Karnataka",
                    ai_confidence=91.0,
                    time_of_collection=datetime.utcnow(),
                    status="pending",
                    tx_hash="0xdef456789012demo2",
                ),
            ]
            db.add_all(batches)
            db.commit()
    finally:
        db.close()

# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
