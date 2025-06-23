const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
const dotenvPath = path.resolve(__dirname, '.env');
if (fs.existsSync(dotenvPath)) {
  console.log(`Loading environment variables from ${dotenvPath}`);
  require('dotenv').config({ path: dotenvPath });
} else {
  console.error(`ERROR: .env file not found at ${dotenvPath}`);
  // Create a sample .env file with instructions
  const sampleEnvContent = `# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=resume-craft-files-ai
PORT=3001
`;
  fs.writeFileSync(path.resolve(__dirname, '.env.sample'), sampleEnvContent);
  console.log('Created .env.sample file with instructions');
}

// Log environment variables for debugging
console.log('Environment Variables:');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '****' + process.env.AWS_ACCESS_KEY_ID.slice(-4) : 'Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '****' : 'Not set');
console.log('PORT:', process.env.PORT);

// Import controllers after environment variables are loaded
const { uploadResume, getRewrittenResume } = require('./controllers/resumeController');
const { listRewrittenResumes, getLatestRewrittenResume } = require('./controllers/awsController');
const { generateResume, generatePDF } = require('./controllers/generateController');
const upload = require('./middlewares/upload');

// Try to import the HTML-to-PDF module, but don't fail if it's not available
let generatePdfFromHtml;
try {
  generatePdfFromHtml = require('./utils/htmlToPdf').generatePdfFromHtml;
  console.log('HTML-to-PDF module loaded successfully');
} catch (error) {
  console.warn('HTML-to-PDF module not available, falling back to basic PDF generation');
  generatePdfFromHtml = null;
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return '';

  try {
    // Parse YYYY-MM format
    const [year, month] = dateString.split('-');
    if (year && month) {
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = date.toLocaleString('default', { month: 'long' });
      return `${monthName} ${year}`;
    }
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

const app = express();
app.use(cors());
// Increase JSON payload limit and add raw body parser for binary data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Handle form data
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// Add middleware to log request details for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Request body type:', typeof req.body);
  if (req.body && typeof req.body === 'object') {
    console.log('Request body keys:', Object.keys(req.body));
  }
  next();
});

app.post('/upload', upload.single('file'), uploadResume);
app.get('/rewritten', getRewrittenResume);
app.get('/list-rewritten-resumes', listRewrittenResumes);
app.get('/latest-rewritten-resume', getLatestRewrittenResume);
app.post('/generate', generateResume);

// Very simple PDF download endpoint
app.get('/very-simple-pdf', (req, res) => {
  try {
    console.log('Very simple PDF endpoint called');

    // Create a temporary directory for the PDF
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const outputPath = path.join(tempDir, `simple-resume-${timestamp}.pdf`);

    // Create a simple PDF using PDFKit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Add some content to the PDF
    doc.fontSize(25).text('Sample Resume', 100, 100);
    doc.fontSize(15).text('This is a sample PDF file for testing download functionality.', 100, 150);
    doc.fontSize(12).text('If you can see this text, the PDF download is working correctly.', 100, 200);
    doc.fontSize(10).text('Generated at: ' + new Date().toLocaleString(), 100, 250);

    // Finalize the PDF
    doc.end();

    // Wait for the PDF to be written to disk
    writeStream.on('finish', () => {
      console.log('Simple PDF created successfully');

      // Set PDF headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="simple-resume.pdf"');
      res.setHeader('Content-Length', fs.statSync(outputPath).size);

      // Send the file directly
      const fileBuffer = fs.readFileSync(outputPath);
      res.send(fileBuffer);

      // Clean up
      setTimeout(() => {
        try {
          fs.unlinkSync(outputPath);
          console.log('Simple PDF file cleaned up');
        } catch (err) {
          console.error('Error cleaning up simple PDF file:', err);
        }
      }, 1000);
    });

    // Handle write stream errors
    writeStream.on('error', (err) => {
      console.error('Error writing simple PDF:', err);
      res.status(500).json({ error: 'Failed to create simple PDF', message: err.message });
    });

  } catch (error) {
    console.error('Error in very simple PDF endpoint:', error);
    res.status(500).json({ error: 'Simple PDF generation failed', message: error.message });
  }
});

