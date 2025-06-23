/**
 * Helper functions for handling resume sections
 */

/**
 * Determines which sections to show on which page
 *
 * @param {Array} sectionOrder - Array of section objects with id and title
 * @param {number} pageIndex - Current page index (0-based)
 * @returns {Array} - Array of section objects to display on the current page
 */
export const getSectionsForPage = (sectionOrder, pageIndex) => {
  // Calculate how many sections to show per page
  const sectionsPerPage = 10; // Show 10 sections per page to ensure all content is displayed

  // Calculate the start and end indices for the current page
  const startIndex = pageIndex * sectionsPerPage;
  const endIndex = startIndex + sectionsPerPage;

  // Make sure we don't try to access sections beyond what's available
  if (startIndex >= sectionOrder.length) {
    return []; // No sections for this page
  }

  // Return the sections for this page
  return sectionOrder.slice(startIndex, endIndex);
};
