import os
import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from ..storage import get_job, create_candidate, UPLOADS_DIR, load_settings
from ..resume_parser import parse_resume
from ..screening_engine import screen_candidate

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload")
async def upload_resumes(
    job_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Accept multiple PDF resume uploads, extract text, run ML screening,
    save files to local uploads directory, and persist candidate records.
    """
    settings = load_settings()
    max_mb = settings.get("max_upload_size_mb", 5)
    max_bytes = max_mb * 1024 * 1024
    max_batch = settings.get("max_batch_size", 20)

    # 1. Validate Job Exists
    job = get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target job with ID '{job_id}' not found. Please select a valid job."
        )

    # 2. Validate Batch Size
    if len(files) == 0:
        raise HTTPException(status_code=400, detail="No files provided for upload.")

    if len(files) > max_batch:
        raise HTTPException(
            status_code=400,
            detail=f"Batch size exceeds maximum limit of {max_batch} files. You submitted {len(files)} files."
        )

    results = []
    processed_count = 0
    success_count = 0

    for file in files:
        processed_count += 1
        orig_name = file.filename or "unknown.pdf"

        # Check extension
        if not orig_name.lower().endswith(".pdf"):
            results.append({
                "filename": orig_name,
                "success": False,
                "error": "Invalid file format. Only PDF (.pdf) files are supported.",
                "candidate": None
            })
            continue

        # Read content
        try:
            content = await file.read()
        except Exception as e:
            results.append({
                "filename": orig_name,
                "success": False,
                "error": f"Failed to read file: {str(e)}",
                "candidate": None
            })
            continue

        # Validate file size
        if len(content) == 0:
            results.append({
                "filename": orig_name,
                "success": False,
                "error": "The uploaded PDF file is empty (0 bytes).",
                "candidate": None
            })
            continue

        if len(content) > max_bytes:
            results.append({
                "filename": orig_name,
                "success": False,
                "error": f"File exceeds maximum allowed size of {max_mb} MB.",
                "candidate": None
            })
            continue

        # Validate PDF header (%PDF-)
        if not content.startswith(b"%PDF-"):
            results.append({
                "filename": orig_name,
                "success": False,
                "error": "Corrupted or invalid PDF format. Missing standard PDF magic header.",
                "candidate": None
            })
            continue

        # Parse PDF text and metadata
        parsed = parse_resume(content)

        if not parsed.get("success", False) or not parsed.get("extracted_text", "").strip():
            # Handle scanned or unreadable PDF
            err_msg = parsed.get("warnings", ["Unable to extract selectable text from this PDF."])[0]
            results.append({
                "filename": orig_name,
                "success": False,
                "error": err_msg,
                "candidate": None
            })
            continue

        # Run real ML matching engine
        screening = screen_candidate(
            job_description=job.get("description", ""),
            required_skills=job.get("required_skills", []),
            preferred_skills=job.get("preferred_skills", []),
            resume_text=parsed["extracted_text"]
        )

        # Generate unique safe server-side filename
        cand_id = str(uuid.uuid4())
        safe_filename = f"cand_{cand_id}.pdf"
        save_path = os.path.join(UPLOADS_DIR, safe_filename)

        try:
            with open(save_path, "wb") as f_out:
                f_out.write(content)
        except Exception as e:
            results.append({
                "filename": orig_name,
                "success": False,
                "error": f"Failed to save upload locally: {str(e)}",
                "candidate": None
            })
            continue

        # Combine warnings
        combined_warnings = list(set(parsed.get("warnings", []) + screening.get("warnings", [])))

        now = datetime.utcnow().isoformat() + "Z"
        candidate_record = {
            "id": cand_id,
            "name": parsed["name"],
            "email": parsed["email"],
            "phone": parsed["phone"],
            "estimated_experience": parsed["estimated_experience"],
            "job_id": job["id"],
            "job_title": job["title"],
            "similarity_score": screening["similarity_score"],
            "required_skills_matched": screening["required_skills_matched"],
            "required_skills_missing": screening["required_skills_missing"],
            "preferred_skills_matched": screening["preferred_skills_matched"],
            "required_skill_coverage": screening["required_skill_coverage"],
            "explanation": screening["explanation"],
            "warnings": combined_warnings,
            "extracted_text": parsed["extracted_text"],
            "original_filename": orig_name,
            "stored_filename": safe_filename,
            "shortlist_status": False,
            "is_demo": False,
            "created_at": now,
            "updated_at": now
        }

        # Persist to local JSON storage
        create_candidate(candidate_record)
        success_count += 1

        results.append({
            "filename": orig_name,
            "success": True,
            "error": None,
            "candidate": candidate_record
        })

    return {
        "job_id": job["id"],
        "job_title": job["title"],
        "total_files": len(files),
        "successful_screenings": success_count,
        "failed_screenings": len(files) - success_count,
        "results": results
    }
