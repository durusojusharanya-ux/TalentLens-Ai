# TalentLens AI — AI-Powered Resume Screening & Recruitment Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**TalentLens AI** is an explainable, privacy-first resume screening, candidate ranking, and recruitment intelligence platform designed for modern hiring teams, technical recruiters, and engineering managers.

Built with an intelligent matching pipeline (**scikit-learn TF-IDF + Cosine Similarity**), high-fidelity PDF extraction (**PyMuPDF**), thread-safe JSON persistence, and a vibrant colorful AI SaaS interface rendered in **Plus Jakarta Sans** and **Inter** typography with ambient glowing gradients (Blue, Cyan, Purple, Lavender).

> 🔒 **100% Dedicated Private Execution**: Operates entirely on your local system with **ZERO API keys**, **NO paid third-party AI cloud fees** (OpenAI, Gemini, Anthropic), and **NO external database services** (PostgreSQL, MongoDB, Supabase). All candidate data and resumes remain under your complete sovereignty.

---

## 📌 Problem Statement & Design Philosophy

Traditional recruitment screening is fraught with operational challenges:
1. **Recruiter Fatigue**: Evaluating hundreds of multi-page technical resumes manually leads to inconsistent, biased evaluations and hours of administrative overhead.
2. **"Black-Box" Cloud AI Vulnerabilities**: Public LLM screening services risk candidate PII exposure, hallucinate qualifications, charge high per-token API fees, and cannot explain why a candidate received a particular score.
3. **Keyword Stuffing & Regex Failures**: Primitive text matching confuses skill abbreviations (`ML` vs `Machine Learning`, `k8s` vs `Kubernetes`) while generating false positives (matching `C` inside `CSS` or `Java` inside `JavaScript`).
4. **Lack of Explainability**: Hiring managers demand defensible, auditable evidence showing *why* a candidate matches a job specification.

**TalentLens AI delivers an ethical, explainable solution**:
- **Defensible Scoring**: Every percentage score is mathematically derived from unigram + bigram TF-IDF vector overlap and boundary-safe skill matching.
- **Evidence-Backed**: Direct quote citations from the resume are displayed alongside each matched skill.
- **Auditable & Sovereign**: Data resides in local files, fully exportable, with complete candidate deletion capabilities.
- **Non-Discriminatory**: Zero demographic, age, gender, or protected characteristic processing.

---

## 🚀 Key Platform Features

### 1. 👥 Side-by-Side Candidate Comparison (Up to 4 Candidates)
- Compare **2, 3, or up to 4 candidates** simultaneously in a responsive grid.
- Comparative dimensions include:
  - Algorithmic Match Score & Score Tier
  - Required Skill Coverage % & Matched Count
  - Consolidated Skill Matrix with resume evidence snippets for each candidate
  - Detected Education Degree & Academic Field
  - Extracted Experience Timeline
  - Recruitment Pipeline Stage & Shortlist Status
- One-click **Export Comparison Matrix to CSV** for offline team calibration.

### 2. 📝 Explainable Match Reports & Scoring Breakdown
- **Downloadable Comprehensive Markdown Report** (`TalentLens_Match_Report_[Name].md`):
  - Ingestion metadata and target role specifications
  - Overall Similarity Score and Required Skill Coverage
  - Explicit scoring breakdown: TF-IDF Vector Overlap %, Mandatory Skill Coverage %, Preferred Competencies Count, and Match Grade (Grade A: $\ge 70\%$, Grade B: $40\text{--}69\%$, Grade C: $< 40\%$)
  - Matched skills with exact quote citations extracted from the resume
  - Missing skills gap analysis
  - Detected education credentials
  - Human recruiter interview notes, rating, and feedback
  - Ethical AI and non-discrimination compliance disclosure
- In-modal **Explainable Scoring Breakdown Matrix** providing instant visual clarity into how the match score was calculated.

### 3. 🎯 6-Stage Recruitment Pipeline
- Candidate progression through 6 persistent stages: `New` $\to$ `Reviewed` $\to$ `Shortlisted` $\to$ `Interview` $\to$ `Selected` $\to$ `Rejected`.
- Interactive visual pipeline funnel bar (`PipelineStageBar`) displaying stage counts and active states.
- Immediate persistent updates to local storage, reflected across all views and CSV exports.

### 4. 🔍 Advanced Search, Filtering, Sorting & CSV Export
- Search candidates by name, email, target role, or specific skills.
- Multi-dimensional filters:
  - **Data Source**: Filter by `All Candidates`, `Real Uploads Only`, or `Demo Data Only`.
  - **Pipeline Stage**: Quick view filters for any stage.
  - **Match Score Tier**: Strong ($\ge 70\%$), Moderate ($40\text{--}69\%$), or Developing ($< 40\%$).
