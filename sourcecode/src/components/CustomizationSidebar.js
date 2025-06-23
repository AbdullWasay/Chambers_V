"use client"

import "../styles/CustomizationSidebar.css"

const CustomizationDial = ({ 
  label, 
  value, 
  onChange, 
  min = 1, 
  max = 5, 
  step = 1, 
  leftLabel = "Low", 
  rightLabel = "High",
  description
}) => {
  return (
    <div className="customization-dial">
      <div className="dial-header">
        <label className="dial-label">{label}</label>
        <span className="dial-value">{value}</span>
      </div>
      {description && <p className="dial-description">{description}</p>}
      <div className="slider-container">
        <span className="slider-label">{leftLabel}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider"
        />
        <span className="slider-label">{rightLabel}</span>
      </div>
    </div>
  )
}

const CustomizationSidebar = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const handleDialChange = (key, value) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    })
  }

  return (
    <div className={`customization-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Resume Optimization</h2>
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

      <div className="sidebar-content">
        <CustomizationDial
          label="ATS Optimization"
          value={settings.atsOptimization || 3}
          onChange={(value) => handleDialChange("atsOptimization", value)}
          description="Adjusts ATS-friendly keywords and phrases"
        />

        <CustomizationDial
          label="Tone"
          value={settings.tone || 3}
          onChange={(value) => handleDialChange("tone", value)}
          leftLabel="Casual"
          rightLabel="Formal"
          description="Shifts tone from casual (1) to formal (5)"
        />

        <CustomizationDial
          label="Length"
          value={settings.length || 3}
          onChange={(value) => handleDialChange("length", value)}
          leftLabel="Concise"
          rightLabel="Detailed"
          description="Controls resume length, from concise (1) to detailed (5)"
        />

        <CustomizationDial
          label="Keyword Density"
          value={settings.keywordDensity || 3}
          onChange={(value) => handleDialChange("keywordDensity", value)}
          description="Adjusts target keyword frequency"
        />

        <CustomizationDial
          label="Industry Jargon"
          value={settings.industryJargon || 3}
          onChange={(value) => handleDialChange("industryJargon", value)}
          description="Adds or reduces industry-specific terminology"
        />

        <CustomizationDial
          label="Action Verb Intensity"
          value={settings.actionVerbIntensity || 3}
          onChange={(value) => handleDialChange("actionVerbIntensity", value)}
          description="Modifies use of strong action verbs"
        />

        <CustomizationDial
          label="Quantifiable Results"
          value={settings.quantifiableResults || 3}
          onChange={(value) => handleDialChange("quantifiableResults", value)}
          description="Adds/removes metrics and stats"
        />

        <div className="sidebar-actions">
          <button className="apply-button" onClick={onClose}>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomizationSidebar
