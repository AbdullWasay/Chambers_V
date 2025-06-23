import os
import json
import logging
import uuid
import tempfile
from datetime import datetime
from pathlib import Path
from flask import jsonify, request, send_file
import boto3
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Helper function to normalize resume data
def normalize_resume_data(resume_data):
    """
    Normalizes resume data to ensure all required fields are present and properly formatted
    This helps with compatibility between different JSON formats
    """
    if not resume_data:
        return {}

    # Create a deep copy to avoid modifying the original data
    normalized_data = json.loads(json.dumps(resume_data))

    # Ensure basics section exists
    if 'basics' not in normalized_data:
        normalized_data['basics'] = {}

    # If name, title, etc. are at the top level but not in basics, move them to basics
    if 'name' in normalized_data and 'name' not in normalized_data['basics']:
        normalized_data['basics']['name'] = normalized_data['name']

    if 'title' in normalized_data and 'title' not in normalized_data['basics']:
        normalized_data['basics']['title'] = normalized_data['title']

    if 'email' in normalized_data and 'email' not in normalized_data['basics']:
        normalized_data['basics']['email'] = normalized_data['email']

    if 'phone' in normalized_data and 'phone' not in normalized_data['basics']:
        normalized_data['basics']['phone'] = normalized_data['phone']

    if 'location' in normalized_data and 'location' not in normalized_data['basics']:
        normalized_data['basics']['location'] = normalized_data['location']

    # If summary is in basics but not at top level, copy it to top level
    if 'summary' in normalized_data['basics'] and 'summary' not in normalized_data:
        normalized_data['summary'] = normalized_data['basics']['summary']

    # Normalize experience section
    if 'experience' in normalized_data and isinstance(normalized_data['experience'], list):
        normalized_data['experience'] = [normalize_experience(exp) for exp in normalized_data['experience']]

    # Normalize education section
    if 'education' in normalized_data and isinstance(normalized_data['education'], list):
        normalized_data['education'] = [normalize_education(edu) for edu in normalized_data['education']]

    # Normalize skills section
    if 'skills' in normalized_data and isinstance(normalized_data['skills'], list):
        normalized_data['skills'] = [normalize_skill(skill) for skill in normalized_data['skills']]

    # Normalize languages section
    if 'languages' in normalized_data and isinstance(normalized_data['languages'], list):
        normalized_data['languages'] = [normalize_language(lang) for lang in normalized_data['languages']]

    # Normalize projects section
    if 'projects' in normalized_data and isinstance(normalized_data['projects'], list):
        normalized_data['projects'] = [normalize_project(project) for project in normalized_data['projects']]

    # Map awards to achievements if achievements doesn't exist
    if 'achievements' not in normalized_data and 'awards' in normalized_data and isinstance(normalized_data['awards'], list):
        normalized_data['achievements'] = [{
            'title': award.get('title', 'Award'),
            'date': award.get('date', ''),
            'organization': award.get('awarder', ''),
            'description': award.get('summary', '')
        } for award in normalized_data['awards']]

    return normalized_data

def normalize_experience(exp):
    """Normalize an experience entry"""
    # Ensure highlights exists and is an array
    if 'highlights' not in exp and 'description' in exp:
        exp['highlights'] = [exp['description']]
    elif 'highlights' not in exp:
        exp['highlights'] = []

    # Ensure dates are properly formatted
    if 'startDate' in exp and not isinstance(exp['startDate'], str):
        exp['startDate'] = str(exp['startDate'])

    if 'endDate' in exp and not isinstance(exp['endDate'], str):
        exp['endDate'] = str(exp['endDate'])

    return exp

def normalize_education(edu):
    """Normalize an education entry"""
    # Map studyType to degree if degree doesn't exist
    if 'degree' not in edu and 'studyType' in edu:
        edu['degree'] = edu['studyType']

    # Map institution to school if school doesn't exist
    if 'school' not in edu and 'institution' in edu:
        edu['school'] = edu['institution']

    # Ensure dates are properly formatted
    if 'startDate' in edu and not isinstance(edu['startDate'], str):
        edu['startDate'] = str(edu['startDate'])

    if 'endDate' in edu and not isinstance(edu['endDate'], str):
        edu['endDate'] = str(edu['endDate'])

    return edu

