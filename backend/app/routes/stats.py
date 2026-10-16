from fastapi import APIRouter
from collections import Counter
from typing import Dict, Any, List
from ..storage import load_candidates, load_jobs, load_settings

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("")
def get_dashboard_statistics():
    """
    Calculate KPIs and chart metrics from actual persisted candidate and job records.
    Never hardcodes production statistics.
    """
    candidates = load_candidates()
    jobs = load_jobs()
    settings = load_settings()

    total_candidates = len(candidates)
    shortlisted_candidates = sum(1 for c in candidates if c.get("shortlist_status", False))
    demo_count = sum(1 for c in candidates if c.get("is_demo", False))

    if total_candidates > 0:
        scores = [c.get("similarity_score", 0.0) for c in candidates]
        avg_score = round(sum(scores) / total_candidates, 1)
        max_score = round(max(scores), 1)
    else:
        avg_score = 0.0
        max_score = 0.0

    # 1. Score Distribution (5 bins)
    distribution = [
        {"range": "0-20%", "count": 0, "label": "0-20%"},
        {"range": "21-40%", "count": 0, "label": "21-40%"},
        {"range": "41-60%", "count": 0, "label": "41-60%"},
        {"range": "61-80%", "count": 0, "label": "61-80%"},
        {"range": "81-100%", "count": 0, "label": "81-100%"}
    ]

    for c in candidates:
        s = c.get("similarity_score", 0.0)
        if s <= 20.0:
            distribution[0]["count"] += 1
        elif s <= 40.0:
            distribution[1]["count"] += 1
        elif s <= 60.0:
            distribution[2]["count"] += 1
        elif s <= 80.0:
            distribution[3]["count"] += 1
        else:
            distribution[4]["count"] += 1

    # 2. Status Breakdown
    under_review = total_candidates - shortlisted_candidates
    status_breakdown = [
        {"name": "Shortlisted", "value": shortlisted_candidates, "color": "#10B981"},
        {"name": "Under Review", "value": under_review, "color": "#6366F1"}
    ]

    # 3. Frequently Matched Skills
    matched_counter = Counter()
    missing_counter = Counter()

    for c in candidates:
        for skill in c.get("required_skills_matched", []):
            matched_counter[skill] += 1
        for skill in c.get("required_skills_missing", []):
            missing_counter[skill] += 1

    top_matched_skills = [
        {"skill": skill, "count": count}
        for skill, count in matched_counter.most_common(7)
    ]
    top_missing_skills = [
        {"skill": skill, "count": count}
        for skill, count in missing_counter.most_common(7)
    ]

    # 4. Recent Screening Activity
    sorted_recent = sorted(candidates, key=lambda x: x.get("created_at", ""), reverse=True)
    recent_activity = [
        {
            "id": c.get("id"),
            "name": c.get("name", "Unknown"),
            "job_title": c.get("job_title", "Unknown Role"),
            "similarity_score": c.get("similarity_score", 0.0),
            "shortlist_status": c.get("shortlist_status", False),
            "created_at": c.get("created_at"),
            "is_demo": c.get("is_demo", False)
        }
        for c in sorted_recent[:6]
    ]

    return {
        "total_resumes": total_candidates,
        "analyzed_candidates": total_candidates,
        "shortlisted_candidates": shortlisted_candidates,
        "avg_match_score": avg_score,
        "highest_match_score": max_score,
        "saved_jobs_count": len(jobs),
        "score_distribution": distribution,
        "status_breakdown": status_breakdown,
        "top_matched_skills": top_matched_skills,
        "top_missing_skills": top_missing_skills,
        "recent_activity": recent_activity,
        "is_demo_mode": demo_count > 0,
        "demo_count": demo_count
    }
