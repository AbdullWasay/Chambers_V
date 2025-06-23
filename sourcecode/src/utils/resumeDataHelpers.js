/**
 * Helper functions for handling resume data in different formats
 */

/**
 * Gets the location string from different possible formats
 * 
 * @param {Object} data - Resume data
 * @returns {string} - Formatted location string
 */
export const getLocationString = (data) => {
  // If location is in basics object
  if (data.basics && data.basics.location) {
    // If location is an object with city/region properties
    if (typeof data.basics.location === 'object' && data.basics.location !== null) {
      if (data.basics.location.city) {
        return `${data.basics.location.city}${data.basics.location.region ? `, ${data.basics.location.region}` : ''}`;
      }
      // If it's an object but doesn't have city property, try to stringify it
      return JSON.stringify(data.basics.location);
    }
    // If location is a string
    if (typeof data.basics.location === 'string') {
      return data.basics.location;
    }
  }
  
  // Fallback to top-level location property
  if (data.location) {
    return typeof data.location === 'string' ? data.location : JSON.stringify(data.location);
  }
  
  return "";
};

/**
 * Gets the title/label string from different possible formats
 * 
 * @param {Object} data - Resume data
 * @returns {string} - Formatted title string
 */
export const getTitleString = (data) => {
  if (data.basics) {
    if (data.basics.label) return data.basics.label;
    if (data.basics.title) return data.basics.title;
  }
  return data.title || "";
};

/**
 * Gets the field name for the title/label
 * 
 * @param {Object} data - Resume data
 * @returns {string} - Field name for title
 */
export const getTitleFieldName = (data) => {
  if (data.basics) {
    if (data.basics.label) return "basics.label";
    if (data.basics.title) return "basics.title";
  }
  return "title";
};

/**
 * Formats date from YYYY-MM to Month Year format
 * 
 * @param {string} dateString - Date in YYYY-MM format or "Present"
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
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
