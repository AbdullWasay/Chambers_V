const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const docx = require('docx');
const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, Packer } = docx;
const htmlDocx = require('html-docx-js');

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

/**
 * Generate a resume in various formats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateResume = async (req, res) => {
  let outputPath = null;

  try {
    console.log('Generate resume request received');
    console.log('Request body keys:', Object.keys(req.body));

    // Validate request body
    if (!req.body) {
      console.error('Missing request body');
      return res.status(400).json({
        error: 'Missing data',
        message: 'Request body is required'
      });
    }

    // Check if this is a form submission (data field contains JSON string)
    let resumeData, template, designSettings, format, fileName;
    let normalizedFormat;

    if (req.body.data) {
      try {
        console.log('Form submission detected, parsing data field');
        const parsedData = JSON.parse(req.body.data);
        resumeData = parsedData.resumeData;
        template = parsedData.template;
        designSettings = parsedData.designSettings;
        format = parsedData.format || 'pdf';
        fileName = parsedData.fileName || 'resume';
        normalizedFormat = format.toLowerCase();

        console.log('Successfully parsed form data with format:', normalizedFormat);
      } catch (parseError) {
        console.error('Error parsing form data:', parseError);
        return res.status(400).json({
          error: 'Invalid data format',
          message: 'Could not parse form data'
        });
      }
    } else if (req.body.resumeData) {
      // Standard JSON request
      console.log('Standard JSON request detected');
      resumeData = req.body.resumeData;
      template = req.body.template;
      designSettings = req.body.designSettings;
      format = req.body.format || 'pdf';
      fileName = req.body.fileName || 'resume';
      normalizedFormat = format.toLowerCase();
    } else {
      console.error('Missing resume data in request');
      console.error('Request body:', JSON.stringify(req.body).substring(0, 200) + '...');
      return res.status(400).json({
        error: 'Missing data',
        message: 'Resume data is required'
      });
    }

    console.log(`Generating resume in ${normalizedFormat} format`);
    console.log('Template:', template);
    console.log('Resume data keys:', Object.keys(resumeData));

    // Normalize the resume data to ensure all required fields are present
    const normalizedData = normalizeResumeData(resumeData);
    console.log('Normalized resume data with sections:', Object.keys(normalizedData));

    // Create a temporary directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate a unique filename
    const uniqueId = uuidv4();
    const safeFileName = fileName.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'resume';
    outputPath = path.join(tempDir, `${safeFileName}-${uniqueId}.${normalizedFormat}`);

    console.log(`Output path: ${outputPath}`);

    // Check if the format is allowed
    const allowedFormats = ['pdf', 'docx', 'txt'];
    if (!allowedFormats.includes(normalizedFormat)) {
      console.error(`Unsupported format requested: ${normalizedFormat}`);
      return res.status(400).json({
        error: 'Unsupported format',
        message: 'Only PDF, DOCX, and TXT formats are supported'
      });
    }

    // Handle different formats
    console.log(`Generating ${normalizedFormat} file...`);
    try {
      switch (normalizedFormat) {
        case 'pdf':
          await generatePDF(normalizedData, template, designSettings, outputPath);
          break;
        case 'docx':
          await generateDOCX(normalizedData, template, designSettings, outputPath);
          break;
        case 'txt':
          await generateTXT(normalizedData, outputPath);
          break;
        default:
          return res.status(400).json({
            error: 'Unsupported format',
            message: 'Only PDF, DOCX, and TXT formats are supported'
          });
      }
    } catch (genError) {
      console.error(`Error during ${normalizedFormat} generation:`, genError);
      return res.status(500).json({
        error: 'File generation failed',
        message: `Error generating ${normalizedFormat.toUpperCase()} file: ${genError.message}`
      });
    }

    // Verify the file was created
    if (!fs.existsSync(outputPath)) {
      console.error(`File was not created at ${outputPath}`);
      return res.status(500).json({
        error: 'File generation failed',
        message: 'Failed to create the output file'
      });
    }

    // Get file stats
    const stats = fs.statSync(outputPath);
    console.log(`File created successfully. Size: ${stats.size} bytes`);

    if (stats.size === 0) {
      console.error('Generated file is empty');
      return res.status(500).json({
        error: 'Empty file',
        message: 'Generated file is empty'
      });
    }
    console.log(`File ready for streaming. Size: ${stats.size} bytes`);

    // Set appropriate headers based on format
    let contentType;
    switch (normalizedFormat) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'docx':
        // Check if we're using the HTML fallback for DOCX
        const htmlPath = outputPath.replace(/\.docx$/, '.html');
        if (fs.existsSync(htmlPath)) {
          console.log('HTML fallback was used for DOCX generation');
          // Still use DOCX content type to ensure proper handling by the browser
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else {
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
        break;
      case 'txt':
        contentType = 'text/plain';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.${normalizedFormat}"`);
    res.setHeader('Content-Length', stats.size);
    // Add cache control headers to prevent caching issues
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Always use direct file sending for PDF files to avoid streaming issues
    try {
      console.log('Reading file into memory for direct sending...');
      const fileBuffer = fs.readFileSync(outputPath);
      console.log(`File read into memory: ${fileBuffer.length} bytes`);

      // Set explicit headers for PDF files
      if (normalizedFormat === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', fileBuffer.length);
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outputPath)}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        console.log('Set explicit PDF headers:', {
          'Content-Type': 'application/pdf',
          'Content-Length': fileBuffer.length,
          'Content-Disposition': `attachment; filename="${path.basename(outputPath)}"`,
        });
      }

      // Send the file directly
      console.log('Sending file buffer directly...');
      res.send(fileBuffer);

      // Clean up after sending
      setTimeout(() => {
        try {
          // Clean up the main output file
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            console.log('Temporary file cleaned up after direct sending');
          }

          // Also clean up any HTML files if they exist (for DOCX fallback)
          if (normalizedFormat === 'docx') {
            const htmlPath = outputPath.replace(/\.docx$/, '.html');
            if (fs.existsSync(htmlPath)) {
              fs.unlinkSync(htmlPath);
              console.log('Temporary HTML file cleaned up after direct sending');
            }
          }
        } catch (cleanupError) {
          console.error('Error cleaning up temporary files after direct sending:', cleanupError);
        }
      }, 2000); // Increased timeout for cleanup

      console.log('File sent directly to client');
      return;
    } catch (readError) {
      console.error(`Error reading file into memory: ${readError.message}`);
      console.log('Falling back to streaming...');
    }

    // Stream the file as a fallback method
    console.log('Streaming file to client as fallback...');

    // For PDF files, try a different approach with explicit headers
    if (normalizedFormat === 'pdf') {
      console.log('Using special PDF streaming approach');

      // Set explicit headers for PDF files
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outputPath)}"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      console.log('Set explicit PDF headers for streaming:', {
        'Content-Type': 'application/pdf',
        'Content-Length': stats.size,
        'Content-Disposition': `attachment; filename="${path.basename(outputPath)}"`,
      });
    }

    const fileStream = fs.createReadStream(outputPath);

    // Handle stream errors
    fileStream.on('error', (streamError) => {
      console.error('Error streaming file:', streamError);
      // Only send error if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Error streaming file',
          message: streamError.message
        });
      } else {
        // If headers are already sent, we need to end the response
        console.error('Headers already sent, ending response');
        res.end();
      }
    });

    // Log when data is being sent
    fileStream.on('data', (chunk) => {
      console.log(`Streaming chunk of size: ${chunk.length} bytes`);
    });

    // Pipe the file to the response
    console.log('Piping file stream to response');
    fileStream.pipe(res);

    // Clean up when the stream is finished
    fileStream.on('end', () => {
      console.log('File streaming completed');
      // Clean up happens after the response is sent
      setTimeout(() => {
        try {
          // Clean up the main output file
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            console.log('Temporary file cleaned up after streaming');
          }

          // Also clean up any HTML files if they exist (for DOCX fallback)
          if (normalizedFormat === 'docx') {
            const htmlPath = outputPath.replace(/\.docx$/, '.html');
            if (fs.existsSync(htmlPath)) {
              fs.unlinkSync(htmlPath);
              console.log('Temporary HTML file cleaned up after streaming');
            }
          }
        } catch (cleanupError) {
          console.error('Error cleaning up temporary files after streaming:', cleanupError);
        }
      }, 2000); // Increased timeout for cleanup
    });

    // File cleanup is handled by the stream 'end' event
    console.log(`Resume generation process completed successfully in ${normalizedFormat} format`);
  } catch (error) {
    console.error('Error generating resume:', error);

    // Try to clean up the temporary files if they exist
    if (outputPath) {
      try {
        // Clean up the main output file
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
          console.log('Temporary file cleaned up after error');
        }

        // Also clean up any HTML files if they exist (for DOCX fallback)
        if (normalizedFormat === 'docx') {
          const htmlPath = outputPath.replace(/\.docx$/, '.html');
          if (fs.existsSync(htmlPath)) {
            fs.unlinkSync(htmlPath);
            console.log('Temporary HTML file cleaned up after error');
          }
        }
      } catch (cleanupError) {
        console.error('Error cleaning up temporary files after error:', cleanupError);
      }
    }

    // If headers have not been sent yet, send an error response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error generating resume',
        message: error.message || 'An unknown error occurred'
      });
    }
  }
};

/**
 * Generate a PDF version of the resume
 * Uses PDFKit to create a properly formatted PDF with the specified dimensions
 * Supports multi-page resumes with proper content flow
 */
