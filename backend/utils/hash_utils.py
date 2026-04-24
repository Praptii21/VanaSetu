import hashlib
from datetime import datetime

def generate_hash(*args) -> str:
    """Generate a short SHA256 hex hash from any number of string arguments."""
    raw = "".join(str(a) for a in args) + datetime.utcnow().isoformat()
    return "0x" + hashlib.sha256(raw.encode()).hexdigest()[:16]
