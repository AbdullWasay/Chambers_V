const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

/**
 * Generate a PDF from HTML template using puppeteer
 * @param {Object} resumeData - The resume data
 * @param {string} template - The template name (modern, elegant, professional, creative)
 * @param {Object} designSettings - The design settings
 * @param {string} outputPath - The output path for the PDF
 * @returns {Promise<void>}
 */
async function generatePdfFromHtml(resumeData, template, designSettings, outputPath) {
  try {
    console.log('Generating PDF from HTML template...');

    // Read the HTML template
    const templatePath = path.join(__dirname, '../templates/resume-pdf.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');

    // Compile the template with proper HTML escaping disabled
    const compiledTemplate = handlebars.compile(templateHtml, { noEscape: true });

    // Generate the HTML content based on the template
    const htmlContent = generateHtmlContent(resumeData, template);

    // Get design settings
    const fontFamily = designSettings?.font || 'Helvetica';
    const fontSize = designSettings?.fontSize || 12;
    const primaryColor = designSettings?.colors?.primary || '#4a6cf7';

    // Render the template with the data
    const renderedHtml = compiledTemplate({
      name: resumeData.basics?.name || 'Resume',
      fontFamily,
      fontSize,
      primaryColor,
      content: htmlContent
    });

    // Save the rendered HTML for debugging
    const debugHtmlPath = outputPath.replace('.pdf', '.html');
    fs.writeFileSync(debugHtmlPath, renderedHtml);

    // Launch puppeteer
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
    await page.setContent(renderedHtml, {
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
    console.log('PDF generated successfully');

  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw error;
  }
}

/**
 * Generate HTML content for the resume
 * @param {Object} resumeData - The resume data
 * @param {string} template - The template name
 * @returns {string} - The HTML content
 */
function generateHtmlContent(resumeData, template) {
  let html = '';

  // Generate header
  html += generateHeader(resumeData);

  // Generate sections based on the data
  if (resumeData.basics?.summary || resumeData.summary) {
    html += generateSection('Summary', generateSummary(resumeData));
  }

  if (resumeData.work || resumeData.experience) {
    html += generateSection('Experience', generateExperience(resumeData));
  }

  if (resumeData.education) {
    html += generateSection('Education', generateEducation(resumeData));
  }

  if (resumeData.skills) {
    html += generateSection('Skills', generateSkills(resumeData));
  }

  if (resumeData.projects) {
    html += generateSection('Projects', generateProjects(resumeData));
  }

  if (resumeData.volunteer) {
    html += generateSection('Volunteer Experience', generateVolunteer(resumeData));
  }

  if (resumeData.awards || resumeData.achievements) {
    html += generateSection('Awards & Achievements', generateAwards(resumeData));
  }

  if (resumeData.certifications) {
    html += generateSection('Certifications', generateCertifications(resumeData));
  }

  if (resumeData.languages) {
    html += generateSection('Languages', generateLanguages(resumeData));
  }

  return html;
}

// Helper functions to generate different sections of the resume
function generateHeader(resumeData) {
  const basics = resumeData.basics || resumeData;
  const name = basics.name || 'Your Name';
  const label = basics.label || basics.title || 'Professional Title';

  let contactHtml = '';
  if (basics.email) {
    contactHtml += `<div class="resume-contact-item"><span>📧</span> ${basics.email}</div>`;
  }
  if (basics.phone) {
    contactHtml += `<div class="resume-contact-item"><span>📱</span> ${basics.phone}</div>`;
  }
  if (basics.location?.city || basics.location?.region) {
    const location = [basics.location.city, basics.location.region].filter(Boolean).join(', ');
    contactHtml += `<div class="resume-contact-item"><span>📍</span> ${location}</div>`;
  }
  if (basics.url || basics.website) {
    contactHtml += `<div class="resume-contact-item"><span>🌐</span> ${basics.url || basics.website}</div>`;
  }
  if (basics.profiles && basics.profiles.length > 0) {
    basics.profiles.forEach(profile => {
      contactHtml += `<div class="resume-contact-item"><span>🔗</span> ${profile.network}: ${profile.username || profile.url}</div>`;
    });
  }

  return `
    <div class="resume-header">
      <div class="resume-header-content">
        <div class="resume-name-title">
          <div class="resume-name">${name}</div>
          <div class="resume-title">${label}</div>
        </div>
        <div class="resume-contact">
          ${contactHtml}
        </div>
      </div>
    </div>
  `;
}

function generateSection(title, content) {
  return `
    <div class="resume-section">
      <div class="section-header">
        <div class="section-title">${title}</div>
      </div>
      <div class="section-content">
        ${content}
      </div>
    </div>
  `;
}

function generateSummary(resumeData) {
  const summary = resumeData.basics?.summary || resumeData.summary || '';
  return `<div class="summary-content">${summary}</div>`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';

  try {
    // Handle YYYY-MM format
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
      const [year, month] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    // Handle other date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

function generateExperience(resumeData) {
  const experiences = resumeData.work || resumeData.experience || [];
  if (!experiences.length) return '';

  let html = '';
  experiences.forEach(exp => {
    const title = exp.position || exp.title || 'Position';
    const company = exp.company || exp.name || 'Company';
    const location = exp.location || '';
    const startDate = exp.startDate ? formatDate(exp.startDate) : '';
    const endDate = exp.endDate ? formatDate(exp.endDate) : 'Present';
    const period = exp.period ? formatDate(exp.period) : `${startDate} - ${endDate}`;
    const description = exp.summary || exp.description || '';

    let highlightsHtml = '';
    if (exp.highlights && exp.highlights.length > 0) {
      highlightsHtml = '<ul class="experience-bullets">';
      exp.highlights.forEach(highlight => {
        highlightsHtml += `<li class="experience-bullet">${highlight}</li>`;
      });
      highlightsHtml += '</ul>';
    }

    html += `
      <div class="experience-item">
        <div class="experience-header">
          <div class="experience-title-company">
            <div class="experience-title">${title}</div>
            <div class="experience-company">${company}${location ? ` | ${location}` : ''}</div>
          </div>
          <div class="experience-period">${period}</div>
        </div>
        ${description ? `<div class="experience-description">${description}</div>` : ''}
        ${highlightsHtml}
      </div>
    `;
  });

  return html;
}

function generateEducation(resumeData) {
  const education = resumeData.education || [];
  if (!education.length) return '';

  let html = '';
  education.forEach(edu => {
    const degree = edu.studyType || edu.degree || '';
    const area = edu.area ? (degree ? ` in ${edu.area}` : edu.area) : '';
    const school = edu.institution || edu.school || 'Institution';
    const location = edu.location || '';
    const startDate = edu.startDate ? formatDate(edu.startDate) : '';
    const endDate = edu.endDate ? formatDate(edu.endDate) : 'Present';
    const year = edu.year ? formatDate(edu.year) : `${startDate} - ${endDate}`;

    html += `
      <div class="education-item">
        <div class="education-header">
          <div class="education-degree-school">
            <div class="education-degree">${degree}${area}</div>
            <div class="education-school">${school}${location ? ` | ${location}` : ''}</div>
          </div>
          <div class="education-year">${year}</div>
        </div>
      </div>
    `;
  });

  return html;
}

function generateSkills(resumeData) {
  const skills = resumeData.skills || [];
  if (!skills.length) return '';

  let html = '<div class="skills-container">';

  skills.forEach(skill => {
    if (skill.name && skill.keywords && skill.keywords.length > 0) {
      html += `
        <div class="skill-category">
          <div class="skill-category-name">${skill.name}</div>
          <div class="skill-items">
            ${skill.keywords.map(keyword => `<div class="skill-item">${keyword}</div>`).join('')}
          </div>
        </div>
      `;
    } else if (skill.category && skill.items && skill.items.length > 0) {
      html += `
        <div class="skill-category">
          <div class="skill-category-name">${skill.category}</div>
          <div class="skill-items">
            ${skill.items.map(item => `<div class="skill-item">${item}</div>`).join('')}
          </div>
        </div>
      `;
    } else if (typeof skill === 'string') {
      html += `<div class="skill-item">${skill}</div>`;
    }
  });

  html += '</div>';
  return html;
}

function generateProjects(resumeData) {
  const projects = resumeData.projects || [];
  if (!projects.length) return '';

  let html = '';
  projects.forEach(project => {
    const name = project.name || 'Project';
    const description = project.description || '';
    const url = project.url || project.website || '';
    const technologies = project.technologies || project.keywords || [];

    let techHtml = '';
    if (technologies.length > 0) {
      techHtml = `<div class="project-technologies">Technologies: ${technologies.join(', ')}</div>`;
    }

    html += `
      <div class="project-item">
        <div class="project-header">
          <div class="project-name">${name}</div>
          ${url ? `<div class="project-link">${url}</div>` : ''}
        </div>
        ${description ? `<div class="project-description">${description}</div>` : ''}
        ${techHtml}
      </div>
    `;
  });

  return html;
}

function generateVolunteer(resumeData) {
  const volunteer = resumeData.volunteer || [];
  if (!volunteer.length) return '';

  let html = '';
  volunteer.forEach(vol => {
    const position = vol.position || vol.role || 'Volunteer';
    const organization = vol.organization || '';
    const startDate = vol.startDate ? formatDate(vol.startDate) : '';
    const endDate = vol.endDate ? formatDate(vol.endDate) : 'Present';
    const period = vol.period ? formatDate(vol.period) : `${startDate} - ${endDate}`;
    const summary = vol.summary || vol.description || '';

    html += `
      <div class="volunteer-item">
        <div class="volunteer-header">
          <div class="volunteer-title-org">
            <div class="volunteer-position">${position}</div>
            <div class="volunteer-organization">${organization}</div>
          </div>
          <div class="volunteer-period">${period}</div>
        </div>
        ${summary ? `<div class="volunteer-description">${summary}</div>` : ''}
      </div>
    `;
  });

  return html;
}

function generateAwards(resumeData) {
  const awards = resumeData.awards || resumeData.achievements || [];
  if (!awards.length) return '';

  let html = '';
  awards.forEach(award => {
    const title = award.title || award.name || 'Award';
    const issuer = award.awarder || award.issuer || award.organization || '';
    const date = award.date ? formatDate(award.date) : '';
    const summary = award.summary || award.description || '';

    html += `
      <div class="award-item">
        <div class="award-header">
          <div class="award-title">${title}</div>
          ${date ? `<div class="award-date">${date}</div>` : ''}
        </div>
        ${issuer ? `<div class="award-issuer">${issuer}</div>` : ''}
        ${summary ? `<div class="award-description">${summary}</div>` : ''}
      </div>
    `;
  });

  return html;
}

function generateCertifications(resumeData) {
  const certifications = resumeData.certifications || [];
  if (!certifications.length) return '';

  let html = '';
  certifications.forEach(cert => {
    const name = cert.name || 'Certification';
    const issuer = cert.issuer || '';
    const date = cert.date ? formatDate(cert.date) : '';

    html += `
      <div class="certification-item">
        <div class="certification-header">
          <div class="certification-name">${name}</div>
          ${date ? `<div class="certification-date">${date}</div>` : ''}
        </div>
        ${issuer ? `<div class="certification-issuer">${issuer}</div>` : ''}
      </div>
    `;
  });

  return html;
}

function generateLanguages(resumeData) {
  const languages = resumeData.languages || [];
  if (!languages.length) return '';

  let html = '<div class="languages-list">';
  languages.forEach(lang => {
    const language = lang.language || lang.name || 'Language';
    const fluency = lang.fluency || lang.level || lang.proficiency || '';

    html += `<div class="language-item">${language}${fluency ? `: ${fluency}` : ''}</div>`;
  });
  html += '</div>';

  return html;
}

module.exports = {
  generatePdfFromHtml
};
