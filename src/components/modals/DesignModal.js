"use client"

import { useState } from "react"
import "../../styles/modals/DesignModal.css"

const DesignModal = ({ onClose, settings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState({ ...settings })

  const handleChange = (key, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }))

    onUpdateSettings({
      ...localSettings,
      [key]: value,
    })
  }

  const handleColorChange = (colorKey, value) => {
    const newColors = {
      ...localSettings.colors,
      [colorKey]: value,
    }

    setLocalSettings((prev) => ({
      ...prev,
      colors: newColors,
    }))

    onUpdateSettings({
      ...localSettings,
      colors: newColors,
    })
  }

  const fontOptions = [
    { value: "Rubik", label: "Rubik" },
    { value: "Arial", label: "Arial" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Lato", label: "Lato" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Playfair Display", label: "Playfair Display" },
    { value: "Merriweather", label: "Merriweather" },
    { value: "Source Sans Pro", label: "Source Sans Pro" },
    { value: "Poppins", label: "Poppins" },
  ]

  const colorOptions = [
    "#4a6cf7",
    "#2563eb",
    "#0ea5e9",
    "#06b6d4",
    "#14b8a6",
    "#10b981",
    "#22c55e",
    "#84cc16",
    "#eab308",
    "#f59e0b",
    "#f97316",
    "#ef4444",
    "#dc2626",
    "#ec4899",
    "#d946ef",
    "#a855f7",
    "#8b5cf6",
    "#6366f1",
    "#000000",
    "#4b5563",
  ]

  const backgroundOptions = [
    { value: "solid", label: "Solid" },
    { value: "gradient", label: "Gradient" },
    { value: "pattern", label: "Pattern" },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="design-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Design & Font</h2>
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

        <div className="design-settings">
          <div className="settings-section">
            <h3>Page Margins</h3>
            <div className="slider-container">
              <span className="slider-label">Narrow</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={localSettings.pageMargins}
                onChange={(e) => handleChange("pageMargins", Number.parseFloat(e.target.value))}
                className="slider"
              />
              <span className="slider-label">Wide</span>
            </div>
          </div>

          <div className="settings-section">
            <h3>Section Spacing</h3>
            <div className="slider-container">
              <span className="slider-label">Compact</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={localSettings.sectionSpacing}
                onChange={(e) => handleChange("sectionSpacing", Number.parseFloat(e.target.value))}
                className="slider"
              />
              <span className="slider-label">More Space</span>
            </div>
          </div>

          <div className="settings-section">
            <h3>Colors</h3>
            <div className="color-options">
              {colorOptions.map((color) => (
                <div
                  key={color}
                  className={`color-option ${localSettings.colors.primary === color ? "selected" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange("primary", color)}
                >
                  {localSettings.colors.primary === color && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h3>Font Style</h3>
            <select
              value={localSettings.font}
              onChange={(e) => handleChange("font", e.target.value)}
              className="select-input"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-section">
            <h3>Font Size</h3>
            <div className="slider-container">
              <span className="slider-label">Small</span>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.05"
                value={localSettings.fontSize || 1}
                onChange={(e) => handleChange("fontSize", Number.parseFloat(e.target.value))}
                className="slider"
              />
              <span className="slider-label">Large</span>
            </div>
            <div className="font-size-preview" style={{ fontSize: `${localSettings.fontSize || 1}rem` }}>
              Sample Text
            </div>
          </div>

          {/* 
<div className="settings-section">
  <h3>Line Height</h3>
  <div className="slider-container">
    <span className="slider-label">Condensed</span>
    <input
      type="range"
      min="0.8"
      max="1.5"
      step="0.1"
      value={localSettings.lineHeight}
      onChange={(e) => handleChange("lineHeight", Number.parseFloat(e.target.value))}
      className="slider"
    />
    <span className="slider-label">Spacious</span>
  </div>
</div>
*/}

          <div className="settings-section">
            <h3>Backgrounds</h3>
            <div className="background-options">
              {backgroundOptions.map((bg) => (
                <div
                  key={bg.value}
                  className={`background-option ${localSettings.backgroundStyle === bg.value ? "selected" : ""}`}
                  onClick={() => handleChange("backgroundStyle", bg.value)}
                >
                  <div className={`bg-preview ${bg.value}`}></div>
                  <span>{bg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignModal
