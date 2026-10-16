import csv
import io
from typing import Optional
from fastapi import APIRouter, Query, Response
from ..storage import load_candidates

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/csv")
def export_candidates_csv(
    shortlist_only: bool = Query(False, description="Filter only shortlisted candidates"),
    job_id: Optional[str] = Query(None, description="Filter by job ID")
):
    """
    Export candidate records to a properly formatted, downloadable CSV file.
    Uses UTF-8-sig encoding for seamless compatibility with Microsoft Excel on Windows.
    """
    candidates = load_candidates()

    if shortlist_only:
        candidates = [c for c in candidates if c.get("shortlist_status", False)]

    if job_id:
        candidates = [c for c in candidates if c.get("job_id") == job_id]

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    # Headers
    headers = [
        "Candidate ID",
        "Candidate Name",
        "Email",
        "Phone",
        "Job Title",
        "Similarity Score (%)",
        "Required Skill Coverage (%)",
        "Required Skills Matched",
        "Required Skills Missing",
        "Preferred Skills Matched",
        "Shortlist Status",
        "Screening Date",
        "Is Demo Data"
    ]
    writer.writerow(headers)

    for c in candidates:
        writer.writerow([
            c.get("id", ""),
            c.get("name", "Not detected"),
            c.get("email", "Not detected"),
            c.get("phone", "Not detected"),
            c.get("job_title", ""),
            c.get("similarity_score", 0.0),
            c.get("required_skill_coverage", 0.0),
            "; ".join(c.get("required_skills_matched", [])),
            "; ".join(c.get("required_skills_missing", [])),
            "; ".join(c.get("preferred_skills_matched", [])),
            "Shortlisted" if c.get("shortlist_status", False) else "Under Review",
            c.get("created_at", ""),
            "Yes" if c.get("is_demo", False) else "No"
        ])

    csv_data = output.getvalue()
    # UTF-8 BOM encoding for Windows Excel compatibility
    csv_bytes = csv_data.encode("utf-8-sig")

    filename = "talentlens_shortlist.csv" if shortlist_only else "talentlens_candidates.csv"

    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
