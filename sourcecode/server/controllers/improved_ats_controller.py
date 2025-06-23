import json
import logging
import re
import string
from collections import Counter
from typing import Dict, List, Tuple, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_ats_compatibility(resume_data: Dict[str, Any], job_description: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze a resume for ATS compatibility and return a detailed score and recommendations.

    Args:
        resume_data (dict): The resume data in JSON format
        job_description (str, optional): Job description to check for keyword matching

    Returns:
        dict: ATS compatibility score and detailed recommendations
    """
    logger.info("Starting enhanced ATS compatibility check")

    # Initialize results
    results = {
        "overall_score": 0,
        "max_score": 100,
        "sections": {},
        "recommendations": [],
        "improvement_areas": []
    }

    # Track individual scores
    scores = {}

    # 1. Check for basic contact information (10 points)
    contact_score, contact_feedback = check_contact_info(resume_data)
    scores["contact_info"] = contact_score
    results["sections"]["contact_info"] = {
        "score": contact_score,
        "max_score": 10,
        "feedback": contact_feedback
    }

    # 2. Check for proper section headers (15 points)
    headers_score, headers_feedback = check_section_headers(resume_data)
    scores["section_headers"] = headers_score
    results["sections"]["section_headers"] = {
        "score": headers_score,
        "max_score": 15,
        "feedback": headers_feedback
    }

    # 3. Check content quality and length (25 points)
    content_score, content_feedback = check_content_quality(resume_data)
    scores["content_quality"] = content_score
    results["sections"]["content_quality"] = {
        "score": content_score,
        "max_score": 25,
        "feedback": content_feedback
    }

    # 4. Check for keyword matching with job description (30 points)
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

    # 5. Check for formatting issues (10 points)
    format_score, format_feedback = check_formatting(resume_data)
    scores["formatting"] = format_score
    results["sections"]["formatting"] = {
        "score": format_score,
        "max_score": 10,
        "feedback": format_feedback
    }

    # 6. Check language quality (10 points)
    language_score, language_feedback = check_language_quality(resume_data)
    scores["language_quality"] = language_score
    results["sections"]["language_quality"] = {
        "score": language_score,
        "max_score": 10,
        "feedback": language_feedback
    }

    # Calculate overall score
    total_score = sum(scores.values())
    results["overall_score"] = min(100, total_score)  # Cap at 100

    # Identify top improvement areas
    improvement_areas = []
    for section, data in results["sections"].items():
        if data["score"] < data["max_score"] * 0.7:  # Less than 70% of max score
            improvement_areas.append({
                "area": section,
                "current_score": data["score"],
                "max_score": data["max_score"],
                "percentage": round((data["score"] / data["max_score"]) * 100),
                "recommendations": data["feedback"]
            })

    # Sort by percentage (ascending)
    improvement_areas.sort(key=lambda x: x["percentage"])
    results["improvement_areas"] = improvement_areas[:3]  # Top 3 areas to improve

    # Add overall assessment
    if total_score >= 90:
        results["assessment"] = "Excellent ATS compatibility"
        results["assessment_details"] = "Your resume is highly optimized for ATS systems. It contains all necessary sections, good keyword matching, and proper formatting."
    elif total_score >= 75:
        results["assessment"] = "Good ATS compatibility"
        results["assessment_details"] = "Your resume is well-structured for ATS systems but has some areas for improvement. Focus on the recommended improvements to increase your chances of passing ATS scans."
    elif total_score >= 60:
        results["assessment"] = "Fair ATS compatibility - improvements needed"
        results["assessment_details"] = "Your resume needs several improvements to be fully ATS-compatible. Pay close attention to the recommended changes to significantly improve your chances with ATS systems."
    else:
        results["assessment"] = "Poor ATS compatibility - significant improvements needed"
        results["assessment_details"] = "Your resume requires major improvements to pass ATS scans. Consider addressing all the recommended changes to make your resume ATS-friendly."

    logger.info(f"Enhanced ATS compatibility check completed with score: {total_score}")
    return results

def check_contact_info(resume_data: Dict[str, Any]) -> Tuple[int, List[str]]:
    """Check if all necessary contact information is present and properly formatted"""
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
            "location": resume_data.get("location", ""),
            "linkedin": resume_data.get("linkedin", "")
        }

    # Check for name
    if not basics.get("name"):
        score -= 3
        feedback.append("Missing name in contact information - this is critical for ATS identification")

    # Check for email
    email = basics.get("email", "")
    if not email:
        score -= 2
        feedback.append("Missing email address - essential contact information for employers")
    elif not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        score -= 1
        feedback.append("Email address format may not be recognized by ATS systems")

    # Check for phone
    phone = basics.get("phone", "")
    if not phone:
        score -= 2
        feedback.append("Missing phone number - essential contact information for employers")

    # Check for location
    if not basics.get("location"):
        score -= 1
        feedback.append("Missing location information - helps with geographic matching")

    # Check for LinkedIn (optional but recommended)
    if not basics.get("linkedin") and not basics.get("profiles", []):
        score -= 1
        feedback.append("Consider adding LinkedIn profile URL for better professional presence")

    # If all good and no feedback
    if not feedback:
        feedback.append("All essential contact information is present and properly formatted")

    return max(0, score), feedback

def check_section_headers(resume_data: Dict[str, Any]) -> Tuple[int, List[str]]:
    """Check if the resume has standard section headers and proper organization"""
    score = 15
    feedback = []

    # Define standard section headers
    standard_sections = [
        "summary", "experience", "work", "employment", "education",
        "skills", "certifications", "projects", "achievements", "languages"
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
        feedback.append("Missing work experience section - critical for ATS evaluation and job matching")

    if "education" not in found_sections:
        score -= 4
        feedback.append("Missing education section - important for qualification verification")

    if "skills" not in found_sections:
        score -= 4
        feedback.append("Missing skills section - crucial for keyword matching in ATS systems")

    # Check for summary/objective
    if "summary" not in found_sections and not resume_data.get("basics", {}).get("summary"):
        score -= 2
        feedback.append("Missing professional summary - helps establish relevance quickly")

    # If all good and no feedback
    if not feedback:
        feedback.append("All essential section headers are present and properly organized")

    return max(0, score), feedback

def check_content_quality(resume_data: Dict[str, Any]) -> Tuple[int, List[str]]:
    """Check the quality and length of content in the resume with detailed scoring"""
    max_score = 25
    current_score = max_score
    feedback = []
    detailed_feedback = []

    # Check summary/objective (5 points)
    summary = ""
    if "summary" in resume_data:
        summary = resume_data["summary"]
    elif resume_data.get("basics", {}).get("summary"):
        summary = resume_data["basics"]["summary"]

    if not summary:
        current_score -= 5
        feedback.append("Missing professional summary - include a concise overview of your qualifications")
        detailed_feedback.append("Summary: 0/5 points - No summary found")
    elif len(summary) < 50:
        current_score -= 3
        feedback.append("Summary is too short (under 50 characters) - expand to highlight key qualifications")
        detailed_feedback.append(f"Summary: 2/5 points - Summary is too brief ({len(summary)} characters)")
    elif len(summary) > 500:
        current_score -= 2
        feedback.append("Summary is too long (over 500 characters) - condense to be more impactful")
        detailed_feedback.append(f"Summary: 3/5 points - Summary is too long ({len(summary)} characters)")
    else:
        # Check for keywords in summary
        industry_keywords = ["experienced", "professional", "skilled", "expertise", "background",
                            "accomplished", "qualified", "specialized", "proficient"]
        keyword_count = sum(1 for keyword in industry_keywords if keyword.lower() in summary.lower())

        if keyword_count >= 3:
            detailed_feedback.append("Summary: 5/5 points - Excellent summary with strong keywords")
        else:
            current_score -= 1
            detailed_feedback.append(f"Summary: 4/5 points - Good summary but could use more industry keywords")
            feedback.append("Summary could be strengthened with more industry-relevant keywords")

    # Check experience entries (8 points)
    experience = resume_data.get("experience", resume_data.get("work", []))
    if not experience or len(experience) == 0:
        current_score -= 8
        feedback.append("No work experience entries found - this is critical content for ATS evaluation")
        detailed_feedback.append("Experience: 0/8 points - No experience entries found")
    else:
        exp_score = 8
        exp_issues = []

        # Check for dates (1 point)
        missing_dates = 0
        for job in experience:
            if not job.get("startDate") or not job.get("endDate"):
                missing_dates += 1

        if missing_dates > 0:
            date_deduction = min(1, missing_dates * 0.25)
            exp_score -= date_deduction
            feedback.append(f"Missing dates in {missing_dates} work experience entries - dates are essential for chronological evaluation")
            exp_issues.append(f"Missing dates in {missing_dates} entries (-{date_deduction} points)")

        # Check for job titles and companies (2 points)
        missing_titles_companies = 0
        for job in experience:
            if not job.get("position") and not job.get("title"):
                missing_titles_companies += 0.5
            if not job.get("company") and not job.get("organization"):
                missing_titles_companies += 0.5

        if missing_titles_companies > 0:
            title_deduction = min(2, missing_titles_companies)
            exp_score -= title_deduction
            feedback.append(f"Missing job titles or company names in experience entries - these are key ATS matching points")
            exp_issues.append(f"Missing titles/companies (-{title_deduction} points)")

        # Check for job descriptions and length (3 points)
        missing_descriptions = 0
        short_descriptions = 0

        for job in experience:
            description = job.get("description", "")
            highlights = job.get("highlights", [])

            if not description and not highlights:
                missing_descriptions += 1
            elif description and len(description) < 100 and not highlights:
                short_descriptions += 1

        desc_deduction = 0
        if missing_descriptions > 0:
            desc_deduction += min(2, missing_descriptions * 0.5)
            feedback.append(f"Missing descriptions in {missing_descriptions} work experience entries - include detailed responsibilities and achievements")
            exp_issues.append(f"Missing descriptions in {missing_descriptions} entries (-{min(2, missing_descriptions * 0.5)} points)")

        if short_descriptions > 0:
            desc_deduction += min(1, short_descriptions * 0.25)
            feedback.append(f"{short_descriptions} work experience entries have very brief descriptions - expand with specific accomplishments")
            exp_issues.append(f"Brief descriptions in {short_descriptions} entries (-{min(1, short_descriptions * 0.25)} points)")

        exp_score -= desc_deduction

        # Check for action verbs and achievements (2 points)
        weak_descriptions = 0
        missing_achievements = 0
        action_verbs = ["achieved", "improved", "led", "managed", "created", "developed", "implemented",
                        "increased", "decreased", "negotiated", "coordinated", "organized", "delivered",
                        "designed", "launched", "optimized", "reduced", "streamlined", "transformed"]

        achievement_indicators = ["increased", "decreased", "reduced", "improved", "grew", "saved",
                                 "generated", "delivered", "achieved", "won", "awarded", "recognized"]

        for job in experience:
            description = job.get("description", "").lower()
            highlights = [h.lower() for h in job.get("highlights", [])]

            # Check for action verbs
            has_action_verb = False
            for verb in action_verbs:
                if verb in description or any(verb in h for h in highlights):
                    has_action_verb = True
                    break

            if not has_action_verb and (description or highlights):
                weak_descriptions += 1

            # Check for achievements with metrics
            has_achievement = False
            for indicator in achievement_indicators:
                if indicator in description or any(indicator in h for h in highlights):
                    has_achievement = True
                    break

            if not has_achievement and (description or highlights):
                missing_achievements += 1

        achievement_deduction = 0
        if weak_descriptions > 0:
            achievement_deduction += min(1, weak_descriptions * 0.25)
            feedback.append(f"{weak_descriptions} work descriptions lack strong action verbs - use achievement-oriented language")
            exp_issues.append(f"Weak action verbs in {weak_descriptions} entries (-{min(1, weak_descriptions * 0.25)} points)")

        if missing_achievements > 0:
            achievement_deduction += min(1, missing_achievements * 0.25)
            feedback.append(f"{missing_achievements} work descriptions lack measurable achievements - include specific results and metrics")
            exp_issues.append(f"Missing achievements in {missing_achievements} entries (-{min(1, missing_achievements * 0.25)} points)")

        exp_score -= achievement_deduction

        # Calculate final experience score
        exp_score = max(0, exp_score)
        current_score = current_score - 8 + exp_score

        if exp_issues:
            detailed_feedback.append(f"Experience: {exp_score}/8 points - Issues: {', '.join(exp_issues)}")
        else:
            detailed_feedback.append("Experience: 8/8 points - Excellent experience section")

    # Check education (4 points)
    education = resume_data.get("education", [])
    if not education or len(education) == 0:
        current_score -= 4
        feedback.append("No education entries found - include your educational background")
        detailed_feedback.append("Education: 0/4 points - No education entries found")
    else:
        edu_score = 4
        edu_issues = []

        # Check for institution and degree (2 points)
        missing_edu_info = 0
        for edu in education:
            if not edu.get("institution"):
                missing_edu_info += 0.5
            if not edu.get("area") and not edu.get("studyType"):
                missing_edu_info += 0.5

        if missing_edu_info > 0:
            edu_deduction = min(2, missing_edu_info)
            edu_score -= edu_deduction
            feedback.append(f"Incomplete information in education entries - include institution and field of study")
            edu_issues.append(f"Missing institution/degree info (-{edu_deduction} points)")

        # Check for dates (1 point)
        missing_edu_dates = 0
        for edu in education:
            if not edu.get("startDate") or not edu.get("endDate"):
                missing_edu_dates += 1

        if missing_edu_dates > 0:
            date_deduction = min(1, missing_edu_dates * 0.25)
            edu_score -= date_deduction
            feedback.append(f"Missing dates in {missing_edu_dates} education entries")
            edu_issues.append(f"Missing dates (-{date_deduction} points)")

        # Check for additional details (1 point)
        has_details = False
        for edu in education:
            if edu.get("gpa") or edu.get("courses") or edu.get("highlights") or edu.get("activities"):
                has_details = True
                break

        if not has_details:
            edu_score -= 1
            feedback.append("Education entries lack additional details like GPA, courses, or achievements")
            edu_issues.append("No additional education details (-1 point)")

        # Calculate final education score
        edu_score = max(0, edu_score)
        current_score = current_score - 4 + edu_score

        if edu_issues:
            detailed_feedback.append(f"Education: {edu_score}/4 points - Issues: {', '.join(edu_issues)}")
        else:
            detailed_feedback.append("Education: 4/4 points - Excellent education section")

    # Check skills section (5 points)
    skills = resume_data.get("skills", [])
    if not skills or len(skills) == 0:
        current_score -= 5
        feedback.append("Missing skills section or no skills listed - skills are crucial for ATS keyword matching")
        detailed_feedback.append("Skills: 0/5 points - No skills listed")
    else:
        skill_score = 5
        skill_issues = []

        # Check number of skills (2 points)
        skill_count = len(skills)
        if skill_count < 5:
            skill_score -= 2
            feedback.append("Very few skills listed - include a comprehensive list of relevant technical and soft skills")
            skill_issues.append(f"Too few skills ({skill_count}) (-2 points)")
        elif skill_count < 8:
            skill_score -= 1
            feedback.append("Consider adding more skills to improve ATS matching")
            skill_issues.append(f"Could use more skills ({skill_count}) (-1 point)")

        # Check for skill categorization (1 point)
        has_categories = False
        for skill in skills:
            if isinstance(skill, dict) and (skill.get("category") or skill.get("level")):
                has_categories = True
                break

        if not has_categories:
            skill_score -= 1
            feedback.append("Skills are not categorized - consider grouping by type or proficiency level")
            skill_issues.append("No skill categorization (-1 point)")

        # Check for skill variety (2 points)
        technical_indicators = ["programming", "software", "technology", "system", "database", "framework", "language"]
        soft_indicators = ["communication", "leadership", "teamwork", "problem-solving", "management", "organization"]

        skills_text = json.dumps(skills).lower()
        has_technical = any(indicator in skills_text for indicator in technical_indicators)
        has_soft = any(indicator in skills_text for indicator in soft_indicators)

        if not has_technical and not has_soft:
            skill_score -= 2
            feedback.append("Skills lack variety - include both technical and soft skills")
            skill_issues.append("No skill variety (-2 points)")
        elif not has_technical or not has_soft:
            skill_score -= 1
            feedback.append("Skills are imbalanced - include both technical and soft skills")
            skill_issues.append("Imbalanced skill types (-1 point)")

        # Calculate final skill score
        skill_score = max(0, skill_score)
        current_score = current_score - 5 + skill_score

        if skill_issues:
            detailed_feedback.append(f"Skills: {skill_score}/5 points - Issues: {', '.join(skill_issues)}")
        else:
            detailed_feedback.append("Skills: 5/5 points - Excellent skills section")

    # Check overall resume length and structure (3 points)
    resume_str = json.dumps(resume_data)
    content_length = len(resume_str)

    length_score = 3
    length_issues = []

    if content_length < 1000:
        length_score -= 2
        feedback.append("Resume appears too short - expand with more detailed information about your experience and skills")
        length_issues.append(f"Resume too short ({content_length} chars) (-2 points)")
    elif content_length < 2000:
        length_score -= 1
        feedback.append("Resume could be more detailed - consider adding more specific information")
        length_issues.append(f"Resume somewhat brief ({content_length} chars) (-1 point)")
    elif content_length > 15000:
        length_score -= 1
        feedback.append("Resume may be too long - consider focusing on the most relevant information")
        length_issues.append(f"Resume too long ({content_length} chars) (-1 point)")

    # Check for additional sections (certifications, projects, etc.)
    additional_sections = 0
    if resume_data.get("certifications") and len(resume_data.get("certifications", [])) > 0:
        additional_sections += 1
    if resume_data.get("projects") and len(resume_data.get("projects", [])) > 0:
        additional_sections += 1
    if resume_data.get("awards") and len(resume_data.get("awards", [])) > 0:
        additional_sections += 1
    if resume_data.get("publications") and len(resume_data.get("publications", [])) > 0:
        additional_sections += 1
    if resume_data.get("volunteer") and len(resume_data.get("volunteer", [])) > 0:
        additional_sections += 1

    if additional_sections == 0:
        length_score = max(0, length_score - 1)
        feedback.append("Consider adding additional sections like certifications, projects, or awards")
        length_issues.append("No additional sections (-1 point)")

    # Calculate final length score
    current_score = current_score - 3 + length_score

    if length_issues:
        detailed_feedback.append(f"Structure & Length: {length_score}/3 points - Issues: {', '.join(length_issues)}")
    else:
        detailed_feedback.append("Structure & Length: 3/3 points - Excellent resume structure and length")

    # Add detailed feedback to the main feedback list
    feedback.extend([f"DETAILED SCORING: {item}" for item in detailed_feedback])

    # If all good and no feedback
    if len(feedback) <= len(detailed_feedback):
        feedback.insert(0, "Content quality and length are excellent - good detail level and appropriate sections")

    return max(0, current_score), feedback

def check_keyword_matching(resume_data: Dict[str, Any], job_description: str) -> Tuple[int, List[str]]:
    """Check how well the resume matches keywords from the job description with detailed analysis"""
    max_score = 30
    current_score = 0
    feedback = []
    detailed_feedback = []

    if not job_description:
        return max_score, ["No job description provided for keyword matching"]

    # Extract keywords from job description
    job_words = re.findall(r'\b[A-Za-z][A-Za-z0-9+#\-\.]{2,}\b', job_description.lower())
    job_word_counts = Counter(job_words)

    # Remove common words and very short words
    common_words = {"and", "the", "a", "an", "in", "on", "at", "to", "for", "with", "by", "of", "or",
                   "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do",
                   "does", "did", "but", "if", "then", "else", "when", "up", "down", "out", "about",
                   "our", "we", "us", "your", "you", "their", "they", "them", "this", "that", "these",
                   "those", "will", "would", "should", "could", "can", "may", "might", "must", "shall"}

    for word in list(job_word_counts.keys()):
        if word in common_words or len(word) <= 2:
            del job_word_counts[word]

    # Get top keywords (most frequent words)
    top_keywords = [word for word, _ in job_word_counts.most_common(20)]

    # Extract potential skill keywords (often nouns)
    skill_indicators = ["experience", "knowledge", "proficiency", "skill", "ability", "familiar", "proficient"]
    skill_keywords = []

    for i, word in enumerate(job_words):
        if i > 0 and job_words[i-1].lower() in skill_indicators:
            skill_keywords.append(word)

    # Add these to top keywords if not already there
    for skill in skill_keywords:
        if skill not in top_keywords and len(top_keywords) < 25:
            top_keywords.append(skill)

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

    # Calculate match percentage
    match_percentage = len(matched_keywords) / len(top_keywords) if top_keywords else 0

    # Detailed scoring breakdown (30 points total)

    # 1. Basic keyword matching (15 points)
    basic_match_score = int(match_percentage * 15)
    current_score += basic_match_score

    match_percentage_display = int(match_percentage * 100)
    detailed_feedback.append(f"Basic Keyword Matching: {basic_match_score}/15 points - {match_percentage_display}% of job keywords found")

    # 2. Keyword placement (10 points)
    placement_score = 0
    placement_issues = []

    # Check for keywords in summary (3 points)
    summary = ""
    if "summary" in resume_data:
        summary = resume_data["summary"]
    elif resume_data.get("basics", {}).get("summary"):
        summary = resume_data["basics"]["summary"]

    summary_keywords = 0
    if summary:
        summary = summary.lower()
        for keyword in top_keywords:
            if keyword in summary:
                summary_keywords += 1

    summary_match_percentage = summary_keywords / len(top_keywords) if top_keywords else 0
    summary_score = min(3, int(summary_match_percentage * 6))  # Up to 3 points
    placement_score += summary_score

    if summary_score < 2:
        placement_issues.append(f"Few keywords in summary (-{3-summary_score} points)")
        feedback.append("Add more job-specific keywords to your professional summary")

    # Check for keywords in experience (4 points)
    experience = resume_data.get("experience", resume_data.get("work", []))
    experience_keywords = 0

    if experience:
        experience_text = json.dumps(experience).lower()
        for keyword in top_keywords:
            if keyword in experience_text:
                experience_keywords += 1

    experience_match_percentage = experience_keywords / len(top_keywords) if top_keywords else 0
    experience_score = min(4, int(experience_match_percentage * 8))  # Up to 4 points
    placement_score += experience_score

    if experience_score < 3:
        placement_issues.append(f"Few keywords in experience section (-{4-experience_score} points)")
        feedback.append("Incorporate more job-specific keywords in your work experience descriptions")

    # Check for keywords in skills (3 points)
    skills = resume_data.get("skills", [])
    skills_keywords = 0

    if skills:
        skills_text = json.dumps(skills).lower()
        for keyword in top_keywords:
            if keyword in skills_text:
                skills_keywords += 1

    skills_match_percentage = skills_keywords / len(top_keywords) if top_keywords else 0
    skills_score = min(3, int(skills_match_percentage * 6))  # Up to 3 points
    placement_score += skills_score

    if skills_score < 2:
        placement_issues.append(f"Few keywords in skills section (-{3-skills_score} points)")
        feedback.append("Add more job-specific skills to your skills section")

    current_score += placement_score

    if placement_issues:
        detailed_feedback.append(f"Keyword Placement: {placement_score}/10 points - Issues: {', '.join(placement_issues)}")
    else:
        detailed_feedback.append(f"Keyword Placement: {placement_score}/10 points - Good keyword distribution across sections")

    # 3. Keyword density and context (5 points)
    density_score = 0
    density_issues = []

    # Calculate keyword density
    resume_word_count = len(re.findall(r'\b\w+\b', resume_text))
    keyword_instances = 0

    for keyword in matched_keywords:
        keyword_instances += len(re.findall(r'\b' + re.escape(keyword) + r'\b', resume_text))

    keyword_density = keyword_instances / resume_word_count if resume_word_count > 0 else 0

    # Ideal density is around 3-5%
    if 0.03 <= keyword_density <= 0.05:
        density_score += 3
    elif 0.02 <= keyword_density < 0.03 or 0.05 < keyword_density <= 0.07:
        density_score += 2
        density_issues.append("Keyword density slightly off optimal range")
        if keyword_density < 0.03:
            feedback.append("Keyword density is slightly low - incorporate more relevant terms")
        else:
            feedback.append("Keyword density is slightly high - ensure natural integration of keywords")
    else:
        density_score += 1
        density_issues.append("Keyword density far from optimal range")
        if keyword_density < 0.02:
            feedback.append("Keyword density is too low - significantly increase relevant terms")
        else:
            feedback.append("Keyword density is too high - may appear as keyword stuffing to ATS")

    # Check for natural keyword context (2 points)
    # This is a simplified check - in a real implementation, this would be more sophisticated
    natural_context = True
    for keyword in matched_keywords[:5]:  # Check first 5 matched keywords
        keyword_pattern = r'\b' + re.escape(keyword) + r'\b'
        keyword_contexts = re.findall(r'[^.!?]*' + keyword_pattern + r'[^.!?]*', resume_text)

        for context in keyword_contexts[:2]:  # Check first 2 instances
            if len(context.split()) < 5:  # Very short context suggests unnatural placement
                natural_context = False
                break

        if not natural_context:
            break

    if natural_context:
        density_score += 2
    else:
        density_score += 1
        density_issues.append("Keywords may not be used in natural context")
        feedback.append("Ensure keywords are used naturally in complete sentences, not just listed")

    current_score += density_score

    if density_issues:
        detailed_feedback.append(f"Keyword Density & Context: {density_score}/5 points - Issues: {', '.join(density_issues)}")
    else:
        detailed_feedback.append(f"Keyword Density & Context: {density_score}/5 points - Optimal keyword usage")

    # Provide overall assessment
    if match_percentage >= 0.8:
        feedback.insert(0, "Excellent keyword matching with job description (over 80% match)")
    elif match_percentage >= 0.6:
        feedback.insert(0, "Good keyword matching (60-80% match), but some important terms are missing")
    elif match_percentage >= 0.4:
        feedback.insert(0, "Fair keyword matching (40-60% match) - resume needs better alignment with job requirements")
    else:
        feedback.insert(0, "Poor keyword matching (under 40% match) - resume needs significant tailoring to the job description")

    # Provide specific keyword recommendations
    if missing_keywords:
        critical_missing = missing_keywords[:min(5, len(missing_keywords))]
        feedback.append(f"Consider adding these important keywords: {', '.join(critical_missing)}")

        # Suggest sections for keywords
        feedback.append("These keywords should be incorporated naturally in your summary, experience, and skills sections")

    # Highlight matched keywords as a positive
    if matched_keywords:
        feedback.append(f"Good use of these relevant keywords: {', '.join(matched_keywords[:5])}")

    # Add detailed feedback
    feedback.extend([f"DETAILED SCORING: {item}" for item in detailed_feedback])

    return current_score, feedback

def check_formatting(resume_data: Dict[str, Any]) -> Tuple[int, List[str]]:
    """Check for potential formatting issues that might affect ATS parsing with detailed scoring"""
    max_score = 10
    current_score = max_score
    feedback = []
    detailed_feedback = []

    # Convert to string to check for potential formatting issues
    resume_str = json.dumps(resume_data)

    # 1. Check for ATS-unfriendly structures (4 points)
    structure_score = 4
    structure_issues = []

    # Check for potential table structures (simplified check)
    if "table" in resume_str.lower() or "colspan" in resume_str.lower() or "rowspan" in resume_str.lower():
        structure_score -= 2
        feedback.append("Possible table structures detected - these may not parse well in ATS systems")
        structure_issues.append("Table structures detected (-2 points)")

    # Check for potential image references
    if "image" in resume_str.lower() or "img" in resume_str.lower() or ".jpg" in resume_str.lower() or ".png" in resume_str.lower():
        structure_score -= 1
        feedback.append("Possible image references detected - ATS systems cannot read images")
        structure_issues.append("Image references detected (-1 point)")

    # Check for complex formatting
    if "font" in resume_str.lower() or "style" in resume_str.lower() or "color" in resume_str.lower():
        structure_score -= 1
        feedback.append("Complex formatting detected - keep formatting simple for best ATS compatibility")
        structure_issues.append("Complex formatting detected (-1 point)")

    current_score = current_score - 4 + structure_score

    if structure_issues:
        detailed_feedback.append(f"ATS-Friendly Structure: {structure_score}/4 points - Issues: {', '.join(structure_issues)}")
    else:
        detailed_feedback.append("ATS-Friendly Structure: 4/4 points - Clean, ATS-friendly structure")

    # 2. Check for special characters and symbols (3 points)
    character_score = 3
    character_issues = []

    # Check for special characters
    special_chars = set(string.punctuation) - {'.', ',', '-', ':', ';', '(', ')', '/', '@'}
    special_char_count = sum(1 for char in resume_str if char in special_chars)

    if special_char_count > 30:
        character_score -= 3
        feedback.append("Excessive special characters detected - these can confuse ATS systems")
        character_issues.append(f"Too many special characters ({special_char_count}) (-3 points)")
    elif special_char_count > 20:
        character_score -= 2
        feedback.append("Many special characters detected - reduce these for better ATS compatibility")
        character_issues.append(f"Many special characters ({special_char_count}) (-2 points)")
    elif special_char_count > 10:
        character_score -= 1
        feedback.append("Some special characters detected - consider reducing these")
        character_issues.append(f"Some special characters ({special_char_count}) (-1 point)")

    # Check for non-standard Unicode characters
    non_standard_chars = sum(1 for char in resume_str if ord(char) > 127 and char not in "•–—""''…€£¥")

    if non_standard_chars > 10:
        character_score = max(0, character_score - 2)
        feedback.append("Non-standard Unicode characters detected - these may not be recognized by ATS systems")
        character_issues.append(f"Non-standard Unicode characters ({non_standard_chars}) (-2 points)")
    elif non_standard_chars > 0:
        character_score = max(0, character_score - 1)
        feedback.append("Some non-standard Unicode characters detected - replace with standard characters")
        character_issues.append(f"Some non-standard Unicode characters ({non_standard_chars}) (-1 point)")

    current_score = current_score - 3 + character_score

    if character_issues:
        detailed_feedback.append(f"Character Usage: {character_score}/3 points - Issues: {', '.join(character_issues)}")
    else:
        detailed_feedback.append("Character Usage: 3/3 points - Appropriate character usage")

    # 3. Check for formatting consistency (3 points)
    consistency_score = 3
    consistency_issues = []

    # Check for bullet point consistency
    bullet_variations = [
        "•", "‣", "⁃", "⁌", "⁍", "-", "*", "o", "▪", "▫", "◦", "⦿", "⦾"
    ]

    bullet_counts = {bullet: resume_str.count(bullet) for bullet in bullet_variations}
    bullet_types_used = sum(1 for count in bullet_counts.values() if count > 0)

    if bullet_types_used > 2:
        consistency_score -= 1
        feedback.append("Multiple bullet point styles detected - use consistent formatting")
        consistency_issues.append(f"Multiple bullet styles ({bullet_types_used}) (-1 point)")

    # Check for date format consistency
    date_formats = []
    date_pattern1 = re.compile(r'\d{4}-\d{2}')  # YYYY-MM
    date_pattern2 = re.compile(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b')  # Month YYYY
    date_pattern3 = re.compile(r'\d{2}/\d{2}/\d{4}')  # MM/DD/YYYY or DD/MM/YYYY

    if date_pattern1.search(resume_str):
        date_formats.append("YYYY-MM")
    if date_pattern2.search(resume_str):
        date_formats.append("Month YYYY")
    if date_pattern3.search(resume_str):
        date_formats.append("MM/DD/YYYY")

    if len(date_formats) > 1:
        consistency_score -= 1
        feedback.append("Inconsistent date formats detected - use a single date format throughout")
        consistency_issues.append(f"Inconsistent date formats ({', '.join(date_formats)}) (-1 point)")

    # Check for section heading consistency
    section_headings = []
    for key in resume_data.keys():
        if key not in ["basics", "meta", "schema"]:
            section_headings.append(key)

    # Check for capitalization consistency
    capitalization_styles = set()
    for heading in section_headings:
        if heading.isupper():
            capitalization_styles.add("ALL CAPS")
        elif heading[0].isupper() and heading[1:].islower():
            capitalization_styles.add("Title Case")
        elif heading.islower():
            capitalization_styles.add("lowercase")
        else:
            capitalization_styles.add("Mixed")

    if len(capitalization_styles) > 1:
        consistency_score -= 1
        feedback.append("Inconsistent capitalization in section headings - use consistent capitalization")
        consistency_issues.append(f"Inconsistent heading capitalization (-1 point)")

    current_score = current_score - 3 + consistency_score

    if consistency_issues:
        detailed_feedback.append(f"Formatting Consistency: {consistency_score}/3 points - Issues: {', '.join(consistency_issues)}")
    else:
        detailed_feedback.append("Formatting Consistency: 3/3 points - Consistent formatting throughout")

    # Add detailed feedback to the main feedback list
    feedback.extend([f"DETAILED SCORING: {item}" for item in detailed_feedback])

    # If all good and no feedback
    if len(feedback) <= len(detailed_feedback):
        feedback.insert(0, "No formatting issues detected - resume has clean, ATS-friendly formatting")

    return max(0, current_score), feedback

def check_language_quality(resume_data: Dict[str, Any]) -> Tuple[int, List[str]]:
    """Check the language quality, including grammar, spelling, and professional tone with detailed scoring"""
    max_score = 10
    current_score = max_score
    feedback = []
    detailed_feedback = []

    # Convert resume to text for analysis
    resume_str = json.dumps(resume_data).lower()

    # 1. Check for professional tone (3 points)
    tone_score = 3
    tone_issues = []

    # Check for filler words and weak language
    filler_words = ["very", "really", "basically", "actually", "literally", "just", "quite",
                   "simply", "that", "totally", "definitely", "certainly", "probably", "usually"]

    filler_count = sum(resume_str.count(f" {word} ") for word in filler_words)

    if filler_count > 10:
        tone_score -= 2
        feedback.append("Excessive filler words detected - use more precise, impactful language")
        tone_issues.append(f"Too many filler words ({filler_count}) (-2 points)")
    elif filler_count > 5:
        tone_score -= 1
        feedback.append("Several filler words detected - use more precise language")
        tone_issues.append(f"Several filler words ({filler_count}) (-1 point)")

    # Check for first-person pronouns (should be minimal in a resume)
    first_person = ["i ", "me ", "my ", "mine ", "myself ", "we ", "our ", "us "]
    first_person_count = sum(resume_str.count(pronoun) for pronoun in first_person)

    if first_person_count > 10:
        tone_score = max(0, tone_score - 2)
        feedback.append("Excessive use of first-person pronouns - focus on achievements rather than 'I' statements")
        tone_issues.append(f"Too many first-person pronouns ({first_person_count}) (-2 points)")
    elif first_person_count > 5:
        tone_score = max(0, tone_score - 1)
        feedback.append("Several first-person pronouns - consider reducing personal references")
        tone_issues.append(f"Several first-person pronouns ({first_person_count}) (-1 point)")

    current_score = current_score - 3 + tone_score

    if tone_issues:
        detailed_feedback.append(f"Professional Tone: {tone_score}/3 points - Issues: {', '.join(tone_issues)}")
    else:
        detailed_feedback.append("Professional Tone: 3/3 points - Excellent professional tone")

    # 2. Check for active vs. passive voice (3 points)
    voice_score = 3
    voice_issues = []

    # Check for passive voice indicators
    passive_indicators = ["was performed", "were provided", "was responsible", "were made",
                         "was created", "were developed", "was managed", "were handled",
                         "was utilized", "were utilized", "was completed", "were completed",
                         "was conducted", "were conducted", "was implemented", "were implemented"]

    passive_count = sum(resume_str.count(phrase) for phrase in passive_indicators)

    if passive_count > 6:
        voice_score -= 3
        feedback.append("Significant passive voice detected - use active voice for stronger impact")
        voice_issues.append(f"Excessive passive voice ({passive_count} instances) (-3 points)")
    elif passive_count > 3:
        voice_score -= 2
        feedback.append("Moderate passive voice detected - use more active voice")
        voice_issues.append(f"Moderate passive voice ({passive_count} instances) (-2 points)")
    elif passive_count > 1:
        voice_score -= 1
        feedback.append("Some passive voice detected - prefer active voice for impact")
        voice_issues.append(f"Some passive voice ({passive_count} instances) (-1 point)")

    # Check for action verbs (positive indicator)
    action_verbs = ["achieved", "improved", "led", "managed", "created", "developed", "implemented",
                    "increased", "decreased", "negotiated", "coordinated", "organized", "delivered",
                    "designed", "launched", "optimized", "reduced", "streamlined", "transformed"]

    action_verb_count = sum(resume_str.count(f" {verb} ") for verb in action_verbs)

    if action_verb_count < 3:
        voice_score = max(0, voice_score - 1)
        feedback.append("Few action verbs detected - use more powerful action verbs")
        voice_issues.append("Few action verbs (-1 point)")

    current_score = current_score - 3 + voice_score

    if voice_issues:
        detailed_feedback.append(f"Active Voice: {voice_score}/3 points - Issues: {', '.join(voice_issues)}")
    else:
        detailed_feedback.append("Active Voice: 3/3 points - Excellent use of active voice")

    # 3. Check for grammar, spelling, and tense consistency (4 points)
    grammar_score = 4
    grammar_issues = []

    # Check for potential spelling/grammar issues (simplified)
    common_errors = ["recieve", "accomodate", "seperate", "occured", "refered", "beleive",
                    "acheive", "recieved", "occuring", "definately", "relevent", "alot",
                    "thier", "wich", "becuase", "untill", "accross", "reccomend", "supercede"]

    error_count = sum(resume_str.count(error) for error in common_errors)

    if error_count > 3:
        grammar_score -= 2
        feedback.append(f"Multiple potential spelling errors detected - proofread carefully")
        grammar_issues.append(f"Multiple spelling errors ({error_count}) (-2 points)")
    elif error_count > 0:
        grammar_score -= 1
        feedback.append(f"Potential spelling errors detected - proofread carefully")
        grammar_issues.append(f"Some spelling errors ({error_count}) (-1 point)")

    # Check for consistency in tense (current jobs should use present tense)
    experience = resume_data.get("experience", resume_data.get("work", []))
    tense_issues_count = 0

    for job in experience:
        is_current = False
        if job.get("endDate") in ["Present", "present", "Current", "current", ""]:
            is_current = True

        description = job.get("description", "").lower()

        # Skip if no description
        if not description:
            continue

        # Check for present tense verbs in current positions
        present_tense_verbs = ["manage", "lead", "create", "develop", "implement", "coordinate", "organize"]
        past_tense_verbs = ["managed", "led", "created", "developed", "implemented", "coordinated", "organized"]

        if is_current:
            # Current job should use present tense
            past_tense_count = sum(description.count(verb) for verb in past_tense_verbs)
            if past_tense_count > 3:
                tense_issues_count += 1
        else:
            # Past job should use past tense
            present_tense_count = sum(description.count(verb) for verb in present_tense_verbs)
            if present_tense_count > 3:
                tense_issues_count += 1

    if tense_issues_count > 2:
        grammar_score = max(0, grammar_score - 2)
        feedback.append("Significant inconsistency in verb tense - use present tense for current positions and past tense for previous positions")
        grammar_issues.append(f"Significant tense inconsistency ({tense_issues_count} positions) (-2 points)")
    elif tense_issues_count > 0:
        grammar_score = max(0, grammar_score - 1)
        feedback.append("Some inconsistency in verb tense - maintain consistent tense based on position status")
        grammar_issues.append(f"Some tense inconsistency ({tense_issues_count} positions) (-1 point)")

    # Check for sentence fragments (simplified)
    fragments = 0
    sentences = re.findall(r'[^.!?]+[.!?]', resume_str)

    for sentence in sentences:
        words = sentence.strip().split()
        if len(words) < 3:  # Very short sentences are often fragments
            fragments += 1

    if fragments > 5:
        grammar_score = max(0, grammar_score - 1)
        feedback.append("Multiple sentence fragments detected - use complete sentences")
        grammar_issues.append(f"Multiple sentence fragments ({fragments}) (-1 point)")

    current_score = current_score - 4 + grammar_score

    if grammar_issues:
        detailed_feedback.append(f"Grammar & Spelling: {grammar_score}/4 points - Issues: {', '.join(grammar_issues)}")
    else:
        detailed_feedback.append("Grammar & Spelling: 4/4 points - Excellent grammar and spelling")

    # Add detailed feedback to the main feedback list
    feedback.extend([f"DETAILED SCORING: {item}" for item in detailed_feedback])

    # If all good and no feedback
    if len(feedback) <= len(detailed_feedback):
        feedback.insert(0, "Language quality is excellent - professional tone and good grammar")

    return max(0, current_score), feedback
