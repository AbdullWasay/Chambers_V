import json
import logging
import re
from collections import Counter

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_ats_compatibility(resume_data, job_description=None):
    """
    Analyze a resume for ATS compatibility and return a score and recommendations.

    Args:
        resume_data (dict): The resume data in JSON format
        job_description (str, optional): Job description to check for keyword matching

    Returns:
        dict: ATS compatibility score and recommendations
    """
    logger.info("Starting ATS compatibility check")

    # Initialize results
    results = {
        "overall_score": 0,
        "max_score": 100,
        "sections": {},
        "recommendations": []
    }

    # Track individual scores
    scores = {}

    # 1. Check for basic contact information
    contact_score, contact_feedback = check_contact_info(resume_data)
    scores["contact_info"] = contact_score
    results["sections"]["contact_info"] = {
        "score": contact_score,
        "max_score": 10,
        "feedback": contact_feedback
    }

    # 2. Check for proper section headers
    headers_score, headers_feedback = check_section_headers(resume_data)
    scores["section_headers"] = headers_score
    results["sections"]["section_headers"] = {
        "score": headers_score,
        "max_score": 15,
        "feedback": headers_feedback
    }

    # 3. Check content quality
    content_score, content_feedback = check_content_quality(resume_data)
    scores["content_quality"] = content_score
    results["sections"]["content_quality"] = {
        "score": content_score,
        "max_score": 25,
        "feedback": content_feedback
    }

    # 4. Check for keyword matching with job description
    if job_description:
        keyword_score, keyword_feedback = check_keyword_matching(resume_data, job_description)
        scores["keyword_matching"] = keyword_score
        results["sections"]["keyword_matching"] = {
            "score": keyword_score,
            "max_score": 30,
            "feedback": keyword_feedback
        }
    else:
        # If no job description, allocate these points to other categories
        content_score += 10  # Add 10 more points to content quality
        results["sections"]["content_quality"]["score"] = content_score
        results["sections"]["content_quality"]["max_score"] = 35
        scores["content_quality"] = content_score

        # Add a note about job description
        results["recommendations"].append({
            "priority": "high",
            "message": "For better ATS compatibility, provide a job description to check for keyword matching."
        })

    # 5. Check for formatting issues
    format_score, format_feedback = check_formatting(resume_data)
    scores["formatting"] = format_score
    results["sections"]["formatting"] = {
        "score": format_score,
        "max_score": 20,
        "feedback": format_feedback
    }

    # Calculate overall score
    total_score = sum(scores.values())
    results["overall_score"] = total_score

    # Add overall assessment
    if total_score >= 90:
        results["assessment"] = "Excellent ATS compatibility"
    elif total_score >= 75:
        results["assessment"] = "Good ATS compatibility"
    elif total_score >= 60:
        results["assessment"] = "Fair ATS compatibility - some improvements needed"
    else:
        results["assessment"] = "Poor ATS compatibility - significant improvements needed"

    logger.info(f"ATS compatibility check completed with score: {total_score}")
    return results

def check_contact_info(resume_data):
    """Check if all necessary contact information is present"""
    score = 10
    feedback = []

    # Check basics section
    basics = resume_data.get("basics", {})
    if not basics and isinstance(resume_data, dict):
        # Try to find contact info at the top level if basics doesn't exist
        basics = {
            "name": resume_data.get("name", ""),
            "email": resume_data.get("email", ""),
            "phone": resume_data.get("phone", ""),
            "location": resume_data.get("location", "")
        }

    # Check for name
    if not basics.get("name"):
        score -= 3
        feedback.append("Missing name in contact information")

    # Check for email
    if not basics.get("email"):
        score -= 2
        feedback.append("Missing email in contact information")

    # Check for phone
    if not basics.get("phone"):
        score -= 2
        feedback.append("Missing phone number in contact information")

    # Check for location
    if not basics.get("location"):
        score -= 1
        feedback.append("Missing location in contact information")

    # If all good and no feedback
    if not feedback:
        feedback.append("All essential contact information is present")

    return max(0, score), feedback

def check_section_headers(resume_data):
    """Check if the resume has standard section headers"""
    score = 15
    feedback = []

    # Define standard section headers
    standard_sections = [
        "summary", "experience", "work", "employment", "education",
        "skills", "certifications", "projects", "achievements"
    ]

    # Check which standard sections are present
    found_sections = []
    for section in standard_sections:
        if section in resume_data or any(s.lower() == section for s in resume_data.keys()):
            found_sections.append(section)

    # Calculate score based on presence of key sections
    essential_sections = ["experience", "work", "employment", "education", "skills"]
    essential_found = any(section in found_sections for section in ["experience", "work", "employment"])

    if not essential_found:
        score -= 7
        feedback.append("Missing work experience section (critical for ATS)")

    if "education" not in found_sections:
        score -= 4
        feedback.append("Missing education section")

    if "skills" not in found_sections:
        score -= 4
        feedback.append("Missing skills section")

    # If all good and no feedback
    if not feedback:
        feedback.append("All essential section headers are present")

    return max(0, score), feedback

