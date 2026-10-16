from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from ..models import Job, JobCreate, JobUpdate
from ..storage import load_jobs, save_jobs, get_job, create_job, update_job, delete_job
import uuid
from datetime import datetime

router = APIRouter(prefix="/jobs", tags=["Jobs"])

SAMPLE_TEMPLATES = [
    {
        "id": "tpl-operations",
        "title": "Senior Operations & Strategy Lead",
        "department": "Business Operations",
        "description": "Seeking an experienced Operations & Strategy Lead to drive cross-functional initiatives, optimize business processes, and direct operational planning. Candidates must possess demonstrated strength in strategic planning, project management, data-driven decision making, executive stakeholder communication, risk assessment, and performance metrics tracking. Experience leading organizational transformation and budget oversight is preferred.",
        "required_skills": ["Strategic Planning", "Project Management", "Operations Management", "Data Analysis", "Leadership", "Process Optimization", "Cross-Functional Collaboration", "Risk Assessment"],
        "preferred_skills": ["Budget Management", "Change Management", "Stakeholder Relations", "Performance Metrics"],
        "min_experience_years": 3.0,
        "location": "Bengaluru / Hybrid",
        "employment_type": "Full-time"
    },
    {
        "id": "tpl-product",
        "title": "Senior Product Manager",
        "department": "Product Strategy",
        "description": "Looking for a seasoned Product Manager to lead product discovery, define roadmaps, and synthesize user feedback into actionable milestones. Requires proven mastery of product strategy, user research, agile delivery, qualitative & quantitative analysis, and cross-team alignment. Strong communication and market research capabilities are essential.",
        "required_skills": ["Product Strategy", "User Research", "Agile Methodology", "Roadmap Planning", "Data Analysis", "Stakeholder Management", "Market Analysis"],
        "preferred_skills": ["Feature Prioritization", "A/B Testing", "Customer Journey", "Executive Presentations"],
        "min_experience_years": 3.5,
        "location": "Remote",
        "employment_type": "Full-time"
    },
    {
        "id": "tpl-talent",
        "title": "Talent Acquisition & People Operations Specialist",
        "department": "Human Resources",
        "description": "Searching for a People Operations Specialist to oversee full-lifecycle talent recruitment, candidate evaluation, interview assessments, and organizational culture. Strong background in candidate screening, structured interviewing, HR compliance, employer branding, and workforce planning is expected.",
        "required_skills": ["Talent Sourcing", "Interview Assessment", "Candidate Screening", "HR Compliance", "Employee Relations", "Communication", "Workforce Planning"],
        "preferred_skills": ["Onboarding", "Employer Branding", "Negotiation", "Retention Strategies"],
        "min_experience_years": 2.0,
        "location": "Hybrid",
        "employment_type": "Full-time"
    },
    {
        "id": "tpl-finance",
        "title": "Financial & Business Analyst",
        "department": "Finance & Analytics",
        "description": "Seeking a thorough Financial & Business Analyst to conduct financial forecasting, variance analysis, reporting, and strategic modeling. Requires deep competence in numerical analysis, business reporting, forecasting models, variance audits, and data synthesis.",
        "required_skills": ["Financial Modeling", "Data Analysis", "Forecasting", "Variance Analysis", "Reporting", "Critical Thinking", "Quantitative Research"],
        "preferred_skills": ["Market Research", "Valuation", "Risk Analysis", "Strategic Insights"],
        "min_experience_years": 2.0,
        "location": "Bengaluru",
        "employment_type": "Full-time"
    },
    {
        "id": "tpl-client-success",
        "title": "Client Success & Account Director",
        "department": "Client Relations",
        "description": "We are hiring an Account Director to champion client retention, executive relationships, and customer satisfaction. Core competencies include strategic communication, account governance, problem solving, contract renewal, and team leadership.",
        "required_skills": ["Account Management", "Client Retention", "Strategic Communication", "Problem Solving", "Customer Satisfaction", "Team Leadership", "Contract Negotiation"],
        "preferred_skills": ["Executive Presentations", "Customer Onboarding", "Cross-Selling", "Value Realization"],
        "min_experience_years": 4.0,
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
