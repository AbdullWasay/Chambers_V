"use client"

import "../../styles/modals/TemplateModal.css"

const TemplateModal = ({ onClose, onSelectTemplate, currentTemplate }) => {
  const templates = [
    {
      id: "modern",
      name: "Modern",
      description: "Clean and contemporary design with a sidebar",
    },
    {
      id: "elegant",
      name: "Elegant",
      description: "Sophisticated design with a classic layout",
    },
    {
      id: "professional",
      name: "Professional",
      description: "Traditional format ideal for corporate roles",
    },
    {
      id: "creative",
      name: "Creative",
      description: "Bold design for creative industries",
    },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose Template</h2>
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
        <div className="templates-grid">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`template-item ${currentTemplate === template.id ? "selected" : ""}`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <div className="template-preview">
                <div className={`template-thumbnail ${template.id}`}>
                  {/* Template thumbnail preview */}
                  <div className="thumbnail-header"></div>
                  <div className="thumbnail-content">
                    <div className="thumbnail-sidebar"></div>
                    <div className="thumbnail-main">
                      <div className="thumbnail-section"></div>
                      <div className="thumbnail-section"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="template-info">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
              </div>
              {currentTemplate === template.id && (
                <div className="template-selected-badge">
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
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TemplateModal
