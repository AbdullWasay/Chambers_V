"use client"

import "../styles/HeroSection.css"

const HeroSection = () => {
  return (
    <div className="hero-section">
      {/* Video Background */}
      <video
        className="hero-video-background"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/homepage.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Video Overlay */}
      <div className="hero-video-overlay"></div>

      <div className="hero-content-wrapper">
        <div className="hero-text-content">
          <h1>Resume Perfected <span className="highlight">by AI</span></h1>
          <p className="hero-subtitle">
            Get past ATS and land more interviews in minutes
          </p>

          <div className="hero-cta-section">
            <button className="hero-primary-button">
              Enter →
            </button>
          </div>


        </div>


      </div>
    </div>
  )
}

export default HeroSection
