from fastapi import APIRouter, Query
from typing import List, Optional, Dict, Any
from ..storage import load_audit_logs

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("")
def list_audit_trail(
    limit: int = Query(50, ge=1, le=200, description="Max events to return"),
    event_type: Optional[str] = Query(None, description="Filter by event type")
):
    """
    Retrieve historical audit events tracking upload, analysis, shortlist,
    deletion, and administrative actions.
    """
    logs = load_audit_logs()
    if event_type:
        logs = [e for e in logs if e.get("event_type") == event_type]
    return logs[:limit]
