from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from ..models import Candidate, CandidateShortlistUpdate
from ..storage import load_candidates, get_candidate, update_candidate_shortlist, delete_candidate

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("")
def list_candidates(
    search: Optional[str] = Query(None, description="Search by candidate name or email"),
    job_id: Optional[str] = Query(None, description="Filter by job ID"),
    shortlisted: Optional[bool] = Query(None, description="Filter by shortlist status"),
    min_score: Optional[float] = Query(None, ge=0, le=100, description="Minimum similarity score"),
    max_score: Optional[float] = Query(None, ge=0, le=100, description="Maximum similarity score"),
    sort_by: str = Query("score", pattern="^(score|name|date|coverage)$"),
    order: str = Query("desc", pattern="^(asc|desc)$")
):
    """
    List candidates with search, filtering, sorting, and dynamic ranking.
    """
    candidates = load_candidates()

    # 1. Search Filter
    if search:
        s = search.strip().lower()
        candidates = [
            c for c in candidates
            if s in c.get("name", "").lower() or s in c.get("email", "").lower() or s in c.get("job_title", "").lower()
        ]

    # 2. Job ID Filter
    if job_id:
        candidates = [c for c in candidates if c.get("job_id") == job_id]

    # 3. Shortlist Filter
    if shortlisted is not None:
        candidates = [c for c in candidates if c.get("shortlist_status") == shortlisted]

    # 4. Score Range Filters
    if min_score is not None:
        candidates = [c for c in candidates if c.get("similarity_score", 0.0) >= min_score]
    if max_score is not None:
        candidates = [c for c in candidates if c.get("similarity_score", 0.0) <= max_score]

    # 5. Sorting
    reverse = (order.lower() == "desc")
    if sort_by == "score":
        candidates.sort(key=lambda x: (x.get("similarity_score", 0.0), x.get("required_skill_coverage", 0.0)), reverse=reverse)
    elif sort_by == "name":
        candidates.sort(key=lambda x: x.get("name", "").lower(), reverse=reverse)
    elif sort_by == "date":
        candidates.sort(key=lambda x: x.get("created_at", ""), reverse=reverse)
    elif sort_by == "coverage":
        candidates.sort(key=lambda x: (x.get("required_skill_coverage", 0.0), x.get("similarity_score", 0.0)), reverse=reverse)

    # 6. Assign dynamic rank based on final ordering
    ranked_candidates = []
    for rank, c in enumerate(candidates, start=1):
        c_copy = dict(c)
        c_copy["rank"] = rank
        ranked_candidates.append(c_copy)

    return ranked_candidates


@router.get("/{candidate_id}")
def get_candidate_details(candidate_id: str):
    """Get complete candidate details including extracted resume text."""
    candidate = get_candidate(candidate_id)
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )
    return candidate


@router.patch("/{candidate_id}/shortlist")
def update_shortlist_status(candidate_id: str, body: CandidateShortlistUpdate):
    """Toggle candidate shortlist status and persist to JSON storage."""
    updated = update_candidate_shortlist(candidate_id, body.shortlist_status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )
    return {
        "status": "success",
        "candidate_id": candidate_id,
        "shortlist_status": updated["shortlist_status"],
        "message": f"Shortlist status updated to {updated['shortlist_status']}."
    }


@router.delete("/{candidate_id}")
def delete_candidate_record(candidate_id: str):
    """Delete candidate from JSON storage and remove associated upload file."""
    deleted = delete_candidate(candidate_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )
    return {
        "status": "success",
        "candidate_id": candidate_id,
        "message": "Candidate record and associated PDF file deleted successfully."
    }
