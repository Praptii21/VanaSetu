# VenaSetu (VanaLedger)

Blockchain-based traceability platform for India's Ayurvedic supply chain.

## Structure

- `backend/`: FastAPI backend with mock blockchain and AI classifier.
- `frontend/`: React + Vite web dashboard for manufacturers, labs, and consumers.
- `android/`: Kotlin mobile app for wild collectors.
- `dataset/`: Training/testing images for the AI classifier.

## Tech Stack
- **Backend:** FastAPI, Python, PostgreSQL, SHA256 Hashing.
- **Frontend:** React, Vite, Framer Motion, Leaflet.
- **Mobile:** Kotlin, Retrofit.

## Quick Setup

To install all dependencies (Python and Node.js) at once, run:
```powershell
./setup.ps1
```

### Manual Installation

**Backend:**
```bash
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```