- Multi-column sorting: Highest Score, Lowest Score, Name, Most Recent.
- Active filter badge indicators with one-click filter reset.
- Enhanced CSV export including candidates' stage, interviewer, rating, feedback, and next steps.

### 5. 📅 Interview Workspace & Activity Timeline
- Structured human recruiter assessment suite inside each candidate dossier:
  - Interview scheduling and status tracking (`Not Scheduled`, `Scheduled`, `Completed`, `Cancelled`)
  - Lead Interviewer assignment
  - 1-to-5 star candidate rating
  - Technical discussion notes
  - Qualitative candidate feedback & recommended next steps
- **Candidate Activity Timeline**: Chronological log of ingestion, parsing, automated scoring, pipeline promotions, and interview schedule events.

### 6. 🔒 Privacy Controls & Resume Storage Information
- Complete candidate data deletion: Permanently removes vector records, timeline, interview notes, and raw uploaded PDF files from disk.
- Dedicated **Resume Storage & Data Locality** dashboard in Settings:
  - Displays absolute filesystem paths for both the Database directory and Resume Uploads vault
  - Verified Zero Cloud AI Calls indicator
  - Clear explanations of storage encryption, permissions, and data retention

### 7. 🧪 Clearly Labelled Demo Mode
- Instant access to a rich synthetic candidate cohort across engineering disciplines (Backend, Frontend, Full-Stack, DevOps, AI/ML).
- All demo records are marked with a distinct `DEMO` badge.
- Candidate directory includes a dedicated filter to isolate real uploads from demo candidates.
- Safe reset and purge options in the Data Management Center: Refreshing or clearing demo records never impacts real uploaded resumes.

### 8. 💾 Backup & Restore with Deep Input Validation
- One-click download of the complete application state as a validated JSON snapshot.
- Thread-locked restoration engine featuring deep schema validation:
  - Verifies presence and valid types for all jobs (`id`, `title`) and candidates (`id`, `name`, `job_id`, numeric `similarity_score`, list structures).
  - Rejects malformed or corrupted JSON payloads with explicit error details.

### 9. 🎨 Modern Colorful AI SaaS Interface
- Cohesive color scheme with soft pastel glows and depth:
  - **Primary Blue** (`#0284C7`) for primary actions and links
  - **AI Purple** (`#8B5CF6`) for match scores and intelligent features
  - **Cyan** (`#06B6D4`) for highlights and active accents
  - **Emerald Green** (`#10B981`) for high matches and verified skills
  - **Amber** (`#F59E0B`) for moderate alignment and pending reviews
  - **Coral Red** (`#EF4444`) for missing competencies and rejections
- Layered radial gradients (`#EAF6FF`, `#EEE7FF`, `#DDFBFA`, `#FFF0F6`) providing ambient visual depth while preserving crisp typography contrast.
- Polished typography using **Plus Jakarta Sans** (headings) and **Inter** (body, tabular figures).
- Responsive layouts, animated skeleton loading states, and helpful empty states.

---

## 🏗️ System Architecture & Data Flow

```
+-------------------------------------------------------------------------------+
|                       TALENTLENS AI SYSTEM ARCHITECTURE                       |
+-------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------+
|                           FRONTEND (React 19 + TypeScript + Vite)             |
|                                                                               |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  | Overview Dashboard |  | Candidates Matrix  |  | Side-by-Side Comparison |  |
|  | - KPIs & Analytics |  | - Search & Filters |  | - Up to 4 Candidates    |  |
|  | - Funnel Visualizer|  | - Pipeline Stages  |  | - Skill Evidence Matrix |  |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  | Candidate Dossier  |  | Data Management    |  | Settings & Theme Studio |  |
|  | - Explainable Rep. |  | - Validated Backup |  | - Storage Paths & PII   |  |
|  | - Interview Notes  |  | - CSV Full Exports |  | - 10 Palette Presets    |  |
|  +--------------------+  +--------------------+  +-------------------------+  |
+---------------------------------------+---------------------------------------+
                                        | REST API / JSON & Multipart
                                        v
+-------------------------------------------------------------------------------+
|                           BACKEND (FastAPI + Python 3.11+)                    |
|                                                                               |
|  +---------------------+   +---------------------+   +---------------------+  |
|  | Resume Ingestion    |   | TF-IDF Scoring      |   | Evidence Extractor  |  |
|  | - PyMuPDF / fitz    |-->| - scikit-learn      |-->| - Keyword in Context|  |
|  | - Contact & Degree  |   | - Cosine Similarity |   | - Exact Quotes      |  |
|  | - Sanitized Storage |   | - Alias Normalizer  |   | - Degree Boundaries |  |
|  +---------------------+   +---------------------+   +---------------------+  |
|                                       |                                       |
|                                       v                                       |
|  +-------------------------------------------------------------------------+  |
|  | Thread-Safe Storage Manager (RLock + Atomic File Operations)            |  |
|  | - Audit Trail Recorder   - Deep Schema Validator   - Demo Isolation     |  |
|  +-------------------------------------------------------------------------+  |
+---------------------------------------+---------------------------------------+
                                        | Local File I/O (Thread-Safe)
                                        v
+-------------------------------------------------------------------------------+
|                           LOCAL FILESYSTEM (100% Private)                     |
|                                                                               |
|   /backend/data/jobs.json            /backend/data/candidates.json            |
|   /backend/data/sessions.json        /backend/data/audit_logs.json            |
|   /backend/data/settings.json        /backend/uploads/cand_<uuid>.pdf         |
+-------------------------------------------------------------------------------+
```