def check_content_quality(resume_data):
    """Check the quality of content in the resume"""
    score = 25
    feedback = []

    # Check summary/objective
    if "summary" in resume_data:
        summary = resume_data["summary"]
        if not summary or len(summary) < 50:
            score -= 5
            feedback.append("Summary is too short or missing")
    elif resume_data.get("basics", {}).get("summary"):
        summary = resume_data["basics"]["summary"]
        if not summary or len(summary) < 50:
            score -= 5
            feedback.append("Summary is too short or missing")
    else:
        score -= 5
        feedback.append("Missing professional summary/objective")

    # Check experience entries
    experience = resume_data.get("experience", resume_data.get("work", []))
    if experience and len(experience) > 0:
        # Check for dates
        missing_dates = 0
        for job in experience:
            if not job.get("startDate") or not job.get("endDate"):
                missing_dates += 1

        if missing_dates > 0:
            score -= min(5, missing_dates * 2)
            feedback.append(f"Missing dates in {missing_dates} work experience entries")

        # Check for job descriptions
        missing_descriptions = 0
        for job in experience:
            if not job.get("description") and not job.get("highlights", []):
                missing_descriptions += 1

        if missing_descriptions > 0:
            score -= min(5, missing_descriptions * 2)
            feedback.append(f"Missing descriptions in {missing_descriptions} work experience entries")

    # Check for skills
    skills = resume_data.get("skills", [])
    if not skills or len(skills) == 0:
        score -= 5
        feedback.append("Missing skills section or no skills listed")

    # If all good and no feedback
    if not feedback:
        feedback.append("Content quality is good")

    return max(0, score), feedback

def check_keyword_matching(resume_data, job_description):
    """Check how well the resume matches keywords from the job description"""
    score = 30
    feedback = []

    if not job_description:
        return score, ["No job description provided for keyword matching"]

    # Extract keywords from job description
    job_words = re.findall(r'\b[A-Za-z][A-Za-z0-9+#\-\.]{2,}\b', job_description.lower())
    job_word_counts = Counter(job_words)

    # Remove common words
    common_words = {"and", "the", "a", "an", "in", "on", "at", "to", "for", "with", "by", "of", "or", "is", "are", "was", "were"}
    for word in common_words:
        if word in job_word_counts:
            del job_word_counts[word]

    # Get top keywords (most frequent words)
    top_keywords = [word for word, count in job_word_counts.most_common(15)]

    # Convert resume to text for keyword searching
    resume_text = json.dumps(resume_data).lower()

    # Count matching keywords
    matched_keywords = []
    missing_keywords = []

    for keyword in top_keywords:
        if keyword in resume_text:
            matched_keywords.append(keyword)
        else:
            missing_keywords.append(keyword)

    # Calculate score based on keyword matches
    match_percentage = len(matched_keywords) / len(top_keywords) if top_keywords else 0
    keyword_score = int(match_percentage * score)

    # Provide feedback
    if match_percentage >= 0.8:
        feedback.append("Excellent keyword matching with job description")
    elif match_percentage >= 0.6:
        feedback.append("Good keyword matching, but some important terms are missing")
    else:
        feedback.append("Poor keyword matching - resume needs to be tailored to the job description")

    if missing_keywords:
        feedback.append(f"Consider adding these keywords: {', '.join(missing_keywords[:5])}")

    return keyword_score, feedback

def check_formatting(resume_data):
    """Check for potential formatting issues that might affect ATS parsing"""
    score = 20
    feedback = []

    # Convert to string to check for potential formatting issues
    resume_str = json.dumps(resume_data)

    # Check for potential table structures (simplified check)
    if "table" in resume_str.lower() or "colspan" in resume_str.lower() or "rowspan" in resume_str.lower():
        score -= 10
        feedback.append("Possible table structures detected - these may not parse well in ATS systems")

    # Check for potential image references
    if "image" in resume_str.lower() or "img" in resume_str.lower() or ".jpg" in resume_str.lower() or ".png" in resume_str.lower():
        score -= 5
        feedback.append("Possible image references detected - ATS systems cannot read images")

    # Check for complex formatting
    if "font" in resume_str.lower() or "style" in resume_str.lower() or "color" in resume_str.lower():
        score -= 5
        feedback.append("Complex formatting detected - keep formatting simple for best ATS compatibility")

    # If all good and no feedback
    if not feedback:
        feedback.append("No formatting issues detected")

    return max(0, score), feedback
