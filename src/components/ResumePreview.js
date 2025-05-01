"use client"

import { useState } from "react"
import "../styles/ResumePreview.css"
import CreativeTemplate from "./template/CreativeTemplate"
import ElegantTemplate from "./template/ElegantTemplate"
import MinimalistTemplate from "./template/MinimalistTemplate"
import ModernTemplate from "./template/ModernTemplate"
import ProfessionalTemplate from "./template/ProfessionalTemplate"

const ResumePreview = ({
  data,
  template,
  designSettings,
  onUpdateData,
  sectionOrder,
  onDeleteSection,
  onMoveSection,
}) => {
  const [editMode, setEditMode] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [editFormatting, setEditFormatting] = useState({})
  const [hoveredSection, setHoveredSection] = useState(null)

  const handleEdit = (path, value, formatting = {}) => {
    setEditMode(path)
    setEditValue(value)
    setEditFormatting(formatting)
  }

  const handleSave = () => {
    if (!editMode) return

    const pathParts = editMode.split(".")
    const newData = { ...data }

    let current = newData
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i]

      // Handle array indices
      if (!isNaN(part)) {
        const index = Number.parseInt(part)
        current = current[index]
      } else {
        current = current[part]
      }
    }

    const lastPart = pathParts[pathParts.length - 1]
    if (!isNaN(lastPart)) {
      current[Number.parseInt(lastPart)] = editValue
    } else {
      current[lastPart] = editValue
    }

    onUpdateData(newData)
    setEditMode(null)
  }

  const handleCancel = () => {
    setEditMode(null)
  }

  const handleSectionHover = (sectionId, isHovering) => {
    setHoveredSection(isHovering ? sectionId : null)
  }

  const renderTemplate = () => {
    const props = {
      data,
      designSettings,
      onEdit: handleEdit,
      editMode,
      editValue,
      editFormatting,
      setEditValue,
      setEditFormatting,
      onSave: handleSave,
      onCancel: handleCancel,
      sectionOrder,
      onDeleteSection,
      onMoveSection,
      hoveredSection,
      onSectionHover: handleSectionHover,
    }

    switch (template) {
      case "modern":
        return <ModernTemplate {...props} />
      case "elegant":
        return <ElegantTemplate {...props} />
      case "professional":
        return <ProfessionalTemplate {...props} />
      case "minimalist":
        return <MinimalistTemplate {...props} />
      case "creative":
        return <CreativeTemplate {...props} />
      default:
        return <ModernTemplate {...props} />
    }
  }

  return (
    <div className="resume-preview-container">
      <div
        className="resume-preview"
        style={{
          fontFamily: designSettings.font,
          fontSize: getFontSize(designSettings.fontSize),
          lineHeight: designSettings.lineHeight * 1.5,
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  )
}

const getFontSize = (size) => {
  switch (size) {
    case "small":
      return "0.9rem"
    case "medium":
      return "1rem"
    case "large":
      return "1.1rem"
    default:
      return "1rem"
  }
}

export default ResumePreview
