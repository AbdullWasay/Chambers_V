"use client"

import { useEffect, useState } from "react"
import "../styles/Editor.css"
import ATSCheckPage from "./ATSCheckPage"
import CustomizationSidebar from "./CustomizationSidebar"
import ResumePreview from "./ResumePreview"
import Sidebar from "./Sidebar"
import AddSectionModal from "./modals/AddSectionModal"
import DesignModal from "./modals/DesignModal"
import DownloadModal from "./modals/DownloadModal"
import RearrangeModal from "./modals/RearrangeModal"
import TemplateModal from "./modals/TemplateModal"

// Import AIChatbot at the top of the file
import AIChatbot from "./AIChatbot"

const Editor = ({ initialData }) => {
  const [resumeData, setResumeData] = useState(initialData)
  const [activeModal, setActiveModal] = useState(null)
  const [currentTemplate, setCurrentTemplate] = useState("modern")
  const [isCustomizationSidebarOpen, setIsCustomizationSidebarOpen] = useState(false)
  const [isAIChatbotOpen, setIsAIChatbotOpen] = useState(false)
  const [isATSCheckOpen, setIsATSCheckOpen] = useState(false)
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
  const [customizationSettings, setCustomizationSettings] = useState({
    atsOptimization: 3,
    tone: 3,
    length: 3,
    keywordDensity: 3,
    industryJargon: 3,
    actionVerbIntensity: 3,
    quantifiableResults: 3,
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
    console.log("Initial data for sections:", initialData);

    // Handle basics section which contains name, title, email, phone, location, and summary
    if (initialData.basics) {
      // If summary is in basics, add it as a separate section
      if (initialData.basics.summary) {
        sections.push({ id: "summary", title: "Summary" })
        // Make sure summary is also available at the top level
        if (!initialData.summary) {
          initialData.summary = initialData.basics.summary;
        }
      }
    } else if (initialData.summary) {
      sections.push({ id: "summary", title: "Summary" })
    }

    // Handle experience section
    if (initialData.experience && initialData.experience.length > 0) {
      sections.push({ id: "experience", title: "Experience" })

      // Normalize experience data structure
      initialData.experience = initialData.experience.map(exp => {
        // Ensure highlights exists and is an array
        if (!exp.highlights && exp.description) {
          // If there are no highlights but there's a description, create highlights from description
          exp.highlights = [exp.description];
        } else if (!exp.highlights) {
          exp.highlights = [];
        }
        return exp;
      });
    }

    // Handle education section
    if (initialData.education && initialData.education.length > 0) {
      sections.push({ id: "education", title: "Education" })

      // Normalize education data structure
      initialData.education = initialData.education.map(edu => {
        // Ensure all required fields exist
        if (!edu.degree && edu.studyType) {
          edu.degree = edu.studyType;
        }
        if (!edu.school && edu.institution) {
          edu.school = edu.institution;
        }
        return edu;
      });
    }

    // Handle skills section
    if (initialData.skills && initialData.skills.length > 0) {
      sections.push({ id: "skills", title: "Skills" })

      // Normalize skills data structure
      initialData.skills = initialData.skills.map(skill => {
        // If skill has name and keywords, format it properly
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

    // Add additional sections if they exist in the data
    if (initialData.projects && initialData.projects.length > 0) {
      sections.push({ id: "projects", title: "Projects" })

      // Normalize projects data
      initialData.projects = initialData.projects.map(project => {
        if (!project.technologies && project.keywords) {
          project.technologies = project.keywords;
        }
        return project;
      });
    }

    // Handle certifications
    if (initialData.certifications && initialData.certifications.length > 0) {
      sections.push({ id: "certifications", title: "Certifications" })
    }

    // Handle languages
    if (initialData.languages && initialData.languages.length > 0) {
      sections.push({ id: "languages", title: "Languages" })

      // Normalize languages data
      initialData.languages = initialData.languages.map(lang => {
        if (!lang.proficiency && lang.fluency) {
          lang.proficiency = lang.fluency;
        }
        return lang;
      });
    }

    // Handle achievements/awards
    if (initialData.achievements && initialData.achievements.length > 0) {
      sections.push({ id: "achievements", title: "Achievements" })
    } else if (initialData.awards && initialData.awards.length > 0) {
      sections.push({ id: "awards", title: "Awards" })
      // Map awards to achievements format
      initialData.achievements = initialData.awards.map(award => ({
        title: award.title,
        date: award.date,
        organization: award.awarder,
        description: award.summary
      }));
    }

    // Handle interests
    if (initialData.interests && initialData.interests.length > 0) {
      sections.push({ id: "interests", title: "Interests" })
    }

    // Handle publications
    if (initialData.publications && initialData.publications.length > 0) {
      sections.push({ id: "publications", title: "Publications" })
    }

    // Handle volunteer work
    if (initialData.volunteer && initialData.volunteer.length > 0) {
      sections.push({ id: "volunteer", title: "Volunteer Experience" })
    }

    console.log("Sections to display:", sections);
    setResumeSections(sections);

    // Update resume data with normalized data
    setResumeData({...initialData});
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

  const handleCustomizationChange = (newSettings) => {
    setCustomizationSettings({ ...customizationSettings, ...newSettings })

    // Apply the customization settings to the resume
    applyCustomizationSettings({ ...customizationSettings, ...newSettings })

    console.log("Customization settings updated:", newSettings)
  }

  // Function to apply customization settings to the resume
  const applyCustomizationSettings = (settings) => {
    // In a real implementation, this would call an API to optimize the resume
    // For now, we'll simulate the effect by logging the settings
    console.log("Applying customization settings to resume:", settings)

    // Example of how you might modify the resume data based on settings
    // This is a simplified example - in a real implementation, you would
    // likely call an API that uses AI to optimize the resume

    // In a real implementation, we would create a copy of the resume data to modify
    // const optimizedData = { ...resumeData }

    // Apply ATS optimization (example: add more keywords in summary)
    if (settings.atsOptimization > 3) {
      // In a real implementation, this would use AI to add ATS-friendly keywords
      console.log("Enhancing ATS optimization")
    }

    // Apply tone adjustments
    if (settings.tone !== 3) {
      // In a real implementation, this would adjust the language tone
      console.log("Adjusting tone to", settings.tone > 3 ? "more formal" : "more casual")
    }

    // Apply length adjustments
    if (settings.length !== 3) {
      // In a real implementation, this would expand or condense content
      console.log("Adjusting content length to", settings.length > 3 ? "more detailed" : "more concise")
    }

    // For now, we're not actually modifying the resume data
    // In a real implementation, you would update the resume data here
    // setResumeData(optimizedData)
  }

  const toggleCustomizationSidebar = () => {
    setIsCustomizationSidebarOpen(!isCustomizationSidebarOpen)
  }

  const toggleAIChatbot = () => {
    setIsAIChatbotOpen(!isAIChatbotOpen)
  }

  const toggleATSCheck = () => {
    setIsATSCheckOpen(!isATSCheckOpen)
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
      <div className="editor-sidebar-wrapper">
        <Sidebar
          onAddSection={() => setActiveModal("addSection")}
          onTemplates={() => setActiveModal("templates")}
          onDesign={() => setActiveModal("design")}
          resumeSections={resumeSections}
          onRearrangeSections={() => setActiveModal("rearrange")}
          onOpenAIChatbot={toggleAIChatbot}
          onOpenATSCheck={toggleATSCheck}
        />
      </div>

      {/* Main Content Area - conditionally show Resume Preview or ATS Check */}
      <div className="main-content-area">
        {isATSCheckOpen ? (
          <div className="ats-check-container">
            <ATSCheckPage
              resumeData={resumeData}
              customizationSettings={customizationSettings}
              onClose={toggleATSCheck}
            />
          </div>
        ) : (
          <ResumePreview
            data={resumeData}
            template={currentTemplate}
            designSettings={designSettings}
            onUpdateData={handleUpdateResumeData}
            sectionOrder={resumeSections}
            onDeleteSection={handleDeleteSection}
            onMoveSection={handleMoveSection}
          />
        )}
      </div>

      {/* Toggle button for customization sidebar */}
      <button className="sidebar-toggle" onClick={toggleCustomizationSidebar}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </button>

      {/* Customization Sidebar */}
      <CustomizationSidebar
        isOpen={isCustomizationSidebarOpen}
        onClose={toggleCustomizationSidebar}
        settings={customizationSettings}
        onUpdateSettings={handleCustomizationChange}
      />



      {/* AI Chatbot */}
      {isAIChatbotOpen && (
        <AIChatbot
          resumeData={resumeData}
          onClose={toggleAIChatbot}
        />
      )}

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

      {activeModal === "rearrange" && (
        <RearrangeModal
          onClose={closeModal}
          sections={resumeSections}
          onRearrange={handleRearrangeSections}
        />
      )}
    </div>
  )
}

export default Editor
