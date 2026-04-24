from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from db.database import engine, Base, get_db
from db.models import Batch  # import all models so tables are created

# Import all routers
from routers import auth, collector, lab, manufacturer, consumer, batches
from seed import seed_fraud_data

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
app.include_router(batches.router)

# ── Startup Logic ─────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup_db_seed():
    seed_fraud_data()
