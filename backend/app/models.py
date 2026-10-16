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
    job_id: str
    job_title: str
    similarity_score: float = 0.0
    required_skills_matched: List[str] = Field(default_factory=list)
    required_skills_missing: List[str] = Field(default_factory=list)
    preferred_skills_matched: List[str] = Field(default_factory=list)
    required_skill_coverage: float = 0.0
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


class AppSettings(BaseModel):
    score_threshold_strong: float = 70.0
    score_threshold_moderate: float = 40.0
    theme: str = "dark"
    max_upload_size_mb: int = 5
    max_batch_size: int = 20
    demo_mode_active: bool = True
