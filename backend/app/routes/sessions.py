from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from ..models import ScreeningSession, ScreeningSessionCreate
from ..storage import (
    load_sessions,
    get_session,
    create_session,
    delete_session,
    get_job,
    load_candidates
)
import uuid
from datetime import datetime

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.get("", response_model=List[ScreeningSession])
def list_screening_sessions():
    """List all saved screening sessions."""
    return load_sessions()


@router.post("", response_model=ScreeningSession, status_code=status.HTTP_201_CREATED)
def create_new_session(session_in: ScreeningSessionCreate):
    """Create a new screening session preserving the target job criteria snapshot."""
    job = get_job(session_in.job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID '{session_in.job_id}' not found.")

    new_id = f"sess-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat() + "Z"

    record = {
        "id": new_id,
        "name": session_in.name.strip(),
        "job_id": job["id"],
        "job_title": job["title"],
        "job_snapshot": {
            "title": job.get("title"),
            "department": job.get("department"),
            "description": job.get("description"),
            "required_skills": job.get("required_skills", []),
            "preferred_skills": job.get("preferred_skills", [])
        },
        "candidate_ids": [],
        "candidate_count": 0,
        "avg_score": 0.0,
        "created_at": now,
        "updated_at": now
    }

    created = create_session(record)
    return created


@router.get("/{session_id}")
def get_session_details(session_id: str):
    """Get screening session details and its associated candidate list."""
    sess = get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail=f"Session with ID '{session_id}' not found.")

    all_cands = load_candidates()
    session_candidates = [c for c in all_cands if c.get("session_id") == session_id or c.get("id") in sess.get("candidate_ids", [])]

    return {
        "session": sess,
        "candidates": session_candidates
    }


@router.delete("/{session_id}")
def delete_screening_session(session_id: str):
    """Delete a screening session."""
    deleted = delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Session with ID '{session_id}' not found.")
    return {"status": "success", "message": f"Session '{session_id}' deleted successfully."}
