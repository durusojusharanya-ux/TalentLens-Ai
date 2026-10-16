import re
from typing import List, Dict, Any, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


DISCLAIMER_NOTICE = (
    "Scores are decision-support signals based on text similarity and skill matching. "
    "They are not hiring probabilities and should not be used as the sole basis for employment decisions."
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

    # Replace newlines and tabs with spaces
    cleaned = text.lower()
    # Protect special tokens like c++, c#, .net
    cleaned = re.sub(r'\bc\+\+\b', ' cpp_token ', cleaned)
    cleaned = re.sub(r'\bc\#\b', ' csharp_token ', cleaned)
    cleaned = re.sub(r'\b\.net\b', ' dotnet_token ', cleaned)

    # Normalize excessive punctuation, keep letters, numbers, hyphens, and protected tokens
    cleaned = re.sub(r'[^\w\s\-\_]', ' ', cleaned)
    # Collapse multiple whitespaces
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

    # Check alias dictionary
    aliases = [skill_clean]
    for canonical, alias_list in SKILL_ALIASES.items():
        if skill_clean == canonical or skill_clean in alias_list:
            aliases = list(set([canonical] + alias_list))
            break

    lowered_text = f" {text.lower()} "

    for alias in aliases:
        # Special cases with symbols: c++, c#, .net
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
            # Match isolated single letter 'c'
            if re.search(r'(?:^|[\s,;./\(\)\[\]])c(?:$|[\s,;./\(\)\[\]])', text, re.IGNORECASE):
                # Ensure it's not followed by ++ or #
                if not re.search(r'\bc\+\+', text, re.IGNORECASE) and not re.search(r'\bc\#', text, re.IGNORECASE):
                    return True
            continue

        # General boundary safe matching
        pattern = r'\b' + re.escape(alias) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False


def analyze_skills(
    resume_text: str,
    required_skills: List[str],
    preferred_skills: List[str]
) -> Dict[str, Any]:
    """
    Step 4: Required-skill and preferred-skill analysis.
    """
    matched_req = []
    missing_req = []
    matched_pref = []

    for req in required_skills:
        req_clean = req.strip()
        if not req_clean:
            continue
        if match_single_skill(req_clean, resume_text):
            matched_req.append(req_clean)
        else:
            missing_req.append(req_clean)

    for pref in preferred_skills:
        pref_clean = pref.strip()
        if not pref_clean:
            continue
        if match_single_skill(pref_clean, resume_text):
            matched_pref.append(pref_clean)

    total_req = len(matched_req) + len(missing_req)
    coverage = round((len(matched_req) / total_req * 100.0), 1) if total_req > 0 else 100.0

    return {
        "required_skills_matched": matched_req,
        "required_skills_missing": missing_req,
        "preferred_skills_matched": matched_pref,
        "required_skill_coverage": coverage
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
        # Sensible defaults: English stop words, unigrams and bigrams, custom token pattern
        vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            token_pattern=r'(?u)\b\w+\b|c\+\+|c\#|\.net',
            min_df=1
        )
        tfidf_matrix = vectorizer.fit_transform([norm_job, norm_resume])
        sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        raw_sim = float(sim_matrix[0][0])

        # Convert to percentage and clamp to 0.0 - 100.0
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
        parts.append(f"Missing required skills: {missing_str}.")

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
        "explanation": explanation,
        "warnings": sim_warnings,
        "notice": DISCLAIMER_NOTICE
    }
