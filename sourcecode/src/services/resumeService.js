import axios from 'axios';

const BASE_URL = 'http://localhost:3001'; // Change this to your actual backend URL if different

/**
 * Normalizes resume data to ensure all required fields are present and properly formatted
 * This helps with compatibility between different JSON formats
 * @param {Object} resumeData - The resume data to normalize
 * @returns {Object} - Normalized resume data
 */
const normalizeResumeData = (resumeData) => {
  if (!resumeData) return {};

  // Create a deep copy to avoid modifying the original data
  const normalizedData = JSON.parse(JSON.stringify(resumeData));

  // Ensure basics section exists
  if (!normalizedData.basics) {
    normalizedData.basics = {};
  }

  // If name, title, etc. are at the top level but not in basics, move them to basics
  if (normalizedData.name && !normalizedData.basics.name) {
    normalizedData.basics.name = normalizedData.name;
  }

  if (normalizedData.title && !normalizedData.basics.title) {
    normalizedData.basics.title = normalizedData.title;
  }

  if (normalizedData.email && !normalizedData.basics.email) {
    normalizedData.basics.email = normalizedData.email;
  }

  if (normalizedData.phone && !normalizedData.basics.phone) {
    normalizedData.basics.phone = normalizedData.phone;
  }

  if (normalizedData.location && !normalizedData.basics.location) {
    normalizedData.basics.location = normalizedData.location;
  }

  // If summary is in basics but not at top level, copy it to top level
  if (normalizedData.basics.summary && !normalizedData.summary) {
    normalizedData.summary = normalizedData.basics.summary;
  }

  // Normalize experience section
  if (normalizedData.experience && Array.isArray(normalizedData.experience)) {
    normalizedData.experience = normalizedData.experience.map(exp => {
      // Ensure highlights exists and is an array
      if (!exp.highlights && exp.description) {
        exp.highlights = [exp.description];
      } else if (!exp.highlights) {
        exp.highlights = [];
      }

      // Ensure dates are properly formatted
      if (exp.startDate && typeof exp.startDate === 'string') {
        // Already a string, no need to format
      } else if (exp.startDate) {
        exp.startDate = exp.startDate.toString();
      }

      if (exp.endDate && typeof exp.endDate === 'string') {
        // Already a string, no need to format
      } else if (exp.endDate) {
        exp.endDate = exp.endDate.toString();
      }

      return exp;
    });
  }

  // Normalize education section
  if (normalizedData.education && Array.isArray(normalizedData.education)) {
    normalizedData.education = normalizedData.education.map(edu => {
      // Map studyType to degree if degree doesn't exist
      if (!edu.degree && edu.studyType) {
        edu.degree = edu.studyType;
      }

      // Map institution to school if school doesn't exist
      if (!edu.school && edu.institution) {
        edu.school = edu.institution;
      }

      // Ensure dates are properly formatted
      if (edu.startDate && typeof edu.startDate === 'string') {
        // Already a string, no need to format
      } else if (edu.startDate) {
        edu.startDate = edu.startDate.toString();
      }

      if (edu.endDate && typeof edu.endDate === 'string') {
        // Already a string, no need to format
      } else if (edu.endDate) {
        edu.endDate = edu.endDate.toString();
      }

      return edu;
    });
  }

  // Normalize skills section
  if (normalizedData.skills && Array.isArray(normalizedData.skills)) {
    normalizedData.skills = normalizedData.skills.map(skill => {
      // If skill has name and keywords, format it properly for the template
      if (skill.name && skill.keywords) {
        return {
          category: skill.name,
          items: Array.isArray(skill.keywords) ? skill.keywords : [skill.keywords]
        };
      } else if (typeof skill === 'string') {
        return skill;
      } else if (skill.name) {
        return skill.name;
      }
      return skill;
    });
  }

  // Normalize languages section
  if (normalizedData.languages && Array.isArray(normalizedData.languages)) {
    normalizedData.languages = normalizedData.languages.map(lang => {
      // Map fluency to proficiency if proficiency doesn't exist
      if (!lang.proficiency && lang.fluency) {
        lang.proficiency = lang.fluency;
      }
      return lang;
    });
  }

  // Normalize projects section
  if (normalizedData.projects && Array.isArray(normalizedData.projects)) {
    normalizedData.projects = normalizedData.projects.map(project => {
      // Map keywords to technologies if technologies doesn't exist
      if (!project.technologies && project.keywords) {
        project.technologies = Array.isArray(project.keywords) ? project.keywords : [project.keywords];
      }
      return project;
    });
  }

  // Map awards to achievements if achievements doesn't exist
  if (!normalizedData.achievements && normalizedData.awards && Array.isArray(normalizedData.awards)) {
    normalizedData.achievements = normalizedData.awards.map(award => ({
      title: award.title || 'Award',
      date: award.date || '',
      organization: award.awarder || '',
      description: award.summary || ''
    }));
  }

  return normalizedData;
};

