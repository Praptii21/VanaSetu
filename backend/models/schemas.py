from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# ── AUTH ────────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # collector | lab | manufacturer

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    user_id: int
    token: str
    role: str
    name: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# ── FRAUD DETECTION ────────────────────────────────────────────────────────
class FraudAlert(BaseModel):
    type: str
    reason: str
    fraud_probability: int
    action: Optional[str] = None

class FraudDetectionResult(BaseModel):
    alert_level: str  # GREEN, YELLOW, RED
    trust_score: int
    fraud_probability: int
    status: str       # pending, flagged, rejected
    message: str
    alerts: List[FraudAlert]

# ── COLLECTOR ────────────────────────────────────────────────────────────────

class HarvestSubmitRequest(BaseModel):
    herb_name: str
    collector_name: str
    weight_kg: float
    gps_lat: float
    gps_lng: float
    ai_confidence: float
    collected_at: datetime

class HarvestSubmitResponse(BaseModel):
    success: bool
    data: dict

class HarvestSubmit(BaseModel):
    herb_name: str
    collector_name: str
    weight_kg: float
    gps_lat: float
    gps_lng: float
    gps_place_name: Optional[str] = None
    ai_confidence: float
    collected_at: Optional[datetime] = None   # if None, backend uses now()

# ── LAB ──────────────────────────────────────────────────────────────────────

class LabReportSubmit(BaseModel):
    ph_level: float
    purity_percentage: float
    heavy_metals_pass: bool
    contamination_pass: bool
    weight_verified_kg: float
    overall_status: str   # pass | fail
    tested_by: str

# ── MANUFACTURER ─────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    product_name: str
    batch_ids: List[int]
    output_units: int
    expiry_date: datetime
