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
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4a6cf7"
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
          <span>Chambers_V</span>
        </Link>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/templates">Templates</Link>
          </li>
          <li>
            <Link to="/pricing">Pricing</Link>
          </li>
        </ul>
      </nav>
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
        <div className="search-box">
          <input type="text" placeholder="Search" />
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
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
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
