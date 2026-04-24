import math
from typing import List, Optional
from datetime import datetime
from models.schemas import FraudAlert, FraudDetectionResult

URBAN_ZONES = [
    {"name": "Bengaluru", "lat": 12.9716, "lng": 77.5946, "radius_km": 15},
    {"name": "Mumbai", "lat": 19.0760, "lng": 72.8777, "radius_km": 20},
    {"name": "Delhi", "lat": 28.6139, "lng": 77.2090, "radius_km": 25},
    {"name": "Chennai", "lat": 13.0827, "lng": 80.2707, "radius_km": 15},
    {"name": "Hyderabad", "lat": 17.3850, "lng": 78.4867, "radius_km": 15},
    {"name": "Pune", "lat": 18.5204, "lng": 73.8567, "radius_km": 15},
    {"name": "Ahmedabad", "lat": 23.0225, "lng": 72.5714, "radius_km": 15},
    {"name": "Jaipur", "lat": 26.9124, "lng": 75.7873, "radius_km": 15}
]

HARVEST_SEASONS = {
    "Ashwagandha": {
        "valid_months": [10, 11, 12, 1, 2],
        "reason": "Ashwagandha roots only mature October to February"
    },
    "Tulsi": {
        "valid_months": [7, 8, 9, 10],
        "reason": "Tulsi peaks July to October"
    },
    "Brahmi": {
        "valid_months": [6, 7, 8, 9],
        "reason": "Brahmi grows June to September"
    },
    "Neem": {
        "valid_months": [3, 4, 5],
        "reason": "Neem leaves harvested March to May"
    },
    "Amla": {
        "valid_months": [11, 12, 1],
        "reason": "Amla fruits ripen November to January"
    },
    "Shatavari": {
        "valid_months": [11, 12, 1, 2],
        "reason": "Shatavari roots harvested November to February"
    }
}

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = (math.sin(dphi/2)**2 + 
         math.cos(phi1) * math.cos(phi2) * 
         math.sin(dlambda/2)**2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def check_location_fraud(lat, lng) -> Optional[FraudAlert]:
    for zone in URBAN_ZONES:
        distance = haversine(lat, lng, zone["lat"], zone["lng"])
        if distance < zone["radius_km"]:
            return FraudAlert(
                type="LOCATION_FRAUD",
                reason=f"Harvest submitted from urban area: {zone['name']}. Wild herbs cannot be harvested from cities.",
                fraud_probability=94
            )
    return None

def check_seasonal_fraud(herb_name, collected_at: datetime) -> Optional[FraudAlert]:
    month = collected_at.month
    if herb_name not in HARVEST_SEASONS:
        return None
    season = HARVEST_SEASONS[herb_name]
    if month not in season["valid_months"]:
        return FraudAlert(
            type="SEASONAL_FRAUD",
            reason=f"{herb_name} cannot be harvested in month {month}. {season['reason']}",
            fraud_probability=91
        )
    return None

def check_visual_fraud(ai_confidence) -> Optional[FraudAlert]:
    if ai_confidence < 70:
        return FraudAlert(
            type="VISUAL_FRAUD",
            reason=f"AI confidence {ai_confidence}% is below 70% threshold. Possible species mismatch or image manipulation.",
            fraud_probability=78,
            action="MANDATORY_LAB_VERIFICATION"
        )
    return None

def run_fraud_detection(
    lat, lng, herb_name, collected_at, ai_confidence
) -> FraudDetectionResult:
    
    alerts = []
    
    loc = check_location_fraud(lat, lng)
    if loc: 
        alerts.append(loc)
        print(f"FRAUD DETECTED: {loc.type}")
    
    sea = check_seasonal_fraud(herb_name, collected_at)
    if sea: 
        alerts.append(sea)
        print(f"FRAUD DETECTED: {sea.type}")
    
    vis = check_visual_fraud(ai_confidence)
    if vis: 
        alerts.append(vis)
        print(f"FRAUD DETECTED: {vis.type}")
    
    if len(alerts) == 0:
        return FraudDetectionResult(
            alert_level="GREEN",
            trust_score=94,
            fraud_probability=0,
            status="pending",
            message="All AI checks passed",
            alerts=[]
        )
    elif len(alerts) == 1:
        return FraudDetectionResult(
            alert_level="YELLOW",
            trust_score=45,
            fraud_probability=alerts[0].fraud_probability,
            status="flagged",
            message="One anomaly detected - review required",
            alerts=alerts
        )
    else:
        max_prob = max(a.fraud_probability for a in alerts)
        return FraudDetectionResult(
            alert_level="RED",
            trust_score=0,
            fraud_probability=max_prob,
            status="rejected",
            message="Multiple fraud signals - batch auto rejected",
            alerts=alerts
        )
