import json
import os
import threading
import uuid
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

# Resolve base paths relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

JOBS_FILE = os.path.join(DATA_DIR, "jobs.json")
CANDIDATES_FILE = os.path.join(DATA_DIR, "candidates.json")
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")
SETTINGS_FILE = os.path.join(DATA_DIR, "settings.json")
AUDIT_FILE = os.path.join(DATA_DIR, "audit_logs.json")

_lock = threading.RLock()


def ensure_directories_and_files():
    """Ensure data and uploads directories and valid JSON files exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(UPLOADS_DIR, exist_ok=True)

    defaults = {
        JOBS_FILE: "[]",
        CANDIDATES_FILE: "[]",
        SESSIONS_FILE: "[]",
        AUDIT_FILE: "[]",
        SETTINGS_FILE: json.dumps({
            "score_threshold_strong": 70.0,
            "score_threshold_moderate": 40.0,
            "theme": "ivory",
            "layout": "command",
            "max_upload_size_mb": 5,
            "max_batch_size": 20,
            "demo_mode_active": True
        }, indent=2)
    }

    for filepath, default_content in defaults.items():
        if not os.path.exists(filepath):
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(default_content)
        else:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if not content:
                        with open(filepath, "w", encoding="utf-8") as f_fix:
                            f_fix.write(default_content)
                    else:
                        json.loads(content)
            except Exception:
                with open(filepath, "w", encoding="utf-8") as f_fix:
                    f_fix.write(default_content)


ensure_directories_and_files()


def _read_json(filepath: str, default: Any) -> Any:
    with _lock:
        try:
            if not os.path.exists(filepath):
                return default
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default


def _write_json(filepath: str, data: Any) -> bool:
    with _lock:
        try:
            temp_path = f"{filepath}.tmp"
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            os.replace(temp_path, filepath)
            return True
        except Exception as e:
            print(f"Error writing to {filepath}: {e}")
            return False


# --- Jobs ---
def load_jobs() -> List[Dict[str, Any]]:
    return _read_json(JOBS_FILE, [])


def save_jobs(jobs: List[Dict[str, Any]]) -> bool:
    return _write_json(JOBS_FILE, jobs)


def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    jobs = load_jobs()
    for job in jobs:
        if job.get("id") == job_id:
            return job
    return None


def create_job(job_data: Dict[str, Any]) -> Dict[str, Any]:
    with _lock:
        jobs = load_jobs()
        jobs.append(job_data)
        save_jobs(jobs)
        record_audit_event(
            event_type="create_job",
            description=f"Created job benchmark '{job_data.get('title')}'",
            job_id=job_data.get("id"),
            job_title=job_data.get("title")
        )
        return job_data


def update_job(job_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    with _lock:
        jobs = load_jobs()
        for idx, job in enumerate(jobs):
            if job.get("id") == job_id:
                for k, v in updates.items():
                    if v is not None:
                        job[k] = v
                job["updated_at"] = datetime.utcnow().isoformat() + "Z"
                jobs[idx] = job
                save_jobs(jobs)
                record_audit_event(
                    event_type="update_job",
                    description=f"Updated job benchmark '{job.get('title')}'",
                    job_id=job_id,
                    job_title=job.get("title")
                )
                return job
    return None


def delete_job(job_id: str) -> bool:
    with _lock:
        jobs = load_jobs()
        target = None
        new_jobs = []
        for j in jobs:
            if j.get("id") == job_id:
                target = j
            else:
                new_jobs.append(j)

        if target is not None:
            save_jobs(new_jobs)
            record_audit_event(
                event_type="delete_job",
                description=f"Deleted job benchmark '{target.get('title')}'",
                job_id=job_id,
                job_title=target.get("title")
            )
            return True
    return False


# --- Candidates ---
def load_candidates() -> List[Dict[str, Any]]:
    return _read_json(CANDIDATES_FILE, [])


def save_candidates(candidates: List[Dict[str, Any]]) -> bool:
    return _write_json(CANDIDATES_FILE, candidates)


def get_candidate(candidate_id: str) -> Optional[Dict[str, Any]]:
    candidates = load_candidates()
    for cand in candidates:
        if cand.get("id") == candidate_id:
            return cand
    return None


def create_candidate(candidate_data: Dict[str, Any]) -> Dict[str, Any]:
    with _lock:
        candidates = load_candidates()
        candidates.append(candidate_data)
        save_candidates(candidates)
        record_audit_event(
            event_type="analysis",
            description=f"Ingested and analyzed resume for '{candidate_data.get('name')}' (Score: {candidate_data.get('similarity_score')}%)",
            candidate_id=candidate_data.get("id"),
            candidate_name=candidate_data.get("name"),
            job_id=candidate_data.get("job_id"),
            job_title=candidate_data.get("job_title"),
            session_id=candidate_data.get("session_id")
        )
        return candidate_data


def update_candidate_shortlist(candidate_id: str, shortlist_status: bool) -> Optional[Dict[str, Any]]:
    with _lock:
        candidates = load_candidates()
        for idx, cand in enumerate(candidates):
            if cand.get("id") == candidate_id:
                cand["shortlist_status"] = shortlist_status
                cand["updated_at"] = datetime.utcnow().isoformat() + "Z"
                candidates[idx] = cand
                save_candidates(candidates)
                ev_type = "shortlist" if shortlist_status else "unshortlist"
                record_audit_event(
                    event_type=ev_type,
                    description=f"{'Added to' if shortlist_status else 'Removed from'} shortlist: '{cand.get('name')}'",
                    candidate_id=candidate_id,
                    candidate_name=cand.get("name"),
                    job_id=cand.get("job_id"),
                    job_title=cand.get("job_title"),
                    session_id=cand.get("session_id")
                )
                return cand
    return None


def bulk_update_shortlist(candidate_ids: List[str], shortlist_status: bool) -> int:
    with _lock:
        candidates = load_candidates()
        count = 0
        id_set = set(candidate_ids)
        for idx, cand in enumerate(candidates):
            if cand.get("id") in id_set:
                cand["shortlist_status"] = shortlist_status
                cand["updated_at"] = datetime.utcnow().isoformat() + "Z"
                candidates[idx] = cand
                count += 1

        if count > 0:
            save_candidates(candidates)
            record_audit_event(
                event_type="bulk_shortlist",
                description=f"Bulk {'shortlisted' if shortlist_status else 'unshortlisted'} {count} candidates",
                metadata={"count": count, "shortlist_status": shortlist_status}
            )
        return count


def update_candidate_stage(candidate_id: str, stage: str) -> Optional[Dict[str, Any]]:
    valid_stages = {"New", "Reviewed", "Shortlisted", "Interview", "Selected", "Rejected"}
    normalized_stage = stage if stage in valid_stages else "Reviewed"
    with _lock:
        candidates = load_candidates()
        for idx, cand in enumerate(candidates):
            if cand.get("id") == candidate_id:
                old_stage = cand.get("stage", "New")
                cand["stage"] = normalized_stage
                if normalized_stage == "Shortlisted":
                    cand["shortlist_status"] = True
                elif normalized_stage == "Rejected":
                    cand["shortlist_status"] = False
                cand["updated_at"] = datetime.utcnow().isoformat() + "Z"
                candidates[idx] = cand
                save_candidates(candidates)
                record_audit_event(
                    event_type="update_stage",
                    description=f"Moved candidate '{cand.get('name')}' from stage '{old_stage}' to '{normalized_stage}'",
                    candidate_id=candidate_id,
                    candidate_name=cand.get("name"),
                    job_id=cand.get("job_id"),
                    job_title=cand.get("job_title"),
                    session_id=cand.get("session_id"),
                    metadata={"from_stage": old_stage, "to_stage": normalized_stage}
                )
                return cand
    return None


def update_candidate_interview(candidate_id: str, interview_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    with _lock:
        candidates = load_candidates()
        for idx, cand in enumerate(candidates):
            if cand.get("id") == candidate_id:
                current_interview = cand.get("interview_notes") or {}
                updated_interview = {
                    **current_interview,
                    **interview_data,
                    "updated_at": datetime.utcnow().isoformat() + "Z"
                }
                cand["interview_notes"] = updated_interview
                # If interview is scheduled, advance stage to Interview if currently New or Reviewed
                if updated_interview.get("status") in ("Scheduled", "Completed") and cand.get("stage") in ("New", "Reviewed"):
                    cand["stage"] = "Interview"
                cand["updated_at"] = datetime.utcnow().isoformat() + "Z"
                candidates[idx] = cand
                save_candidates(candidates)
                record_audit_event(
                    event_type="update_interview",
                    description=f"Updated interview evaluation notes for '{cand.get('name')}': status={updated_interview.get('status')}",
                    candidate_id=candidate_id,
                    candidate_name=cand.get("name"),
                    job_id=cand.get("job_id"),
                    job_title=cand.get("job_title"),
                    session_id=cand.get("session_id")
                )
                return cand
    return None


def delete_candidate(candidate_id: str) -> bool:
    with _lock:
        candidates = load_candidates()
        target = None
        remaining = []
        for cand in candidates:
            if cand.get("id") == candidate_id:
                target = cand
            else:
                remaining.append(cand)

        if target is not None:
            save_candidates(remaining)
            stored_filename = target.get("stored_filename")
            if stored_filename:
                delete_uploaded_file(stored_filename)
            record_audit_event(
                event_type="delete_candidate",
                description=f"Deleted candidate record and upload for '{target.get('name')}'",
                candidate_id=candidate_id,
                candidate_name=target.get("name"),
                job_id=target.get("job_id"),
                job_title=target.get("job_title")
            )
            return True
    return False


def delete_uploaded_file(filename: str) -> bool:
    """Safely delete uploaded file ensuring no path traversal."""
    if not filename:
        return False
    clean_name = os.path.basename(filename)
    file_path = os.path.join(UPLOADS_DIR, clean_name)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Error removing uploaded file {file_path}: {e}")
    return False


# --- Screening Sessions ---
def load_sessions() -> List[Dict[str, Any]]:
    return _read_json(SESSIONS_FILE, [])


def save_sessions(sessions: List[Dict[str, Any]]) -> bool:
    return _write_json(SESSIONS_FILE, sessions)


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    sessions = load_sessions()
    for s in sessions:
        if s.get("id") == session_id:
            return s
    return None


def create_session(session_data: Dict[str, Any]) -> Dict[str, Any]:
    with _lock:
        sessions = load_sessions()
        sessions.insert(0, session_data)
        save_sessions(sessions)
        record_audit_event(
            event_type="create_session",
            description=f"Created screening session '{session_data.get('name')}' for job '{session_data.get('job_title')}'",
            session_id=session_data.get("id"),
            job_id=session_data.get("job_id"),
            job_title=session_data.get("job_title")
        )
        return session_data


def update_session(session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    with _lock:
        sessions = load_sessions()
        for idx, s in enumerate(sessions):
            if s.get("id") == session_id:
                for k, v in updates.items():
                    s[k] = v
                s["updated_at"] = datetime.utcnow().isoformat() + "Z"
                sessions[idx] = s
                save_sessions(sessions)
                return s
    return None


def delete_session(session_id: str) -> bool:
    with _lock:
        sessions = load_sessions()
        new_sessions = [s for s in sessions if s.get("id") != session_id]
        if len(new_sessions) < len(sessions):
            save_sessions(new_sessions)
            record_audit_event(
                event_type="delete_session",
                description=f"Deleted screening session '{session_id}'",
                session_id=session_id
            )
            return True
    return False


# --- Audit Logs ---
def load_audit_logs() -> List[Dict[str, Any]]:
    return _read_json(AUDIT_FILE, [])


def save_audit_logs(logs: List[Dict[str, Any]]) -> bool:
    return _write_json(AUDIT_FILE, logs)


def record_audit_event(
    event_type: str,
    description: str,
    candidate_id: Optional[str] = None,
    candidate_name: Optional[str] = None,
    job_id: Optional[str] = None,
    job_title: Optional[str] = None,
    session_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    with _lock:
        logs = load_audit_logs()
        event = {
            "id": str(uuid.uuid4()),
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "job_id": job_id,
            "job_title": job_title,
            "session_id": session_id,
            "description": description,
            "metadata": metadata or {}
        }
        logs.insert(0, event)
        # Keep recent 200 events to prevent boundless growth
        if len(logs) > 200:
            logs = logs[:200]
        save_audit_logs(logs)
        return event


# --- Demo Data Management ---
def reset_demo_data(demo_candidates: List[Dict[str, Any]], sample_job: Optional[Dict[str, Any]] = None):
    with _lock:
        if sample_job:
            jobs = load_jobs()
            job_exists = any(j.get("id") == sample_job.get("id") for j in jobs)
            if not job_exists:
                jobs.insert(0, sample_job)
                save_jobs(jobs)

        candidates = load_candidates()
        real_candidates = [c for c in candidates if not c.get("is_demo", False)]
        combined = real_candidates + demo_candidates
        save_candidates(combined)

        record_audit_event(
            event_type="reset_demo",
            description=f"Refreshed synthetic demo cohort ({len(demo_candidates)} candidates) with real ML scores. Real candidate records preserved."
        )
        return len(demo_candidates)


# --- Settings ---
def load_settings() -> Dict[str, Any]:
    return _read_json(SETTINGS_FILE, {
        "score_threshold_strong": 70.0,
        "score_threshold_moderate": 40.0,
        "theme": "ivory",
        "layout": "command",
        "max_upload_size_mb": 5,
        "max_batch_size": 20,
        "demo_mode_active": True
    })


def save_settings(settings: Dict[str, Any]) -> bool:
    return _write_json(SETTINGS_FILE, settings)


# --- Backup & Restore ---
def create_system_backup() -> Dict[str, Any]:
    """Create a validated JSON snapshot of the local database."""
    with _lock:
        return {
            "app": "TalentLens AI",
            "version": "1.1.0",
            "created_at": datetime.utcnow().isoformat() + "Z",
            "jobs": load_jobs(),
            "candidates": load_candidates(),
            "sessions": load_sessions(),
            "audit_logs": load_audit_logs(),
            "settings": load_settings()
        }


def restore_system_backup(backup_data: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate and restore application data from a backup snapshot."""
    with _lock:
        if not isinstance(backup_data, dict):
            return False, "Invalid backup payload: expected JSON object."

        # Validate structure
        jobs = backup_data.get("jobs")
        candidates = backup_data.get("candidates")
        sessions = backup_data.get("sessions")
        settings = backup_data.get("settings")

        if not isinstance(jobs, list) or not isinstance(candidates, list):
            return False, "Validation failure: 'jobs' and 'candidates' arrays must be present in backup."

        # Validate each job
        for idx, job in enumerate(jobs):
            if not isinstance(job, dict):
                return False, f"Validation failure: Job at index {idx} must be an object."
            if not job.get("id") or not isinstance(job.get("id"), str):
                return False, f"Validation failure: Job at index {idx} is missing a valid 'id'."
            if not job.get("title") or not isinstance(job.get("title"), str):
                return False, f"Validation failure: Job at index {idx} is missing a valid 'title'."

        # Validate each candidate
        for idx, cand in enumerate(candidates):
            if not isinstance(cand, dict):
                return False, f"Validation failure: Candidate at index {idx} must be an object."
            if not cand.get("id") or not isinstance(cand.get("id"), str):
                return False, f"Validation failure: Candidate at index {idx} is missing a valid 'id'."
            if not cand.get("name") or not isinstance(cand.get("name"), str):
                return False, f"Validation failure: Candidate at index {idx} is missing a valid 'name'."
            if "similarity_score" in cand and not isinstance(cand.get("similarity_score"), (int, float)):
                return False, f"Validation failure: Candidate '{cand.get('name')}' has non-numeric similarity_score."

        # Validate settings if present
        if settings is not None and not isinstance(settings, dict):
            return False, "Validation failure: 'settings' must be an object."

        save_jobs(jobs)
        save_candidates(candidates)
        if isinstance(sessions, list):
            save_sessions(sessions)
        if isinstance(settings, dict):
            save_settings(settings)
        if "audit_logs" in backup_data and isinstance(backup_data["audit_logs"], list):
            save_audit_logs(backup_data["audit_logs"])

        record_audit_event(
            event_type="restore_backup",
            description=f"Restored system backup containing {len(candidates)} candidates and {len(jobs)} jobs.",
            metadata={"candidate_count": len(candidates), "job_count": len(jobs)}
        )
        return True, f"Successfully restored {len(candidates)} candidates and {len(jobs)} jobs."
