import pymupdf as fitz
import re
from typing import Dict, Any, List, Tuple


EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
PHONE_REGEX = re.compile(r'(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?|\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}')
YEARS_EXP_REGEX = re.compile(r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp|working|industry)', re.IGNORECASE)

DISALLOWED_NAME_WORDS = {
    "resume", "curriculum", "vitae", "cv", "profile", "summary", "experience",
    "education", "skills", "projects", "contact", "email", "phone", "address",
    "objective", "work", "page", "developer", "engineer", "software", "scientist"
}


def extract_text_from_pdf(pdf_bytes: bytes) -> Tuple[str, List[str]]:
    """
    Extract selectable text from PDF bytes using PyMuPDF.
    Returns (extracted_text, warnings).
    """
    warnings = []
    text = ""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        return "", [f"Malformed or corrupted PDF file: {str(e)}"]

    if doc.is_encrypted:
        try:
            # Try empty password
            if not doc.authenticate(""):
                return "", ["Password-protected PDF. Cannot extract text without password."]
        except Exception:
            return "", ["Password-protected PDF. Cannot extract text without password."]

    total_pages = len(doc)
    if total_pages == 0:
        return "", ["PDF has no pages."]

    extracted_pages = []
    for page_num in range(total_pages):
        page = doc[page_num]
        page_text = page.get_text("text")
        if page_text:
            extracted_pages.append(page_text)

    text = "\n".join(extracted_pages).strip()

    if not text:
        warnings.append("No selectable text was detected. This MVP does not include OCR. Please upload a text-based PDF.")
    elif len(text.split()) < 30:
        warnings.append("Resume contains very low text volume (< 30 words), which may reduce scoring accuracy.")

    return text, warnings


def extract_candidate_name(text: str) -> str:
    """
    Extract candidate name using conservative heuristics from top lines.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        return "Not detected"

    # Check top 6 non-empty lines
    for line in lines[:6]:
        # Strip bullets or extra symbols
        cleaned = re.sub(r'[^a-zA-Z\s\.\'-]', ' ', line).strip()
        words = cleaned.split()

        # Name should be 2 to 4 words, each capitalized or title case, no email/phone/url
        if 2 <= len(words) <= 4:
            lowered = [w.lower() for w in words]
            # Check if any word is in disallowed words
            if any(w in DISALLOWED_NAME_WORDS for w in lowered):
                continue
            # Ensure words look like real names (length >= 2, mostly alpha)
            if all(len(w) >= 2 and w.isalpha() for w in words):
                # Ensure at least first character of words is capitalized
                if all(w[0].isupper() for w in words):
                    return " ".join(words)

    return "Not detected"


def extract_candidate_email(text: str) -> str:
    """
    Extract email address using regex.
    """
    matches = EMAIL_REGEX.findall(text)
    if matches:
        return matches[0].strip()
    return "Not detected"


def extract_candidate_phone(text: str) -> str:
    """
    Extract phone number using conservative patterns.
    """
    # Look in the top 20 lines where contact info usually lives
    header_text = "\n".join([line for line in text.split("\n")[:20]])
    match = PHONE_REGEX.search(header_text)
    if match:
        raw_phone = match.group(0).strip()
        # Clean up unwanted trailing punctuation
        raw_phone = re.sub(r'[,;]$', '', raw_phone)
        if len(re.sub(r'\D', '', raw_phone)) >= 7:
            return raw_phone
    return "Not detected"


def extract_candidate_experience(text: str) -> str:
    """
    Detect explicit mention of years of experience.
    """
    match = YEARS_EXP_REGEX.search(text)
    if match:
        years = match.group(1)
        return f"{years}+ years"

    # Year range detection in experience section e.g. 2019 - 2023
    year_ranges = re.findall(r'\b(20[0-2]\d)\s*[-–to]+\s*(20[0-2]\d|present|current)\b', text, re.IGNORECASE)
    if year_ranges:
        calculated_years = 0
        current_year = 2026
        for start_str, end_str in year_ranges:
            try:
                start_yr = int(start_str)
                end_yr = current_year if end_str.lower() in ("present", "current") else int(end_str)
                if end_yr >= start_yr:
                    calculated_years += (end_yr - start_yr)
            except Exception:
                pass
        if calculated_years > 0:
            return f"~{calculated_years} years (calculated)"

    return "Not detected"


def extract_candidate_education(text: str) -> str:
    """
    Detect explicit mention of education degrees or major from resume text.
    Returns 'Not detected in extracted text' if no formal degree term is present.
    """
    if not text:
        return "Not detected in extracted text"

    # First check lines following an 'EDUCATION' header
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    in_edu = False
    for line in lines:
        if re.match(r'^(?:education|academic background|qualifications)\b', line, re.IGNORECASE):
            in_edu = True
            continue
        if in_edu:
            if re.match(r'^(?:skills|projects|experience|work|certifications|summary|technical)\b', line, re.IGNORECASE):
                break
            if len(line) >= 4 and not re.match(r'^[•\-\*]', line):
                clean_line = re.sub(r'^[•\-\*\>\s]+', '', line).strip()
                if len(clean_line) >= 5:
                    return clean_line[:90]

    # Regex search for degrees
    edu_regex = re.compile(
        r'\b(?:B\.?Tech|B\.?S\.?|B\.?E\.?|BCA|M\.?Tech|M\.?S\.?|MCA|Ph\.?D|Bachelor(?:\s+of\s+[A-Za-z]+)?|Master(?:\s+of\s+[A-Za-z]+)?|Diploma)\b[^\n,;]*',
        re.IGNORECASE
    )
    match = edu_regex.search(text)
    if match:
        snippet = match.group(0).strip()
        if len(snippet) > 80:
            snippet = snippet[:77] + "..."
        return snippet

    return "Not detected in extracted text"


def parse_resume(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    High-level resume parser.
    """
    text, warnings = extract_text_from_pdf(pdf_bytes)
    if not text:
        return {
            "name": "Not detected",
            "email": "Not detected",
            "phone": "Not detected",
            "estimated_experience": "Not detected",
            "estimated_education": "Not detected in extracted text",
            "extracted_text": "",
            "warnings": warnings,
            "success": False
        }

    name = extract_candidate_name(text)
    email = extract_candidate_email(text)
    phone = extract_candidate_phone(text)
    exp = extract_candidate_experience(text)
    edu = extract_candidate_education(text)

    if name == "Not detected":
        warnings.append("Candidate name could not be automatically determined.")
    if email == "Not detected":
        warnings.append("No contact email address detected in text.")

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "estimated_experience": exp,
        "estimated_education": edu,
        "extracted_text": text,
        "warnings": warnings,
        "success": True
    }