const generatePDF = async (resumeData, template, designSettings, outputPath) => {
  try {
    console.log('Generating multi-page PDF file with PDFKit...');

    // Create a PDF document with A4 dimensions
    // A4 size is 210mm x 297mm (8.27in x 11.69in)
    // PDFKit uses points (1/72 inch), so A4 is 595.28 x 841.89 points
    const doc = new PDFDocument({
      size: 'A4', // Standard A4 size (210mm x 297mm)
      margin: 40, // Slightly smaller margins to fit more content
      info: {
        Title: `Resume - ${resumeData.basics?.name || 'No Name'}`,
        Author: resumeData.basics?.name || 'Resume Generator',
        Subject: 'Professional Resume',
        Keywords: 'resume, cv, professional'
      },
      bufferPages: true, // Enable page buffering to allow for page counting
      autoFirstPage: true, // Automatically create the first page
      layout: 'portrait', // Ensure portrait orientation
      compress: true // Compress the PDF to reduce file size
    });

    // Set the page size explicitly to ensure it's correct
    doc.page.width = 595.28; // A4 width in points
    doc.page.height = 841.89; // A4 height in points

    // Pipe the PDF output to a file
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Set default font and size
    const fontFamily = designSettings?.font || 'Helvetica';
    const fontSize = designSettings?.fontSize || 12;
    doc.font(fontFamily).fontSize(fontSize);

    // Track available space on the current page
    let yPos = 40; // Starting Y position (top margin)
    const pageHeight = doc.page.height - 80; // Total usable height (minus top and bottom margins)

    // Function to check if we need a new page and add one if necessary
    const checkForNewPage = (requiredHeight) => {
      if (yPos + requiredHeight > pageHeight) {
        doc.addPage();
        yPos = 40; // Reset Y position for the new page
        return true;
      }
      return false;
    };

    // Function to add a section header
    const addSectionHeader = (title) => {
      // Check if we need a new page for this section header
      if (checkForNewPage(30)) {
        // We're on a new page, so we have space
      }

      doc.fontSize(10).font(`${fontFamily}-Bold`).text(title, 40, yPos);
      yPos += 15;
      return yPos;
    };

    // Add header with name and title (always on first page)
    // Handle name from either basics or top level
    const name = resumeData.basics?.name || resumeData.name || 'No Name';
    doc.fontSize(18).font(`${fontFamily}-Bold`).text(name, {
      align: 'center'
    });
    yPos += 20;

    // Handle title from either basics or top level
    const title = resumeData.basics?.title || resumeData.title || 'No Title';
    doc.fontSize(12).font(fontFamily).text(title, {
      align: 'center'
    });
    yPos += 15;

    // Add contact information
    const contactInfo = [];

    // Get email from either basics or top level
    const email = resumeData.basics?.email || resumeData.email;
    if (email) contactInfo.push(`Email: ${email}`);

    // Get phone from either basics or top level
    const phone = resumeData.basics?.phone || resumeData.phone;
    if (phone) contactInfo.push(`Phone: ${phone}`);

    // Get location from either basics or top level
    const location = resumeData.basics?.location || resumeData.location;
    if (location) contactInfo.push(`Location: ${location}`);

    if (contactInfo.length > 0) {
      doc.fontSize(8).text(contactInfo.join(' | '), {
        align: 'center'
      });
      yPos += 15;
    }

    // Add summary - get from either basics or top level
    const summary = resumeData.summary || resumeData.basics?.summary;
    if (summary) {
      checkForNewPage(50); // Check if we need a new page for the summary section
      addSectionHeader('SUMMARY');

      doc.fontSize(8).font(fontFamily).text(summary, {
        align: 'justify',
        lineGap: 1,
        width: doc.page.width - 80
      });
      yPos += doc.heightOfString(summary, {
        width: doc.page.width - 80,
        lineGap: 1
      }) + 10;
    }

    // Add experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      checkForNewPage(50); // Check if we need a new page for the experience section
      addSectionHeader('EXPERIENCE');

      resumeData.experience.forEach(exp => {
        // Estimate the height needed for this experience entry
        let entryHeight = 50; // Base height for title, dates, location

        if (exp.highlights && exp.highlights.length > 0) {
          entryHeight += exp.highlights.length * 15; // Add height for each highlight
        } else if (exp.description) {
          entryHeight += 20; // Add height for description
        }

        // Check if we need a new page for this experience entry
        checkForNewPage(entryHeight);

        doc.fontSize(9).font(`${fontFamily}-Bold`).text(`${exp.title || 'Position'} at ${exp.company || 'Company'}`, 40, yPos);
        yPos += 12;

        // Format dates
        const startDate = exp.startDate ? formatDate(exp.startDate) : '';
        const endDate = exp.endDate ? formatDate(exp.endDate) : 'Present';
        doc.fontSize(8).font(fontFamily).text(`${startDate} - ${endDate}`, 40, yPos);
        yPos += 10;

        if (exp.location) {
          doc.text(`${exp.location}`, 40, yPos);
          yPos += 10;
        }

        // Add highlights as bullet points
        if (exp.highlights && exp.highlights.length > 0) {
          yPos += 5;
          exp.highlights.forEach(highlight => {
            // Check if we need a new page for this highlight
            if (checkForNewPage(15)) {
              // We're on a new page, add some context
              doc.fontSize(8).font(fontFamily).text(`${exp.title} (continued)`, 40, yPos);
              yPos += 10;
            }

            doc.fontSize(8).text(`• ${highlight}`, 55, yPos, {
              width: doc.page.width - 95
            });
            yPos += doc.heightOfString(`• ${highlight}`, {
              width: doc.page.width - 95
            }) + 5;
          });
        } else if (exp.description) {
          yPos += 5;
          doc.fontSize(8).text(exp.description, 40, yPos, {
            width: doc.page.width - 80
          });
          yPos += doc.heightOfString(exp.description, {
            width: doc.page.width - 80
          }) + 5;
        }

        yPos += 5; // Add some space after each experience entry
      });
    }

    // Add education
    if (resumeData.education && resumeData.education.length > 0) {
      checkForNewPage(50); // Check if we need a new page for the education section
      addSectionHeader('EDUCATION');

      resumeData.education.forEach(edu => {
        // Estimate height needed for this education entry
        const entryHeight = 50;

        // Check if we need a new page for this education entry
        checkForNewPage(entryHeight);

        if (edu.studyType || edu.area) {
          doc.fontSize(9).font(`${fontFamily}-Bold`).text(`${edu.studyType || ''} ${edu.area ? 'in ' + edu.area : ''}`, 40, yPos);
          yPos += 12;
        }
        if (edu.institution) {
          doc.fontSize(8).font(fontFamily).text(`${edu.institution}`, 40, yPos);
          yPos += 10;
        }
        if (edu.startDate || edu.endDate) {
          const startDate = edu.startDate ? formatDate(edu.startDate) : '';
          const endDate = edu.endDate ? formatDate(edu.endDate) : 'Present';
          doc.text(`${startDate} - ${endDate}`, 40, yPos);
          yPos += 10;
        }

        yPos += 5; // Add some space after each education entry
      });
    }

    // Add skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      checkForNewPage(50); // Check if we need a new page for the skills section
      addSectionHeader('SKILLS');

      // Create a more compact skills section with multiple rows
      const skillsPerRow = 3; // 3 skills per row
      const skillRows = [];

      for (let i = 0; i < resumeData.skills.length; i += skillsPerRow) {
        const rowSkills = resumeData.skills.slice(i, i + skillsPerRow);
        skillRows.push(rowSkills);
      }

      skillRows.forEach(row => {
        // Check if we need a new page for this row of skills
        checkForNewPage(15);

        const rowText = row.map(skill => {
          // Handle different skill formats
          if (skill.category && skill.items && Array.isArray(skill.items)) {
            // Format for category/items structure
            const limitedItems = skill.items.slice(0, 5);
            const itemsText = limitedItems.join(', ');
            return `${skill.category}: ${itemsText}${skill.items.length > 5 ? '...' : ''}`;
          } else if (skill.name && skill.keywords && Array.isArray(skill.keywords)) {
            // Format for name/keywords structure
            const limitedKeywords = skill.keywords.slice(0, 5);
            const keywordText = limitedKeywords.join(', ');
            return `${skill.name}: ${keywordText}${skill.keywords.length > 5 ? '...' : ''}`;
          } else if (skill.name && skill.level) {
            // Format for name/level structure
            return `${skill.name}: ${skill.level}`;
          } else if (skill.name) {
            // Just the name
            return skill.name;
          } else if (typeof skill === 'string') {
            // Plain string
            return skill;
          }
          return '';
        }).filter(text => text).join(' | ');

        if (rowText.trim() !== '') {
          doc.fontSize(8).font(fontFamily).text(rowText, 40, yPos, {
            width: doc.page.width - 80
          });
          yPos += doc.heightOfString(rowText, {
            width: doc.page.width - 80
          }) + 5;
        }
      });
    }

    // Add projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      checkForNewPage(50); // Check if we need a new page for the projects section
      addSectionHeader('PROJECTS');

      resumeData.projects.forEach(project => {
        // Estimate height needed for this project entry
        let entryHeight = 30; // Base height for title

        if (project.description) {
          entryHeight += 20; // Add height for description
        }

        if (project.highlights && project.highlights.length > 0) {
          entryHeight += project.highlights.length * 15; // Add height for each highlight
        }

        // Check if we need a new page for this project entry
        checkForNewPage(entryHeight);

        doc.fontSize(9).font(`${fontFamily}-Bold`).text(project.name || 'Project', 40, yPos);
        yPos += 12;

        if (project.description) {
          doc.fontSize(8).font(fontFamily).text(project.description, 40, yPos, {
            lineGap: 1,
            width: doc.page.width - 80
          });
          yPos += doc.heightOfString(project.description, {
            lineGap: 1,
            width: doc.page.width - 80
          }) + 5;
        }

        if (project.highlights && project.highlights.length > 0) {
          yPos += 5;
          project.highlights.forEach(highlight => {
            // Check if we need a new page for this highlight
            if (checkForNewPage(15)) {
              // We're on a new page, add some context
              doc.fontSize(8).font(fontFamily).text(`${project.name} (continued)`, 40, yPos);
              yPos += 10;
            }

            doc.fontSize(8).text(`• ${highlight}`, 55, yPos, {
              width: doc.page.width - 95
            });
            yPos += doc.heightOfString(`• ${highlight}`, {
              width: doc.page.width - 95
            }) + 5;
          });
        }

        yPos += 5; // Add some space after each project entry
      });
    }

    // Add certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      checkForNewPage(50); // Check if we need a new page for the certifications section
      addSectionHeader('CERTIFICATIONS');

      resumeData.certifications.forEach(cert => {
        // Estimate height needed for this certification entry
        const entryHeight = 40;

        // Check if we need a new page for this certification entry
        checkForNewPage(entryHeight);

        doc.fontSize(9).font(`${fontFamily}-Bold`).text(cert.name || 'Certification', 40, yPos);
        yPos += 12;

        const certInfo = [];
        if (cert.issuer) certInfo.push(`Issuer: ${cert.issuer}`);
        if (cert.date) certInfo.push(`Date: ${formatDate(cert.date)}`);

        if (certInfo.length > 0) {
          doc.fontSize(8).font(fontFamily).text(certInfo.join(' | '), 40, yPos);
          yPos += 10;
        }

        yPos += 5; // Add some space after each certification entry
      });
    }

    // Add languages
    if (resumeData.languages && resumeData.languages.length > 0) {
      checkForNewPage(30); // Check if we need a new page for the languages section
      addSectionHeader('LANGUAGES');

      const languagesText = resumeData.languages.map(lang =>
        `${lang.language || 'Language'}: ${lang.fluency || 'Fluent'}`
      ).join(' | ');

      doc.fontSize(8).font(fontFamily).text(languagesText, 40, yPos, {
        width: doc.page.width - 80
      });
      yPos += doc.heightOfString(languagesText, {
        width: doc.page.width - 80
      }) + 10;
    }

    // Add page numbers if there are multiple pages
    const pageCount = doc.bufferedPageRange().count;
    if (pageCount > 1) {
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        // Add a footer with page numbers
        doc.fontSize(8).text(`Page ${i + 1} of ${pageCount}`, 0, doc.page.height - 30, {
          align: 'center',
          width: doc.page.width
        });
      }

      // Add a small note on the first page about pagination
      doc.switchToPage(0);
      doc.fontSize(7).fillColor('gray').text(
        'This resume spans multiple pages with all content included.',
        40, doc.page.height - 50, {
          align: 'left',
          width: doc.page.width - 80
        }
      );
      // Reset text color
      doc.fillColor('black');
    }

    // Add a header to each page after the first page
    if (pageCount > 1) {
      for (let i = 1; i < pageCount; i++) {
        doc.switchToPage(i);
        // Add a small header with name and title
        doc.fontSize(10).font(`${fontFamily}-Bold`).fillColor(designSettings?.colors?.primary || '#4a6cf7').text(
          resumeData.basics?.name || 'No Name',
          40, 20, {
            width: doc.page.width - 80,
            align: 'left'
          }
        );

        // Add a separator line
        doc.moveTo(40, 35).lineTo(doc.page.width - 40, 35).stroke();

        // Reset color
        doc.fillColor('black');
      }
    }

    // Finalize the PDF and end the stream
    doc.end();

    // Return a promise that resolves when the stream is finished
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log('PDF file created successfully');
        resolve();
      });
      stream.on('error', (err) => {
        console.error('Error creating PDF file:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Helper function to format dates from YYYY-MM to Month Year
const formatDate = (dateString) => {
  if (!dateString) return '';

  // Handle 'Present' or other non-date strings
  if (dateString.toLowerCase() === 'present' || !dateString.includes('-')) {
    return dateString;
  }

  try {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
};

/**
 * Generate a DOCX version of the resume
 */
/**
 * Generate RTF content for the resume (fallback method)
 */
const generateRTF = (resumeData) => {
  // RTF header
  let rtf = '{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033{\\fonttbl{\\f0\\fswiss\\fcharset0 Calibri;}}';
  rtf += '{\\colortbl ;\\red0\\green0\\blue0;}';
  rtf += '\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\qc\\b\\f0\\fs32 ';

  // Name
  rtf += `${resumeData.basics?.name || 'No Name'}\\par\\fs24 `;

  // Title
  rtf += `\\b0 ${resumeData.basics?.title || 'No Title'}\\par`;

  // Contact info
  if (resumeData.basics) {
    const contactInfo = [];
    if (resumeData.basics.email) contactInfo.push(`Email: ${resumeData.basics.email}`);
    if (resumeData.basics.phone) contactInfo.push(`Phone: ${resumeData.basics.phone}`);
    if (resumeData.basics.location) contactInfo.push(`Location: ${resumeData.basics.location}`);

    if (contactInfo.length > 0) {
      rtf += `\\fs20 ${contactInfo.join(' | ')}\\par`;
    }
  }

  // Summary
  if (resumeData.basics?.summary) {
    rtf += '\\pard\\sa200\\sl276\\slmult1\\b\\fs24 SUMMARY\\par\\b0\\fs22 ';
    rtf += `${resumeData.basics.summary}\\par`;
  }

  // Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    rtf += '\\b\\fs24 EXPERIENCE\\par';

    resumeData.experience.forEach(exp => {
      const startDate = exp.startDate ? formatDate(exp.startDate) : '';
      const endDate = exp.endDate ? formatDate(exp.endDate) : 'Present';

      rtf += `\\b\\fs22 ${exp.title || 'Position'} at ${exp.company || 'Company'}\\par\\b0\\fs20 `;
      rtf += `${startDate} - ${endDate}\\par`;

      if (exp.location) {
        rtf += `${exp.location}\\par`;
      }

      if (exp.highlights && exp.highlights.length > 0) {
        exp.highlights.forEach(highlight => {
          rtf += `\\pard\\fi-360\\li720\\sa200\\sl276\\slmult1\\bullet ${highlight}\\par`;
        });
        rtf += '\\pard\\sa200\\sl276\\slmult1';
      } else if (exp.description) {
        rtf += `${exp.description}\\par`;
      }
    });
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    rtf += '\\b\\fs24 EDUCATION\\par';

    resumeData.education.forEach(edu => {
      let degreeText = "Degree";
      if (edu.studyType && edu.area) {
        degreeText = `${edu.studyType} in ${edu.area}`;
      } else if (edu.studyType) {
        degreeText = edu.studyType;
      } else if (edu.area) {
        degreeText = `Degree in ${edu.area}`;
      }

      const startDate = edu.startDate ? formatDate(edu.startDate) : '';
      const endDate = edu.endDate ? formatDate(edu.endDate) : 'Present';

      rtf += `\\b\\fs22 ${degreeText}\\par\\b0\\fs20 `;
      rtf += `${edu.institution || 'Institution'}\\par`;
      rtf += `${startDate} - ${endDate}\\par`;
    });
  }

  // Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    rtf += '\\b\\fs24 SKILLS\\par\\b0\\fs20 ';

    resumeData.skills.forEach(skill => {
      if (skill.name && skill.keywords && skill.keywords.length > 0) {
        rtf += `${skill.name}: ${skill.keywords.join(', ')}\\par`;
      } else if (skill.name) {
        rtf += `${skill.name}\\par`;
      }
    });
  }

  // Projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    rtf += '\\b\\fs24 PROJECTS\\par';

    resumeData.projects.forEach(project => {
      rtf += `\\b\\fs22 ${project.name || 'Project'}\\par\\b0\\fs20 `;

      if (project.description) {
        rtf += `${project.description}\\par`;
      }
    });
  }

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    rtf += '\\b\\fs24 CERTIFICATIONS\\par';

    resumeData.certifications.forEach(cert => {
      rtf += `\\b\\fs22 ${cert.name || 'Certification'}\\par\\b0\\fs20 `;

      if (cert.issuer) {
        rtf += `Issued by: ${cert.issuer}\\par`;
      }

      if (cert.date) {
        rtf += `Date: ${formatDate(cert.date)}\\par`;
      }
    });
  }

  // Languages
  if (resumeData.languages && resumeData.languages.length > 0) {
    rtf += '\\b\\fs24 LANGUAGES\\par\\b0\\fs20 ';

    const languagesText = resumeData.languages.map(lang =>
      `${lang.language || 'Language'}: ${lang.fluency || 'Fluent'}`
    ).join(' | ');

    rtf += `${languagesText}\\par`;
  }

  // RTF footer
  rtf += '}';

  return rtf;
};

