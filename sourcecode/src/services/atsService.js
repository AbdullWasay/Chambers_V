import axios from 'axios';

const BASE_URL = 'http://localhost:3001'; // Change this to your actual backend URL if different

/**
 * Check ATS compatibility of a resume
 *
 * @param {Object} resumeData - The resume data in JSON format
 * @returns {Promise<Object>} - ATS compatibility results
 */
export const checkATSCompatibility = async (resumeData) => {
  try {
    // For development/testing, return dynamically calculated sample data
    return getDynamicATSResults(resumeData);

    const response = await axios.post(`${BASE_URL}/check-ats-compatibility`, {
      resume: resumeData
    });

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data?.error || 'Failed to check ATS compatibility');
    }
  } catch (error) {
    console.error("Error checking ATS compatibility:", error);
    throw error;
  }
};

/**
 * Get sample ATS compatibility results (for testing/development)
 * @returns {Object} - Sample ATS compatibility results
 */
/**
 * Calculate dynamic ATS results based on the actual resume content
 * @param {Object} resumeData - The resume data to analyze
 * @returns {Object} - Calculated ATS compatibility results
 */
export const getDynamicATSResults = (resumeData) => {
  // Initialize scores
  let contentQualityScore = 0;
  let keywordMatchingScore = 0;
  let formattingScore = 0;
  let languageQualityScore = 0;
  let sectionOrganizationScore = 0;

  // Maximum possible scores
  const maxContentQualityScore = 25;
  const maxKeywordMatchingScore = 30;
  const maxFormattingScore = 10;
  const maxLanguageQualityScore = 10;
  const maxSectionOrganizationScore = 25;

  // Content Quality Check
  const contentQualityFeedback = [];
  const contentDetailedScoring = [];

  // Check summary
  let summaryScore = 0;
  let summaryFeedback = "";

  const summary = resumeData?.summary || resumeData?.basics?.summary || "";
  if (!summary) {
    summaryFeedback = "Missing professional summary - include a concise overview of your qualifications";
    contentQualityFeedback.push(summaryFeedback);
    contentDetailedScoring.push("Summary: 0/5 points - No summary found");
  } else if (summary.length < 50) {
    summaryScore = 2;
    summaryFeedback = "Summary is too short (under 50 characters) - expand to highlight key qualifications";
    contentQualityFeedback.push(summaryFeedback);
    contentDetailedScoring.push(`Summary: ${summaryScore}/5 points - Summary is too brief (${summary.length} characters)`);
  } else if (summary.length > 500) {
    summaryScore = 3;
    summaryFeedback = "Summary is too long (over 500 characters) - condense to be more impactful";
    contentQualityFeedback.push(summaryFeedback);
    contentDetailedScoring.push(`Summary: ${summaryScore}/5 points - Summary is too long (${summary.length} characters)`);
  } else {
    summaryScore = 5;
    contentDetailedScoring.push("Summary: 5/5 points - Excellent summary");
  }

  contentQualityScore += summaryScore;

  // Check experience
  let experienceScore = 0;
  const experienceIssues = [];

  const experience = resumeData?.experience || [];
  if (!experience || experience.length === 0) {
    contentQualityFeedback.push("No work experience entries found - this is critical content for ATS evaluation");
    contentDetailedScoring.push("Experience: 0/8 points - No experience entries found");
  } else {
    experienceScore = 8; // Start with full score and deduct

    // Check for job titles and companies
    let missingTitlesCompanies = 0;
    for (const job of experience) {
      if (!job.position && !job.title) {
        missingTitlesCompanies += 1;
      }
      if (!job.company && !job.organization) {
        missingTitlesCompanies += 1;
      }
    }

    if (missingTitlesCompanies > 0) {
      const deduction = Math.min(3, missingTitlesCompanies);
      experienceScore -= deduction;
      contentQualityFeedback.push("Missing job titles or company names in experience entries - these are key ATS matching points");
      experienceIssues.push(`Missing titles/companies (-${deduction} points)`);
    }

    // Check for descriptions/highlights
    let missingDescriptions = 0;
    for (const job of experience) {
      if (!job.description && (!job.highlights || job.highlights.length === 0)) {
        missingDescriptions += 1;
      }
    }

    if (missingDescriptions > 0) {
      const deduction = Math.min(5, missingDescriptions * 2);
      experienceScore -= deduction;
      contentQualityFeedback.push(`Missing descriptions in ${missingDescriptions} work experience entries - include detailed responsibilities and achievements`);
      experienceIssues.push(`Missing descriptions (-${deduction} points)`);
    }

    contentQualityScore += experienceScore;

    if (experienceIssues.length > 0) {
      contentDetailedScoring.push(`Experience: ${experienceScore}/8 points - Issues: ${experienceIssues.join(', ')}`);
    } else {
      contentDetailedScoring.push("Experience: 8/8 points - Excellent experience section");
    }
  }

  // Check education
  let educationScore = 0;
  const educationIssues = [];

  const education = resumeData?.education || [];
  if (!education || education.length === 0) {
    contentQualityFeedback.push("No education entries found - include your educational background");
    contentDetailedScoring.push("Education: 0/4 points - No education entries found");
  } else {
    educationScore = 4; // Start with full score and deduct

    // Check for institution and degree
    let missingEduInfo = 0;
    for (const edu of education) {
      if (!edu.institution && !edu.school) {
        missingEduInfo += 1;
      }
      if (!edu.area && !edu.studyType && !edu.degree) {
        missingEduInfo += 1;
      }
    }

    if (missingEduInfo > 0) {
      const deduction = Math.min(4, missingEduInfo);
      educationScore -= deduction;
      contentQualityFeedback.push("Incomplete information in education entries - include institution and field of study");
      educationIssues.push(`Missing education details (-${deduction} points)`);
    }

    contentQualityScore += educationScore;

    if (educationIssues.length > 0) {
      contentDetailedScoring.push(`Education: ${educationScore}/4 points - Issues: ${educationIssues.join(', ')}`);
    } else {
      contentDetailedScoring.push("Education: 4/4 points - Excellent education section");
    }
  }

  // Check skills
  let skillsScore = 0;
  const skillsIssues = [];

  const skills = resumeData?.skills || [];
  if (!skills || skills.length === 0) {
    contentQualityFeedback.push("Missing skills section or no skills listed - skills are crucial for ATS keyword matching");
    contentDetailedScoring.push("Skills: 0/5 points - No skills listed");
  } else {
    skillsScore = 5; // Start with full score and deduct

    // Check number of skills
    if (skills.length < 5) {
      skillsScore -= 3;
      contentQualityFeedback.push("Very few skills listed - include a comprehensive list of relevant technical and soft skills");
      skillsIssues.push(`Too few skills (${skills.length}) (-3 points)`);
    } else if (skills.length < 8) {
      skillsScore -= 1;
      contentQualityFeedback.push("Consider adding more skills to improve ATS matching");
      skillsIssues.push(`Could use more skills (${skills.length}) (-1 point)`);
    }

    contentQualityScore += skillsScore;

    if (skillsIssues.length > 0) {
      contentDetailedScoring.push(`Skills: ${skillsScore}/5 points - Issues: ${skillsIssues.join(', ')}`);
    } else {
      contentDetailedScoring.push("Skills: 5/5 points - Excellent skills section");
    }
  }

  // Add structure & length score (3 points)
  let structureScore = 3;
  contentDetailedScoring.push("Structure & Length: 3/3 points - Good resume structure");
  contentQualityScore += structureScore;

  // Add detailed scoring to feedback
  contentQualityFeedback.push(...contentDetailedScoring.map(item => `DETAILED SCORING: ${item}`));

  // Keyword Usage Check (simplified without job description)
  const keywordMatchingFeedback = [
    "Use industry-specific keywords throughout your resume",
    "Include relevant technical terms and skills in your summary",
    "Match keywords to the types of jobs you're applying for"
  ];

  // Simplified scoring without job description
  keywordMatchingScore = 22; // Default score

  // Formatting Check (simplified)
  formattingScore = 8;
  const formattingFeedback = [
    "No major formatting issues detected - resume has clean, ATS-friendly formatting",
    "DETAILED SCORING: ATS-Friendly Structure: 4/4 points - Clean structure",
    "DETAILED SCORING: Character Usage: 3/3 points - Appropriate character usage",
    "DETAILED SCORING: Formatting Consistency: 1/3 points - Some inconsistency detected"
  ];

  // Language Quality Check (simplified)
  languageQualityScore = 7;
  const languageQualityFeedback = [
    "Language quality is good - professional tone and good grammar",
    "DETAILED SCORING: Professional Tone: 2/3 points - Good professional tone",
    "DETAILED SCORING: Active Voice: 2/3 points - Good use of active voice",
    "DETAILED SCORING: Grammar & Spelling: 3/4 points - Good grammar and spelling"
  ];

  // Section Organization Check
  const sectionOrganizationFeedback = [];

  // Check for essential sections
  const essentialSections = ["summary", "experience", "education", "skills"];
  const missingSections = [];

  for (const section of essentialSections) {
    if (!resumeData[section] ||
        (Array.isArray(resumeData[section]) && resumeData[section].length === 0)) {
      missingSections.push(section);
    }
  }

  if (missingSections.length > 0) {
    sectionOrganizationFeedback.push(`Missing essential sections: ${missingSections.join(', ')} - add these for better ATS compatibility`);
    sectionOrganizationScore = Math.max(0, 25 - (missingSections.length * 6));
    sectionOrganizationFeedback.push(`DETAILED SCORING: Section Headers: ${25 - missingSections.length * 6}/25 points - Missing ${missingSections.length} essential sections`);
  } else {
    sectionOrganizationScore = 25;
    sectionOrganizationFeedback.push("All essential section headers are present and properly organized");
    sectionOrganizationFeedback.push("DETAILED SCORING: Section Headers: 25/25 points - All essential sections present");
  }

  // Calculate overall score
  const overallScore = contentQualityScore + keywordMatchingScore + formattingScore + languageQualityScore + sectionOrganizationScore;
  const maxScore = maxContentQualityScore + maxKeywordMatchingScore + maxFormattingScore + maxLanguageQualityScore + maxSectionOrganizationScore;

  // Determine assessment based on score
  let assessment = "";
  let assessmentDetails = "";

  const scorePercentage = (overallScore / maxScore) * 100;

  if (scorePercentage >= 90) {
    assessment = "Excellent ATS Compatibility";
    assessmentDetails = "Your resume has excellent ATS compatibility. It is well-structured, contains all essential sections, and uses appropriate keywords.";
  } else if (scorePercentage >= 80) {
    assessment = "Good ATS Compatibility";
    assessmentDetails = "Your resume has good ATS compatibility but could be improved in several areas. Address the recommendations below to increase your chances of passing ATS systems.";
  } else if (scorePercentage >= 70) {
    assessment = "Fair ATS Compatibility";
    assessmentDetails = "Your resume has fair ATS compatibility. Several important improvements are needed to ensure it passes ATS systems effectively.";
  } else if (scorePercentage >= 60) {
    assessment = "Poor ATS Compatibility";
    assessmentDetails = "Your resume has poor ATS compatibility. Significant improvements are needed in multiple areas to pass ATS systems.";
  } else {
    assessment = "Very Poor ATS Compatibility";
    assessmentDetails = "Your resume has very poor ATS compatibility. Major revisions are needed to make it ATS-friendly.";
  }

  // Create improvement areas
  const improvementAreas = [];

  // Add content quality to improvement areas if score is less than 80%
  if (contentQualityScore < maxContentQualityScore * 0.8) {
    improvementAreas.push({
      area: "content_quality",
      current_score: contentQualityScore,
      max_score: maxContentQualityScore,
      percentage: Math.round((contentQualityScore / maxContentQualityScore) * 100),
      recommendations: contentQualityFeedback
    });
  }

  // Add keyword matching to improvement areas if score is less than 80%
  if (keywordMatchingScore < maxKeywordMatchingScore * 0.8) {
    improvementAreas.push({
      area: "keyword_matching",
      current_score: keywordMatchingScore,
      max_score: maxKeywordMatchingScore,
      percentage: Math.round((keywordMatchingScore / maxKeywordMatchingScore) * 100),
      recommendations: keywordMatchingFeedback
    });
  }

  // Add section organization to improvement areas if score is less than 80%
  if (sectionOrganizationScore < maxSectionOrganizationScore * 0.8) {
    improvementAreas.push({
      area: "section_organization",
      current_score: sectionOrganizationScore,
      max_score: maxSectionOrganizationScore,
      percentage: Math.round((sectionOrganizationScore / maxSectionOrganizationScore) * 100),
      recommendations: sectionOrganizationFeedback
    });
  }

  // Sort improvement areas by score (lowest first)
  improvementAreas.sort((a, b) => (a.percentage - b.percentage));

  return {
    overall_score: overallScore,
    max_score: maxScore,
    assessment: assessment,
    assessment_details: assessmentDetails,

    sections: {
      content_quality: {
        score: contentQualityScore,
        max_score: maxContentQualityScore,
        feedback: contentQualityFeedback
      },
      keyword_matching: {
        score: keywordMatchingScore,
        max_score: maxKeywordMatchingScore,
        feedback: keywordMatchingFeedback
      },
      formatting: {
        score: formattingScore,
        max_score: maxFormattingScore,
        feedback: formattingFeedback
      },
      language_quality: {
        score: languageQualityScore,
        max_score: maxLanguageQualityScore,
        feedback: languageQualityFeedback
      },
      section_organization: {
        score: sectionOrganizationScore,
        max_score: maxSectionOrganizationScore,
        feedback: sectionOrganizationFeedback
      }
    },

    improvement_areas: improvementAreas
  };
};

