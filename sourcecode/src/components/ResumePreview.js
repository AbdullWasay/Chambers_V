"use client"

import { useEffect, useRef, useState } from "react"
import { FaTrash } from "react-icons/fa"
import "../styles/ResumePreview.css"
import CreativeTemplate from "./template/CreativeTemplate"
import ElegantTemplate from "./template/ElegantTemplate"
import ModernTemplate from "./template/ModernTemplate"
import ProfessionalTemplate from "./template/ProfessionalTemplate"

const ResumePreview = ({
  data,
  template,
  designSettings,
  onUpdateData,
  sectionOrder,
  onDeleteSection,
  onMoveSection,
}) => {
  const [editMode, setEditMode] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [editFormatting, setEditFormatting] = useState({})
  const [hoveredSection, setHoveredSection] = useState(null)
  const [pages, setPages] = useState([{ id: 1, content: null }])
  const [hoveredPage, setHoveredPage] = useState(null)
  const pageRefs = useRef([])

  // Reference to track content overflow
  const contentRef = useRef(null);

  // Modified to always return 1 page to display all content on a single page
  const calculateRequiredPages = () => {
    // Always return 1 to ensure we only have a single page
    return 1;
  };

  // Function to get sections for a specific page - modified to show all sections on a single page
  const getSectionsForPage = (pageIndex) => {
    // Only show content on the first page (pageIndex 0)
    if (pageIndex === 0) {
      // Return all sections for the first page
      return sectionOrder.map(section => ({
        ...section,
        _visibility: {
          visibilityPercentage: 1,
          continuesFromPrevious: false,
          continuesToNext: false,
          visibleTop: 0,
          visibleBottom: 0
        }
      }));
    }

    // Return empty array for any other pages
    return [];
  };

  // Handle section deletion - recalculate pages
  useEffect(() => {
    // When a section is deleted, we need to recalculate pages
    if (contentRef.current) {
      const timer = setTimeout(() => {
        const requiredPages = calculateRequiredPages();

        // If we need fewer pages than we currently have, remove the extra pages
        if (requiredPages < pages.length) {
          const newPages = Array.from({ length: requiredPages }, (_, index) => ({
            id: index + 1,
            content: null
          }));
          setPages(newPages);
          console.log("Reduced pages to:", requiredPages);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [data, sectionOrder.length]); // Run when data changes or sections are removed

  // Initialize page refs and handle automatic pagination
  useEffect(() => {
    pageRefs.current = pageRefs.current.slice(0, pages.length);

    // We need to wait for the content to render before calculating pages
    const timer = setTimeout(() => {
      // Auto-adjust page count based on content overflow
      const requiredPages = calculateRequiredPages();

      if (requiredPages > pages.length) {
        // Create an array of the required number of pages
        const newPages = Array.from({ length: requiredPages }, (_, index) => ({
          id: index + 1,
          content: null
        }));
        setPages(newPages);
        console.log("Auto-adjusted pages to:", requiredPages);
      }
    }, 500); // Small delay to ensure content is rendered

    return () => clearTimeout(timer);
  }, [sectionOrder, data]); // Re-run when sections or data changes

  const handleEdit = (path, value, formatting = {}) => {
    setEditMode(path)
    setEditValue(value)
    setEditFormatting(formatting)
  }

  const handleSave = () => {
    if (!editMode) return

    const pathParts = editMode.split(".")
    const newData = { ...data }

    let current = newData
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i]

      // Handle array indices
      if (!isNaN(part)) {
        const index = Number.parseInt(part)
        current = current[index]
      } else {
        current = current[part]
      }
    }

    const lastPart = pathParts[pathParts.length - 1]

    // Apply formatting to the text if any formatting is active
    let formattedValue = editValue;
    if (editFormatting.bold || editFormatting.italic || editFormatting.underline) {
      // Create HTML with the appropriate formatting
      let styledText = editValue;

      // Apply formatting by wrapping in HTML tags
      if (editFormatting.bold) {
        styledText = `<strong>${styledText}</strong>`;
      }
      if (editFormatting.italic) {
        styledText = `<em>${styledText}</em>`;
      }
      if (editFormatting.underline) {
        styledText = `<u>${styledText}</u>`;
      }

      formattedValue = styledText;
    }

    if (!isNaN(lastPart)) {
      current[Number.parseInt(lastPart)] = formattedValue;
    } else {
      current[lastPart] = formattedValue;
    }

    onUpdateData(newData)
    setEditMode(null)
  }

  const handleCancel = () => {
    setEditMode(null)
  }

  const handleSectionHover = (sectionId, isHovering) => {
    setHoveredSection(isHovering ? sectionId : null)
  }

  const handleDeletePage = (pageId) => {
    if (pages.length <= 1) return // Don't delete the last page

    // Find the index of the page to delete
    const pageIndex = pages.findIndex(page => page.id === pageId);

    if (pageIndex === -1) return; // Page not found

    // Create a new array without the deleted page
    const newPages = [...pages];
    newPages.splice(pageIndex, 1);

    // Update page IDs to be sequential
    const updatedPages = newPages.map((page, idx) => ({
      ...page,
      id: idx + 1
    }));

    setPages(updatedPages);

    // Force a re-render to update the UI and recalculate content flow
    setTimeout(() => {
      // Recalculate required pages after deletion
      const requiredPages = calculateRequiredPages();

      // If we need fewer pages than we currently have after deletion, adjust
      if (requiredPages < updatedPages.length) {
        const finalPages = Array.from({ length: requiredPages }, (_, index) => ({
          id: index + 1,
          content: null
        }));
        setPages(finalPages);
        console.log("Adjusted pages after deletion to:", requiredPages);
      }

      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  const handleAddPage = () => {
    // Don't add more than 5 pages
    if (pages.length >= 5) return;

    // Create a new page with the next sequential ID
    const newPageId = pages.length + 1;
    const newPage = { id: newPageId, content: null };

    // Add the new page to the pages array
    const newPages = [...pages, newPage];
    setPages(newPages);
    console.log("Added new page. Total pages:", newPages.length);

    // Force a re-render to update the UI
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  const handlePageHover = (pageId) => {
    setHoveredPage(pageId)
  }

  // Function to render the template (used for the hidden content measurement)
  const renderTemplate = (pageIndex) => {
    const props = {
      data,
      designSettings,
      onEdit: handleEdit,
      editMode,
      editValue,
      editFormatting,
      setEditValue,
      setEditFormatting,
      onSave: handleSave,
      onCancel: handleCancel,
      sectionOrder,
      onDeleteSection,
      onMoveSection,
      hoveredSection,
      onSectionHover: handleSectionHover,
      pageIndex,
      totalPages: pages.length,
      getSectionsForPage: getSectionsForPage, // Pass the function to determine sections for this page
    }

    switch (template) {
      case "modern":
        return <ModernTemplate {...props} />
      case "elegant":
        return <ElegantTemplate {...props} />
      case "professional":
        return <ProfessionalTemplate {...props} />
      case "creative":
        return <CreativeTemplate {...props} />
      default:
        return <ModernTemplate {...props} />
    }
  }

  return (
    <div className="resume-preview-container">
      <div className="pages-container">
        {/* Hidden container to measure total content height */}
        <div
          ref={contentRef}
          style={{
            position: 'absolute',
            visibility: 'hidden',
            width: '793px', // A4 width
            height: 'auto',
            overflow: 'visible',
            fontFamily: designSettings.font,
            fontSize: getFontSize(designSettings.fontSize),
            lineHeight: designSettings.lineHeight * 1.5,
          }}
        >
          {renderTemplate(0)}
        </div>

        {pages.map((page, index) => {
          // Use the improved getSectionsForPage function to determine which sections to show on this page
          const sectionsForThisPage = getSectionsForPage(index);

          return (
            <div
              key={page.id}
              className="resume-page-wrapper"
              onMouseEnter={() => handlePageHover(page.id)}
              onMouseLeave={() => handlePageHover(null)}
              ref={el => pageRefs.current[index] = el}
              style={{ marginTop: index === 0 ? '0' : '30px' }} /* Added margin between pages */
            >
              <div className="resume-page">
                <div
                  className="resume-preview"
                  style={{
                    fontFamily: designSettings.font,
                    fontSize: getFontSize(designSettings.fontSize),
                    lineHeight: designSettings.lineHeight * 1.5,
                    position: 'relative',
                    height: 'auto', // Allow height to grow
                    minHeight: '100%',
                    width: '100%',
                    overflow: 'visible', // Show all content
                    boxSizing: 'border-box', // Include padding in height calculation
                  }}
                >
                  {/* Render the template component which will handle all sections */}
                  {sectionsForThisPage.length > 0 ? (
                    renderTemplate(index)
                  ) : (
                    <div className="empty-page-message">
                      <p>This page is currently empty in the preview.</p>
                      <p>Don't worry - when you download your resume as a PDF, content will automatically flow across pages as needed.</p>
                      <p>Your resume will be properly formatted as a multi-page document in the downloaded PDF.</p>
                    </div>
                  )}
                </div>

                {hoveredPage === page.id && (
                  <div className="page-controls">
                    <div className="page-control-icons">
                      {pages.length > 1 && (
                        <FaTrash
                          className="page-control-icon delete-icon"
                          onClick={() => handleDeletePage(page.id)}
                          title="Delete page"
                        />
                      )}
                    </div>
                  </div>
                )}
                <div className="page-number">Page {index + 1}</div>
              </div>
            </div>
          );
        })}

        {/* Add Page Button - Hidden since we're using a single page */}
        {/* Hide the add page button since we're displaying all content on a single page */}
      </div>
    </div>
  )
}

const getFontSize = (size) => {
  switch (size) {
    case "small":
      return "0.9rem"
    case "medium":
      return "1rem"
    case "large":
      return "1.1rem"
    default:
      return "1rem"
  }
}

export default ResumePreview
