from fastapi import APIRouter
from typing import Dict, Any
from ..models import AppSettings
from ..storage import load_settings, save_settings, DATA_DIR, UPLOADS_DIR
import os

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("")
def get_settings():
    """Get current application settings, storage paths, and privacy information."""
    settings = load_settings()
    return {
        "settings": settings,
        "storage_info": {
            "data_directory": os.path.abspath(DATA_DIR),
            "uploads_directory": os.path.abspath(UPLOADS_DIR),
            "storage_type": "Local JSON files & Local filesystem PDF storage",
            "encryption": "Unencrypted local storage (Standard file permissions)"
        },
        "privacy_notice": {
            "local_execution": "All resume PDF text extraction and TF-IDF machine learning vectorization execute strictly on this local machine.",
            "zero_cloud_calls": "No external cloud AI APIs, external databases, or third-party tracking services are invoked.",
            "local_access_caution": "Files are stored locally in plain JSON and disk formats. Anyone with physical or shell access to this system can read stored data.",
            "production_notice": "Do not expose this instance over public networks without adding transport layer security (HTTPS), user authentication, and disk encryption."
        }
    }


@router.patch("")
def update_settings(updates: Dict[str, Any]):
    """Update configurable application settings."""
    current = load_settings()
    allowed_keys = {
        "score_threshold_strong",
        "score_threshold_moderate",
        "theme",
        "max_upload_size_mb",
        "max_batch_size",
        "demo_mode_active"
    }

    for k, v in updates.items():
        if k in allowed_keys and v is not None:
            current[k] = v

    save_settings(current)
    return {
        "status": "success",
        "settings": current,
        "message": "Settings saved successfully."
    }