// Simple PDF download endpoint that works
app.post('/simple-pdf', async (req, res) => {
  try {
    console.log('Simple PDF download endpoint called');

    // Get resume data and template/design settings from request
    const resumeData = req.body.resumeData || {};
    const template = req.body.template || 'modern';
    const designSettings = req.body.designSettings || {
      font: 'Helvetica',
      fontSize: 12,
      colors: {
        primary: '#4a6cf7',
        secondary: '#6c757d'
      }
    };
    const fileName = req.body.fileName || 'resume';

    // Get HTML content if provided
    const htmlContent = req.body.htmlContent;

    console.log('Resume data received with sections:', Object.keys(resumeData));
    console.log('Template:', template);
    console.log('Design settings:', designSettings);
    console.log('HTML content provided:', !!htmlContent);

    // Create a temporary directory for the PDF
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const outputPath = path.join(tempDir, `${fileName}-${timestamp}.pdf`);

    // If HTML content is provided, use it directly
    if (htmlContent) {
      try {
        console.log('Generating PDF from provided HTML content');

        // Save the HTML content for debugging
        const debugHtmlPath = path.join(tempDir, `${fileName}-${timestamp}.html`);
        fs.writeFileSync(debugHtmlPath, htmlContent);

        // Launch puppeteer
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
        });

        const page = await browser.newPage();

        // Set viewport to A4 size
        await page.setViewport({
          width: 794, // A4 width in pixels at 96 DPI
          height: 1123, // A4 height in pixels at 96 DPI
          deviceScaleFactor: 2 // Higher resolution
        });

        // Set content with proper wait options
        await page.setContent(htmlContent, {
          waitUntil: ['load', 'networkidle0', 'domcontentloaded']
        });

        // Wait for fonts to load
        await page.evaluateHandle('document.fonts.ready');

        // Wait a bit more to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate PDF with better quality settings and proper margins
        await page.pdf({
          path: outputPath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          },
          preferCSSPageSize: true,
          displayHeaderFooter: false,
          scale: 1,
          landscape: false
        });

        await browser.close();
        console.log('PDF generated successfully from HTML content');

        // Set PDF headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
        res.setHeader('Content-Length', fs.statSync(outputPath).size);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Send the file directly
        const fileBuffer = fs.readFileSync(outputPath);
        res.send(fileBuffer);

        // Clean up
        setTimeout(() => {
          try {
            fs.unlinkSync(outputPath);
            fs.unlinkSync(debugHtmlPath);
            console.log('PDF and HTML files cleaned up');
          } catch (err) {
            console.error('Error cleaning up files:', err);
          }
        }, 1000);

        return; // Exit early if successful
      } catch (htmlError) {
        console.error('Error generating PDF from HTML content:', htmlError);
        console.log('Falling back to other methods');
      }
    }

    // Check if HTML-to-PDF module is available
    if (generatePdfFromHtml) {
      try {
        // Generate the PDF using our HTML-to-PDF approach
        await generatePdfFromHtml(resumeData, template, designSettings, outputPath);

        console.log('PDF created successfully using HTML-to-PDF');

        // Set PDF headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
        res.setHeader('Content-Length', fs.statSync(outputPath).size);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Send the file directly
        const fileBuffer = fs.readFileSync(outputPath);
        res.send(fileBuffer);

        // Clean up
        setTimeout(() => {
          try {
            fs.unlinkSync(outputPath);
            console.log('PDF file cleaned up');
          } catch (err) {
            console.error('Error cleaning up PDF file:', err);
          }
        }, 1000);

        return; // Exit early if successful
      } catch (pdfError) {
        console.error('Error generating PDF with HTML-to-PDF:', pdfError);
        console.log('Falling back to basic PDF generation');
      }
    } else {
      console.log('HTML-to-PDF module not available, using basic PDF generation');
    }

    // If we get here, either the HTML-to-PDF module is not available or it failed
    // Create a basic PDF using PDFKit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({
      size: 'A4',
      margin: 60, // Increased margin for better spacing on all sides
      info: {
        Title: `Resume - ${resumeData.basics?.name || 'No Name'}`,
        Author: resumeData.basics?.name || 'Resume Generator',
        Subject: 'Professional Resume',
        Keywords: 'resume, cv, professional'
      }
    });

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Add basic content - header
    const name = resumeData.basics?.name || resumeData.name || 'Your Name';
    const title = resumeData.basics?.label || resumeData.title || 'Professional Title';

    doc.fontSize(24).font('Helvetica-Bold').fillColor('#4a6cf7').text(name, { align: 'center' });
    doc.fontSize(14).font('Helvetica').fillColor('black').text(title, { align: 'center' });
    doc.moveDown(0.5);

    // Contact info
    const contactInfo = [];
    const email = resumeData.basics?.email || resumeData.email;
    const phone = resumeData.basics?.phone || resumeData.phone;
    const location = resumeData.basics?.location?.city ?
      `${resumeData.basics.location.city}${resumeData.basics.location.region ? ', ' + resumeData.basics.location.region : ''}` :
      resumeData.location;
    const website = resumeData.basics?.url || resumeData.website;

    if (email) contactInfo.push(`Email: ${email}`);
    if (phone) contactInfo.push(`Phone: ${phone}`);
    if (location) contactInfo.push(`Location: ${location}`);
    if (website) contactInfo.push(`Website: ${website}`);

    doc.fontSize(10).text(contactInfo.join(' | '), { align: 'center' });
    doc.moveDown(1);

    // Summary
    const summary = resumeData.basics?.summary || resumeData.summary;
    if (summary) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#4a6cf7').text('SUMMARY');
      doc.fontSize(10).font('Helvetica').fillColor('black').text(summary);
      doc.moveDown(1);
    }

    // Finalize the PDF
    doc.end();

    // Wait for the PDF to be written to disk
    writeStream.on('finish', () => {
      console.log('Basic PDF created successfully');

      // Set PDF headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.setHeader('Content-Length', fs.statSync(outputPath).size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Send the file directly
      const fileBuffer = fs.readFileSync(outputPath);
      res.send(fileBuffer);

      // Clean up
      setTimeout(() => {
        try {
          fs.unlinkSync(outputPath);
          console.log('Basic PDF file cleaned up');
        } catch (err) {
          console.error('Error cleaning up basic PDF file:', err);
        }
      }, 1000);
    });

    // Handle write stream errors
    writeStream.on('error', (err) => {
      console.error('Error writing basic PDF:', err);
      res.status(500).json({ error: 'Failed to create PDF', message: err.message });
    });
  } catch (error) {
    console.error('Error in simple PDF endpoint:', error);
    res.status(500).json({ error: 'PDF generation failed', message: error.message });
  }
});

