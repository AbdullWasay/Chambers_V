"use client"

import { useEffect, useState } from "react"
import "../styles/Editor.css"
import ResumePreview from "./ResumePreview"
import Sidebar from "./Sidebar"
import AddSectionModal from "./modals/AddSectionModal"
import DesignModal from "./modals/DesignModal"
import DownloadModal from "./modals/DownloadModal"
import TemplateModal from "./modals/TemplateModal"

const Editor = ({ initialData }) => {
  const [resumeData, setResumeData] = useState(initialData)
  const [activeModal, setActiveModal] = useState(null)
  const [currentTemplate, setCurrentTemplate] = useState("modern")
  const [designSettings, setDesignSettings] = useState({
    font: "Rubik",
    fontSize: 1, // Default font size (1rem)
    pageMargins: 1,
    sectionSpacing: 1,
    colors: {
      primary: "#4a6cf7",
      background: "#ffffff",
      text: "#333333",
    },
    backgroundStyle: "solid",
  })
  const [resumeSections, setResumeSections] = useState([
    { id: "summary", title: "Summary" },
    { id: "experience", title: "Experience" },
    { id: "education", title: "Education" },
    { id: "skills", title: "Skills" },
  ])

  // Initialize sections based on initial data
  useEffect(() => {
    if (!initialData) return

    const sections = []

    // Add basic sections
    if (initialData.summary) {
      sections.push({ id: "summary", title: "Summary" })
    }

    if (initialData.experience && initialData.experience.length > 0) {
      sections.push({ id: "experience", title: "Experience" })
    }

    if (initialData.education && initialData.education.length > 0) {
      sections.push({ id: "education", title: "Education" })
    }

    if (initialData.skills && initialData.skills.length > 0) {
      sections.push({ id: "skills", title: "Skills" })
    }

    // Add additional sections if they exist in the data
    if (initialData.projects && initialData.projects.length > 0) {
      sections.push({ id: "projects", title: "Projects" })
    }

    if (initialData.certifications && initialData.certifications.length > 0) {
      sections.push({ id: "certifications", title: "Certifications" })
    }

    if (initialData.languages && initialData.languages.length > 0) {
      sections.push({ id: "languages", title: "Languages" })
    }

    if (initialData.achievements && initialData.achievements.length > 0) {
      sections.push({ id: "achievements", title: "Achievements" })
    }

    if (initialData.interests && initialData.interests.length > 0) {
      sections.push({ id: "interests", title: "Interests" })
    }

    setResumeSections(sections)
  }, [initialData])

  // Apply design settings to the resume preview
  useEffect(() => {
    const resumePreview = document.querySelector(".resume-preview")
    if (resumePreview) {
      // Apply font family
      resumePreview.style.fontFamily = designSettings.font

      // Apply font size
      resumePreview.style.fontSize = `${designSettings.fontSize}rem`

      // Apply page margins
      resumePreview.style.padding = `${designSettings.pageMargins * 30}px`

      // Apply section spacing
      const sections = document.querySelectorAll(".resume-section")
      sections.forEach((section) => {
        section.style.marginBottom = `${designSettings.sectionSpacing * 30}px`
      })

      // Apply background style
      if (designSettings.backgroundStyle === "gradient") {
        resumePreview.style.background = `linear-gradient(135deg, ${designSettings.colors.background} 0%, #f5f7fa 100%)`
      } else if (designSettings.backgroundStyle === "pattern") {
        resumePreview.style.backgroundColor = designSettings.colors.background
        resumePreview.style.backgroundImage = `radial-gradient(${designSettings.colors.primary}20 1px, transparent 1px)`
        resumePreview.style.backgroundSize = "10px 10px"
      } else {
        resumePreview.style.backgroundColor = designSettings.colors.background
        resumePreview.style.backgroundImage = "none"
      }

      // Apply text color
      resumePreview.style.color = designSettings.colors.text
    }
  }, [designSettings])

  const closeModal = () => {
    setActiveModal(null)
  }

  const handleAddSection = (sectionType, customName = "") => {
    const newSection = createEmptySection(sectionType)
    const sectionTitle = customName || getSectionTitle(sectionType)
    const sectionId = customName ? customName.toLowerCase().replace(/\s+/g, "_") : sectionType

    // Create a copy of the resume data and add the new section
    const updatedData = { ...resumeData }

    if (!updatedData[sectionId]) {
      updatedData[sectionId] = []
    }

    if (Array.isArray(updatedData[sectionId])) {
      updatedData[sectionId] = [...updatedData[sectionId], newSection]
    } else if (typeof updatedData[sectionId] === "string") {
      // If it's a string (like summary), convert to array with the old value and new one
      updatedData[sectionId] = [updatedData[sectionId], newSection]
    } else {
      updatedData[sectionId] = [newSection]
    }

    setResumeData(updatedData)

    // Add to sections list if not already there
    if (!resumeSections.some((section) => section.id === sectionId)) {
      setResumeSections([...resumeSections, { id: sectionId, title: sectionTitle }])
    }

    closeModal()
  }

  const getSectionTitle = (sectionType) => {
    const titles = {
      summary: "Summary",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
      projects: "Projects",
      certifications: "Certifications",
      languages: "Languages",
      interests: "Interests",
      references: "References",
      publications: "Publications",
      volunteer: "Volunteer",
      achievements: "Achievements",
      custom: "Custom Section",
    }
    return titles[sectionType] || "New Section"
  }

  const createEmptySection = (sectionType) => {
    switch (sectionType) {
      case "experience":
        return {
          title: "New Position",
          company: "Company Name",
          location: "Location",
          period: "Start - End",
          bullets: ["Responsibility or achievement"],
        }
      case "education":
        return {
          degree: "Degree Name",
          school: "School Name",
          location: "Location",
          year: "Graduation Year",
        }
      case "skills":
        return "New Skill"
      case "projects":
        return {
          name: "Project Name",
          description: "Project Description",
          technologies: ["Technology 1", "Technology 2"],
          link: "https://project-link.com",
        }
      case "certifications":
        return {
          name: "Certification Name",
          issuer: "Issuing Organization",
          date: "Issue Date",
          link: "https://certification-link.com",
        }
      case "languages":
        return {
          language: "Language Name",
          proficiency: "Proficiency Level",
        }
      case "interests":
        return "New Interest"
      case "references":
        return {
          name: "Reference Name",
          position: "Position",
          company: "Company",
          contact: "Contact Information",
        }
      case "publications":
        return {
          title: "Publication Title",
          publisher: "Publisher",
          date: "Publication Date",
          link: "https://publication-link.com",
        }
      case "volunteer":
        return {
          organization: "Organization Name",
          role: "Volunteer Role",
          period: "Start - End",
          description: "Description of volunteer work",
        }
      case "achievements":
        return {
          title: "Achievement Title",
          organization: "Organization",
          date: "Date",
          description: "Description of achievement",
        }
      case "custom":
        return "Custom content"
      default:
        return "New Item"
    }
  }

  const handleTemplateChange = (template) => {
    setCurrentTemplate(template)
    closeModal()
  }

  const handleDesignChange = (newSettings) => {
    setDesignSettings({ ...designSettings, ...newSettings })
  }

  const handleUpdateResumeData = (updatedData) => {
    setResumeData(updatedData)
  }

  const handleRearrangeSections = (newSections) => {
    setResumeSections(newSections)
  }

  const handleDeleteSection = (sectionId) => {
    // Remove section from resumeData
    const updatedData = { ...resumeData }
    delete updatedData[sectionId]
    setResumeData(updatedData)

    // Remove section from resumeSections
    const updatedSections = resumeSections.filter((section) => section.id !== sectionId)
    setResumeSections(updatedSections)
  }

  const handleMoveSection = (sectionId, direction) => {
    const sectionIndex = resumeSections.findIndex((section) => section.id === sectionId)
    if (sectionIndex === -1) return

    const newSections = [...resumeSections]

    if (direction === "up" && sectionIndex > 0) {
      // Swap with the section above
      ;[newSections[sectionIndex - 1], newSections[sectionIndex]] = [
        newSections[sectionIndex],
        newSections[sectionIndex - 1],
      ]
    } else if (direction === "down" && sectionIndex < newSections.length - 1) {
      // Swap with the section below
      ;[newSections[sectionIndex], newSections[sectionIndex + 1]] = [
        newSections[sectionIndex + 1],
        newSections[sectionIndex],
      ]
    }

    setResumeSections(newSections)
  }

  return (
    <div className="editor-container">
      <Sidebar
        onAddSection={() => setActiveModal("addSection")}
        onTemplates={() => setActiveModal("templates")}
        onDesign={() => setActiveModal("design")}
        resumeSections={resumeSections}
        onRearrangeSections={handleRearrangeSections}
      />

      <ResumePreview
        data={resumeData}
        template={currentTemplate}
        designSettings={designSettings}
        onUpdateData={handleUpdateResumeData}
        sectionOrder={resumeSections}
        onDeleteSection={handleDeleteSection}
        onMoveSection={handleMoveSection}
      />

      {activeModal === "addSection" && <AddSectionModal onClose={closeModal} onAddSection={handleAddSection} />}

      {activeModal === "templates" && (
        <TemplateModal onClose={closeModal} onSelectTemplate={handleTemplateChange} currentTemplate={currentTemplate} />
      )}

      {activeModal === "design" && (
        <DesignModal onClose={closeModal} settings={designSettings} onUpdateSettings={handleDesignChange} />
      )}

      {/* Hidden button to trigger download modal */}
      <button id="download-modal-trigger" style={{ display: "none" }} onClick={() => setActiveModal("download")} />

      {activeModal === "download" && (
        <DownloadModal
          onClose={closeModal}
          resumeData={resumeData}
          template={currentTemplate}
          designSettings={designSettings}
        />
      )}
    </div>
  )
}

export default Editor
