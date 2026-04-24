import requests
import json

url = "http://127.0.0.1:8000/submit-harvest"
data = {
    "herb_name": "Ashwagandha",
    "collector_name": "TestUser",
    "weight_kg": 5.5,
    "gps_lat": 12.3,
    "gps_lng": 76.4,
    "ai_confidence": 95.0
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
