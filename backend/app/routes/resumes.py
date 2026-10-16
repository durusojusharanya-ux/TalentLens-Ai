import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from ..storage import (
    get_job,
    create_candidate,
    UPLOADS_DIR,
    load_settings,
    create_session,
    get_session,
    update_session,
    record_audit_event
)
from ..resume_parser import parse_resume
from ..screening_engine import screen_candidate

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload")
async def upload_resumes(
    job_id: str = Form(...),
    session_id: Optional[str] = Form(None),
    files: List[UploadFile] = File(...)
):
    """
    Accept multiple PDF resume uploads, extract text, run ML screening,
    save files to local uploads directory, associate with screening session,
    and persist candidate records.
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

    # 3. Resolve or Create Screening Session
    active_session_id = session_id
    if active_session_id:
        existing_sess = get_session(active_session_id)
        if not existing_sess:
            active_session_id = None

    if not active_session_id:
        # Create fresh session for this screening run
        date_str = datetime.utcnow().strftime("%b %d, %Y %H:%M")
        new_sess_id = f"sess-{uuid.uuid4().hex[:8]}"
        create_session({
            "id": new_sess_id,
            "name": f"{job['title']} Screening ({date_str})",
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
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        })
        active_session_id = new_sess_id

    results = []
    processed_count = 0
    success_count = 0
    created_candidate_ids = []
    scores_accum = []

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
            "session_id": active_session_id,
            "similarity_score": screening["similarity_score"],
            "required_skills_matched": screening["required_skills_matched"],
            "required_skills_missing": screening["required_skills_missing"],
            "preferred_skills_matched": screening["preferred_skills_matched"],
            "evidence_snippets": screening.get("evidence_snippets", {}),
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

        create_candidate(candidate_record)
        success_count += 1
        created_candidate_ids.append(cand_id)
        scores_accum.append(screening["similarity_score"])

        results.append({
            "filename": orig_name,
            "success": True,
            "error": None,
            "candidate": candidate_record
        })

    # Update session metrics
    if active_session_id and created_candidate_ids:
        sess = get_session(active_session_id)
        if sess:
            updated_ids = list(set(sess.get("candidate_ids", []) + created_candidate_ids))
            avg = sum(scores_accum) / len(scores_accum) if scores_accum else 0.0
            update_session(active_session_id, {
                "candidate_ids": updated_ids,
                "candidate_count": len(updated_ids),
                "avg_score": round(avg, 1)
            })

    record_audit_event(
        event_type="upload_batch",
        description=f"Batch screened {len(files)} files for role '{job['title']}' ({success_count} succeeded, {len(files) - success_count} failed)",
        job_id=job["id"],
        job_title=job["title"],
        session_id=active_session_id,
        metadata={"total_files": len(files), "succeeded": success_count}
    )

    return {
        "job_id": job["id"],
        "job_title": job["title"],
        "session_id": active_session_id,
        "total_files": len(files),
        "successful_screenings": success_count,
        "failed_screenings": len(files) - success_count,
        "results": results
    }
