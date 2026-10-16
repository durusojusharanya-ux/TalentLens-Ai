import json
import os
import threading
from typing import List, Dict, Any, Optional
from datetime import datetime

# Resolve base paths relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

JOBS_FILE = os.path.join(DATA_DIR, "jobs.json")
CANDIDATES_FILE = os.path.join(DATA_DIR, "candidates.json")
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")
SETTINGS_FILE = os.path.join(DATA_DIR, "settings.json")

_lock = threading.RLock()


def ensure_directories_and_files():
    """Ensure data and uploads directories and valid JSON files exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(UPLOADS_DIR, exist_ok=True)

    defaults = {
        JOBS_FILE: "[]",
        CANDIDATES_FILE: "[]",
        SESSIONS_FILE: "[]",
        SETTINGS_FILE: json.dumps({
            "score_threshold_strong": 70.0,
            "score_threshold_moderate": 40.0,
            "theme": "dark",
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
            # Check if file is empty or corrupted
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
                return job
    return None


def delete_job(job_id: str) -> bool:
    with _lock:
        jobs = load_jobs()
        new_jobs = [j for j in jobs if j.get("id") != job_id]
        if len(new_jobs) < len(jobs):
            save_jobs(new_jobs)
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
            # Delete associated file safely
            stored_filename = target.get("stored_filename")
            if stored_filename:
                delete_uploaded_file(stored_filename)
            return True
    return False


def delete_uploaded_file(filename: str) -> bool:
    """Safely delete uploaded file ensuring no path traversal."""
    if not filename:
        return False
    # Avoid directory traversal
    clean_name = os.path.basename(filename)
    file_path = os.path.join(UPLOADS_DIR, clean_name)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Error removing uploaded file {file_path}: {e}")
    return False


# --- Demo Data Management ---
def reset_demo_data(demo_candidates: List[Dict[str, Any]], sample_job: Optional[Dict[str, Any]] = None):
    """
    Reset demo dataset while preserving all real uploaded candidates.
    If sample_job is provided, ensure it exists in jobs.
    """
    with _lock:
        # 1. Update jobs if sample job provided
        if sample_job:
            jobs = load_jobs()
            job_exists = any(j.get("id") == sample_job.get("id") for j in jobs)
            if not job_exists:
                jobs.insert(0, sample_job)
                save_jobs(jobs)

        # 2. Filter candidates: keep real uploads (is_demo == False)
        candidates = load_candidates()
        real_candidates = [c for c in candidates if not c.get("is_demo", False)]
        combined = real_candidates + demo_candidates
        save_candidates(combined)
        return len(demo_candidates)


# --- Settings ---
def load_settings() -> Dict[str, Any]:
    return _read_json(SETTINGS_FILE, {
        "score_threshold_strong": 70.0,
        "score_threshold_moderate": 40.0,
        "theme": "dark",
        "max_upload_size_mb": 5,
        "max_batch_size": 20,
        "demo_mode_active": True
    })


def save_settings(settings: Dict[str, Any]) -> bool:
    return _write_json(SETTINGS_FILE, settings)
