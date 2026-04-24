import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    res = conn.execute(text("SELECT id, herb_name, status, collector_name FROM batches ORDER BY created_at DESC"))
    batches = [dict(row._mapping) for row in res]
    print(f"Total batches: {len(batches)}")
    for b in batches:
        print(b)