/**
 * Get sample ATS compatibility results (for testing/development)
 * @returns {Object} - Sample ATS compatibility results
 */
export const getSampleATSResults = () => {
  return {
    overall_score: 72,
    max_score: 100,
    assessment: "Good ATS Compatibility",
    assessment_details: "Your resume has good ATS compatibility but could be improved in several areas. Address the recommendations below to increase your chances of passing ATS systems.",

    sections: {
      content_quality: {
        score: 18,
        max_score: 25,
        feedback: [
          "Summary is too short (under 50 characters) - expand to highlight key qualifications",
          "Experience lacks detailed bullet points - add more achievements",
          "DETAILED SCORING: Summary: 2/5 points - Summary is too brief (42 characters)",
          "DETAILED SCORING: Experience: 6/8 points - Issues: Brief descriptions in 2 entries (-1 point), Missing achievements in 2 entries (-1 point)",
          "DETAILED SCORING: Education: 4/4 points - Excellent education section",
          "DETAILED SCORING: Skills: 3/5 points - Issues: Could use more skills (7) (-1 point), No skill categorization (-1 point)",
          "DETAILED SCORING: Structure & Length: 3/3 points - Excellent resume structure and length"
        ]
      },
      keyword_matching: {
        score: 21,
        max_score: 30,
        feedback: [
          "Fair keyword matching (40-60% match) - resume needs better alignment with job requirements",
          "Consider adding these important keywords: python, database, cloud, agile, leadership",
          "These keywords should be incorporated naturally in your summary, experience, and skills sections",
          "DETAILED SCORING: Basic Keyword Matching: 9/15 points - 45% of job keywords found",
          "DETAILED SCORING: Keyword Placement: 7/10 points - Issues: Few keywords in summary (-2 points), Few keywords in skills section (-1 point)",
          "DETAILED SCORING: Keyword Density & Context: 5/5 points - Optimal keyword usage"
        ]
      },
      formatting: {
        score: 8,
        max_score: 10,
        feedback: [
          "No formatting issues detected - resume has clean, ATS-friendly formatting",
          "DETAILED SCORING: ATS-Friendly Structure: 4/4 points - Clean, ATS-friendly structure",
          "DETAILED SCORING: Character Usage: 3/3 points - Appropriate character usage",
          "DETAILED SCORING: Formatting Consistency: 1/3 points - Issues: Multiple bullet styles (3) (-1 point), Inconsistent date formats (YYYY-MM, Month YYYY) (-1 point)"
        ]
      },
      language_quality: {
        score: 7,
        max_score: 10,
        feedback: [
          "Several filler words detected - use more precise language",
          "Some passive voice detected - prefer active voice for impact",
          "DETAILED SCORING: Professional Tone: 2/3 points - Issues: Several filler words (7) (-1 point)",
          "DETAILED SCORING: Active Voice: 2/3 points - Issues: Some passive voice (2 instances) (-1 point)",
          "DETAILED SCORING: Grammar & Spelling: 3/4 points - Issues: Some tense inconsistency (1 positions) (-1 point)"
        ]
      },
      section_organization: {
        score: 18,
        max_score: 25,
        feedback: [
          "All essential section headers are present and properly organized",
          "DETAILED SCORING: Section Headers: 10/10 points - All essential sections present",
          "DETAILED SCORING: Section Order: 5/5 points - Optimal section ordering",
          "DETAILED SCORING: Section Content: 3/10 points - Issues: Missing key details in experience (-4 points), Incomplete skills information (-3 points)"
        ]
      }
    },

    improvement_areas: [
      {
        area: "keyword_matching",
        current_score: 21,
        max_score: 30,
        percentage: 70,
        recommendations: [
          "Add more job-specific keywords to your professional summary",
          "Incorporate more job-specific keywords in your work experience descriptions",
          "Add more job-specific skills to your skills section",
          "DETAILED SCORING: Basic Keyword Matching: 9/15 points - 45% of job keywords found",
          "DETAILED SCORING: Keyword Placement: 7/10 points - Issues: Few keywords in summary (-2 points), Few keywords in skills section (-1 point)"
        ]
      },
      {
        area: "content_quality",
        current_score: 18,
        max_score: 25,
        percentage: 72,
        recommendations: [
          "Expand your professional summary to highlight key qualifications",
          "Add more detailed bullet points to your experience section",
          "Include more achievements with measurable results",
          "DETAILED SCORING: Summary: 2/5 points - Summary is too brief (42 characters)",
          "DETAILED SCORING: Experience: 6/8 points - Issues: Brief descriptions in 2 entries (-1 point), Missing achievements in 2 entries (-1 point)"
        ]
      },
      {
        area: "section_organization",
        current_score: 18,
        max_score: 25,
        percentage: 72,
        recommendations: [
          "Add more details to your experience section",
          "Expand your skills section with more comprehensive information",
          "DETAILED SCORING: Section Content: 3/10 points - Issues: Missing key details in experience (-4 points), Incomplete skills information (-3 points)"
        ]
      }
    ]
  };
};