def normalize_skill(skill):
    """Normalize a skill entry"""
    # If skill has name and keywords, format it properly for the template
    if isinstance(skill, dict):
        if 'name' in skill and 'keywords' in skill:
            return {
                'category': skill['name'],
                'items': skill['keywords'] if isinstance(skill['keywords'], list) else [skill['keywords']]
            }
        elif 'name' in skill:
            return skill['name']
    elif isinstance(skill, str):
        return skill

    return skill

def normalize_language(lang):
    """Normalize a language entry"""
    if isinstance(lang, dict):
        # Map fluency to proficiency if proficiency doesn't exist
        if 'proficiency' not in lang and 'fluency' in lang:
            lang['proficiency'] = lang['fluency']

    return lang

def normalize_project(project):
    """Normalize a project entry"""
    if isinstance(project, dict):
        # Map keywords to technologies if technologies doesn't exist
        if 'technologies' not in project and 'keywords' in project:
            project['technologies'] = project['keywords'] if isinstance(project['keywords'], list) else [project['keywords']]

    return project

# Helper function to format dates from YYYY-MM to Month Year
def format_date(date_string):
    """Format date from YYYY-MM to Month Year"""
    if not date_string:
        return ''

    # Handle 'Present' or other non-date strings
    if date_string.lower() == 'present' or '-' not in date_string:
        return date_string

    try:
        year, month = date_string.split('-')
        date = datetime(int(year), int(month), 1)
        return date.strftime('%B %Y')
    except Exception as e:
        logger.error(f'Error formatting date: {e}')
        return date_string

