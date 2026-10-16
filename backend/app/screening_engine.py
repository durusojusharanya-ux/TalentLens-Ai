import re
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


DISCLAIMER_NOTICE = (
    "Scores are decision-support signals based on technical text similarity and skill matching. "
    "They are not hiring probabilities and should not be used as the sole basis for employment decisions."
)

METHODOLOGY_EXPLANATION = (
    "TalentLens AI computes TF-IDF numerical vectorization (unigrams and bigrams) between the target role description "
    "and candidate resumes, calculating empirical cosine similarity. Required and preferred skills are evaluated using "
    "boundary-safe phrase matching with canonical alias normalization. A 'Not detected' result indicates the exact terminology "
    "was not found in the selectable resume text, which may occur due to alternative phrasing, unextracted portfolio links, "
    "or unlisted experience."
)

# Standard skill alias map for intelligent entity resolution
SKILL_ALIASES = {
    "machine learning": ["ml", "machine learning", "machine-learning"],
    "deep learning": ["dl", "deep learning", "neural networks"],
    "natural language processing": ["nlp", "natural language processing", "text mining"],
    "scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
    "tensorflow": ["tensorflow", "tf"],
    "pytorch": ["pytorch", "torch"],
    "javascript": ["javascript", "js", "ecmascript"],
    "typescript": ["typescript", "ts"],
    "react": ["react", "react.js", "reactjs"],
    "node.js": ["node.js", "nodejs", "node"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp", "c sharp"],
    ".net": [".net", "dotnet"],
    "fastapi": ["fastapi", "fast-api"],
    "postgresql": ["postgresql", "postgres", "psql"],
    "mongodb": ["mongodb", "mongo"],
    "kubernetes": ["kubernetes", "k8s"],
    "rest apis": ["rest apis", "rest api", "restful", "rest"],
    "ci/cd": ["ci/cd", "cicd", "continuous integration"],
    "sql": ["sql", "mysql", "sqlite", "tsql"],
    "docker": ["docker", "containerization"],
    "git": ["git", "github", "gitlab"],
    "html": ["html", "html5"],
    "css": ["css", "css3"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "python": ["python", "python3", "py"],
    "data analysis": ["data analysis", "exploratory data analysis", "eda"],
    "data science": ["data science"],
    "c": ["c"]
}


def normalize_text(text: str) -> str:
    """
    Step 1: Normalize text.
    Converts to lowercase, normalizes whitespace, preserves meaningful technical terms.
    """
    if not text:
        return ""

    cleaned = text.lower()
    # Protect special tokens like c++, c#, .net
    cleaned = re.sub(r'\bc\+\+\b', ' cpp_token ', cleaned)
    cleaned = re.sub(r'\bc\#\b', ' csharp_token ', cleaned)
    cleaned = re.sub(r'\b\.net\b', ' dotnet_token ', cleaned)

    # Normalize excessive punctuation, keep letters, numbers, hyphens, and protected tokens
    cleaned = re.sub(r'[^\w\s\-\_]', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    # Restore protected tokens
    cleaned = cleaned.replace('cpp_token', 'c++')
    cleaned = cleaned.replace('csharp_token', 'c#')
    cleaned = cleaned.replace('dotnet_token', '.net')

    return cleaned


def match_single_skill(skill_query: str, text: str) -> bool:
    """
    Safely match a skill query in normalized text using boundary-safe regex and aliases.
    Prevents false positives like 'C' matching 'CSS' or 'Java' matching 'JavaScript'.
    """
    skill_clean = skill_query.strip().lower()
    if not skill_clean or not text:
        return False

    aliases = [skill_clean]
    for canonical, alias_list in SKILL_ALIASES.items():
        if skill_clean == canonical or skill_clean in alias_list:
            aliases = list(set([canonical] + alias_list))
            break

    lowered_text = f" {text.lower()} "

    for alias in aliases:
        if alias == "c++":
            if " c++ " in lowered_text or " cpp " in lowered_text:
                return True
            continue
        if alias == "c#":
            if " c# " in lowered_text or " csharp " in lowered_text:
                return True
            continue
        if alias == ".net":
            if " .net " in lowered_text or " dotnet " in lowered_text:
                return True
            continue
        if alias == "c":
            if re.search(r'(?:^|[\s,;./\(\)\[\]])c(?:$|[\s,;./\(\)\[\]])', text, re.IGNORECASE):
                if not re.search(r'\bc\+\+', text, re.IGNORECASE) and not re.search(r'\bc\#', text, re.IGNORECASE):
                    return True
            continue

        pattern = r'\b' + re.escape(alias) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False


def extract_skill_evidence(skill_query: str, raw_text: str) -> str:
    """
    Extract authentic evidence snippet directly from actual extracted resume text.
    Never invents or hallucinates text.
    """
    if not raw_text or not skill_query:
        return "Not detected in extracted resume text."

    # Split resume into lines and sentences
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]

    # First check line-by-line for the best contextual sentence
    best_snippet = None
    for line in lines:
        if match_single_skill(skill_query, line):
            cleaned = re.sub(r'^[•\-\*\>\s]+', '', line).strip()
            if len(cleaned) > 10:
                best_snippet = cleaned
                break

    if not best_snippet:
        # Check by sentence splitting if lines are long
        sentences = re.split(r'(?<=[.!?])\s+', raw_text)
        for sent in sentences:
            if match_single_skill(skill_query, sent):
                cleaned = re.sub(r'[\r\n\t]+', ' ', sent).strip()
                cleaned = re.sub(r'^[•\-\*\>\s]+', '', cleaned).strip()
                if len(cleaned) > 10:
                    best_snippet = cleaned
                    break

    if best_snippet:
        # Limit snippet to ~160 chars cleanly
        if len(best_snippet) > 160:
            best_snippet = best_snippet[:157] + "..."
        return best_snippet

    return "Referenced in candidate profile text."


def analyze_skills(
    resume_text: str,
    required_skills: List[str],
    preferred_skills: List[str]
) -> Dict[str, Any]:
    """
    Step 4: Required-skill and preferred-skill analysis with genuine evidence snippets.
    """
    matched_req = []
    missing_req = []
    matched_pref = []
    evidence_snippets = {}

    for req in required_skills:
        req_clean = req.strip()
        if not req_clean:
            continue
        if match_single_skill(req_clean, resume_text):
            matched_req.append(req_clean)
            evidence_snippets[req_clean] = extract_skill_evidence(req_clean, resume_text)
        else:
            missing_req.append(req_clean)
            evidence_snippets[req_clean] = "Not detected in extracted text (the resume does not explicitly list this term; may exist in unlisted projects or external portfolio)."

    for pref in preferred_skills:
        pref_clean = pref.strip()
        if not pref_clean:
            continue
        if match_single_skill(pref_clean, resume_text):
            matched_pref.append(pref_clean)
            evidence_snippets[pref_clean] = extract_skill_evidence(pref_clean, resume_text)

    total_req = len(matched_req) + len(missing_req)
    coverage = round((len(matched_req) / total_req * 100.0), 1) if total_req > 0 else 100.0

    return {
        "required_skills_matched": matched_req,
        "required_skills_missing": missing_req,
        "preferred_skills_matched": matched_pref,
        "required_skill_coverage": coverage,
        "evidence_snippets": evidence_snippets
    }


def compute_tf_idf_similarity(job_description: str, resume_text: str) -> Tuple[float, List[str]]:
    """
    Step 2 & 3: TF-IDF vectorization and cosine similarity calculation.
    Returns (clamped_similarity_score, warnings).
    """
    warnings = []
    norm_job = normalize_text(job_description)
    norm_resume = normalize_text(resume_text)

    if not norm_job or len(norm_job.split()) < 3:
        return 0.0, ["Job description contains insufficient text for vectorization."]

    if not norm_resume or len(norm_resume.split()) < 5:
        return 0.0, ["Resume contains insufficient text for vectorization."]

    try:
        vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            token_pattern=r'(?u)\b\w+\b|c\+\+|c\#|\.net',
            min_df=1
        )
        tfidf_matrix = vectorizer.fit_transform([norm_job, norm_resume])
        sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        raw_sim = float(sim_matrix[0][0])

        score = round(min(100.0, max(0.0, raw_sim * 100.0)), 1)
        return score, warnings
    except Exception as e:
        return 0.0, [f"Vectorization note: {str(e)}"]


def generate_explanation(
    score: float,
    matched_req: List[str],
    missing_req: List[str],
    matched_pref: List[str]
) -> str:
    """
    Step 5: Explainable rule-based summary grounded directly in actual matching results.
    """
    parts = []

    if matched_req:
        skills_str = ", ".join(matched_req[:4])
        if len(matched_req) > 4:
            skills_str += f", and {len(matched_req) - 4} others"
        parts.append(f"Relevant text was detected for core required skills: {skills_str}.")
    else:
        parts.append("None of the specified required skills were explicitly identified in the resume text.")

    if matched_pref:
        pref_str = ", ".join(matched_pref[:3])
        parts.append(f"Preferred skill coverage includes: {pref_str}.")

    if missing_req:
        missing_str = ", ".join(missing_req[:3])
        if len(missing_req) > 3:
            missing_str += f", and {len(missing_req) - 3} other required qualifications"
        parts.append(f"Not detected in resume text: {missing_str}.")

    if score >= 70.0:
        parts.append("The resume exhibits high textual alignment with the key responsibilities and domain terminology in the job description.")
    elif score >= 40.0:
        parts.append("The resume shows moderate terminology overlap with the role description, reflecting partial alignment with the domain.")
    else:
        parts.append("The document exhibits lower overall vocabulary and phrase overlap with the target role description.")

    return " ".join(parts)


def screen_candidate(
    job_description: str,
    required_skills: List[str],
    preferred_skills: List[str],
    resume_text: str
) -> Dict[str, Any]:
    """
    Complete end-to-end ML screening pipeline.
    """
    score, sim_warnings = compute_tf_idf_similarity(job_description, resume_text)
    skill_results = analyze_skills(resume_text, required_skills, preferred_skills)

    explanation = generate_explanation(
        score,
        skill_results["required_skills_matched"],
        skill_results["required_skills_missing"],
        skill_results["preferred_skills_matched"]
    )

    return {
        "similarity_score": score,
        "required_skills_matched": skill_results["required_skills_matched"],
        "required_skills_missing": skill_results["required_skills_missing"],
        "preferred_skills_matched": skill_results["preferred_skills_matched"],
        "required_skill_coverage": skill_results["required_skill_coverage"],
        "evidence_snippets": skill_results["evidence_snippets"],
        "explanation": explanation,
        "warnings": sim_warnings,
        "notice": DISCLAIMER_NOTICE,
        "methodology": METHODOLOGY_EXPLANATION
    }
