from fastapi import APIRouter
from ..demo_generator import generate_demo_dataset
from ..storage import reset_demo_data, load_candidates, save_candidates

router = APIRouter(prefix="/demo", tags=["Demo"])


@router.post("/reset")
def reset_demo_data_endpoint():
    """
    Reset or refresh the synthetic demo candidates using the real TF-IDF ML pipeline.
    Preserves all real uploaded candidate records.
    """
    sample_job, demo_candidates = generate_demo_dataset()
    count = reset_demo_data(demo_candidates, sample_job)
    return {
        "status": "success",
        "message": f"Successfully initialized {count} synthetic demo candidates scored using the screening pipeline.",
        "demo_count": count
    }


@router.delete("/clear")
def clear_demo_data_endpoint():
    """
    Remove synthetic demo candidates from the database while preserving all real uploads.
    """
    candidates = load_candidates()
    real_candidates = [c for c in candidates if not c.get("is_demo", False)]
    save_candidates(real_candidates)
    return {
        "status": "success",
        "message": "Demo candidates removed. Real uploaded records preserved.",
        "remaining_candidates": len(real_candidates)
    }