def generate_pdf(resume_data, template, design_settings, output_path):
    """
    Generate a PDF version of the resume
    Uses ReportLab to create a properly formatted PDF with the specified dimensions
    Supports multi-page resumes with proper content flow
    """
    try:
        logger.info('Generating multi-page PDF file with ReportLab...')

        # Create a PDF document with A4 dimensions
        # A4 size is 210mm x 297mm (8.27in x 11.69in)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        # Set document metadata
        doc.title = f"Resume - {resume_data.get('basics', {}).get('name', 'No Name')}"
        doc.author = resume_data.get('basics', {}).get('name', 'Resume Generator')
        doc.subject = 'Professional Resume'
        doc.keywords = ['resume', 'cv', 'professional']

        # Get design settings
        font_family = design_settings.get('font', 'Helvetica') if design_settings else 'Helvetica'
        font_size = design_settings.get('fontSize', 12) if design_settings else 12
        primary_color = design_settings.get('colors', {}).get('primary', '#4a6cf7') if design_settings else '#4a6cf7'

        # Convert hex color to RGB
        def hex_to_rgb(hex_color):
            hex_color = hex_color.lstrip('#')
            return tuple(int(hex_color[i:i+2], 16)/255 for i in (0, 2, 4))

        primary_rgb = hex_to_rgb(primary_color)

        # Create styles
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Title'],
            fontName=f'{font_family}-Bold',
            fontSize=18,
            alignment=TA_CENTER,
            spaceAfter=10
        )

        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontName=font_family,
            fontSize=12,
            alignment=TA_CENTER,
            spaceAfter=5
        )

        contact_style = ParagraphStyle(
            'Contact',
            parent=styles['Normal'],
            fontName=font_family,
            fontSize=8,
            alignment=TA_CENTER,
            spaceAfter=15
        )

        section_title_style = ParagraphStyle(
            'SectionTitle',
            parent=styles['Heading2'],
            fontName=f'{font_family}-Bold',
            fontSize=10,
            textColor=primary_rgb,
            spaceAfter=5
        )

        item_title_style = ParagraphStyle(
            'ItemTitle',
            parent=styles['Normal'],
            fontName=f'{font_family}-Bold',
            fontSize=9,
            spaceAfter=2
        )

        item_subtitle_style = ParagraphStyle(
            'ItemSubtitle',
            parent=styles['Normal'],
            fontName=font_family,
            fontSize=8,
            spaceAfter=2
        )

        normal_style = ParagraphStyle(
            'Normal',
            parent=styles['Normal'],
            fontName=font_family,
            fontSize=8,
            spaceAfter=5
        )

        bullet_style = ParagraphStyle(
            'Bullet',
            parent=styles['Normal'],
            fontName=font_family,
            fontSize=8,
            leftIndent=20,
            spaceAfter=2
        )

        # Build the document content
        elements = []

        # Add header with name and title
        name = resume_data.get('basics', {}).get('name', 'No Name')
        elements.append(Paragraph(name, title_style))

        title = resume_data.get('basics', {}).get('title', 'No Title')
        elements.append(Paragraph(title, subtitle_style))

        # Add contact information
        contact_info = []

        email = resume_data.get('basics', {}).get('email')
        if email:
            contact_info.append(f"Email: {email}")

        phone = resume_data.get('basics', {}).get('phone')
        if phone:
            contact_info.append(f"Phone: {phone}")

        location = resume_data.get('basics', {}).get('location')
        if location:
            if isinstance(location, dict):
                location_str = location.get('city', '')
                if location.get('region'):
                    location_str += f", {location['region']}"
                contact_info.append(f"Location: {location_str}")
            else:
                contact_info.append(f"Location: {location}")

        if contact_info:
            elements.append(Paragraph(" | ".join(contact_info), contact_style))

        # Add summary
        summary = resume_data.get('summary') or resume_data.get('basics', {}).get('summary')
        if summary:
            elements.append(Paragraph("SUMMARY", section_title_style))
            elements.append(Paragraph(summary, normal_style))
            elements.append(Spacer(1, 10))

        # Add experience
        if 'experience' in resume_data and resume_data['experience']:
            elements.append(Paragraph("EXPERIENCE", section_title_style))

            for exp in resume_data['experience']:
                job_title = exp.get('title', 'Position')
                company = exp.get('company', 'Company')
                elements.append(Paragraph(f"{job_title} at {company}", item_title_style))

                # Format dates
                start_date = format_date(exp.get('startDate', ''))
                end_date = format_date(exp.get('endDate', 'Present'))
                elements.append(Paragraph(f"{start_date} - {end_date}", item_subtitle_style))

                if exp.get('location'):
                    elements.append(Paragraph(exp['location'], item_subtitle_style))

                # Add highlights as bullet points
                if exp.get('highlights') and exp['highlights']:
                    for highlight in exp['highlights']:
                        elements.append(Paragraph(f"• {highlight}", bullet_style))
                elif exp.get('description'):
                    elements.append(Paragraph(exp['description'], normal_style))

                elements.append(Spacer(1, 5))

            elements.append(Spacer(1, 5))

        # Add education
        if 'education' in resume_data and resume_data['education']:
            elements.append(Paragraph("EDUCATION", section_title_style))

            for edu in resume_data['education']:
                degree_text = ""
                if edu.get('studyType') and edu.get('area'):
                    degree_text = f"{edu['studyType']} in {edu['area']}"
                elif edu.get('studyType'):
                    degree_text = edu['studyType']
                elif edu.get('area'):
                    degree_text = f"Degree in {edu['area']}"
                elif edu.get('degree'):
                    degree_text = edu['degree']
                else:
                    degree_text = "Degree"

                elements.append(Paragraph(degree_text, item_title_style))

                if edu.get('institution') or edu.get('school'):
                    school = edu.get('institution') or edu.get('school', 'Institution')
                    elements.append(Paragraph(school, item_subtitle_style))

                # Format dates
                start_date = format_date(edu.get('startDate', ''))
                end_date = format_date(edu.get('endDate', 'Present'))
                if start_date or end_date:
                    elements.append(Paragraph(f"{start_date} - {end_date}", item_subtitle_style))

                elements.append(Spacer(1, 5))

            elements.append(Spacer(1, 5))

        # Add skills
        if 'skills' in resume_data and resume_data['skills']:
            elements.append(Paragraph("SKILLS", section_title_style))

            for skill in resume_data['skills']:
                if isinstance(skill, dict):
                    if 'category' in skill and 'items' in skill:
                        skill_text = f"{skill['category']}: {', '.join(skill['items'][:5])}"
                        if len(skill['items']) > 5:
                            skill_text += "..."
                        elements.append(Paragraph(skill_text, normal_style))
                    elif 'name' in skill and 'keywords' in skill:
                        keywords = skill['keywords']
                        if isinstance(keywords, list):
                            skill_text = f"{skill['name']}: {', '.join(keywords[:5])}"
                            if len(keywords) > 5:
                                skill_text += "..."
                        else:
                            skill_text = f"{skill['name']}: {keywords}"
                        elements.append(Paragraph(skill_text, normal_style))
                    elif 'name' in skill and 'level' in skill:
                        elements.append(Paragraph(f"{skill['name']}: {skill['level']}", normal_style))
                    elif 'name' in skill:
                        elements.append(Paragraph(skill['name'], normal_style))
                elif isinstance(skill, str):
                    elements.append(Paragraph(skill, normal_style))

            elements.append(Spacer(1, 5))

        # Add projects
        if 'projects' in resume_data and resume_data['projects']:
            elements.append(Paragraph("PROJECTS", section_title_style))

            for project in resume_data['projects']:
                elements.append(Paragraph(project.get('name', 'Project'), item_title_style))

                if project.get('description'):
                    elements.append(Paragraph(project['description'], normal_style))

                if project.get('highlights') and project['highlights']:
                    for highlight in project['highlights']:
                        elements.append(Paragraph(f"• {highlight}", bullet_style))

                elements.append(Spacer(1, 5))

            elements.append(Spacer(1, 5))

        # Add certifications
        if 'certifications' in resume_data and resume_data['certifications']:
            elements.append(Paragraph("CERTIFICATIONS", section_title_style))

            for cert in resume_data['certifications']:
                elements.append(Paragraph(cert.get('name', 'Certification'), item_title_style))

                cert_info = []
                if cert.get('issuer'):
                    cert_info.append(f"Issuer: {cert['issuer']}")
                if cert.get('date'):
                    cert_info.append(f"Date: {format_date(cert['date'])}")

                if cert_info:
                    elements.append(Paragraph(" | ".join(cert_info), item_subtitle_style))

                elements.append(Spacer(1, 5))

            elements.append(Spacer(1, 5))

        # Add languages
        if 'languages' in resume_data and resume_data['languages']:
            elements.append(Paragraph("LANGUAGES", section_title_style))

            languages_text = " | ".join([
                f"{lang.get('language', 'Language')}: {lang.get('fluency', lang.get('proficiency', 'Fluent'))}"
                for lang in resume_data['languages']
            ])

            elements.append(Paragraph(languages_text, normal_style))
            elements.append(Spacer(1, 10))

        # Build the PDF
        doc.build(elements)

        logger.info('PDF file created successfully')
        return True
    except Exception as error:
        logger.error(f'Error generating PDF: {error}')
        raise error

