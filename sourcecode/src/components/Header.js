"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "../styles/Header.css"
import TemplateModal from "./modals/TemplateModal"

const Header = () => {
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("modern")

  // Sample resume data for creating a new resume
  const createNewResume = (template) => {
    const sampleData = {
      name: "Your Name",
      title: "Professional Title",
      contact: {
        phone: "123-456-7890",
        email: "your.email@example.com",
        linkedin: "linkedin.com/in/yourprofile",
      },
      summary:
        "Professional summary highlighting your key qualifications, experience, and career goals. This section should be concise and tailored to the specific position you're applying for.",
      experience: [
        {
          title: "Job Title",
          company: "Company Name",
          location: "City, State",
          period: "Month Year - Present",
          bullets: [
            "Key accomplishment or responsibility",
            "Another significant achievement with quantifiable results",
            "Additional responsibility or project you managed",
          ],
        },
      ],
      education: [
        {
          degree: "Degree Name",
          school: "University Name",
          location: "City, State",
          year: "Year",
        },
      ],
      skills: ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"],
    }

    // Store the sample data and selected template in localStorage
    localStorage.setItem("newResumeData", JSON.stringify(sampleData))
    localStorage.setItem("selectedTemplate", template)

    // Navigate to the editor page
    window.location.href = "/editor"
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    createNewResume(template)
    setShowTemplateModal(false)
  }

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img
            src="/logo.jpg"
            alt="Chambers_V Logo"
            className="logo-image"
          />
          <span style={{ color: "var(--color-text-primary)", fontWeight: "600" }}>Chambers_V</span>
        </Link>
      </div>
      <div className="user-actions">
        <button className="new-resume-btn" onClick={() => setShowTemplateModal(true)}>
          <span>New Resume</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {showTemplateModal && (
        <TemplateModal
          onClose={() => setShowTemplateModal(false)}
          onSelectTemplate={handleTemplateSelect}
          currentTemplate={selectedTemplate}
        />
      )}
    </header>
  )
}

export default Header
