import os
import io
import json
import pytest
import pymupdf as fitz
from fastapi.testclient import TestClient
from app.main import app
from app.storage import (
    load_jobs,
    load_candidates,
    save_candidates,
    save_jobs,
    load_sessions,
    load_audit_logs,
    create_system_backup,
    restore_system_backup
)
from app.screening_engine import (
    normalize_text,
    match_single_skill,
    compute_tf_idf_similarity,
    analyze_skills,
    screen_candidate,
    extract_skill_evidence,
    METHODOLOGY_EXPLANATION,
    DISCLAIMER_NOTICE
)
from app.resume_parser import (
    extract_text_from_pdf,
    extract_candidate_name,
    extract_candidate_email,
    extract_candidate_phone,
    extract_candidate_experience,
    extract_candidate_education,
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


def test_evidence_snippet_extraction_and_disclaimer():
    """Verify genuine text snippet extraction without hallucinating facts."""
    resume_body = (
        "Senior Cloud Architect\n"
        "Engineered scalable microservices using FastAPI and Docker containers across AWS ECS.\n"
        "Optimized complex PostgreSQL queries resulting in 40% latency reduction.\n"
        "Lead developer with 6+ years experience in enterprise systems."
    )
    
    # Matched skill returns authentic line from text
    snippet_fastapi = extract_skill_evidence("FastAPI", resume_body)
    assert "FastAPI" in snippet_fastapi
    assert "Engineered scalable microservices" in snippet_fastapi

    snippet_postgres = extract_skill_evidence("PostgreSQL", resume_body)
    assert "PostgreSQL" in snippet_postgres

    # Unmatched skill returns explicit not-detected message
    snippet_unmatched = extract_skill_evidence("Kubernetes", "")
    assert "Not detected" in snippet_unmatched

    # Disclaimer and methodology explanations are defined
    assert "decision-support" in DISCLAIMER_NOTICE.lower()
    assert "TF-IDF" in METHODOLOGY_EXPLANATION
    assert "Not detected" in METHODOLOGY_EXPLANATION


def test_screening_sessions_workflow():
    """Verify session creation, job snapshot preservation, and retrieval."""
    # 1. Create a Job
    job_res = client.post("/api/jobs", json={
        "title": "Staff Platform Engineer",
        "description": "Looking for Go and Kubernetes infrastructure specialists.",
        "required_skills": ["Go", "Kubernetes"],
        "preferred_skills": ["Terraform"]
    })
    job_id = job_res.json()["id"]

    # 2. Create Screening Session
    sess_res = client.post("/api/sessions", json={
        "name": "Q4 Staff Infra Hiring Round",
        "job_id": job_id
    })
    assert sess_res.status_code == 201
    sess_data = sess_res.json()
    sess_id = sess_data["id"]
    assert sess_data["name"] == "Q4 Staff Infra Hiring Round"
    assert sess_data["job_snapshot"]["title"] == "Staff Platform Engineer"
    assert "Go" in sess_data["job_snapshot"]["required_skills"]

    # 3. Retrieve sessions list
    list_res = client.get("/api/sessions")
    assert list_res.status_code == 200
    assert any(s["id"] == sess_id for s in list_res.json())

    # 4. Clean up
    client.delete(f"/api/sessions/{sess_id}")
    client.delete(f"/api/jobs/{job_id}")


def test_candidate_comparison_endpoint():
    """Verify side-by-side comparison of candidates with skill matrix and evidence snippets."""
    # Fetch existing candidates
    res = client.get("/api/candidates")
    assert res.status_code == 200
    all_cands = res.json()
    assert len(all_cands) >= 2, "Need at least 2 candidates for comparison test"

    cand1 = all_cands[0]["id"]
    cand2 = all_cands[1]["id"]

    # Valid 2-candidate comparison
    cmp_res = client.post("/api/candidates/compare", json={"candidate_ids": [cand1, cand2]})
    assert cmp_res.status_code == 200
    data = cmp_res.json()
    assert data["candidate_count"] == 2
    assert len(data["candidates"]) == 2
    assert "skill_matrix" in data
    assert len(data["skill_matrix"]) > 0

    # Skill matrix entry has evidence and matched flags
    matrix_item = data["skill_matrix"][0]
    assert "skill" in matrix_item
    assert "is_required" in matrix_item
    assert cand1 in matrix_item["candidates"]
    assert "matched" in matrix_item["candidates"][cand1]
    assert "evidence" in matrix_item["candidates"][cand1]

    # Test up to 4 candidates if enough exist
    if len(all_cands) >= 4:
        cand3 = all_cands[2]["id"]
        cand4 = all_cands[3]["id"]
        cmp_4_res = client.post("/api/candidates/compare", json={"candidate_ids": [cand1, cand2, cand3, cand4]})
        assert cmp_4_res.status_code == 200
        assert cmp_4_res.json()["candidate_count"] == 4

        # Rejection of invalid count (>4)
        bad_5 = client.post("/api/candidates/compare", json={"candidate_ids": [cand1, cand2, cand3, cand4, cand1]})
        assert bad_5.status_code == 400

    # Rejection of invalid count (<2)
    bad_cmp = client.post("/api/candidates/compare", json={"candidate_ids": [cand1]})
    assert bad_cmp.status_code == 400


def test_bulk_shortlist_and_quick_views():
    """Verify bulk shortlisting and quick view filtering."""
    res = client.get("/api/candidates")
    cands = res.json()
    assert len(cands) >= 2

    ids = [cands[0]["id"], cands[1]["id"]]

    # Bulk shortlist to True
    bulk_res = client.post("/api/candidates/bulk-shortlist", json={
        "candidate_ids": ids,
        "shortlist_status": True
    })
    assert bulk_res.status_code == 200
    assert bulk_res.json()["updated_count"] == 2

    # Verify quick view filtering
    shortlisted_res = client.get("/api/candidates?quick_view=shortlisted")
    assert shortlisted_res.status_code == 200
    shortlisted_list = shortlisted_res.json()
    assert all(c["shortlist_status"] is True for c in shortlisted_list)

    # Bulk revert to False
    bulk_res2 = client.post("/api/candidates/bulk-shortlist", json={
        "candidate_ids": ids,
        "shortlist_status": False
    })
    assert bulk_res2.status_code == 200


def test_audit_trail_logging():
    """Verify audit trail logs events."""
    audit_res = client.get("/api/audit?limit=20")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert isinstance(logs, list)
    if len(logs) > 0:
        entry = logs[0]
        assert "id" in entry
        assert "event_type" in entry
        assert "timestamp" in entry


def test_backup_and_validated_restore():
    """Verify JSON backup export and validated restore behavior."""
    # 1. Export backup snapshot
    backup_res = client.get("/api/backup")
    assert backup_res.status_code == 200
    snapshot = backup_res.json()
    assert snapshot["app"] == "TalentLens AI"
    assert "candidates" in snapshot
    assert "jobs" in snapshot
    assert "sessions" in snapshot

    # 2. Reject malformed restore payloads
    malformed_res = client.post("/api/backup/restore", json={"invalid": "payload"})
    assert malformed_res.status_code == 400

    # 2b. Reject candidate with missing id/name or non-numeric score
    bad_cand_payload = {
        "jobs": [{"id": "j1", "title": "Dev"}],
        "candidates": [{"id": "c1", "name": "Test", "similarity_score": "not_a_number"}]
    }
    bad_cand_res = client.post("/api/backup/restore", json=bad_cand_payload)
    assert bad_cand_res.status_code == 400
    assert "non-numeric" in bad_cand_res.json()["detail"]

    # 2c. Reject job missing title
    bad_job_payload = {
        "jobs": [{"id": "j1"}],
        "candidates": []
    }
    bad_job_res = client.post("/api/backup/restore", json=bad_job_payload)
    assert bad_job_res.status_code == 400
    assert "missing a valid 'title'" in bad_job_res.json()["detail"]

    # 3. Valid restore
    restore_res = client.post("/api/backup/restore", json=snapshot)
    assert restore_res.status_code == 200
    assert restore_res.json()["status"] == "success"


def test_tfidf_reproducibility_and_empty_docs():
    """Verify TF-IDF returns identical scores for identical inputs and safely handles empty docs."""
    job_text = "Senior Python developer experienced in FastAPI, microservices, and Docker."
    resume_text = "Proficient Python engineer building microservices with FastAPI and Docker."

    score1, terms1 = compute_tf_idf_similarity(job_text, resume_text)
    score2, terms2 = compute_tf_idf_similarity(job_text, resume_text)
    assert score1 == score2
    assert terms1 == terms2

    # Empty inputs should return 0.0 without throwing exceptions
    empty_score1, _ = compute_tf_idf_similarity("", resume_text)
    assert empty_score1 == 0.0
    empty_score2, _ = compute_tf_idf_similarity(job_text, "")
    assert empty_score2 == 0.0
    empty_score3, _ = compute_tf_idf_similarity("", "")
    assert empty_score3 == 0.0


def test_candidate_stage_and_interview_updates():
    """Verify recruitment pipeline stage transitions and interview notes updates."""
    # Ensure at least 1 candidate exists
    candidates = load_candidates()
    if len(candidates) == 0:
        client.post("/api/demo/reset")
        candidates = load_candidates()

    assert len(candidates) > 0
    candidate_id = candidates[0]["id"]

    # 1. Update Stage to Interview
    stage_res = client.patch(f"/api/candidates/{candidate_id}/stage", json={"stage": "Interview"})
    assert stage_res.status_code == 200
    assert stage_res.json()["stage"] == "Interview"

    # 2. Update Interview Workspace Notes
    interview_payload = {
        "scheduled_date": "2026-10-24T14:30:00",
        "status": "Scheduled",
        "interviewer": "Elena Rostova (Staff ML Engineer)",
        "rating": 5,
        "notes": "Excellent explanation of transformer attention mechanisms and vector embeddings.",
        "feedback": "Strong cultural alignment and depth in PyTorch.",
        "next_steps": "Offer consideration"
    }
    inv_res = client.patch(f"/api/candidates/{candidate_id}/interview", json=interview_payload)
    assert inv_res.status_code == 200
    inv_data = inv_res.json()["interview_notes"]
    assert inv_data["interviewer"] == "Elena Rostova (Staff ML Engineer)"
    assert inv_data["rating"] == 5

    # 3. Verify in Candidate Details
    detail_res = client.get(f"/api/candidates/{candidate_id}")
    assert detail_res.status_code == 200
    cand_detail = detail_res.json()
    assert cand_detail["stage"] == "Interview"
    assert cand_detail["interview_notes"]["rating"] == 5

    # 4. Verify stage filtering
    filter_res = client.get("/api/candidates?stage=Interview")
    assert filter_res.status_code == 200
    filtered_list = filter_res.json()
    assert any(c["id"] == candidate_id for c in filtered_list)


def test_export_jobs_csv():
    """Verify jobs CSV export endpoint."""
    res = client.get("/api/export/jobs/csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "talentlens_jobs.csv" in res.headers.get("content-disposition", "")
    content = res.text
    assert "Job ID" in content
    assert "Job Title" in content
    assert "Required Skills" in content


def test_education_extraction():
    """Verify degree extraction and safe fallback."""
    text_with_degree = "Candidate Name\nEducation: B.Tech in Computer Science and Engineering\nExperience: 3 years"
    edu = extract_candidate_education(text_with_degree)
    assert "B.Tech" in edu

    text_no_degree = "John Doe\nExperienced software programmer skilled in Python and JavaScript."
    edu_none = extract_candidate_education(text_no_degree)
    assert edu_none == "Not detected in extracted text"


