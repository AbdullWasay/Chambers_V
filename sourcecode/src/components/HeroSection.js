"use client"

import "../styles/HeroSection.css"

const HeroSection = ({ onCreateResume }) => {
  return (
    <div className="hero-section">
      <div className="hero-content-wrapper">
        <div className="hero-text-content">
          <h1>Craft Your <span className="highlight">Perfect Resume</span> in Minutes</h1>
          <p className="hero-subtitle">
            Our AI-powered platform helps you create professional, ATS-optimized resumes that stand out and get you more interviews.
          </p>

          <div className="hero-options">
            <button className="hero-option-button" onClick={onCreateResume}>Resume</button>
            <button className="hero-option-button">Cover Letter</button>
            <button className="hero-option-button">Emails</button>
            <button className="hero-option-button">Jobs</button>
            <button className="hero-option-button">Package</button>
          </div>

          <div className="hero-features">
            <div className="hero-feature">
              <span className="feature-icon">✓</span>
              <span>ATS-optimized templates</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">✓</span>
              <span>Ready in minutes</span>
            </div>
          </div>
        </div>

        <div className="hero-image-content">
          <img
            src="/bg.png"
            alt="Professional Resume Template"
            className="hero-dashboard-image"
          />
        </div>
      </div>
    </div>
  )
}

export default HeroSection
