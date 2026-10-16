from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from ..models import Job, JobCreate, JobUpdate
from ..storage import load_jobs, save_jobs, get_job, create_job, update_job, delete_job
import uuid
from datetime import datetime

router = APIRouter(prefix="/jobs", tags=["Jobs"])

SAMPLE_TEMPLATES = [
    {
        "id": "tpl-aiml",
        "title": "AI/ML Engineer Intern",
        "department": "AI Research",
        "description": "Seeking an AI/ML Intern with hands-on experience in machine learning algorithms, deep learning, PyTorch or TensorFlow, scikit-learn, and Python. Experience with data preprocessing using Pandas and NumPy, model evaluation, and REST APIs is required. Familiarity with FastAPI and Docker is a bonus.",
        "required_skills": ["Python", "Machine Learning", "scikit-learn", "PyTorch", "Pandas", "NumPy", "Git", "REST APIs"],
        "preferred_skills": ["FastAPI", "Docker", "Deep Learning", "Natural Language Processing"],
        "min_experience_years": 0.5,
        "location": "Bengaluru / Hybrid",
        "employment_type": "Internship"
    },
    {
        "id": "tpl-python",
        "title": "Python Developer",
        "department": "Backend Engineering",
        "description": "Looking for a Python Developer skilled in developing backend services, APIs, and data pipelines. Strong background in Python, FastAPI or Flask, SQL databases, Git, Docker, and RESTful architectures. Knowledge of test-driven development and asynchronous programming preferred.",
        "required_skills": ["Python", "FastAPI", "SQL", "Git", "REST APIs", "Docker"],
        "preferred_skills": ["Flask", "PostgreSQL", "CI/CD", "Redis"],
        "min_experience_years": 1.0,
        "location": "Remote",
        "employment_type": "Full-time"
    },
    {
        "id": "tpl-fullstack",
        "title": "Full-Stack Developer",
        "department": "Product Engineering",
        "description": "Seeking a Full-Stack Developer to build responsive user interfaces and robust web APIs. Must be proficient in React, TypeScript, JavaScript, HTML, CSS, and modern backend frameworks like Node.js or Python FastAPI. Experience with relational databases and Docker is preferred.",
        "required_skills": ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Python", "REST APIs", "Git"],
        "preferred_skills": ["FastAPI", "Docker", "PostgreSQL", "Tailwind CSS"],
        "min_experience_years": 1.5,
        "location": "Hybrid",
        "employment_type": "Full-time"
    },
    {
        "id": "tpl-data-analyst",
        "title": "Data Analyst",
        "department": "Business Intelligence",
        "description": "Searching for a Data Analyst to extract, analyze, and visualize complex datasets. Strong experience with SQL, Python, Pandas, NumPy, and statistical analysis is essential. Ability to translate business problems into data-driven solutions and clear visualizations.",
        "required_skills": ["SQL", "Python", "Pandas", "NumPy", "Data Analysis", "Git"],
        "preferred_skills": ["Tableau", "Power BI", "Statistics", "Machine Learning"],
        "min_experience_years": 1.0,
        "location": "Bengaluru",
        "employment_type": "Full-time"
    },
    {
        "id": "tpl-frontend",
        "title": "Frontend Developer",
        "department": "Web Engineering",
        "description": "We are hiring a Frontend Developer experienced in building modern, performant web applications. Core competencies include React, TypeScript, JavaScript, HTML5, CSS3, responsive design, and state management. Experience integrating REST APIs and UI component libraries is expected.",
        "required_skills": ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Git", "REST APIs"],
        "preferred_skills": ["Tailwind CSS", "Next.js", "Redux", "Figma"],
        "min_experience_years": 1.0,
        "location": "Remote",
        "employment_type": "Full-time"
    }
]


@router.get("/templates")
def get_job_templates():
    """Return pre-configured sample job templates."""
    return SAMPLE_TEMPLATES


@router.get("", response_model=List[Job])
def list_jobs():
    """List all saved jobs."""
    return load_jobs()


@router.post("", response_model=Job, status_code=status.HTTP_201_CREATED)
def create_new_job(job_in: JobCreate):
    """Create a new job description."""
    new_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    job_record = {
        "id": new_id,
        "title": job_in.title.strip(),
        "department": job_in.department.strip(),
        "description": job_in.description.strip(),
        "required_skills": [s.strip() for s in job_in.required_skills if s.strip()],
        "preferred_skills": [s.strip() for s in job_in.preferred_skills if s.strip()],
        "min_experience_years": job_in.min_experience_years or 0.0,
        "location": job_in.location.strip() if job_in.location else "Remote",
        "employment_type": job_in.employment_type.strip() if job_in.employment_type else "Full-time",
        "created_at": now,
        "updated_at": now
    }

    created = create_job(job_record)
    return created


@router.get("/{job_id}", response_model=Job)
def get_job_by_id(job_id: str):
    """Get single job details or 404."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID '{job_id}' not found.")
    return job


@router.put("/{job_id}", response_model=Job)
def update_existing_job(job_id: str, updates: JobUpdate):
    """Update job fields."""
    existing = get_job(job_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Job with ID '{job_id}' not found.")

    update_dict = updates.model_dump(exclude_unset=True)
    if "required_skills" in update_dict and update_dict["required_skills"]:
        update_dict["required_skills"] = [s.strip() for s in update_dict["required_skills"] if s.strip()]
    if "preferred_skills" in update_dict and update_dict["preferred_skills"]:
        update_dict["preferred_skills"] = [s.strip() for s in update_dict["preferred_skills"] if s.strip()]

    updated = update_job(job_id, update_dict)
    return updated


@router.delete("/{job_id}")
def delete_existing_job(job_id: str):
    """Delete job by ID."""
    success = delete_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Job with ID '{job_id}' not found.")
    return {"status": "success", "message": f"Job '{job_id}' deleted successfully."}