---

## 🧠 Explainable Scoring Methodology

Unlike opaque cloud LLM services, TalentLens AI calculates match metrics using transparent mathematical and statistical techniques:

### 1. Text Sanitization & Tokenization
```python
def normalize_text(text: str) -> str:
    # Converts text to lowercase
    # Protects technical tokens with symbols (c++, c#, .net)
    # Normalizes punctuation and collapses whitespace
```
- Preserves domain-critical symbols such as `C++`, `C#`, and `.NET`.
- Standardizes vocabulary across diverse resume formats.

### 2. TF-IDF Numerical Vectorization
The engine fits a `TfidfVectorizer` across both the target job description and extracted resume text:
$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$
- **N-gram Range**: $(1, 2)$ — captures unigrams (e.g., `python`, `docker`) and bigrams (e.g., `machine learning`, `ci/cd`).
- **Stop Words**: Standard English stop-word filtering.
- **Token Pattern**: `(?u)\b\w+\b|c\+\+|c\#|\.net` ensuring programming terms are tokenized intact.

### 3. Cosine Similarity Calculation
The semantic alignment between the job benchmark vector $\vec{J}$ and candidate resume vector $\vec{R}$ is calculated as:
$$\text{Similarity}(\vec{J}, \vec{R}) = \frac{\vec{J} \cdot \vec{R}}{\|\vec{J}\|_2 \|\vec{R}\|_2}$$
$$\text{Similarity Score} = \text{round}\Big(\min(100.0, \max(0.0, \text{Similarity} \times 100.0)), 1\Big)$$

### 4. Boundary-Safe Skill Matching & Coverage
Skills are verified using an alias dictionary and strict boundary-safe regex patterns:
$$\text{Required Skill Coverage} = \frac{|\text{Required Skills Matched}|}{|\text{Total Required Skills}|} \times 100\%$$
- **Alias Resolution**: `sklearn` $\leftrightarrow$ `scikit-learn`, `k8s` $\leftrightarrow$ `kubernetes`, `js` $\leftrightarrow$ `javascript`.
- **False-Positive Guard**: Word boundaries prevent `C` from triggering on `CSS` and `Java` from triggering on `JavaScript`.

### 5. Multi-Tier Match Grading
Candidates are classified into actionable grade tiers:
- **Grade A (Strong Alignment)**: $\ge 70.0\%$ similarity. High contextual and vocabulary alignment.
- **Grade B (Moderate Alignment)**: $40.0\% - 69.9\%$ similarity. Solid foundational competence with potential skill gaps.
- **Grade C (Developing Alignment)**: $< 40.0\%$ similarity. Limited keyword or role alignment.

---

## 💻 Visual Interface Previews

