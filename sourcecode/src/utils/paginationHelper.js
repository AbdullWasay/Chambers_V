/**
 * Helper functions for resume pagination
 * Helps distribute sections across pages more efficiently
 */

/**
 * Determines which sections to show on the first page
 * Prioritizes essential sections like summary, experience, education, skills
 * 
 * @param {Array} sectionOrder - Array of section objects with id and title
 * @returns {Array} - Array of section objects to display on first page
 */
export const getSectionsForFirstPage = (sectionOrder) => {
  // Prioritize essential sections on first page: summary, experience, education, skills
  const essentialSections = sectionOrder.filter(section =>
  ["summary", "experience", "education", "skills"].includes(section.id)
  );
  
  // If we have fewer than 6 essential sections, we can add more
  if (essentialSections.length < 6) {
    // Calculate how many additional sections we can fit
    const additionalCount = 6 - essentialSections.length;
    
    // Get non-essential sections
    const otherSections = sectionOrder.filter(section => 
      !["summary", "experience", "education", "skills"].includes(section.id)
    );
    
    // Add as many additional sections as we can fit
    return [...essentialSections, ...otherSections.slice(0, additionalCount)];
  }
  
  // If we have more than 6 essential sections, just show the first 6
  return essentialSections.slice(0, 6);
};

/**
 * Determines which sections to show on a specific page
 * 
 * @param {number} pageIndex - Index of the current page (0-based)
 * @param {Array} sectionOrder - Array of section objects with id and title
 * @returns {Array} - Array of section objects to display on the specified page
 *
  export const getSectionsForPage = (pageIndex, sectionOrder) => {
  // For the first page, always show the header and summary
  if (pageIndex === 0) {
    return getSectionsForFirstPage(sectionOrder);
  } else {
    // For subsequent pages, distribute remaining sections more efficiently
    
    // First, get all sections
    const allSections = [...sectionOrder];
    
    // Determine which sections are already shown on the first page
    const firstPageSections = getSectionsForFirstPage(sectionOrder);
    const firstPageSectionIds = firstPageSections.map(section => section.id);
    
    // Filter out sections already shown on the first page
    const remainingSections = allSections.filter(section => 
      !firstPageSectionIds.includes(section.id)
    );
    
    // Calculate how many sections per page for remaining pages
    // We'll try to distribute them evenly
    const sectionsPerPage = 6; // Aim for 6 sections per page
    const startIndex = (pageIndex - 1) * sectionsPerPage;
    
    // Make sure we don't try to access sections beyond what's available
    if (startIndex >= remainingSections.length) {
      return []; // No sections for this page
    }
    
    return remainingSections.slice(startIndex, startIndex + sectionsPerPage);
  }
};
*/