// New direct resume PDF download endpoint
app.get('/direct-pdf', (req, res) => {
  try {
    console.log('Direct PDF endpoint called');

    // Create a sample resume data
    const sampleResumeData = {
      basics: {
        name: "John Doe",
        title: "Software Developer",
        email: "john.doe@example.com",
        phone: "(123) 456-7890",
        location: "New York, NY",
        summary: "Experienced software developer with expertise in web development and cloud technologies."
      },
      experience: [
        {
          company: "Tech Company",
          title: "Senior Developer",
          startDate: "2018-01",
          endDate: "",
          location: "New York, NY",
          highlights: [
            "Led development of key features for the company's main product",
            "Mentored junior developers and conducted code reviews",
            "Implemented CI/CD pipelines to improve deployment efficiency"
          ]
        },
        {
          company: "Startup Inc.",
          title: "Junior Developer",
          startDate: "2015-06",
          endDate: "2017-12",
          location: "Boston, MA",
          highlights: [
            "Developed and maintained web applications using React and Node.js",
            "Collaborated with design team to implement responsive UI components",
            "Participated in agile development process"
          ]
        }
      ],
      education: [
        {
          institution: "University of Technology",
          area: "Computer Science",
          studyType: "Bachelor",
          startDate: "2011-09",
          endDate: "2015-05"
        }
      ],
      skills: [
        {
          name: "Programming Languages",
          keywords: ["JavaScript", "Python", "Java", "HTML", "CSS"]
        },
        {
          name: "Frameworks & Libraries",
          keywords: ["React", "Node.js", "Express", "Django"]
        },
        {
          name: "Tools & Platforms",
          keywords: ["Git", "Docker", "AWS", "CI/CD"]
        }
      ]
    };

    // Create a temporary directory for the PDF
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const outputPath = path.join(tempDir, `sample-resume-${timestamp}.pdf`);

    // Generate the PDF using PDFKit directly
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({
      size: 'A4',
      margin: 60, // Increased margin for better spacing on all sides
      info: {
        Title: 'Sample Resume',
        Author: 'Resume Generator',
        Subject: 'Professional Resume',
        Keywords: 'resume, cv, professional'
      }
    });

    // Pipe to a write stream
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Add content to the PDF
    // Header
    doc.fontSize(24).font('Helvetica-Bold').text(sampleResumeData.basics.name, { align: 'center' });
    doc.fontSize(14).font('Helvetica').text(sampleResumeData.basics.title, { align: 'center' });
    doc.moveDown(0.5);

    // Contact info
    const contactInfo = [];
    if (sampleResumeData.basics.email) contactInfo.push(`Email: ${sampleResumeData.basics.email}`);
    if (sampleResumeData.basics.phone) contactInfo.push(`Phone: ${sampleResumeData.basics.phone}`);
    if (sampleResumeData.basics.location) contactInfo.push(`Location: ${sampleResumeData.basics.location}`);

    doc.fontSize(10).text(contactInfo.join(' | '), { align: 'center' });
    doc.moveDown(1);

    // Summary
    if (sampleResumeData.basics.summary) {
      doc.fontSize(12).font('Helvetica-Bold').text('SUMMARY');
      doc.fontSize(10).font('Helvetica').text(sampleResumeData.basics.summary);
      doc.moveDown(1);
    }

    // Experience
    if (sampleResumeData.experience && sampleResumeData.experience.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('EXPERIENCE');
      doc.moveDown(0.5);

      sampleResumeData.experience.forEach(exp => {
        doc.fontSize(11).font('Helvetica-Bold').text(`${exp.title} at ${exp.company}`);

        const startDate = exp.startDate ? formatDate(exp.startDate) : '';
        const endDate = exp.endDate ? formatDate(exp.endDate) : 'Present';
        doc.fontSize(10).font('Helvetica').text(`${startDate} - ${endDate}`);

        if (exp.location) {
          doc.text(`${exp.location}`);
        }

        if (exp.highlights && exp.highlights.length > 0) {
          doc.moveDown(0.3);
          exp.highlights.forEach(highlight => {
            doc.fontSize(10).text(`• ${highlight}`, { indent: 20 });
          });
        }

        doc.moveDown(0.5);
      });
    }

    // Education
    if (sampleResumeData.education && sampleResumeData.education.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('EDUCATION');
      doc.moveDown(0.5);

      sampleResumeData.education.forEach(edu => {
        if (edu.studyType || edu.area) {
          doc.fontSize(11).font('Helvetica-Bold').text(`${edu.studyType || ''} ${edu.area ? 'in ' + edu.area : ''}`);
        }
        if (edu.institution) {
          doc.fontSize(10).font('Helvetica').text(`${edu.institution}`);
        }
        if (edu.startDate || edu.endDate) {
          const startDate = edu.startDate ? formatDate(edu.startDate) : '';
          const endDate = edu.endDate ? formatDate(edu.endDate) : 'Present';
          doc.text(`${startDate} - ${endDate}`);
        }
        doc.moveDown(0.5);
      });
    }

    // Skills
    if (sampleResumeData.skills && sampleResumeData.skills.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('SKILLS');
      doc.moveDown(0.5);

      sampleResumeData.skills.forEach(skill => {
        if (skill.name && skill.keywords && skill.keywords.length > 0) {
          doc.fontSize(11).font('Helvetica-Bold').text(skill.name);
          doc.fontSize(10).font('Helvetica').text(skill.keywords.join(', '));
          doc.moveDown(0.3);
        }
      });
    }

    // Add page numbers
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, {
        align: 'center',
        width: doc.page.width - 100
      });
    }

    // Finalize the PDF
    doc.end();

    // Wait for the PDF to be written to disk
    writeStream.on('finish', () => {
      console.log('Sample resume PDF created successfully');

      // Set PDF headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="sample-resume.pdf"');
      res.setHeader('Content-Length', fs.statSync(outputPath).size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Send the file directly
      const fileBuffer = fs.readFileSync(outputPath);
      res.send(fileBuffer);

      // Clean up
      setTimeout(() => {
        try {
          fs.unlinkSync(outputPath);
          console.log('Sample resume PDF cleaned up');
        } catch (err) {
          console.error('Error cleaning up sample resume PDF:', err);
        }
      }, 1000);
    });

    // Handle write stream errors
    writeStream.on('error', (err) => {
      console.error('Error writing PDF:', err);
      res.status(500).json({ error: 'Failed to create PDF', message: err.message });
    });

  } catch (error) {
    console.error('Error in direct PDF endpoint:', error);
    res.status(500).json({ error: 'PDF generation failed', message: error.message });
  }
});

