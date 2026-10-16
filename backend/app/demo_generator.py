from typing import List, Dict, Any, Tuple
from .models import Job, Candidate
from .screening_engine import screen_candidate
from .resume_parser import extract_candidate_name, extract_candidate_email, extract_candidate_phone, extract_candidate_experience
from datetime import datetime
import uuid


SAMPLE_JOB_DATA = {
    "id": "job-sample-aiml-001",
    "title": "Senior Operations & Strategy Lead",
    "department": "Business Operations",
    "description": (
        "We are looking for an ambitious Operations & Strategy Lead to drive cross-functional initiatives, optimize business processes, "
        "and direct operational planning. The ideal candidate has demonstrated experience in Strategic Planning, Project Management, "
        "Operations Management, Data Analysis, Leadership, and Process Optimization. You will collaborate on workflow automation, "
        "manage stakeholder expectations, direct risk assessments, and establish performance metrics."
    ),
    "required_skills": [
        "Strategic Planning",
        "Project Management",
        "Operations Management",
        "Data Analysis",
        "Leadership",
        "Process Optimization",
        "Risk Assessment",
        "Stakeholder Management"
    ],
    "preferred_skills": [
        "Budget Management",
        "Change Management",
        "Market Research",
        "Performance Metrics"
    ],
    "min_experience_years": 3.0,
    "location": "Bengaluru / Hybrid",
    "employment_type": "Full-time"
}


DEMO_RESUMES = [
    {
        "name": "Aria Vance",
        "email": "aria.vance@example.edu",
        "phone": "+1 (555) 234-5678",
        "text": """Aria Vance
aria.vance@example.edu | +1 (555) 234-5678 | San Francisco, CA

SUMMARY
Experienced Operations and Strategy Lead with 4+ years of experience directing organizational initiatives and operational excellence.
Proven expertise in Strategic Planning, Project Management, Operations Management, Data Analysis, Leadership, and Process Optimization.

EDUCATION
M.B.A. in Operations & Strategy, Expected May 2026
B.S. in Business Administration, 2022

CORE COMPETENCIES
Strategic Management: Strategic Planning, Project Management, Operations Management, Change Management
Analysis & Metrics: Data Analysis, Risk Assessment, Performance Metrics, Market Research
Leadership & Alignment: Leadership, Stakeholder Management, Budget Management, Cross-Functional Collaboration

PROJECTS & EXPERIENCE
Senior Operations Lead (2024 - Present)
- Spearheaded enterprise-wide Strategic Planning and Project Management across multi-functional business units.
- Conducted quantitative Data Analysis to identify workflow bottlenecks, driving a 32% efficiency improvement.
- Directed Risk Assessment audits and established transparent KPI Performance Metrics for leadership.
- Managed Stakeholder Management communications and oversaw continuous Process Optimization initiatives.""",
    },
    {
        "name": "Liam Chen",
        "email": "liam.chen@devmail.org",
        "phone": "+1 (555) 876-5432",
        "text": """Liam Chen
liam.chen@devmail.org | +1 (555) 876-5432 | Seattle, WA

PROFESSIONAL SUMMARY
Operations Director with 3+ years of experience managing business operations, project delivery, and team leadership.
Demonstrated competence in Strategic Planning, Project Management, Operations Management, and Leadership.

EDUCATION
B.S. in Management & Business Operations, 2024

PROFESSIONAL EXPERTISE
Operations: Strategic Planning, Project Management, Operations Management, Leadership
Governance: Stakeholder Management, Budget Management, Change Management, Team Coordination

EXPERIENCE
Operations Project Lead | CloudTech Enterprise (2024 - 2026)
- Directed cross-functional teams in executing strategic Project Management and Operations Management initiatives.
- Championed team Leadership and conducted regular Stakeholder Management reviews with executive sponsors.
- Oversaw Budget Management allocations and implemented departmental Change Management procedures.""",
    },
    {
        "name": "Sophia Patel",
        "email": "sophia.patel@datahub.net",
        "phone": "+1 (555) 345-6789",
        "text": """Sophia Patel
sophia.patel@datahub.net | +1 (555) 345-6789 | Chicago, IL

OBJECTIVE
Analytical and detail-oriented Operations Analyst with 2+ years of experience transforming business processes through data-driven insights.
Strong command of Data Analysis, Process Optimization, Risk Assessment, and Performance Metrics.

EDUCATION
B.S. in Economics & Business Analytics, 2025

CORE COMPETENCIES
Business Analysis: Data Analysis, Process Optimization, Risk Assessment, Market Research
Operational Governance: Performance Metrics, Stakeholder Management, Reporting, Strategic Planning

EXPERIENCE
Business Operations Analyst | Horizon Analytics (2024 - 2025)
- Performed rigorous Data Analysis and financial modeling to support Strategic Planning.
- Identified operational bottlenecks and implemented automated Process Optimization workflows.
- Synthesized weekly Risk Assessment reports and tracked Performance Metrics dashboards for leadership.
- Conducted targeted Market Research to evaluate competitor capabilities and customer satisfaction.""",
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
            "evidence_snippets": results.get("evidence_snippets", {}),
            "session_id": "session-demo-001",
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
