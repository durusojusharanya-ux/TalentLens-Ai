from fastapi import APIRouter, HTTPException, Body, status
from typing import Dict, Any
from ..storage import create_system_backup, restore_system_backup

router = APIRouter(prefix="/backup", tags=["Backup"])


@router.get("")
def export_backup_snapshot():
    """
    Generate and download a validated complete JSON snapshot of the local database.
    """
    snapshot = create_system_backup()
    return snapshot


@router.post("/restore")
def restore_backup_snapshot(payload: Dict[str, Any] = Body(...)):
    """
    Restore local database from a verified JSON backup snapshot.
    Validates payload integrity before applying changes under thread lock.
    """
    success, message = restore_system_backup(payload)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    return {
        "status": "success",
        "message": message
    }