// Handler function for PDF downloads
function handlePdfDownload(req, res) {
  try {
    console.log(`Direct PDF download request received via ${req.method}`);
    console.log('Request headers:', req.headers);

    // Log request body if it exists
    if (req.body) {
      console.log('Request body type:', typeof req.body);
      if (typeof req.body === 'object') {
        console.log('Request body keys:', Object.keys(req.body));
      }
    }

    // Create a temporary directory for the PDF
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileName = req.body?.fileName || 'resume';
    const safeFileName = fileName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const outputPath = path.join(tempDir, `${safeFileName}-${timestamp}.pdf`);

    // Check if we have resume data from the request
    let resumeData = null;
    let template = 'modern';

    if (req.body?.resumeData) {
      try {
        // If resumeData is a string (from form submission), parse it
        if (typeof req.body.resumeData === 'string') {
          resumeData = JSON.parse(req.body.resumeData);
          console.log('Parsed resume data from form submission');
        } else {
          // If it's already an object, use it directly
          resumeData = req.body.resumeData;
          console.log('Using resume data from direct JSON submission');
        }

        // Get template if provided
        if (req.body.template) {
          template = req.body.template;
        }

        console.log('Resume data sections:', resumeData ? Object.keys(resumeData) : 'No resume data');
        console.log('Using template:', template);

        // If we have valid resume data, generate a proper PDF using the generatePDF function
        if (resumeData) {
          console.log('Generating PDF from resume data...');

          // Use the imported generatePDF function
          // Already imported at the top of the file

          // Default design settings
          const designSettings = {
            font: 'Helvetica',
            fontSize: 12,
            colors: {
              primary: '#4a6cf7',
              secondary: '#6c757d'
            }
          };

          // Generate the PDF
          generatePDF(resumeData, template, designSettings, outputPath)
            .then(() => {
              console.log('PDF generated successfully');
              sendPdfToClient(outputPath, res);
            })
            .catch((err) => {
              console.error('Error generating PDF:', err);
              createFallbackPdf(outputPath, res);
            });

          return; // Early return to avoid executing the fallback code
        }
      } catch (parseError) {
        console.error('Error parsing resume data:', parseError);
        // Continue to fallback PDF
      }
    }

    // If we don't have valid resume data or there was an error, create a fallback PDF
    createFallbackPdf(outputPath, res);

  } catch (error) {
    console.error('Error in direct PDF download:', error);
    res.status(500).json({ error: 'PDF download failed', message: error.message });
  }
}