def generate_docx(resume_data, template, design_settings, output_path):
    """
    Generate a DOCX version of the resume
    """
    try:
        logger.info('Generating DOCX file...')

        # For now, we'll just create a simple text file with .docx extension
        # In a real implementation, you would use a library like python-docx
        with open(output_path, 'w', encoding='utf-8') as f:
            # Write header
            f.write(f"{resume_data.get('basics', {}).get('name', 'No Name')}\n")
            f.write(f"{resume_data.get('basics', {}).get('title', 'No Title')}\n\n")

            # Write contact info
            contact_info = []
            if resume_data.get('basics', {}).get('email'):
                contact_info.append(f"Email: {resume_data['basics']['email']}")
            if resume_data.get('basics', {}).get('phone'):
                contact_info.append(f"Phone: {resume_data['basics']['phone']}")
            if resume_data.get('basics', {}).get('location'):
                if isinstance(resume_data['basics']['location'], dict):
                    location = resume_data['basics']['location'].get('city', '')
                    if resume_data['basics']['location'].get('region'):
                        location += f", {resume_data['basics']['location']['region']}"
                    contact_info.append(f"Location: {location}")
                else:
                    contact_info.append(f"Location: {resume_data['basics']['location']}")

            if contact_info:
                f.write(" | ".join(contact_info) + "\n\n")

            # Write summary
            summary = resume_data.get('summary') or resume_data.get('basics', {}).get('summary')
            if summary:
                f.write("SUMMARY\n")
                f.write(f"{summary}\n\n")

            # Write experience
            if 'experience' in resume_data and resume_data['experience']:
                f.write("EXPERIENCE\n")

                for exp in resume_data['experience']:
                    f.write(f"{exp.get('title', 'Position')} at {exp.get('company', 'Company')}\n")

                    # Format dates
                    start_date = format_date(exp.get('startDate', ''))
                    end_date = format_date(exp.get('endDate', 'Present'))
                    f.write(f"{start_date} - {end_date}\n")

                    if exp.get('location'):
                        f.write(f"{exp['location']}\n")

                    # Write highlights
                    if exp.get('highlights') and exp['highlights']:
                        for highlight in exp['highlights']:
                            f.write(f"• {highlight}\n")
                    elif exp.get('description'):
                        f.write(f"{exp['description']}\n")

                    f.write("\n")

            # Write education
            if 'education' in resume_data and resume_data['education']:
                f.write("EDUCATION\n")

                for edu in resume_data['education']:
                    degree_text = ""
                    if edu.get('studyType') and edu.get('area'):
                        degree_text = f"{edu['studyType']} in {edu['area']}"
                    elif edu.get('studyType'):
                        degree_text = edu['studyType']
                    elif edu.get('area'):
                        degree_text = f"Degree in {edu['area']}"
                    elif edu.get('degree'):
                        degree_text = edu['degree']
                    else:
                        degree_text = "Degree"

                    f.write(f"{degree_text}\n")

                    if edu.get('institution') or edu.get('school'):
                        school = edu.get('institution') or edu.get('school', 'Institution')
                        f.write(f"{school}\n")

                    # Format dates
                    start_date = format_date(edu.get('startDate', ''))
                    end_date = format_date(edu.get('endDate', 'Present'))
                    if start_date or end_date:
                        f.write(f"{start_date} - {end_date}\n")

                    f.write("\n")

            # Write skills
            if 'skills' in resume_data and resume_data['skills']:
                f.write("SKILLS\n")

                for skill in resume_data['skills']:
                    if isinstance(skill, dict):
                        if 'category' in skill and 'items' in skill:
                            f.write(f"{skill['category']}: {', '.join(skill['items'])}\n")
                        elif 'name' in skill and 'keywords' in skill:
                            keywords = skill['keywords']
                            if isinstance(keywords, list):
                                f.write(f"{skill['name']}: {', '.join(keywords)}\n")
                            else:
                                f.write(f"{skill['name']}: {keywords}\n")
                        elif 'name' in skill and 'level' in skill:
                            f.write(f"{skill['name']}: {skill['level']}\n")
                        elif 'name' in skill:
                            f.write(f"{skill['name']}\n")
                    elif isinstance(skill, str):
                        f.write(f"{skill}\n")

                f.write("\n")

            # Write languages
            if 'languages' in resume_data and resume_data['languages']:
                f.write("LANGUAGES\n")

                for lang in resume_data['languages']:
                    f.write(f"{lang.get('language', 'Language')}: {lang.get('fluency', lang.get('proficiency', 'Fluent'))}\n")

                f.write("\n")

        logger.info('DOCX file created successfully')
        return True
    except Exception as error:
        logger.error(f'Error generating DOCX: {error}')
        raise error

