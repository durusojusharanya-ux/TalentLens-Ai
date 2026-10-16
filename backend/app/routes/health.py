from fastapi import APIRouter
import sklearn
import pymupdf

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "TalentLens AI Screening Engine",
        "version": "1.0.0",
        "ml_libraries": {
            "scikit_learn": sklearn.__version__,
            "pymupdf": pymupdf.__version__
        },
        "storage": "Local JSON persistence"
    }
