from fastapi import FastAPI, Depends, HTTPException, Header
import os
import random
from datetime import datetime, timezone
from firebase_config import get_db
from quests_db import QUESTS

app = FastAPI(title="UsQuest Backend")

# We use a simple secret token to ensure only cron-job.org can trigger these endpoints.
CRON_SECRET = os.getenv("CRON_SECRET", "local-dev-secret-token")

def verify_cron_secret(x_cron_token: str = Header(None)):
    if x_cron_token != CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized. Invalid Cron Token.")
    return True

@app.get("/")
def read_root():
    return {"status": "ok", "app": "UsQuest Backend API"}

@app.post("/api/cron/daily", dependencies=[Depends(verify_cron_secret)])
async def trigger_daily_quest():
    """
    Called daily by a cron job (e.g., 8:00 AM).
    Selects a random daily quest and assigns it to all couples in the database.
    """
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    # Pick a random daily quest
    quest = random.choice(QUESTS["daily"])
    
    doc_ref = db.collection("global_quests").document()
    doc_ref.set({
        "quest_id": quest["id"],
        "title": quest["title"],
        "description": quest["description"],
        "type": quest["type"],
        "frequency": "daily",
        "assigned_at": datetime.now(timezone.utc),
        "expires_in_hours": 24
    })
    
    return {"status": "success", "quest": quest["title"]}


@app.post("/api/cron/weekly", dependencies=[Depends(verify_cron_secret)])
async def trigger_weekly_quest():
    """
    Called weekly by a cron job (e.g., Sunday 9:00 AM).
    Selects a random weekly quest and assigns it.
    """
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    quest = random.choice(QUESTS["weekly"])
    
    doc_ref = db.collection("global_quests").document()
    doc_ref.set({
        "quest_id": quest["id"],
        "title": quest["title"],
        "description": quest["description"],
        "type": quest["type"],
        "frequency": "weekly",
        "assigned_at": datetime.now(timezone.utc),
        "expires_in_hours": 24 * 7
    })
    
    return {"status": "success", "quest": quest["title"]}