def generate_txt(resume_data, output_path):
    """
    Generate a TXT version of the resume
    """
    try:
        logger.info('Generating TXT file...')

        with open(output_path, 'w', encoding='utf-8') as f:
            # Write header
            f.write(f"{resume_data.get('basics', {}).get('name', 'No Name')}\n")
            f.write(f"{resume_data.get('basics', {}).get('title', 'No Title')}\n\n")

            # Write contact info
            contact_info = []
            if resume_data.get('basics', {}).get('email'):
                contact_info.append(f"Email: {resume_data['basics']['email']}")
            if resume_data.get('basics', {}).get('phone'):
                contact_info.append(f"Phone: {resume_data['basics']['phone']}")
            if resume_data.get('basics', {}).get('location'):
                if isinstance(resume_data['basics']['location'], dict):
                    location = resume_data['basics']['location'].get('city', '')
                    if resume_data['basics']['location'].get('region'):
                        location += f", {resume_data['basics']['location']['region']}"
                    contact_info.append(f"Location: {location}")
                else:
                    contact_info.append(f"Location: {resume_data['basics']['location']}")

            if contact_info:
                f.write(" | ".join(contact_info) + "\n\n")

            # Write summary
            summary = resume_data.get('summary') or resume_data.get('basics', {}).get('summary')
            if summary:
                f.write("SUMMARY\n")
                f.write("=======\n")
                f.write(f"{summary}\n\n")

            # Write experience
            if 'experience' in resume_data and resume_data['experience']:
                f.write("EXPERIENCE\n")
                f.write("==========\n")

                for exp in resume_data['experience']:
                    f.write(f"{exp.get('title', 'Position')} at {exp.get('company', 'Company')}\n")

                    # Format dates
                    start_date = format_date(exp.get('startDate', ''))
                    end_date = format_date(exp.get('endDate', 'Present'))
                    f.write(f"{start_date} - {end_date}\n")

                    if exp.get('location'):
                        f.write(f"{exp['location']}\n")

                    # Write highlights
                    if exp.get('highlights') and exp['highlights']:
                        for highlight in exp['highlights']:
                            f.write(f"* {highlight}\n")
                    elif exp.get('description'):
                        f.write(f"{exp['description']}\n")

                    f.write("\n")

            # Write education
            if 'education' in resume_data and resume_data['education']:
                f.write("EDUCATION\n")
                f.write("=========\n")

                for edu in resume_data['education']:
                    degree_text = ""
                    if edu.get('studyType') and edu.get('area'):
                        degree_text = f"{edu['studyType']} in {edu['area']}"
                    elif edu.get('studyType'):
                        degree_text = edu['studyType']
                    elif edu.get('area'):
                        degree_text = f"Degree in {edu['area']}"
                    elif edu.get('degree'):
                        degree_text = edu['degree']
                    else:
                        degree_text = "Degree"

                    f.write(f"{degree_text}\n")

                    if edu.get('institution') or edu.get('school'):
                        school = edu.get('institution') or edu.get('school', 'Institution')
                        f.write(f"{school}\n")

                    # Format dates
                    start_date = format_date(edu.get('startDate', ''))
                    end_date = format_date(edu.get('endDate', 'Present'))
                    if start_date or end_date:
                        f.write(f"{start_date} - {end_date}\n")

                    f.write("\n")

            # Write skills
            if 'skills' in resume_data and resume_data['skills']:
                f.write("SKILLS\n")
                f.write("======\n")

                for skill in resume_data['skills']:
                    if isinstance(skill, dict):
                        if 'category' in skill and 'items' in skill:
                            f.write(f"{skill['category']}: {', '.join(skill['items'])}\n")
                        elif 'name' in skill and 'keywords' in skill:
                            keywords = skill['keywords']
                            if isinstance(keywords, list):
                                f.write(f"{skill['name']}: {', '.join(keywords)}\n")
                            else:
                                f.write(f"{skill['name']}: {keywords}\n")
                        elif 'name' in skill and 'level' in skill:
                            f.write(f"{skill['name']}: {skill['level']}\n")
                        elif 'name' in skill:
                            f.write(f"{skill['name']}\n")
                    elif isinstance(skill, str):
                        f.write(f"{skill}\n")

                f.write("\n")

            # Write projects
            if 'projects' in resume_data and resume_data['projects']:
                f.write("PROJECTS\n")
                f.write("========\n")

                for project in resume_data['projects']:
                    f.write(f"{project.get('name', 'Project')}\n")

                    if project.get('description'):
                        f.write(f"{project['description']}\n")

                    if project.get('highlights') and project['highlights']:
                        for highlight in project['highlights']:
                            f.write(f"* {highlight}\n")

                    f.write("\n")

            # Write certifications
            if 'certifications' in resume_data and resume_data['certifications']:
                f.write("CERTIFICATIONS\n")
                f.write("==============\n")

                for cert in resume_data['certifications']:
                    f.write(f"{cert.get('name', 'Certification')}\n")

                    if cert.get('issuer'):
                        f.write(f"Issued by: {cert['issuer']}\n")

                    if cert.get('date'):
                        f.write(f"Date: {format_date(cert['date'])}\n")

                    f.write("\n")

            # Write languages
            if 'languages' in resume_data and resume_data['languages']:
                f.write("LANGUAGES\n")
                f.write("=========\n")

                for lang in resume_data['languages']:
                    f.write(f"{lang.get('language', 'Language')}: {lang.get('fluency', lang.get('proficiency', 'Fluent'))}\n")

                f.write("\n")

        logger.info('TXT file created successfully')
        return True
    except Exception as error:
        logger.error(f'Error generating TXT: {error}')
        raise error

