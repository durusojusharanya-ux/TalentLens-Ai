from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid


class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    department: str = Field(default="Engineering", max_length=100)
    description: str = Field(..., min_length=10)
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    min_experience_years: Optional[float] = Field(default=0.0, ge=0)
    location: Optional[str] = Field(default="Remote")
    employment_type: str = Field(default="Full-time")


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    min_experience_years: Optional[float] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None


class Job(JobBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class CandidateBase(BaseModel):
    name: str = "Not detected"
    email: str = "Not detected"
    phone: Optional[str] = "Not detected"
    estimated_experience: Optional[str] = "Not detected"
    estimated_education: Optional[str] = "Not detected in extracted text"
    job_id: str
    job_title: str
    session_id: Optional[str] = None
    stage: str = "New"  # New, Reviewed, Shortlisted, Interview, Selected, Rejected
    similarity_score: float = 0.0
    required_skills_matched: List[str] = Field(default_factory=list)
    required_skills_missing: List[str] = Field(default_factory=list)
    preferred_skills_matched: List[str] = Field(default_factory=list)
    evidence_snippets: Dict[str, str] = Field(default_factory=dict)
    required_skill_coverage: float = 0.0
    interview_notes: Dict[str, Any] = Field(default_factory=lambda: {
        "scheduled_date": None,
        "status": "Not Scheduled",
        "interviewer": "",
        "rating": None,
        "notes": "",
        "feedback": "",
        "next_steps": "",
        "updated_at": None
    })
    explanation: str = ""
    warnings: List[str] = Field(default_factory=list)
    extracted_text: str = ""
    original_filename: str = ""
    stored_filename: str = ""
    shortlist_status: bool = False
    is_demo: bool = False


class Candidate(CandidateBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class CandidateShortlistUpdate(BaseModel):
    shortlist_status: bool


class CandidateStageUpdate(BaseModel):
    stage: str


class CandidateInterviewUpdate(BaseModel):
    scheduled_date: Optional[str] = None
    status: Optional[str] = "Not Scheduled"
    interviewer: Optional[str] = ""
    rating: Optional[int] = None
    notes: Optional[str] = ""
    feedback: Optional[str] = ""
    next_steps: Optional[str] = ""


class BulkShortlistRequest(BaseModel):
    candidate_ids: List[str]
    shortlist_status: bool


class CandidateCompareRequest(BaseModel):
    candidate_ids: List[str]


class ScreeningSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    job_id: str
    job_title: str
    job_snapshot: Dict[str, Any] = Field(default_factory=dict)
    candidate_ids: List[str] = Field(default_factory=list)
    candidate_count: int = 0
    avg_score: float = 0.0
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class ScreeningSessionCreate(BaseModel):
    name: str
    job_id: str


class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str  # upload, analysis, shortlist, unshortlist, delete_candidate, create_job, delete_job, create_session, restore_backup
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    candidate_id: Optional[str] = None
    candidate_name: Optional[str] = None
    job_id: Optional[str] = None
    job_title: Optional[str] = None
    session_id: Optional[str] = None
    description: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AppSettings(BaseModel):
    score_threshold_strong: float = 70.0
    score_threshold_moderate: float = 40.0
    theme: str = "ivory"
    layout: str = "command"
    max_upload_size_mb: int = 5
    max_batch_size: int = 20
    demo_mode_active: bool = True
