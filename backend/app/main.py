from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .storage import ensure_directories_and_files, load_candidates, reset_demo_data
from .demo_generator import generate_demo_dataset
from .routes import (
    health,
    jobs,
    resumes,
    candidates,
    stats,
    export,
    demo,
    settings,
    sessions,
    audit,
    backup
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure directories and files exist
    ensure_directories_and_files()
    
    # Auto-seed demo dataset if candidate repository is empty
    current_candidates = load_candidates()
    if len(current_candidates) == 0:
        sample_job, demo_candidates = generate_demo_dataset()
        reset_demo_data(demo_candidates, sample_job)
        print("[TalentLens AI] Initialized synthetic demo candidates and sample job.")

    yield


app = FastAPI(
    title="TalentLens AI — Resume Screening and Candidate Ranking API",
    description="Local AI-powered resume screening platform with PyMuPDF text extraction, scikit-learn TF-IDF vectorization, screening sessions, and JSON persistence.",
    version="1.1.0",
    lifespan=lifespan
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under /api
app.include_router(health.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(candidates.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(backup.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(demo.router, prefix="/api")
app.include_router(settings.router, prefix="/api")


@app.get("/")
def root_redirect():
    return {
        "message": "TalentLens AI API is running.",
        "documentation": "/docs",
        "health_check": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
