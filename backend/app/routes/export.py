import csv
import io
from typing import Optional
from fastapi import APIRouter, Query, Response
from ..storage import load_candidates, load_jobs

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/csv")
def export_candidates_csv(
    shortlist_only: bool = Query(False, description="Filter only shortlisted candidates"),
    job_id: Optional[str] = Query(None, description="Filter by job ID"),
    stage: Optional[str] = Query(None, description="Filter by recruitment pipeline stage"),
    search: Optional[str] = Query(None, description="Filter by candidate search text"),
    min_score: Optional[float] = Query(None, description="Minimum similarity score"),
    max_score: Optional[float] = Query(None, description="Maximum similarity score"),
    is_demo: Optional[bool] = Query(None, description="Filter demo status")
):
    """
    Export candidate records to a properly formatted, downloadable CSV file.
    Supports comprehensive filtering (shortlist, job, stage, search, score range, demo status).
    Uses UTF-8-sig encoding for seamless compatibility with Microsoft Excel on Windows.
    """
    candidates = load_candidates()

    if shortlist_only:
        candidates = [c for c in candidates if c.get("shortlist_status", False)]

    if job_id:
        candidates = [c for c in candidates if c.get("job_id") == job_id]

    if stage:
        candidates = [c for c in candidates if c.get("stage", "New").lower() == stage.lower()]

    if search:
        s = search.strip().lower()
        candidates = [
            c for c in candidates
            if s in c.get("name", "").lower() or s in c.get("email", "").lower() or s in c.get("job_title", "").lower()
        ]

    if min_score is not None:
        candidates = [c for c in candidates if c.get("similarity_score", 0.0) >= min_score]

    if max_score is not None:
        candidates = [c for c in candidates if c.get("similarity_score", 0.0) <= max_score]

    if is_demo is not None:
        candidates = [c for c in candidates if c.get("is_demo", False) == is_demo]

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    # Headers
    headers = [
        "Candidate ID",
        "Candidate Name",
        "Email",
        "Phone",
        "Job Title",
        "Pipeline Stage",
        "Similarity Score (%)",
        "Required Skill Coverage (%)",
        "Estimated Education",
        "Estimated Experience",
        "Interview Status",
        "Lead Interviewer",
        "Interview Rating (1-5)",
        "Interview Feedback",
        "Recommended Next Steps",
        "Required Skills Matched",
        "Required Skills Missing",
        "Preferred Skills Matched",
        "Shortlist Status",
        "Screening Date",
        "Is Demo Data"
    ]
    writer.writerow(headers)

    for c in candidates:
        interview = c.get("interview_notes") or {}
        writer.writerow([
            c.get("id", ""),
            c.get("name", "Not detected"),
            c.get("email", "Not detected"),
            c.get("phone", "Not detected"),
            c.get("job_title", ""),
            c.get("stage", "New"),
            c.get("similarity_score", 0.0),
            c.get("required_skill_coverage", 0.0),
            c.get("estimated_education", "Not detected in extracted text"),
            c.get("estimated_experience", "Not detected"),
            interview.get("status", "Not Scheduled"),
            interview.get("interviewer", ""),
            interview.get("rating", ""),
            interview.get("feedback", ""),
            interview.get("next_steps", ""),
            "; ".join(c.get("required_skills_matched", [])),
            "; ".join(c.get("required_skills_missing", [])),
            "; ".join(c.get("preferred_skills_matched", [])),
            "Shortlisted" if c.get("shortlist_status", False) else "Under Review",
            c.get("created_at", ""),
            "Yes" if c.get("is_demo", False) else "No"
        ])

    csv_data = output.getvalue()
    csv_bytes = csv_data.encode("utf-8-sig")
    filename = "talentlens_shortlist.csv" if shortlist_only else "talentlens_candidates.csv"

    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/jobs/csv")
def export_jobs_csv():
    """
    Export all job benchmarks to a structured, downloadable CSV file.
    """
    jobs = load_jobs()
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    headers = [
        "Job ID",
        "Job Title",
        "Department",
        "Location",
        "Employment Type",
        "Min Experience (Years)",
        "Required Skills",
        "Preferred Skills",
        "Created Date"
    ]
    writer.writerow(headers)

    for j in jobs:
        writer.writerow([
            j.get("id", ""),
            j.get("title", ""),
            j.get("department", ""),
            j.get("location", "Remote"),
            j.get("employment_type", "Full-time"),
            j.get("min_experience_years", 0.0),
            "; ".join(j.get("required_skills", [])),
            "; ".join(j.get("preferred_skills", [])),
            j.get("created_at", "")
        ])

    csv_data = output.getvalue()
    csv_bytes = csv_data.encode("utf-8-sig")

    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="talentlens_jobs.csv"'
        }
    )