// Helper function to create a fallback PDF
function createFallbackPdf(outputPath, res) {
  try {
    console.log('Creating fallback PDF...');

    // Create a simple text file (not a real PDF, but will test the download mechanism)
    const content = 'This is a sample PDF file for testing download functionality.\n' +
                   'In a real implementation, this would be a properly formatted PDF.';
    fs.writeFileSync(outputPath, content);

    console.log(`Fallback PDF created at: ${outputPath}`);

    // Send the PDF to the client
    sendPdfToClient(outputPath, res);

  } catch (error) {
    console.error('Error creating fallback PDF:', error);
    res.status(500).json({ error: 'Failed to create fallback PDF', message: error.message });
  }
}

// Helper function to send a PDF to the client
function sendPdfToClient(outputPath, res) {
  try {
    // Set PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outputPath)}"`);
    res.setHeader('Content-Length', fs.statSync(outputPath).size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    console.log('PDF headers set, sending file...');

    // Send the file directly
    const fileBuffer = fs.readFileSync(outputPath);
    console.log(`Read file buffer of size: ${fileBuffer.length} bytes`);
    res.send(fileBuffer);

    console.log('File sent to client');

    // Clean up
    setTimeout(() => {
      try {
        fs.unlinkSync(outputPath);
        console.log('PDF file cleaned up');
      } catch (err) {
        console.error('Error cleaning up PDF file:', err);
      }
    }, 1000);

  } catch (error) {
    console.error('Error sending PDF to client:', error);
    res.status(500).json({ error: 'Failed to send PDF', message: error.message });
  }
}

// Simple generate endpoint for testing
app.post('/simple-generate', (req, res) => {
  try {
    console.log('Simple generate request received');
    console.log('Request body keys:', Object.keys(req.body));

    const { format = 'txt', fileName = 'simple-resume' } = req.body;
    const normalizedFormat = format.toLowerCase();

    // Create a temporary file
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const outputPath = path.join(tempDir, `${fileName}-${Date.now()}.${normalizedFormat}`);

    // Create a simple file with some content
    let content = 'This is a simple test resume file.\n\n';
    content += 'Name: John Doe\n';
    content += 'Title: Software Developer\n\n';
    content += 'Experience:\n';
    content += '- Senior Developer at Tech Company (2018-Present)\n';
    content += '- Junior Developer at Startup (2015-2018)\n\n';
    content += 'Education:\n';
    content += '- Bachelor in Computer Science, University (2011-2015)\n\n';
    content += 'Skills:\n';
    content += '- Programming: JavaScript, Python, Java\n';
    content += '- Tools: Git, Docker, AWS\n';

    // Write the file
    fs.writeFileSync(outputPath, content);

    // Set appropriate headers
    let contentType;
    switch (normalizedFormat) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'txt':
      default:
        contentType = 'text/plain';
        break;
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.${normalizedFormat}"`);
    res.setHeader('Content-Length', fs.statSync(outputPath).size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Stream the file
    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);

    // Clean up when done
    fileStream.on('end', () => {
      try {
        fs.unlinkSync(outputPath);
        console.log('Temporary file cleaned up');
      } catch (err) {
        console.error('Error cleaning up file:', err);
      }
    });
  } catch (error) {
    console.error('Error in simple generate:', error);
    res.status(500).json({
      error: 'Error generating file',
      message: error.message
    });
  }
});

// Test route for file download
app.get('/test-download', (req, res) => {
  try {
    const format = req.query.format || 'txt';
    const testFilePath = path.join(__dirname, 'temp', `test-file-${Date.now()}.${format}`);

    // Create a test file
    let content = 'This is a test file for download functionality.';

    // For PDF format, create a simple PDF using PDFKit
    if (format.toLowerCase() === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(testFilePath);

      doc.pipe(writeStream);

      // Add some content to the PDF
      doc.fontSize(25).text('Test PDF Document', 100, 100);
      doc.fontSize(12).text('This is a test PDF file generated for download testing.', 100, 150);
      doc.text('If you can see this text, the PDF download is working correctly.', 100, 170);
      doc.text('Generated at: ' + new Date().toLocaleString(), 100, 200);

      // Finalize the PDF
      doc.end();

      // Wait for the PDF to be written to disk
      writeStream.on('finish', () => {
        console.log('Test PDF created successfully');
        sendTestFile(testFilePath, format, res);
      });

      return; // Early return to avoid executing the rest of the function
    } else {
      // For other formats, just write a text file
      fs.writeFileSync(testFilePath, content);
      sendTestFile(testFilePath, format, res);
    }
  } catch (error) {
    console.error('Error in test download route:', error);
    res.status(500).json({ error: 'Test download failed', message: error.message });
  }
});

// Helper function to send test files
function sendTestFile(filePath, format, res) {
  try {
    // Set appropriate headers
    let contentType;
    switch (format.toLowerCase()) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'txt':
      default:
        contentType = 'text/plain';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="test-file.${format}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Read the file into memory and send it directly
    const fileBuffer = fs.readFileSync(filePath);
    res.send(fileBuffer);

    // Clean up the file after sending
    setTimeout(() => {
      try {
        fs.unlinkSync(filePath);
        console.log('Test file cleaned up');
      } catch (err) {
        console.error('Error cleaning up test file:', err);
      }
    }, 1000);
  } catch (error) {
    console.error('Error sending test file:', error);
    res.status(500).json({ error: 'Failed to send test file', message: error.message });
  }
}

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