export const uploadResume = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });

    console.log("Resume uploaded:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading resume:", error);
    console.error("Error details:", error.response || error); // Log more details
    throw error;
}
};

export const fetchRewrittenResume = async (key) => {
  try {
    console.log("Fetching rewritten resume with key:", key);

    // First try to get the exact file with the key
    try {
      const response = await axios.get(`${BASE_URL}/rewritten`, {
        params: { key },
      });

      console.log("Received rewritten resume data:", response.data);
      return response.data;
    } catch (error) {
      // If the exact key doesn't work, try to get the latest resume
      console.log("Couldn't find resume with exact key, trying to get latest resume...");
      const latestResponse = await axios.get(`${BASE_URL}/latest-rewritten-resume`);
      console.log("Received latest resume data:", latestResponse.data);
      return latestResponse.data;
    }
  } catch (error) {
    console.error("Error fetching rewritten resume:", error);
    throw error;
  }
};

export const saveResume = async (resumeData) => {
  try {
    const response = await axios.post(`${BASE_URL}/save`, resumeData);
    return response.data;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw error;
  }
};



export const downloadResume = async (resumeData, template, designSettings, format = "pdf", fileName = "resume") => {
  try {
    console.log(`Starting download process for format: ${format}`);

    // Validate format on client side
    const allowedFormats = ['pdf', 'txt'];
    if (!allowedFormats.includes(format.toLowerCase())) {
      console.error(`Invalid format requested: ${format}`);
      throw new Error('Only PDF and TXT formats are supported');
    }

    // Ensure we have valid data
    if (!resumeData) {
      console.error('Resume data is missing');
      throw new Error('Resume data is required for download');
    }

    // Normalize the resume data to ensure all required fields are present
    const normalizedData = normalizeResumeData(resumeData);
    console.log('Normalized resume data:', Object.keys(normalizedData));

    // Log which sections are being included
    const includedSections = Object.keys(normalizedData).filter(key =>
      normalizedData[key] &&
      (Array.isArray(normalizedData[key]) ? normalizedData[key].length > 0 : true)
    );
    console.log('Resume data prepared with sections:', includedSections);

    // For PDF format, use our simple PDF endpoint
    if (format.toLowerCase() === 'pdf') {
      console.log('Using simple PDF endpoint for PDF download');
      console.log('Template:', template);
      console.log('Design settings:', designSettings);

      try {
        // Capture the HTML content from the resume preview
        const resumePreview = document.querySelector('.resume-preview');
        let htmlContent = null;

        if (resumePreview) {
          console.log('Resume preview element found, capturing HTML content');

          // Clone the element to avoid modifying the original
          const previewClone = resumePreview.cloneNode(true);

          // Get all styles from the document
          const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
              try {
                return Array.from(styleSheet.cssRules)
                  .map(rule => rule.cssText)
                  .join('\n');
              } catch (e) {
                console.log('Error accessing styleSheet rules:', e);
                return '';
              }
            })
            .filter(Boolean)
            .join('\n');

          // Create a complete HTML document with the resume content and styles
          htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Resume</title>
              <style>
                ${styles}
                @page {
                  size: A4;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                .resume-preview {
                  width: 210mm;
                  min-height: 297mm;
                  padding: 0;
                  margin: 0;
                  background: white;
                  box-shadow: none;
                  transform: none;
                }
              </style>
            </head>
            <body>
              ${previewClone.outerHTML}
            </body>
            </html>
          `;

          console.log('HTML content captured successfully');
        } else {
          console.log('Resume preview element not found, falling back to data-only approach');
        }

        // Use arraybuffer instead of blob for better compatibility
        const response = await axios({
          method: 'post',
          url: `${BASE_URL}/simple-pdf`,
          data: {
            resumeData: normalizedData,
            template,
            designSettings,
            fileName,
            htmlContent
          },
          responseType: 'arraybuffer', // Use arraybuffer instead of blob
          timeout: 180000, // Increase timeout to 3 minutes for larger documents
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        });

        console.log('Response received from simple-pdf endpoint:', response.status);

        // Check if we received valid data
        if (!response.data || response.data.byteLength === 0) {
          console.error('Received empty data from server');
          throw new Error('Server returned empty data. Please try again.');
        }

        // Create a blob from the arraybuffer
        const blob = new Blob([response.data], { type: 'application/pdf' });
        console.log(`Blob created: size=${blob.size}, type=${blob.type}`);

        // Trigger the download
        const url = URL.createObjectURL(blob);
        console.log('Created object URL for download:', url);

        // Create a download link and click it
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName || 'resume'}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 500);

        return url;
      } catch (pdfError) {
        console.error('Error in PDF download:', pdfError);
        throw pdfError;
      }
    }

    // For other formats, use the standard approach
    console.log('Using standard download approach for non-PDF format');
    console.log('Sending request to generate endpoint...');

    try {
      // Use arraybuffer instead of blob for better compatibility
      const response = await axios({
        method: 'post',
        url: `${BASE_URL}/generate`,
        data: {
          resumeData: normalizedData,
          template,
          designSettings,
          format: format.toLowerCase(),
          fileName
        },
        responseType: 'arraybuffer', // Use arraybuffer instead of blob
        timeout: 180000, // Increase timeout to 3 minutes for larger documents
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });

      console.log('Response received from server:', response.status, response.headers);

      // Check if the response is valid
      if (!response.data || response.data.byteLength === 0) {
        console.error('Received empty response from server');
        throw new Error('Server returned an empty response. Please try again.');
      }

      // Get the content type from the response headers
      const contentType = response.headers['content-type'];
      console.log('Content type from server:', contentType);

      // Convert arraybuffer to blob with the correct MIME type
      let mimeType;
      switch (format.toLowerCase()) {
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'txt':
          mimeType = 'text/plain';
          break;
        default:
          mimeType = 'application/octet-stream';
      }

      // Check if we received valid data
      if (!response.data || response.data.byteLength === 0) {
        console.error('Received empty data from server');
        throw new Error('Server returned empty data. Please try again.');
      }

      // Log the response headers for debugging
      console.log('Response headers:', JSON.stringify(response.headers));

      // Create a blob from the arraybuffer
      const blob = new Blob([response.data], { type: mimeType });
      console.log(`Blob created: size=${blob.size}, type=${blob.type}`);

      // Check if the blob is valid
      if (blob.size === 0) {
        console.error('Created blob is empty');
        throw new Error('Created blob is empty. Please try again.');
      }

      // Trigger the download
      const url = URL.createObjectURL(blob);
      console.log('Created object URL for download:', url);

      // Create a download link and click it
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName || 'resume'}.${format.toLowerCase()}`;
      console.log(`Setting download filename to: ${a.download}`);

      // Append to body and trigger click
      document.body.appendChild(a);
      console.log('Download link appended to document body, triggering click...');
      a.click();
      console.log('Download link clicked');

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Download link and object URL cleaned up');
      }, 500); // Increased timeout for cleanup

      return url;

    } catch (axiosError) {
      // Handle axios errors
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response status:', axiosError.response.status);
        console.error('Error response headers:', axiosError.response.headers);

        // Try to parse the error response
        if (axiosError.response.data) {
          // If it's an arraybuffer, convert to text
          if (axiosError.response.data instanceof ArrayBuffer) {
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(axiosError.response.data);
            console.error('Error response data:', text);
            throw new Error(`Server error: ${text}`);
          } else {
            console.error('Error response data:', axiosError.response.data);
            throw new Error(`Server error: ${axiosError.response.status}`);
          }
        } else {
          throw new Error(`Server error: ${axiosError.response.status}`);
        }
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error('Error request:', axiosError.request);
        throw new Error('No response received from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', axiosError.message);
        throw axiosError;
      }
    }
  } catch (error) {
    console.error("Error downloading resume:", error);
    throw error;
  }
};


