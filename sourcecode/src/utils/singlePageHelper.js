// Helper function to determine which sections to show on a single page
export const getSectionsForSinglePage = (sectionOrder, pageIndex) => {
  // Get all sections that have content
  const sectionsWithContent = sectionOrder;

  // If we're on the first page, return all sections
  if (pageIndex === 0) {
    // Prioritize summary to be first if it exists
    const summarySection = sectionsWithContent.find(section => section.id === "summary");
    const nonSummarySections = sectionsWithContent.filter(section => section.id !== "summary");
    
    if (summarySection) {
      // If we have a summary, put it first followed by all other sections
      return [summarySection, ...nonSummarySections];
    } else {
      // No summary, return all sections in their original order
      return sectionsWithContent;
    }
  } else {
    // For subsequent pages, return empty (we want everything on one page)
    return [];
  }
}
