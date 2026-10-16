import os
import io
import json
import pytest
import pymupdf as fitz
from fastapi.testclient import TestClient
from app.main import app
from app.storage import load_jobs, load_candidates, save_candidates, save_jobs
from app.screening_engine import (
    normalize_text,
    match_single_skill,
    compute_tf_idf_similarity,
    analyze_skills,
    screen_candidate
)
from app.resume_parser import (
    extract_text_from_pdf,
    extract_candidate_name,
    extract_candidate_email,
    extract_candidate_phone,
    extract_candidate_experience,
    parse_resume
)

client = TestClient(app)


def create_sample_pdf_bytes(text: str) -> bytes:
    """Helper to create a valid in-memory PDF using PyMuPDF."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text, fontsize=11)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "scikit_learn" in data["ml_libraries"]
    assert "pymupdf" in data["ml_libraries"]


def test_job_crud_and_validation():
    # 1. Invalid Job (missing description or too short)
    bad_res = client.post("/api/jobs", json={"title": "Dev", "description": "short"})
    assert bad_res.status_code == 422

    # 2. Valid Job Creation
    job_payload = {
        "title": "Backend Python Test Engineer",
        "department": "Engineering",
        "description": "Building high performance microservices with Python, FastAPI, Docker, and SQL.",
        "required_skills": ["Python", "FastAPI", "SQL"],
        "preferred_skills": ["Docker"],
        "min_experience_years": 1.0,
        "location": "Remote",
        "employment_type": "Full-time"
    }
    create_res = client.post("/api/jobs", json=job_payload)
    assert create_res.status_code == 201
    job_data = create_res.json()
    job_id = job_data["id"]
    assert job_data["title"] == "Backend Python Test Engineer"

    # 3. Retrieve Job
    get_res = client.get(f"/api/jobs/{job_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == job_id

    # 4. Update Job
    update_res = client.put(f"/api/jobs/{job_id}", json={"location": "Bangalore"})
    assert update_res.status_code == 200
    assert update_res.json()["location"] == "Bangalore"

    # 5. Delete Job
    del_res = client.delete(f"/api/jobs/{job_id}")
    assert del_res.status_code == 200


def test_pdf_extraction_and_heuristics():
    resume_content = (
        "Marcus Aurelius\n"
        "marcus.aurelius@rome.org | (555) 123-4567 | Rome, Italy\n"
        "Professional Software Engineer with 3+ years of experience in Python and machine learning.\n"
        "Experienced in PyTorch, scikit-learn, Git, Docker, and REST APIs.\n"
        "Demonstrated track record of delivering production software systems, data pipelines, and responsive tools."
    )
    pdf_bytes = create_sample_pdf_bytes(resume_content)

    text, warnings = extract_text_from_pdf(pdf_bytes)
    assert "Marcus Aurelius" in text
    assert len(warnings) == 0

    name = extract_candidate_name(text)
    assert name == "Marcus Aurelius"

    email = extract_candidate_email(text)
    assert email == "marcus.aurelius@rome.org"

    phone = extract_candidate_phone(text)
    assert "123-4567" in phone

    exp = extract_candidate_experience(text)
    assert "3+" in exp


def test_invalid_and_empty_pdf_handling():
    # Empty bytes
    parsed_empty = parse_resume(b"")
    assert parsed_empty["success"] is False

    # Corrupt PDF
    parsed_corrupt = parse_resume(b"Not a valid PDF at all")
    assert parsed_corrupt["success"] is False

    # Empty PDF with no text
    empty_doc = fitz.open()
    empty_doc.new_page()  # Page with no text
    empty_bytes = empty_doc.write()
    empty_doc.close()

    parsed_blank = parse_resume(empty_bytes)
    assert parsed_blank["success"] is False
    assert any("No selectable text was detected" in w for w in parsed_blank["warnings"])


def test_tfidf_and_skill_matching():
    job_desc = "We need a Senior Python Developer with deep experience in FastAPI, Docker, and PostgreSQL databases."
    resume_matched = (
        "Experienced Python Developer skilled in FastAPI, Docker containerization, "
        "and PostgreSQL backend architectures. Built scalable RESTful services."
    )
    resume_unrelated = (
        "Certified Floral Designer specializing in wedding floral arrangements, "
        "bouquet styling, and customer relations."
    )

    score_high, _ = compute_tf_idf_similarity(job_desc, resume_matched)
    score_low, _ = compute_tf_idf_similarity(job_desc, resume_unrelated)

    # High match should be substantially greater than low match
    assert score_high > score_low
    assert score_high > 10.0
    assert score_low < 5.0

    # Skill matching with aliases
    assert match_single_skill("python", "Proficient in Python and Flask.") is True
    assert match_single_skill("scikit-learn", "Used sklearn for random forest classification.") is True
    assert match_single_skill("c", "Experienced with C programming language.") is True
    # Boundary check: 'C' should NOT match 'CSS'
    assert match_single_skill("c", "Expertise in CSS and HTML.") is False
    # 'Java' should NOT match 'JavaScript'
    assert match_single_skill("java", "Frontend in JavaScript and React.") is False


def test_resume_upload_endpoint():
    # Create a job first
    job_res = client.post("/api/jobs", json={
        "title": "Machine Learning Engineer",
        "description": "Looking for ML specialist with PyTorch, scikit-learn, Python, and Git.",
        "required_skills": ["Python", "PyTorch", "scikit-learn", "Git"],
        "preferred_skills": ["Docker"]
    })
    job_id = job_res.json()["id"]

    # Valid candidate PDF
    cand_text = (
        "Elena Rostova\n"
        "elena.rostova@mlhub.ai\n"
        "Machine Learning Engineer with 2+ years of experience in Python, PyTorch, scikit-learn, and Git."
    )
    pdf_bytes = create_sample_pdf_bytes(cand_text)

    # Upload
    files = [
        ("files", ("elena_resume.pdf", pdf_bytes, "application/pdf")),
        ("files", ("corrupted_resume.pdf", b"corrupted data", "application/pdf"))
    ]
    data = {"job_id": job_id}

    res = client.post("/api/resumes/upload", data=data, files=files)
    assert res.status_code == 200
    res_json = res.json()
    assert res_json["total_files"] == 2
    assert res_json["successful_screenings"] == 1
    assert res_json["failed_screenings"] == 1

    valid_result = [r for r in res_json["results"] if r["success"]][0]
    candidate = valid_result["candidate"]
    assert candidate["name"] == "Elena Rostova"
    assert candidate["email"] == "elena.rostova@mlhub.ai"
    assert candidate["similarity_score"] > 0.0
    assert "Python" in candidate["required_skills_matched"]

    # Shortlist test
    cand_id = candidate["id"]
    patch_res = client.patch(f"/api/candidates/{cand_id}/shortlist", json={"shortlist_status": True})
    assert patch_res.status_code == 200
    assert patch_res.json()["shortlist_status"] is True

    # Candidate details test
    det_res = client.get(f"/api/candidates/{cand_id}")
    assert det_res.status_code == 200
    assert det_res.json()["name"] == "Elena Rostova"

    # CSV export test
    csv_res = client.get("/api/export/csv?shortlist_only=true")
    assert csv_res.status_code == 200
    assert "Elena Rostova" in csv_res.content.decode("utf-8-sig")

    # Candidate delete test & file cleanup
    del_res = client.delete(f"/api/candidates/{cand_id}")
    assert del_res.status_code == 200
    # Clean up test job
    client.delete(f"/api/jobs/{job_id}")


def test_demo_reset_preserves_real_records():
    # 1. Reset demo
    reset_res = client.post("/api/demo/reset")
    assert reset_res.status_code == 200

    # 2. Add a real candidate
    real_cand = {
        "id": "real-cand-999",
        "name": "Real Candidate John",
        "email": "john.real@test.org",
        "job_id": "job-sample-aiml-001",
        "job_title": "AI/ML Engineer Intern",
        "similarity_score": 50.0,
        "required_skills_matched": ["Python"],
        "required_skills_missing": ["PyTorch"],
        "preferred_skills_matched": [],
        "required_skill_coverage": 50.0,
        "explanation": "Test",
        "warnings": [],
        "extracted_text": "Sample text",
        "original_filename": "john_resume.pdf",
        "stored_filename": "",
        "shortlist_status": False,
        "is_demo": False,
        "created_at": "2026-10-16T12:00:00Z",
        "updated_at": "2026-10-16T12:00:00Z"
    }
    cands = load_candidates()
    cands.append(real_cand)
    save_candidates(cands)

    # 3. Reset demo again
    reset_res2 = client.post("/api/demo/reset")
    assert reset_res2.status_code == 200

    # 4. Verify Real candidate still exists!
    cands_after = load_candidates()
    assert any(c["id"] == "real-cand-999" for c in cands_after)

    # Cleanup test candidate
    client.delete("/api/candidates/real-cand-999")
