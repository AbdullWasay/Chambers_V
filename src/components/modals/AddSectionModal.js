"use client"
import { useState } from "react"
import "../../styles/modals/AddSectionModal.css"

const AddSectionModal = ({ onClose, onAddSection }) => {
  const [customSectionName, setCustomSectionName] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const sectionTypes = [
    { id: "experience", name: "Experience", icon: "briefcase" },
    { id: "education", name: "Education", icon: "book" },
    { id: "skills", name: "Skills", icon: "check-circle" },
    { id: "projects", name: "Projects", icon: "code" },
    { id: "certifications", name: "Certifications", icon: "award" },
    { id: "languages", name: "Languages", icon: "globe" },
    { id: "interests", name: "Interests", icon: "heart" },
    { id: "references", name: "References", icon: "users" },
    { id: "publications", name: "Publications", icon: "file-text" },
    { id: "volunteer", name: "Volunteer", icon: "hands-helping" },
    { id: "achievements", name: "Achievements", icon: "trophy" },
    { id: "custom", name: "Custom", icon: "plus-circle" },
  ]

  const handleSectionClick = (sectionType) => {
    if (sectionType === "custom") {
      setShowCustomInput(true)
    } else {
      onAddSection(sectionType)
    }
  }

  const handleCustomSectionSubmit = () => {
    if (customSectionName.trim()) {
      onAddSection("custom", customSectionName)
      setCustomSectionName("")
      setShowCustomInput(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCustomSectionSubmit()
    }
  }

  const getIcon = (iconName) => {
    switch (iconName) {
      case "briefcase":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        )
      case "book":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        )
      case "check-circle":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )
      case "code":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        )
      case "award":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
        )
      case "globe":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        )
      case "heart":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        )
      case "users":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      case "file-text":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        )
      case "hands-helping":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 11h4a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"></path>
            <path d="M4 9h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H4"></path>
            <path d="M8 21h8a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H8"></path>
            <path d="M6 13v8"></path>
            <path d="M18 13v8"></path>
          </svg>
        )
      case "trophy":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
        )
      case "plus-circle":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        )
      default:
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        )
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-section-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add a new section</h2>
          <button className="close-button" onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <p className="modal-subtitle">Click on a section to add it to your resume</p>

        {showCustomInput ? (
          <div className="custom-section-input">
            <input
              type="text"
              placeholder="Enter section name"
              value={customSectionName}
              onChange={(e) => setCustomSectionName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="custom-section-input-field"
              autoFocus
            />
            <div className="custom-section-actions">
              <button className="cancel-button" onClick={() => setShowCustomInput(false)}>
                Cancel
              </button>
              <button className="add-button" onClick={handleCustomSectionSubmit}>
                Add Section
              </button>
            </div>
          </div>
        ) : (
          <div className="section-grid">
            {sectionTypes.map((section) => (
              <div key={section.id} className="section-item" onClick={() => handleSectionClick(section.id)}>
                <div className="section-icon">{getIcon(section.icon)}</div>
                <div className="section-name">{section.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddSectionModal
