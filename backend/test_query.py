from utils.auth_utils import create_access_token
from db.database import SessionLocal
from db.models import User
import requests

db = SessionLocal()
u = db.query(User).filter(User.role == 'lab').first()
if u:
    token = create_access_token({"user_id": u.id, "role": u.role})
    r = requests.get("http://localhost:8000/batches/pending", headers={"Authorization": f"Bearer {token}"})
    print(r.status_code)
    print(r.text[:500])
else:
    print("No lab user found")
db.close()
