from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from ..models import (
    Candidate,
    CandidateShortlistUpdate,
    CandidateStageUpdate,
    CandidateInterviewUpdate,
    BulkShortlistRequest,
    CandidateCompareRequest
)
from ..storage import (
    load_candidates,
    get_candidate,
    update_candidate_shortlist,
    update_candidate_stage,
    update_candidate_interview,
    bulk_update_shortlist,
    delete_candidate
)

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("")
def list_candidates(
    search: Optional[str] = Query(None, description="Search by candidate name, email, or role"),
    job_id: Optional[str] = Query(None, description="Filter by job ID"),
    session_id: Optional[str] = Query(None, description="Filter by screening session ID"),
    shortlisted: Optional[bool] = Query(None, description="Filter by shortlist status"),
    stage: Optional[str] = Query(None, description="Filter by recruitment pipeline stage"),
    min_score: Optional[float] = Query(None, ge=0, le=100, description="Minimum similarity score"),
    max_score: Optional[float] = Query(None, ge=0, le=100, description="Maximum similarity score"),
    quick_view: Optional[str] = Query(None, description="Saved filter view: top_matches, missing_mandatory, shortlisted, under_review"),
    sort_by: str = Query("score", pattern="^(score|name|date|coverage)$"),
    order: str = Query("desc", pattern="^(asc|desc)$")
):
    """
    List candidates with search, filtering, session filtering, quick-views, and dynamic ranking.
    """
    candidates = load_candidates()

    # 1. Quick View Predefined Filters
    if quick_view == "top_matches":
        candidates = [c for c in candidates if c.get("similarity_score", 0.0) >= 70.0]
    elif quick_view == "missing_mandatory":
        candidates = [c for c in candidates if len(c.get("required_skills_missing", [])) > 0]
    elif quick_view == "shortlisted":
        candidates = [c for c in candidates if c.get("shortlist_status") is True]
    elif quick_view == "under_review":
        candidates = [c for c in candidates if c.get("shortlist_status") is False]

    # 2. Search Filter
    if search:
        s = search.strip().lower()
        candidates = [
            c for c in candidates
            if s in c.get("name", "").lower() or s in c.get("email", "").lower() or s in c.get("job_title", "").lower()
        ]

    # 3. Job ID Filter
    if job_id:
        candidates = [c for c in candidates if c.get("job_id") == job_id]

    # 4. Session ID Filter
    if session_id:
        candidates = [c for c in candidates if c.get("session_id") == session_id]

    # 5. Shortlist Filter
    if shortlisted is not None:
        candidates = [c for c in candidates if c.get("shortlist_status") == shortlisted]

    # 6. Pipeline Stage Filter
    if stage:
        candidates = [c for c in candidates if c.get("stage", "New").lower() == stage.lower()]

    # 6. Score Range Filters
    if min_score is not None:
        candidates = [c for c in candidates if c.get("similarity_score", 0.0) >= min_score]
    if max_score is not None:
        candidates = [c for c in candidates if c.get("similarity_score", 0.0) <= max_score]

    # 7. Sorting
    reverse = (order.lower() == "desc")
    if sort_by == "score":
        candidates.sort(key=lambda x: (x.get("similarity_score", 0.0), x.get("required_skill_coverage", 0.0)), reverse=reverse)
    elif sort_by == "name":
        candidates.sort(key=lambda x: x.get("name", "").lower(), reverse=reverse)
    elif sort_by == "date":
        candidates.sort(key=lambda x: x.get("created_at", ""), reverse=reverse)
    elif sort_by == "coverage":
        candidates.sort(key=lambda x: (x.get("required_skill_coverage", 0.0), x.get("similarity_score", 0.0)), reverse=reverse)

    # 8. Dynamic Rank
    ranked_candidates = []
    for rank, c in enumerate(candidates, start=1):
        c_copy = dict(c)
        c_copy["rank"] = rank
        ranked_candidates.append(c_copy)

    return ranked_candidates


@router.post("/compare")
def compare_candidates(body: CandidateCompareRequest):
    """
    Compare 2, 3, or 4 candidates side-by-side.
    Returns comparative metrics, skill matrices with evidence snippets, and experience breakdown.
    """
    if len(body.candidate_ids) < 2 or len(body.candidate_ids) > 4:
        raise HTTPException(
            status_code=400,
            detail="Comparison requires between 2 and 4 candidates."
        )

    candidates = []
    for cid in body.candidate_ids:
        cand = get_candidate(cid)
        if not cand:
            raise HTTPException(status_code=404, detail=f"Candidate '{cid}' not found.")
        candidates.append(cand)

    # Union of all skills across candidates
    all_req_skills = set()
    all_pref_skills = set()
    for c in candidates:
        for s in c.get("required_skills_matched", []) + c.get("required_skills_missing", []):
            all_req_skills.add(s)
        for s in c.get("preferred_skills_matched", []):
            all_pref_skills.add(s)

    # Build comparison matrix
    skill_matrix = []
    for skill in sorted(all_req_skills):
        item = {"skill": skill, "is_required": True, "candidates": {}}
        for c in candidates:
            has_skill = skill in c.get("required_skills_matched", [])
            evidence = c.get("evidence_snippets", {}).get(skill, "Not detected in extracted resume text.")
            item["candidates"][c["id"]] = {
                "matched": has_skill,
                "evidence": evidence
            }
        skill_matrix.append(item)

    for skill in sorted(all_pref_skills):
        item = {"skill": skill, "is_required": False, "candidates": {}}
        for c in candidates:
            has_skill = skill in c.get("preferred_skills_matched", [])
            evidence = c.get("evidence_snippets", {}).get(skill, "Not detected in extracted resume text.")
            item["candidates"][c["id"]] = {
                "matched": has_skill,
                "evidence": evidence
            }
        skill_matrix.append(item)

    return {
        "candidate_count": len(candidates),
        "candidates": candidates,
        "skill_matrix": skill_matrix
    }


@router.post("/bulk-shortlist")
def bulk_shortlist_endpoint(body: BulkShortlistRequest):
    """Bulk update shortlist status for multiple candidates."""
    count = bulk_update_shortlist(body.candidate_ids, body.shortlist_status)
    return {
        "status": "success",
        "updated_count": count,
        "shortlist_status": body.shortlist_status,
        "message": f"Successfully updated shortlist status for {count} candidates."
    }


@router.get("/{candidate_id}")
def get_candidate_details(candidate_id: str):
    """Get complete candidate details including extracted resume text and evidence snippets."""
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


@router.patch("/{candidate_id}/stage")
def update_stage_endpoint(candidate_id: str, body: CandidateStageUpdate):
    """Update recruitment pipeline stage (New, Reviewed, Shortlisted, Interview, Selected, Rejected)."""
    updated = update_candidate_stage(candidate_id, body.stage)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )
    return {
        "status": "success",
        "candidate_id": candidate_id,
        "stage": updated["stage"],
        "shortlist_status": updated.get("shortlist_status", False),
        "message": f"Candidate stage updated to '{updated['stage']}'."
    }


@router.patch("/{candidate_id}/interview")
def update_interview_endpoint(candidate_id: str, body: CandidateInterviewUpdate):
    """Update interview workspace details (date, status, interviewer, rating, feedback, next steps)."""
    updated = update_candidate_interview(candidate_id, body.model_dump())
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found."
        )
    return {
        "status": "success",
        "candidate_id": candidate_id,
        "stage": updated.get("stage", "New"),
        "interview_notes": updated.get("interview_notes", {}),
        "message": "Candidate interview evaluation notes updated successfully."
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