### 1. Side-by-Side 4-Candidate Comparison Grid
```text
+-------------------------------------------------------------------------------------------------------+
|  CANDIDATE COMPARISON MATRIX (4 Candidates)                                    [Export Matrix to CSV]  |
+-------------------------------------------------------------------------------------------------------+
| Metric / Candidate  | Maya Lin            | Marcus Vance        | Elena Rostova       | David Chen    |
+---------------------+---------------------+---------------------+---------------------+---------------+
| Match Score         | 88.5% [Strong]      | 76.2% [Strong]      | 64.0% [Moderate]    | 52.8% [Mod]   |
| Required Coverage   | 100% (5/5)          | 80% (4/5)           | 60% (3/5)           | 60% (3/5)     |
| Stage               | Interview           | Shortlisted         | Reviewed            | New           |
| Python              | [x] "...Python 3.11"| [x] "...Python back"| [x] "...FastAPI/Py" | [ ] Missing   |
| FastAPI             | [x] "...FastAPI dev"| [x] "...FastAPI api"| [ ] Missing         | [x] "...Fast" |
| Docker              | [x] "...Docker k8s" | [x] "...Docker cont"| [x] "...Docker"     | [ ] Missing   |
| Degree              | B.Tech (Comp Sci)   | M.S. (Software Eng) | B.S. (Info Tech)    | Not Detected  |
+-------------------------------------------------------------------------------------------------------+
```

### 2. 6-Stage Recruitment Pipeline Bar
```text
+-------------------------------------------------------------------------------------------------------+
| Pipeline Funnel:  [1] New (4)  ->  [2] Reviewed (6)  ->  [3] Shortlisted (5)  ->  [4] Interview (3)  |
|                                                      ->  [5] Selected (1)     ->  [6] Rejected (2)    |
+-------------------------------------------------------------------------------------------------------+
```

---

## 📁 Repository Directory Structure

```text
TalentLens-AI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application, lifespan & CORS
│   │   ├── models.py               # Pydantic v2 data contracts
│   │   ├── storage.py              # Thread-safe JSON persistence & backup validation
│   │   ├── resume_parser.py        # PyMuPDF text & contact extraction
│   │   ├── screening_engine.py     # scikit-learn TF-IDF & skill matching
│   │   ├── demo_generator.py       # Isolated synthetic candidate generator
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py           # /api/health
│   │       ├── stats.py            # /api/stats
│   │       ├── jobs.py             # /api/jobs (CRUD & templates)
│   │       ├── resumes.py          # /api/resumes/upload
│   │       ├── candidates.py       # /api/candidates (CRUD, compare, stages, notes)
│   │       ├── export.py           # /api/export/csv & /api/export/jobs/csv
│   │       ├── backup.py           # /api/backup & /api/backup/restore
│   │       ├── demo.py             # /api/demo/reset & clear
│   │       └── settings.py         # /api/settings
│   ├── data/
│   │   ├── jobs.json               # Persisted job benchmarks
│   │   ├── candidates.json         # Persisted candidate profiles & interview notes
│   │   ├── audit_logs.json         # Chronological audit trail
│   │   └── settings.json           # User preferences & thresholds
│   ├── uploads/                    # Sanitized PDF resume vault (cand_<uuid>.pdf)
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_core.py            # Pytest test suite (17 comprehensive tests)
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx         # Responsive navigation drawer
│   │   │   ├── Header.tsx          # Top bar with job selector & health status
│   │   │   ├── PipelineStageBar.tsx # 6-stage recruitment visual bar
│   │   │   ├── AppearanceCustomizer.tsx # Appearance panel & 10 preset themes
│   │   │   ├── DataManagementCenter.tsx # CSV exports, JSON backups & demo controls
│   │   │   ├── CandidateDetailModal.tsx # Dossier, report download & interview notes
│   │   │   ├── CandidateCompareModal.tsx # 4-candidate comparison & CSV export
│   │   │   └── JobModal.tsx        # Role benchmark modal & templates
│   │   ├── pages/
│   │   │   ├── OverviewPage.tsx    # KPIs, Recharts telemetry, recent activity
│   │   │   ├── AnalyzePage.tsx     # Multi-PDF upload & live evaluation table
│   │   │   ├── CandidatesPage.tsx  # Searchable directory, source filter & quick actions
│   │   │   ├── ShortlistPage.tsx   # Curated talent pool & export
│   │   │   ├── AnalyticsPage.tsx   # Skill distributions & score analytics
│   │   │   ├── JobsPage.tsx        # Benchmark management & skill definitions
│   │   │   └── SettingsPage.tsx    # Appearance studio, storage info & audit trail
│   │   ├── services/
│   │   │   └── api.ts              # Typed API service client
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript definitions
│   │   ├── App.tsx                 # Root application controller
│   │   ├── main.tsx
│   │   └── index.css               # Color theme variables & responsive styles
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## 🛠️ Prerequisites & Installation

### Prerequisites
- **Python 3.11+** installed (`python --version`)
- **Node.js v18+** & **npm v9+** installed (`node -v`, `npm -v`)
- Modern web browser (Chrome, Edge, Firefox, Brave, Safari)

### 1. Clone & Set Up Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Windows Command Prompt:
.venv\Scripts\activate.bat
# macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Set Up Frontend
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node modules
npm install
```

