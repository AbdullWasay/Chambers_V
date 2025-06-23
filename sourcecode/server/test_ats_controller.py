import json
import logging
from controllers.improved_ats_controller import check_ats_compatibility

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Sample resume data with various issues
sample_resume = {
    "basics": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "123-456-7890",
        "location": "New York, NY"
    },
    "summary": "Experienced software developer with a passion for creating efficient and scalable applications.",
    "experience": [
        {
            "company": "Tech Solutions Inc.",
            "position": "Senior Developer",
            "startDate": "2018-01",
            "endDate": "Present",
            "description": "Lead developer for enterprise applications.",
            "highlights": [
                "Developed and maintained multiple web applications",
                "Improved system performance by 40%",
                "Managed a team of 5 developers"
            ]
        },
        {
            "company": "Digital Innovations",
            "position": "Software Engineer",
            "startDate": "2015-03",
            "endDate": "2017-12",
            "description": "Worked on various projects using JavaScript and Python.",
            "highlights": []
        }
    ],
    "education": [
        {
            "institution": "University of Technology",
            "area": "Computer Science",
            "studyType": "Bachelor",
            "startDate": "2011-09",
            "endDate": "2015-05"
        }
    ],
    "skills": [
        {"name": "JavaScript", "level": "Expert"},
        {"name": "Python", "level": "Advanced"},
        {"name": "React", "level": "Intermediate"},
        {"name": "Node.js", "level": "Advanced"}
    ]
}

# Sample resume with issues
problematic_resume = {
    "basics": {
        "name": "Jane Smith",
        "email": "janesmith@example",  # Invalid email
        # Missing phone
        "location": ""  # Missing location
    },
    # Missing summary
    "experience": [
        {
            "company": "Software Solutions",
            "position": "Developer",
            # Missing dates
            "description": "",  # Empty description
            "highlights": []
        }
    ],
    "education": [],  # Missing education
    # Missing skills
}

# Sample job description
job_description = """
Software Developer Position

We are looking for an experienced software developer proficient in JavaScript, React, and Node.js.
The ideal candidate will have experience with web application development, API integration, and database management.
Responsibilities include:
- Developing and maintaining web applications
- Writing clean, efficient, and well-documented code
- Collaborating with cross-functional teams
- Troubleshooting and debugging issues

Requirements:
- 3+ years of experience in software development
- Strong knowledge of JavaScript, React, and Node.js
- Experience with RESTful APIs
- Familiarity with database systems (SQL and NoSQL)
- Good problem-solving skills
- Bachelor's degree in Computer Science or related field
"""

def test_ats_compatibility():
    # Test with good resume and job description
    logger.info("Testing ATS compatibility with good resume and job description")
    result1 = check_ats_compatibility(sample_resume, job_description)
    print("\n=== GOOD RESUME WITH JOB DESCRIPTION ===")
    print(f"Overall Score: {result1['overall_score']}/{result1['max_score']}")
    print(f"Assessment: {result1['assessment']}")
    print("\nSection Scores:")
    for section, data in result1['sections'].items():
        print(f"- {section}: {data['score']}/{data['max_score']}")
    
    print("\nTop Improvement Areas:")
    for area in result1.get('improvement_areas', []):
        print(f"- {area['area']} ({area['percentage']}%)")
    
    # Test with problematic resume
    logger.info("Testing ATS compatibility with problematic resume")
    result2 = check_ats_compatibility(problematic_resume, job_description)
    print("\n=== PROBLEMATIC RESUME WITH JOB DESCRIPTION ===")
    print(f"Overall Score: {result2['overall_score']}/{result2['max_score']}")
    print(f"Assessment: {result2['assessment']}")
    print("\nSection Scores:")
    for section, data in result2['sections'].items():
        print(f"- {section}: {data['score']}/{data['max_score']}")
    
    print("\nTop Improvement Areas:")
    for area in result2.get('improvement_areas', []):
        print(f"- {area['area']} ({area['percentage']}%)")
        print(f"  Recommendations: {', '.join(area['recommendations'])}")
    
    # Test without job description
    logger.info("Testing ATS compatibility without job description")
    result3 = check_ats_compatibility(sample_resume)
    print("\n=== GOOD RESUME WITHOUT JOB DESCRIPTION ===")
    print(f"Overall Score: {result3['overall_score']}/{result3['max_score']}")
    print(f"Assessment: {result3['assessment']}")

if __name__ == "__main__":
    test_ats_compatibility()
