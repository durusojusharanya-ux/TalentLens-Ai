from typing import List, Dict, Any, Tuple
from .models import Job, Candidate
from .screening_engine import screen_candidate
from .resume_parser import extract_candidate_name, extract_candidate_email, extract_candidate_phone, extract_candidate_experience
from datetime import datetime
import uuid


SAMPLE_JOB_DATA = {
    "id": "job-sample-aiml-001",
    "title": "AI/ML Engineer Intern",
    "department": "AI Research & Development",
    "description": (
        "We are looking for an ambitious AI/ML Engineer Intern to build, fine-tune, and evaluate machine learning models. "
        "The ideal candidate has hands-on experience with Python, scikit-learn, PyTorch or TensorFlow, Machine Learning fundamentals, "
        "and data manipulation libraries such as Pandas and NumPy. You will collaborate on natural language processing pipelines, "
        "integrate models with REST APIs, and apply Git for version control. Exposure to FastAPI and Docker is a strong plus."
    ),
    "required_skills": [
        "Python",
        "Machine Learning",
        "scikit-learn",
        "PyTorch",
        "Pandas",
        "NumPy",
        "Git",
        "REST APIs"
    ],
    "preferred_skills": [
        "FastAPI",
        "Docker",
        "Deep Learning",
        "Natural Language Processing"
    ],
    "min_experience_years": 0.5,
    "location": "Bengaluru / Hybrid",
    "employment_type": "Internship"
}


DEMO_RESUMES = [
    {
        "name": "Aria Vance",
        "email": "aria.vance@example.edu",
        "phone": "+1 (555) 234-5678",
        "text": """Aria Vance
aria.vance@example.edu | +1 (555) 234-5678 | San Francisco, CA

SUMMARY
Passionate Artificial Intelligence student with 1+ years of experience training and evaluating machine learning models. 
Proven expertise in Python, PyTorch, scikit-learn, Pandas, and NumPy for NLP and predictive modeling.

EDUCATION
B.S. in Computer Science (AI Track), Expected May 2026

TECHNICAL SKILLS
Languages: Python, C++, SQL
ML Frameworks: PyTorch, scikit-learn, TensorFlow, Hugging Face
Libraries: Pandas, NumPy, Matplotlib, SciPy
Tools & Concepts: Git, Docker, REST APIs, Deep Learning, Natural Language Processing, Machine Learning

PROJECTS & EXPERIENCE
AI Research Assistant (2025 - Present)
- Trained transformer-based NLP classification models with PyTorch and Hugging Face, achieving 91% F1-score.
- Conducted exploratory data analysis and feature engineering on tabular datasets using Pandas, NumPy, and scikit-learn.
- Built automated evaluation pipelines and integrated model inference endpoints using REST APIs and Git for versioning.
- Experimented with deep learning architectures and hyperparameter tuning.""",
    },
    {
        "name": "Liam Chen",
        "email": "liam.chen@devmail.org",
        "phone": "+1 (555) 876-5432",
        "text": """Liam Chen
liam.chen@devmail.org | +1 (555) 876-5432 | Seattle, WA

PROFESSIONAL SUMMARY
Full-Stack Software Engineer with 2+ years of experience developing responsive web applications and backend microservices.
Proficient in TypeScript, React, Python, FastAPI, Node.js, and Docker containerization.

EDUCATION
B.S. in Software Engineering, Graduated 2025

TECHNICAL EXPERTISE
Frontend: React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS
Backend: Python, FastAPI, Node.js, Express, REST APIs
Database & DevOps: PostgreSQL, SQL, Docker, Git, CI/CD, Linux
ML Familiarity: Basic Python data analysis with Pandas, introductory Machine Learning concepts

EXPERIENCE
Junior Full-Stack Developer | CloudTech Solutions (2024 - 2026)
- Designed and maintained REST APIs using Python FastAPI and PostgreSQL.
- Implemented responsive frontend dashboards using React and TypeScript.
- Containerized microservices using Docker and automated deployments via Git CI/CD pipelines.
- Integrated third-party analytics APIs and optimized database queries.""",
    },
    {
        "name": "Sophia Patel",
        "email": "sophia.patel@datahub.net",
        "phone": "+1 (555) 345-6789",
        "text": """Sophia Patel
sophia.patel@datahub.net | +1 (555) 345-6789 | Chicago, IL

OBJECTIVE
Analytical and detail-oriented Data Analyst with 1.5+ years of experience transforming raw enterprise datasets into actionable insights.
Strong command of SQL, Python, Pandas, NumPy, and Tableau dashboards.

EDUCATION
B.S. in Statistics & Data Analytics, 2025

CORE COMPETENCIES
Analysis & BI: Data Analysis, Exploratory Data Analysis, Tableau, Power BI, Excel
Programming: Python, SQL, R
Data Processing: Pandas, NumPy, Data Cleaning, Data Visualization
Collaboration: Git, Agile, Business Communication

EXPERIENCE
Data Analyst Intern | Horizon Analytics (2024 - 2025)
- Wrote complex SQL queries across relational databases to extract business KPI metrics.
- Utilized Python, Pandas, and NumPy for automated data cleansing and statistical analysis.
- Created interactive BI dashboards in Tableau for executive stakeholders.
- Collaborated using Git version control and presented weekly insights to management.""",
    }
]


def generate_demo_dataset() -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Generate synthetic demo job and candidates.
    Calculates similarity scores using the REAL ML PIPELINE against the sample job.
    """
    sample_job = dict(SAMPLE_JOB_DATA)
    sample_job["created_at"] = datetime.utcnow().isoformat() + "Z"
    sample_job["updated_at"] = datetime.utcnow().isoformat() + "Z"

    demo_candidates = []
    for cand in DEMO_RESUMES:
        # Run real ML pipeline
        results = screen_candidate(
            job_description=sample_job["description"],
            required_skills=sample_job["required_skills"],
            preferred_skills=sample_job["preferred_skills"],
            resume_text=cand["text"]
        )

        cand_id = f"demo-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow().isoformat() + "Z"

        record = {
            "id": cand_id,
            "name": cand["name"],
            "email": cand["email"],
            "phone": cand["phone"],
            "estimated_experience": extract_candidate_experience(cand["text"]),
            "job_id": sample_job["id"],
            "job_title": sample_job["title"],
            "similarity_score": results["similarity_score"],
            "required_skills_matched": results["required_skills_matched"],
            "required_skills_missing": results["required_skills_missing"],
            "preferred_skills_matched": results["preferred_skills_matched"],
            "required_skill_coverage": results["required_skill_coverage"],
            "explanation": results["explanation"],
            "warnings": results["warnings"],
            "extracted_text": cand["text"],
            "original_filename": f"{cand['name'].lower().replace(' ', '_')}_synthetic_demo_resume.pdf",
            "stored_filename": f"demo_{cand_id}.pdf",
            "shortlist_status": (results["similarity_score"] >= 60.0 or results["required_skill_coverage"] >= 75.0),
            "is_demo": True,
            "created_at": now,
            "updated_at": now
        }
        demo_candidates.append(record)

    # Sort descending by real similarity score
    demo_candidates.sort(key=lambda x: (x["similarity_score"], x["required_skill_coverage"]), reverse=True)
    return sample_job, demo_candidates
