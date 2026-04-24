from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # collector | lab | manufacturer
    created_at = Column(DateTime, default=datetime.utcnow)

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    herb_name = Column(String, index=True)
    collector_name = Column(String)
    weight_kg = Column(Float)
    gps_lat = Column(Float)
    gps_lng = Column(Float)
    gps_place_name = Column(String, nullable=True)
    ai_confidence = Column(Float)
    time_of_collection = Column(DateTime)
    status = Column(String, default="pending") # pending, lab verified, with manufacturer
    tx_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    lab_report = relationship("LabReport", back_populates="batch", uselist=False)

class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"))
    ph_level = Column(Float)
    purity_percentage = Column(Float)
    heavy_metals_pass = Column(Boolean)
    contamination_pass = Column(Boolean)
    weight_verified_kg = Column(Float)
    weight_match = Column(Boolean)
    overall_status = Column(String) # pass, fail
    report_hash = Column(String)
    tested_by = Column(String, nullable=True)
    time_tested = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", back_populates="lab_report")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True)
    batch_ids = Column(JSON) # Store array of batch ids
    total_input_weight = Column(Float)
    output_units = Column(Integer)
    manufacturing_date = Column(DateTime)
    expiry_date = Column(DateTime)
    product_hash = Column(String)
    trust_score = Column(Float)
    qr_data = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
