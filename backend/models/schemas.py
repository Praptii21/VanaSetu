from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class HarvestSubmit(BaseModel):
    herb_name: str
    collector_name: str
    weight_kg: float
    gps_lat: float
    gps_lng: float
    gps_place_name: Optional[str] = None
    ai_confidence: float

class LabReportSubmit(BaseModel):
    ph_level: float
    purity_percentage: float
    heavy_metals_pass: bool
    contamination_pass: bool
    weight_verified_kg: float
    overall_status: str

class ProductCreate(BaseModel):
    product_name: str
    batch_ids: List[int]
    output_units: int
    expiry_date: datetime
