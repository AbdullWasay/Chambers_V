/**
 * Converts AWS resume data format to the application format
 * Ensures all sections are properly included in the output
 *
 * @param {Object} awsResumeData - The resume data from AWS S3
 * @returns {Object} - Formatted resume data for the application
 */
export const convertAwsResumeToAppFormat = (awsResumeData) => {
  if (!awsResumeData) {
    console.error("No resume data provided to converter");
    return null;
  }

  console.log("Converting AWS resume data:", awsResumeData);

  // Create a properly structured resume object with all sections
  const formattedResume = {
    // Keep basics as a separate object to ensure contact info is properly displayed
    basics: awsResumeData.basics ? {
      ...awsResumeData.basics,
      // Ensure url is set if it's missing in basics but present at top level
      url: awsResumeData.basics.url || awsResumeData.website || ""
    } : {
      name: awsResumeData.name || "",
      title: awsResumeData.title || awsResumeData.label || "",
      email: awsResumeData.email || "",
      phone: awsResumeData.phone || "",
      location: awsResumeData.location || "",
      url: awsResumeData.website || "",
      summary: awsResumeData.summary || ""
    },

    // Also include top-level properties for backward compatibility
    name: awsResumeData.basics?.name || awsResumeData.name || "",
    title: awsResumeData.basics?.title || awsResumeData.basics?.label || awsResumeData.title || "",
    email: awsResumeData.basics?.email || awsResumeData.email || "",
    phone: awsResumeData.basics?.phone || awsResumeData.phone || "",
    location: awsResumeData.basics?.location || awsResumeData.location || "",
    website: awsResumeData.basics?.url || awsResumeData.website || "",
    summary: awsResumeData.basics?.summary || awsResumeData.summary || "",

    // Experience section
    experience: Array.isArray(awsResumeData.experience)
      ? awsResumeData.experience.map(exp => ({
          ...exp,
          // Format dates for display if needed
          startDate: formatDate(exp.startDate),
          endDate: formatDate(exp.endDate)
        }))
      : [],

    // Education section
    education: Array.isArray(awsResumeData.education)
      ? awsResumeData.education.map(edu => ({
          ...edu,
          // Format graduation date if needed
          graduationDate: formatDate(edu.graduationDate)
        }))
      : [],

    // Skills section
    skills: Array.isArray(awsResumeData.skills) ? awsResumeData.skills : [],

    // Projects section - ensure this is included
    projects: Array.isArray(awsResumeData.projects) ? awsResumeData.projects : [],

    // Certifications section - ensure this is included
    certifications: Array.isArray(awsResumeData.certifications) ? awsResumeData.certifications : [],

    // Achievements section - ensure this is included
    achievements: Array.isArray(awsResumeData.achievements) ? awsResumeData.achievements : [],

    // Languages section
    languages: Array.isArray(awsResumeData.languages) ? awsResumeData.languages : [],

    // Volunteer section
    volunteer: Array.isArray(awsResumeData.volunteer) ? awsResumeData.volunteer : [],

    // Publications section
    publications: Array.isArray(awsResumeData.publications) ? awsResumeData.publications : [],

    // Interests section
    interests: Array.isArray(awsResumeData.interests) ? awsResumeData.interests : []
  };

  console.log("Converted resume data:", formattedResume);
  return formattedResume;
};

/**
 * Formats date from YYYY-MM to Month Year format
 *
 * @param {string} dateString - Date in YYYY-MM format or "Present"
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString) => {
  if (!dateString) return "";

  if (dateString === "Present") return "Present";

  // Check if the date is in YYYY-MM format
  const dateRegex = /^\d{4}-\d{2}$/;
  if (!dateRegex.test(dateString)) return dateString;

  const [year, month] = dateString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);

  // Format as "Month Year"
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};
