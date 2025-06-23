"use client"

import { useEffect, useState } from "react"
import { checkATSCompatibility } from "../services/atsService"
import "../styles/ATSCompatibilityCheck.css"

const ATSCompatibilityCheck = ({ resumeData }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [atsResults, setAtsResults] = useState(null)
  const [activeSection, setActiveSection] = useState(null)

  const handleCheckCompatibility = async () => {
    if (!resumeData) {
      setError("No resume data available for ATS check")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Pass the current resume data to ensure fresh calculation
      const results = await checkATSCompatibility(resumeData)
      setAtsResults(results)
      // Set the first section as active
      if (results.sections && Object.keys(results.sections).length > 0) {
        setActiveSection(Object.keys(results.sections)[0])
      }
    } catch (err) {
      console.error("Error checking ATS compatibility:", err)
      setError("Failed to check ATS compatibility. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Run initial check when component mounts or when resumeData changes
  useEffect(() => {
    if (resumeData) {
      handleCheckCompatibility()
    }
  }, [resumeData])

  // Get score color based on value
  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return "#4caf50" // Green
    if (percentage >= 60) return "#ff9800" // Orange
    return "#f44336" // Red
  }

  // Format section name for display
  const formatSectionName = (name) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="ats-compatibility-container">
      <div className="ats-header">
        {!atsResults && (
          <button
            className="check-ats-button"
            onClick={handleCheckCompatibility}
            disabled={loading}
          >
            {loading ? "Checking..." : "Check ATS Compatibility"}
          </button>
        )}
      </div>

      {error && <div className="ats-error">{error}</div>}

      {loading && (
        <div className="ats-loading">
          <div className="ats-loading-spinner"></div>
          <p>Analyzing your resume...</p>
        </div>
      )}

      {atsResults && (
        <div className="ats-results">
          <div className="ats-score-overview">
            <div
              className="ats-score-circle"
              style={{
                background: `conic-gradient(
                  ${getScoreColor(atsResults.overall_score, atsResults.max_score)}
                  ${(atsResults.overall_score / atsResults.max_score) * 360}deg,
                  #e0e0e0 0deg
                )`
              }}
            >
              <div className="ats-score-inner">
                <span className="ats-score-value">{atsResults.overall_score}</span>
                <span className="ats-score-max">/{atsResults.max_score}</span>
              </div>
            </div>
            <div className="ats-assessment">
              <h3>{atsResults.assessment}</h3>
              <p>{atsResults.assessment_details}</p>
            </div>
          </div>

          <div className="ats-sections">
            <h3>Section Scores</h3>
            <div className="ats-section-bars">
              {Object.entries(atsResults.sections).map(([section, data]) => {
                // Filter out detailed scoring feedback
                const simpleFeedback = data.feedback.filter(item =>
                  !item.startsWith("DETAILED SCORING:")
                );

                return (
                  <div
                    key={section}
                    className={`ats-section-item ${activeSection === section ? 'active' : ''}`}
                    onClick={() => setActiveSection(section)}
                  >
                    <div className="ats-section-header">
                      <span className="ats-section-name">{formatSectionName(section)}</span>
                      <span
                        className="ats-section-score"
                        style={{ color: getScoreColor(data.score, data.max_score) }}
                      >
                        {data.score}/{data.max_score}
                      </span>
                    </div>
                    <div className="ats-progress-container">
                      <div
                        className="ats-progress-bar"
                        style={{
                          width: `${(data.score / data.max_score) * 100}%`,
                          backgroundColor: getScoreColor(data.score, data.max_score)
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {activeSection && atsResults.sections[activeSection] && (
            <div className="ats-section-details">
              <h3>Recommendations for {formatSectionName(activeSection)}</h3>
              <ul className="ats-recommendations">
                {atsResults.sections[activeSection].feedback
                  .filter(item => !item.startsWith("DETAILED SCORING:"))
                  .slice(0, 3) // Limit to 3 recommendations
                  .map((item, index) => (
                    <li key={index}>{item}</li>
                  ))
                }
              </ul>
            </div>
          )}

          <div className="ats-actions">
            <button
              className="ats-recheck-button"
              onClick={handleCheckCompatibility}
              disabled={loading}
            >
              {loading ? "Checking..." : "Re-Check Compatibility"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ATSCompatibilityCheck