def generate_resume(request):
    """
    Generate a resume in various formats
    """
    output_path = None

    try:
        logger.info('Generate resume request received')

        # Get request data
        if not request.is_json and not request.form:
            logger.error('Missing request body')
            return jsonify({
                'error': 'Missing data',
                'message': 'Request body is required'
            }), 400

        # Check if this is a form submission (data field contains JSON string)
        if request.form and 'data' in request.form:
            try:
                logger.info('Form submission detected, parsing data field')
                parsed_data = json.loads(request.form['data'])
                resume_data = parsed_data.get('resumeData')
                template = parsed_data.get('template')
                design_settings = parsed_data.get('designSettings')
                format_type = parsed_data.get('format', 'pdf').lower()
                file_name = parsed_data.get('fileName', 'resume')

                logger.info(f'Successfully parsed form data with format: {format_type}')
            except json.JSONDecodeError as parse_error:
                logger.error(f'Error parsing form data: {parse_error}')
                return jsonify({
                    'error': 'Invalid data format',
                    'message': 'Could not parse form data'
                }), 400
        elif request.is_json and 'resumeData' in request.json:
            # Standard JSON request
            logger.info('Standard JSON request detected')
            resume_data = request.json.get('resumeData')
            template = request.json.get('template')
            design_settings = request.json.get('designSettings')
            format_type = request.json.get('format', 'pdf').lower()
            file_name = request.json.get('fileName', 'resume')
        else:
            logger.error('Missing resume data in request')
            return jsonify({
                'error': 'Missing data',
                'message': 'Resume data is required'
            }), 400

        logger.info(f'Generating resume in {format_type} format')
        logger.info(f'Template: {template}')
        logger.info(f'Resume data keys: {list(resume_data.keys()) if resume_data else "None"}')

        # Normalize the resume data to ensure all required fields are present
        normalized_data = normalize_resume_data(resume_data)
        logger.info(f'Normalized resume data with sections: {list(normalized_data.keys())}')

        # Create a temporary directory if it doesn't exist
        temp_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'temp')
        os.makedirs(temp_dir, exist_ok=True)

        # Generate a unique filename
        unique_id = str(uuid.uuid4())
        safe_file_name = ''.join(c if c.isalnum() else '-' for c in file_name).lower() or 'resume'
        output_path = os.path.join(temp_dir, f'{safe_file_name}-{unique_id}.{format_type}')

        logger.info(f'Output path: {output_path}')

        # Check if the format is allowed
        allowed_formats = ['pdf', 'docx', 'txt']
        if format_type not in allowed_formats:
            logger.error(f'Unsupported format requested: {format_type}')
            return jsonify({
                'error': 'Unsupported format',
                'message': 'Only PDF, DOCX, and TXT formats are supported'
            }), 400

        # Handle different formats
        logger.info(f'Generating {format_type} file...')
        try:
            if format_type == 'pdf':
                generate_pdf(normalized_data, template, design_settings, output_path)
            elif format_type == 'docx':
                generate_docx(normalized_data, template, design_settings, output_path)
            elif format_type == 'txt':
                generate_txt(normalized_data, output_path)
            else:
                return jsonify({
                    'error': 'Unsupported format',
                    'message': 'Only PDF, DOCX, and TXT formats are supported'
                }), 400
        except Exception as gen_error:
            logger.error(f'Error during {format_type} generation: {gen_error}')
            return jsonify({
                'error': 'File generation failed',
                'message': f'Error generating {format_type.upper()} file: {str(gen_error)}'
            }), 500

        # Verify the file was created
        if not os.path.exists(output_path):
            logger.error(f'File was not created at {output_path}')
            return jsonify({
                'error': 'File generation failed',
                'message': 'Failed to create the output file'
            }), 500

        # Get file stats
        file_size = os.path.getsize(output_path)
        logger.info(f'File created successfully. Size: {file_size} bytes')

        if file_size == 0:
            logger.error('Generated file is empty')
            return jsonify({
                'error': 'Empty file',
                'message': 'Generated file is empty'
            }), 500

        logger.info(f'File ready for streaming. Size: {file_size} bytes')

        # Set appropriate content type based on format
        content_types = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain'
        }
        content_type = content_types.get(format_type, 'application/octet-stream')

        # Send the file
        return send_file(
            output_path,
            as_attachment=True,
            download_name=f'{safe_file_name}.{format_type}',
            mimetype=content_type
        )
    except Exception as error:
        logger.error(f'Error generating resume: {error}')

        # Try to clean up the temporary files if they exist
        if output_path and os.path.exists(output_path):
            try:
                os.remove(output_path)
                logger.info('Temporary file cleaned up after error')
            except Exception as cleanup_error:
                logger.error(f'Error cleaning up temporary files after error: {cleanup_error}')

        return jsonify({
            'error': 'Error generating resume',
            'message': str(error)
        }), 500