---

## 🚀 Running Locally

Launch both servers locally in separate terminal windows:

### Terminal 1: FastAPI Backend
```bash
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Terminal 2: Vite React Frontend
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

### Platform Endpoints
- **Web UI**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Base API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Diagnostics**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🧪 Testing Backend Workflows

The test suite validates:
1. Health endpoint & scikit-learn / PyMuPDF availability
2. Job benchmark CRUD operations & validation
3. In-memory PDF text extraction & heuristic contact identification
4. Handling of empty, corrupted, and image-only PDFs
5. Mathematical TF-IDF cosine similarity calculations
6. Boundary-safe skill matching with aliases (e.g. `C` vs `CSS`)
7. Multi-PDF resume upload & error isolation
8. Candidate deletion and physical file removal
9. Candidate comparison endpoint for up to 4 candidates
10. Validated backup creation and schema-checked restoration
11. Recruitment pipeline stage transitions and interview notes updates
12. CSV export generation with valid UTF-8 BOM encoding

Run tests using `pytest`:
```bash
cd backend
.venv\Scripts\python.exe -m pytest tests/test_core.py -v
```

Expected output:
```text
============================= test session starts =============================
tests/test_core.py::test_health_endpoint PASSED                          [  5%]
tests/test_core.py::test_job_crud_and_validation PASSED                  [ 11%]
tests/test_core.py::test_pdf_extraction_and_heuristics PASSED            [ 17%]
tests/test_core.py::test_invalid_and_empty_pdf_handling PASSED           [ 23%]
tests/test_core.py::test_tfidf_and_skill_matching PASSED                 [ 29%]
tests/test_core.py::test_resume_upload_endpoint PASSED                   [ 35%]
tests/test_core.py::test_demo_reset_preserves_real_records PASSED        [ 41%]
tests/test_core.py::test_evidence_snippet_extraction_and_disclaimer PASSED [ 47%]
tests/test_core.py::test_screening_sessions_workflow PASSED              [ 52%]
tests/test_core.py::test_candidate_comparison_endpoint PASSED            [ 58%]
tests/test_core.py::test_bulk_shortlist_and_quick_views PASSED           [ 64%]
tests/test_core.py::test_audit_trail_logging PASSED                      [ 70%]
tests/test_core.py::test_backup_and_validated_restore PASSED             [ 76%]
tests/test_core.py::test_tfidf_reproducibility_and_empty_docs PASSED     [ 82%]
tests/test_core.py::test_candidate_stage_and_interview_updates PASSED    [ 88%]
tests/test_core.py::test_export_jobs_csv PASSED                          [ 94%]
tests/test_core.py::test_education_extraction PASSED                     [100%]
======================= 17 passed in 4.25s =========================
```

---

## 🔒 Privacy, Security & Data Sovereignty

- **Zero Cloud Transmission**: All PDF document parsing, contact extraction, and TF-IDF numerical vectorization run locally on CPU.
- **Physical Resume Storage**: Uploaded PDF files are saved to `backend/uploads/` using server-assigned UUIDs (`cand_<uuid>.pdf`). User filenames are never used as raw filesystem paths.
- **Permanent Deletion**: Clicking delete on any candidate permanently removes their metadata, scoring record, and physical PDF file from disk.
- **Local JSON Storage**: All records reside in `backend/data/` as standard JSON. Local permissions govern access. For public network hosting, ensure TLS/HTTPS, user authentication, and disk encryption are configured.
- **Non-Discriminatory Design**: The matching engine evaluates technical vocabulary overlap exclusively. It does not parse or rank by race, ethnicity, gender, age, marital status, or protected characteristics.

---

## ⚖️ Technical Limitations & Future Roadmap

- **Scanned Image Resumes**: PyMuPDF extracts text streams embedded in PDFs. Image-only or low-resolution scanned documents without an OCR text layer return an informative notification. *Future Roadmap: Integrate local Tesseract OCR.*
- **Single-Node Filesystem**: Data is stored in atomic, thread-safe JSON files suitable for local team operations. *Future Roadmap: Optional local DuckDB/SQLite driver for high-volume enterprise archives.*
- **Dense Semantic Embeddings**: Current scoring pairs TF-IDF unigram+bigram n-grams with boundary-safe dictionary normalization for fast, explainable, lightweight CPU execution. *Future Roadmap: Optional local Sentence-Transformers (`all-MiniLM-L6-v2`) via ONNX Runtime.*

---

## 📄 License

Developed for educational, portfolio, and production decision-support purposes. All rights reserved.
