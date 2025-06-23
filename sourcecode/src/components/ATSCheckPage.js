"use client"

import "../styles/ATSCheckPage.css"
import ATSCompatibilityCheck from "./ATSCompatibilityCheck"

const ATSCheckPage = ({ resumeData, customizationSettings, onClose }) => {

  return (
    <div className="ats-check-page">
      <div className="ats-check-header">
        <h2>ATS Compatibility Check</h2>
        <button className="back-to-resume-button" onClick={onClose}>
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
            <path d="M19 12H5"></path>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Resume
        </button>
      </div>

      <div className="ats-check-content">
        <div className="ats-check-intro">
          <p>
            Check how well your resume will perform with Applicant Tracking Systems (ATS).
            This analysis evaluates your resume's structure, content, and formatting.
          </p>
        </div>

        <div className="ats-results-section">
          <ATSCompatibilityCheck
            resumeData={resumeData}
            customizationSettings={customizationSettings}
          />
        </div>
      </div>
    </div>
  )
}

export default ATSCheckPage