/**
 * Generate a simple HTML version of the resume that can be converted to DOCX
 */
const generateSimpleHTML = (resumeData) => {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume - ${resumeData.basics?.name || 'No Name'}</title>
  <style>
    @page {
      size: 21cm 29.7cm; /* A4 size */
      margin: 2cm; /* Standard margins */
    }
    body {
      font-family: Calibri, Arial, sans-serif;
      margin: 0;
      padding: 0;
      font-size: 11pt; /* Slightly smaller font to fit more content */
      line-height: 1.2; /* Tighter line spacing */
    }
    .container {
      width: 100%;
      max-width: 17cm; /* A4 width minus margins */
      margin: 0 auto;
      padding: 0;
    }
    h1, h2, h3 { margin-bottom: 0.1em; }
    h1 { font-size: 16pt; text-align: center; margin-top: 0; }
    h2 { font-size: 12pt; text-align: center; font-weight: normal; }
    h3 { font-size: 12pt; margin-top: 0.5em; border-bottom: 1px solid #ccc; padding-bottom: 0.1em; }
    .contact { text-align: center; margin-bottom: 0.5em; font-size: 10pt; }
    ul { margin-top: 0.1em; margin-bottom: 0.1em; padding-left: 1.2em; }
    li { margin-bottom: 0.1em; }
    p { margin: 0.2em 0; }
    .job-title { font-weight: bold; margin-bottom: 0; }
    .job-date, .job-location { margin-top: 0; margin-bottom: 0.1em; font-size: 10pt; }
    .degree { font-weight: bold; margin-bottom: 0; }
    .institution, .edu-date { margin-top: 0; margin-bottom: 0.1em; font-size: 10pt; }
    .section { margin-bottom: 0.5em; }
    .skills-container { column-count: 2; column-gap: 1em; }
  </style>
</head>
<body>
<div class="container">
  <h1>${resumeData.basics?.name || 'No Name'}</h1>
  <h2>${resumeData.basics?.title || 'No Title'}</h2>

  <div class="contact">`;

  if (resumeData.basics) {
    const contactInfo = [];
    if (resumeData.basics.email) contactInfo.push(`Email: ${resumeData.basics.email}`);
    if (resumeData.basics.phone) contactInfo.push(`Phone: ${resumeData.basics.phone}`);
    if (resumeData.basics.location) contactInfo.push(`Location: ${resumeData.basics.location}`);
    html += contactInfo.join(' | ');
  }

  html += `</div>`;

  // Add summary
  if (resumeData.basics?.summary) {
    html += `
  <div class="section">
    <h3>SUMMARY</h3>
    <p>${resumeData.basics.summary}</p>
  </div>`;
  }

  // Add experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    html += `
  <div class="section">
    <h3>EXPERIENCE</h3>`;

    resumeData.experience.forEach(exp => {
      const startDate = exp.startDate ? formatDate(exp.startDate) : '';
      const endDate = exp.endDate ? formatDate(exp.endDate) : 'Present';

      html += `
    <div class="job">
      <p class="job-title">${exp.title || 'Position'} at ${exp.company || 'Company'}</p>
      <p class="job-date">${startDate} - ${endDate}</p>`;

      if (exp.location) {
        html += `
      <p class="job-location">${exp.location}</p>`;
      }

      if (exp.highlights && exp.highlights.length > 0) {
        html += `
      <ul>`;
        exp.highlights.forEach(highlight => {
          html += `
        <li>${highlight}</li>`;
        });
        html += `
      </ul>`;
      } else if (exp.description) {
        html += `
      <p>${exp.description}</p>`;
      }

      html += `
    </div>`;
    });

    html += `
  </div>`;
  }

  // Add education
  if (resumeData.education && resumeData.education.length > 0) {
    html += `
  <div class="section">
    <h3>EDUCATION</h3>`;

    resumeData.education.forEach(edu => {
      let degreeText = "Degree";
      if (edu.studyType && edu.area) {
        degreeText = `${edu.studyType} in ${edu.area}`;
      } else if (edu.studyType) {
        degreeText = edu.studyType;
      } else if (edu.area) {
        degreeText = `Degree in ${edu.area}`;
      }

      const startDate = edu.startDate ? formatDate(edu.startDate) : '';
      const endDate = edu.endDate ? formatDate(edu.endDate) : 'Present';

      html += `
    <div class="education-entry">
      <p class="degree">${degreeText}</p>
      <p class="institution">${edu.institution || 'Institution'}</p>
      <p class="edu-date">${startDate} - ${endDate}</p>
    </div>`;
    });

    html += `
  </div>`;
  }

  // Add skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    html += `
  <div class="section">
    <h3>SKILLS</h3>
    <div class="skills-container">`;

    resumeData.skills.forEach(skill => {
      if (skill.name && skill.keywords && skill.keywords.length > 0) {
        html += `
      <p><strong>${skill.name}:</strong> ${skill.keywords.join(', ')}</p>`;
      } else if (skill.name) {
        html += `
      <p><strong>${skill.name}</strong></p>`;
      } else if (skill.keywords && skill.keywords.length > 0) {
        html += `
      <p><strong>Skills:</strong> ${skill.keywords.join(', ')}</p>`;
      }
    });

    html += `
    </div>
  </div>`;
  }

  // Add projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    html += `
  <div class="section">
    <h3>PROJECTS</h3>`;

    resumeData.projects.forEach(project => {
      html += `
    <div class="project">
      <p class="job-title">${project.name || 'Project'}</p>`;

      if (project.description) {
        html += `
      <p>${project.description}</p>`;
      }

      if (project.highlights && project.highlights.length > 0) {
        html += `
      <ul>`;
        project.highlights.forEach(highlight => {
          html += `
        <li>${highlight}</li>`;
        });
        html += `
      </ul>`;
      }

      html += `
    </div>`;
    });

    html += `
  </div>`;
  }

  // Add certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    html += `
  <div class="section">
    <h3>CERTIFICATIONS</h3>`;

    resumeData.certifications.forEach(cert => {
      html += `
    <div class="certification">
      <p class="job-title">${cert.name || 'Certification'}</p>`;

      if (cert.issuer) {
        html += `
      <p>Issued by: ${cert.issuer}</p>`;
      }

      if (cert.date) {
        html += `
      <p>Date: ${formatDate(cert.date)}</p>`;
      }

      html += `
    </div>`;
    });

    html += `
  </div>`;
  }

  // Add languages
  if (resumeData.languages && resumeData.languages.length > 0) {
    html += `
  <div class="section">
    <h3>LANGUAGES</h3>
    <p>${resumeData.languages.map(lang => `${lang.language || 'Language'}: ${lang.fluency || 'Fluent'}`).join(' | ')}</p>
  </div>`;
  }

  html += `
</div>
</body>
</html>`;

  return html;
};

/**
 * Generate a DOCX version of the resume with exact same formatting as PDF
 */
const generateDOCX = async (resumeData, template, designSettings, outputPath) => {
  try {
    console.log('Generating DOCX file with exact same formatting as PDF...');

    // Get primary color from design settings
    const primaryColor = designSettings?.colors?.primary || '#4A6CF7';

    // Get template-specific colors
    let templateColor = primaryColor;
    if (template === 'professional') {
      templateColor = '#2c3e50';
    } else if (template === 'creative') {
      templateColor = '#e74c3c';
    } else if (template === 'elegant') {
      templateColor = '#333333';
    }

    // Set font family based on template and design settings
    let fontFamily = designSettings?.font || 'Calibri';
    if (template === 'elegant') {
      fontFamily = 'Georgia, "Times New Roman", serif';
    }

    // Create a well-formatted HTML document for conversion that exactly matches PDF styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Resume - ${resumeData.basics?.name || 'Resume'}</title>
        <style>
          @page {
            size: A4;
            margin: 40pt;
          }
          body {
            font-family: ${fontFamily};
            color: #333333;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            font-size: 12pt;
          }
          .page {
            position: relative;
            width: 595.28pt;
            height: 841.89pt;
            padding: 40pt;
            box-sizing: border-box;
          }
          .header {
            text-align: center;
            margin-bottom: 15pt;
          }
          .name {
            color: ${templateColor};
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 5pt;
          }
          .title {
            font-size: 12pt;
            font-weight: normal;
            margin-top: 0;
            margin-bottom: 5pt;
          }
          .contact-info {
            font-size: 8pt;
            text-align: center;
            margin-bottom: 15pt;
          }
          .section-header {
            color: ${templateColor};
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid ${templateColor};
            padding-bottom: 2pt;
            margin-top: 15pt;
            margin-bottom: 10pt;
            ${template === 'elegant' ? 'font-style: italic;' : ''}
            ${template === 'modern' ? 'border-bottom-width: 2px;' : ''}
          }
          .item {
            margin-bottom: 10pt;
          }
          .item-header {
            color: ${templateColor};
            font-size: 9pt;
            font-weight: bold;
            margin-bottom: 3pt;
          }
          .item-subheader {
            font-size: 8pt;
            margin-bottom: 3pt;
          }
          .item-date {
            font-size: 8pt;
            font-style: italic;
            margin-bottom: 3pt;
          }
          .item-location {
            font-size: 8pt;
            margin-bottom: 3pt;
          }
          .item-description {
            font-size: 8pt;
            margin-top: 3pt;
            text-align: justify;
          }
          ul {
            margin-top: 5pt;
            margin-bottom: 5pt;
            padding-left: 15pt;
          }
          li {
            font-size: 8pt;
            margin-bottom: 3pt;
            position: relative;
          }
          li:before {
            content: "•";
            position: absolute;
            left: -10pt;
          }
          .skills-container {
            display: flex;
            flex-wrap: wrap;
          }
          .skill-item {
            font-size: 8pt;
            margin-bottom: 5pt;
            width: 100%;
          }
          .skill-name {
            font-weight: bold;
            color: ${templateColor};
          }
          .languages-list {
            font-size: 8pt;
          }
          p {
            font-size: 8pt;
            margin-top: 3pt;
            margin-bottom: 3pt;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="name">${resumeData.basics?.name || ''}</div>
            <div class="title">${resumeData.basics?.title || resumeData.basics?.label || ''}</div>

            <div class="contact-info">
              ${resumeData.basics?.email ? `Email: ${resumeData.basics.email}` : ''}
              ${resumeData.basics?.phone ? ` | Phone: ${resumeData.basics.phone}` : ''}
              ${resumeData.basics?.location ?
                ` | Location: ${typeof resumeData.basics.location === 'string' ?
                  resumeData.basics.location :
                  (resumeData.basics.location.city ?
                    `${resumeData.basics.location.city}${resumeData.basics.location.region ? ', ' + resumeData.basics.location.region : ''}` :
                    '')}` :
                ''}
            </div>
          </div>

          <!-- Summary Section -->
          ${resumeData.basics?.summary ? `
          <div class="section">
            <div class="section-header">SUMMARY</div>
            <p class="item-description">${resumeData.basics.summary}</p>
          </div>
          ` : ''}

          <!-- Experience Section -->
          ${resumeData.experience && resumeData.experience.length > 0 ? `
          <div class="section">
            <div class="section-header">EXPERIENCE</div>
            ${resumeData.experience.map(exp => `
              <div class="item">
                <div class="item-header">${exp.title || 'Position'} at ${exp.company || 'Company'}</div>
                <div class="item-date">
                  ${exp.startDate ? formatDate(exp.startDate) : ''} - ${exp.endDate ? formatDate(exp.endDate) : 'Present'}
                  ${exp.location ? ` | ${exp.location}` : ''}
                </div>
                ${exp.highlights && exp.highlights.length > 0 ? `
                  <ul>
                    ${exp.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                  </ul>
                ` : exp.description ? `<p class="item-description">${exp.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- Education Section -->
          ${resumeData.education && resumeData.education.length > 0 ? `
          <div class="section">
            <div class="section-header">EDUCATION</div>
            ${resumeData.education.map(edu => `
              <div class="item">
                <div class="item-header">
                  ${edu.studyType && edu.area ? `${edu.studyType} in ${edu.area}` :
                    edu.studyType ? edu.studyType :
                    edu.area ? `Degree in ${edu.area}` :
                    edu.degree ? edu.degree : 'Degree'}
                </div>
                <div class="item-subheader">${edu.institution || edu.school || 'Institution'}</div>
                <div class="item-date">
                  ${edu.startDate ? formatDate(edu.startDate) : ''} - ${edu.endDate ? formatDate(edu.endDate) : 'Present'}
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- Skills Section -->
          ${resumeData.skills && resumeData.skills.length > 0 ? `
          <div class="section">
            <div class="section-header">SKILLS</div>
            <div class="skills-container">
              ${resumeData.skills.map(skill => `
                <div class="skill-item">
                  ${skill.name && skill.keywords ? `
                    <span class="skill-name">${skill.name}:</span> ${Array.isArray(skill.keywords) ? skill.keywords.join(', ') : skill.keywords}
                  ` : skill.category && skill.items ? `
                    <span class="skill-name">${skill.category}:</span> ${Array.isArray(skill.items) ? skill.items.join(', ') : skill.items}
                  ` : `${skill.name || skill}`}
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Projects Section -->
          ${resumeData.projects && resumeData.projects.length > 0 ? `
          <div class="section">
            <div class="section-header">PROJECTS</div>
            ${resumeData.projects.map(project => `
              <div class="item">
                <div class="item-header">${project.name || 'Project'}</div>
                ${project.description ? `<p class="item-description">${project.description}</p>` : ''}
                ${project.highlights && project.highlights.length > 0 ? `
                  <ul>
                    ${project.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- Certifications Section -->
          ${resumeData.certifications && resumeData.certifications.length > 0 ? `
          <div class="section">
            <div class="section-header">CERTIFICATIONS</div>
            ${resumeData.certifications.map(cert => `
              <div class="item">
                <div class="item-header">${cert.name || 'Certification'}</div>
                ${cert.issuer ? `<div class="item-subheader">Issued by: ${cert.issuer}</div>` : ''}
                ${cert.date ? `<div class="item-date">Date: ${formatDate(cert.date)}</div>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- Languages Section -->
          ${resumeData.languages && resumeData.languages.length > 0 ? `
          <div class="section">
            <div class="section-header">LANGUAGES</div>
            <div class="languages-list">
              ${resumeData.languages.map(lang =>
                `<span class="skill-name">${lang.language || 'Language'}:</span> ${lang.fluency || 'Fluent'}`
              ).join(' | ')}
            </div>
          </div>
          ` : ''}

          <!-- Achievements Section -->
          ${resumeData.achievements && resumeData.achievements.length > 0 ? `
          <div class="section">
            <div class="section-header">ACHIEVEMENTS</div>
            ${resumeData.achievements.map(achievement => `
              <div class="item">
                <div class="item-header">${achievement.title || 'Achievement'}</div>
                ${achievement.date ? `<div class="item-date">${formatDate(achievement.date)}</div>` : ''}
                ${achievement.description ? `<p class="item-description">${achievement.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;

    // Write HTML to a temporary file
    const tempHtmlPath = outputPath.replace(/\.docx$/, '.html');
    fs.writeFileSync(tempHtmlPath, htmlContent);
    console.log('HTML file created for DOCX conversion');

    // Convert HTML to DOCX using html-docx-js
    try {
      // Read the HTML file
      const htmlBuffer = fs.readFileSync(tempHtmlPath, 'utf-8');

      // Convert HTML to DOCX with specific options to match PDF formatting
      const docxBuffer = htmlDocx.asBlob(htmlBuffer, {
        orientation: 'portrait',
        margins: {
          top: 576,    // 40pt in twips (1/20 of a point)
          right: 576,  // 40pt
          bottom: 576, // 40pt
          left: 576    // 40pt
        }
      });

      // Convert Blob to Buffer for Node.js
      const arrayBuffer = await docxBuffer.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write the buffer to the file
      console.log('Writing DOCX buffer to file...');
      fs.writeFileSync(outputPath, buffer);
      console.log('DOCX file created successfully with html-docx-js');

      // Clean up the temporary HTML file
      try {
        fs.unlinkSync(tempHtmlPath);
        console.log('Temporary HTML file cleaned up');
      } catch (cleanupError) {
        console.error('Error cleaning up temporary HTML file:', cleanupError);
      }
    } catch (htmlDocxError) {
      console.error('Error generating DOCX with html-docx-js:', htmlDocxError);
      console.log('Falling back to RTF generation...');

      // Generate RTF content as a fallback
      const rtfContent = generateRTF(resumeData);

      // Write RTF content to the DOCX file
      fs.writeFileSync(outputPath, rtfContent);
      console.log('DOCX file created using RTF fallback method');
    }
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw error;
  }
};

/**
 * Generate a TXT version of the resume with all content properly included
 */
const generateTXT = async (resumeData, outputPath) => {
  try {
    console.log('Generating comprehensive TXT file with all resume content...');
    let content = '';

    // Helper function to format dates
    const formatDateForTxt = (dateString) => {
      if (!dateString) return '';
      if (dateString.toLowerCase() === 'present') return 'Present';

      try {
        if (dateString.includes('-')) {
          const [year, month] = dateString.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        return dateString;
      } catch (e) {
        return dateString;
      }
    };

    // Get name from either basics or top level
    const name = resumeData.basics?.name || resumeData.name || 'Name';
    content += `${name}\n`;

    // Get title from either basics or top level
    const title = resumeData.basics?.title || resumeData.title || resumeData.basics?.label || 'Title';
    content += `${title}\n\n`;

    // Contact information - get from either basics or top level
    content += 'CONTACT INFORMATION\n';
    content += '-------------------\n';

    // Email
    const email = resumeData.basics?.email || resumeData.email || '';
    if (email) content += `Email: ${email}\n`;

    // Phone
    const phone = resumeData.basics?.phone || resumeData.phone || '';
    if (phone) content += `Phone: ${phone}\n`;

    // Location
    let location = '';
    if (resumeData.basics?.location) {
      if (typeof resumeData.basics.location === 'string') {
        location = resumeData.basics.location;
      } else if (resumeData.basics.location.city) {
        location = `${resumeData.basics.location.city}${resumeData.basics.location.region ? ', ' + resumeData.basics.location.region : ''}`;
      }
    } else if (resumeData.location) {
      location = resumeData.location;
    }
    if (location) content += `Location: ${location}\n`;

    // Website/URL
    const website = resumeData.basics?.url || resumeData.basics?.website || resumeData.website || '';
    if (website) content += `Website: ${website}\n`;

    // LinkedIn
    let linkedin = '';
    if (resumeData.basics?.linkedin) {
      linkedin = resumeData.basics.linkedin;
    } else if (resumeData.basics?.profiles && resumeData.basics.profiles.length > 0) {
      const linkedInProfile = resumeData.basics.profiles.find(p =>
        p.network && p.network.toLowerCase().includes('linkedin'));
      if (linkedInProfile) {
        linkedin = linkedInProfile.url || linkedInProfile.username || '';
      }
    }
    if (linkedin) content += `LinkedIn: ${linkedin}\n`;

    content += '\n';

    // Summary - get from either basics or top level
    const summary = resumeData.summary || resumeData.basics?.summary || '';
    if (summary) {
      content += 'SUMMARY\n';
      content += '-------\n';
      content += `${summary}\n\n`;
    }

    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      content += 'EXPERIENCE\n';
      content += '----------\n';
      resumeData.experience.forEach(exp => {
        content += `${exp.title || 'Position'} at ${exp.company || 'Company'}\n`;

        // Format dates
        const startDate = exp.startDate ? formatDateForTxt(exp.startDate) : '';
        const endDate = exp.endDate ? formatDateForTxt(exp.endDate) : 'Present';
        content += `${startDate} - ${endDate}\n`;

        if (exp.location) {
          content += `Location: ${exp.location}\n`;
        }

        content += '\n';

        if (exp.highlights && exp.highlights.length > 0) {
          exp.highlights.forEach(highlight => {
            content += `• ${highlight}\n`;
          });
        } else if (exp.description) {
          content += `${exp.description}\n`;
        }

        content += '\n';
      });
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      content += 'EDUCATION\n';
      content += '---------\n';
      resumeData.education.forEach(edu => {
        // Degree/Study Type
        if (edu.studyType || edu.area || edu.degree) {
          const degree = edu.studyType || edu.degree || '';
          const area = edu.area ? `in ${edu.area}` : '';
          content += `${degree} ${area}\n`.trim();
        }

        // Institution
        if (edu.institution || edu.school) {
          content += `${edu.institution || edu.school}\n`;
        }

        // Dates
        if (edu.startDate || edu.endDate) {
          const startDate = edu.startDate ? formatDateForTxt(edu.startDate) : '';
          const endDate = edu.endDate ? formatDateForTxt(edu.endDate) : 'Present';
          content += `${startDate} - ${endDate}\n`;
        }

        // GPA
        if (edu.gpa) {
          content += `GPA: ${edu.gpa}\n`;
        }

        content += '\n';
      });
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      content += 'SKILLS\n';
      content += '------\n';
      resumeData.skills.forEach(skill => {
        if (typeof skill === 'string') {
          // Handle simple string skills
          content += `• ${skill}\n`;
        } else if (skill.name && skill.keywords && Array.isArray(skill.keywords)) {
          // Handle name/keywords structure
          content += `• ${skill.name}: ${skill.keywords.join(', ')}\n`;
        } else if (skill.category && skill.items && Array.isArray(skill.items)) {
          // Handle category/items structure
          content += `• ${skill.category}: ${skill.items.join(', ')}\n`;
        } else if (skill.name && skill.level) {
          // Handle name/level structure
          content += `• ${skill.name}: ${skill.level}\n`;
        } else if (skill.name) {
          // Just the name
          content += `• ${skill.name}\n`;
        }
      });
      content += '\n';
    }

    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      content += 'PROJECTS\n';
      content += '--------\n';
      resumeData.projects.forEach(project => {
        content += `${project.name || 'Project'}\n`;

        // Dates if available
        if (project.startDate || project.endDate) {
          const startDate = project.startDate ? formatDateForTxt(project.startDate) : '';
          const endDate = project.endDate ? formatDateForTxt(project.endDate) : 'Present';
          content += `${startDate} - ${endDate}\n`;
        }

        // Description
        if (project.description) {
          content += `${project.description}\n`;
        }

        // Highlights
        if (project.highlights && project.highlights.length > 0) {
          content += '\n';
          project.highlights.forEach(highlight => {
            content += `• ${highlight}\n`;
          });
        }

        content += '\n';
      });
    }

    // Certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      content += 'CERTIFICATIONS\n';
      content += '--------------\n';
      resumeData.certifications.forEach(cert => {
        content += `${cert.name || 'Certification'}\n`;

        if (cert.issuer) {
          content += `Issuer: ${cert.issuer}\n`;
        }

        if (cert.date) {
          content += `Date: ${formatDateForTxt(cert.date)}\n`;
        }

        if (cert.url) {
          content += `URL: ${cert.url}\n`;
        }

        content += '\n';
      });
    }

    // Languages
    if (resumeData.languages && resumeData.languages.length > 0) {
      content += 'LANGUAGES\n';
      content += '---------\n';
      resumeData.languages.forEach(lang => {
        if (typeof lang === 'string') {
          content += `• ${lang}\n`;
        } else {
          content += `• ${lang.language || 'Language'}: ${lang.fluency || 'Fluent'}\n`;
        }
      });
      content += '\n';
    }

    // Achievements/Awards
    if (resumeData.achievements && resumeData.achievements.length > 0) {
      content += 'ACHIEVEMENTS\n';
      content += '------------\n';
      resumeData.achievements.forEach(achievement => {
        content += `${achievement.title || 'Achievement'}\n`;

        if (achievement.date) {
          content += `Date: ${formatDateForTxt(achievement.date)}\n`;
        }

        if (achievement.description) {
          content += `${achievement.description}\n`;
        }

        content += '\n';
      });
    }

    // Volunteer Work
    if (resumeData.volunteer && resumeData.volunteer.length > 0) {
      content += 'VOLUNTEER EXPERIENCE\n';
      content += '-------------------\n';
      resumeData.volunteer.forEach(vol => {
        content += `${vol.position || 'Volunteer'} at ${vol.organization || 'Organization'}\n`;

        if (vol.startDate || vol.endDate) {
          const startDate = vol.startDate ? formatDateForTxt(vol.startDate) : '';
          const endDate = vol.endDate ? formatDateForTxt(vol.endDate) : 'Present';
          content += `${startDate} - ${endDate}\n`;
        }

        if (vol.summary) {
          content += `${vol.summary}\n`;
        }

        if (vol.highlights && vol.highlights.length > 0) {
          vol.highlights.forEach(highlight => {
            content += `• ${highlight}\n`;
          });
        }

        content += '\n';
      });
    }

    // Publications
    if (resumeData.publications && resumeData.publications.length > 0) {
      content += 'PUBLICATIONS\n';
      content += '------------\n';
      resumeData.publications.forEach(pub => {
        content += `${pub.name || 'Publication'}\n`;

        if (pub.publisher) {
          content += `Publisher: ${pub.publisher}\n`;
        }

        if (pub.releaseDate) {
          content += `Date: ${formatDateForTxt(pub.releaseDate)}\n`;
        }

        if (pub.website) {
          content += `URL: ${pub.website}\n`;
        }

        if (pub.summary) {
          content += `${pub.summary}\n`;
        }

        content += '\n';
      });
    }

    // Interests
    if (resumeData.interests && resumeData.interests.length > 0) {
      content += 'INTERESTS\n';
      content += '---------\n';
      resumeData.interests.forEach(interest => {
        if (typeof interest === 'string') {
          content += `• ${interest}\n`;
        } else if (interest.name) {
          content += `• ${interest.name}\n`;

          if (interest.keywords && interest.keywords.length > 0) {
            content += `  ${interest.keywords.join(', ')}\n`;
          }
        }
      });
      content += '\n';
    }

    // References (if available, though typically not included in public resumes)
    if (resumeData.references && resumeData.references.length > 0) {
      content += 'REFERENCES\n';
      content += '----------\n';
      content += 'Available upon request\n\n';
    }

    console.log('Writing comprehensive TXT content to file...');
    fs.writeFileSync(outputPath, content);
    console.log('TXT file created successfully with all resume content');
  } catch (error) {
    console.error('Error generating TXT:', error);
    throw error;
  }
};



module.exports = {
  generateResume,
  generatePDF // Export the generatePDF function for direct use
};
