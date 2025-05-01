"use client"

import { useEffect, useRef, useState } from "react"
import "../styles/EditableField.css"

const EditableField = ({
  value,
  onEdit,
  isEditing,
  editValue,
  editFormatting = {},
  setEditValue,
  setEditFormatting = () => {},
  onSave,
  onCancel,
  multiline = false,
  className = "",
  style = {},
}) => {
  const inputRef = useRef(null)
  const [showToolbar, setShowToolbar] = useState(false)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleKeyDown = (e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault()
          toggleBold()
          break
        case "i":
          e.preventDefault()
          toggleItalic()
          break
        case "u":
          e.preventDefault()
          toggleUnderline()
          break
        default:
          break
      }
    }

    if (e.key === "Enter" && !e.shiftKey && !multiline) {
      e.preventDefault()
      onSave()
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  const toggleBold = () => {
    setEditFormatting({ ...editFormatting, bold: !editFormatting.bold })
  }

  const toggleItalic = () => {
    setEditFormatting({ ...editFormatting, italic: !editFormatting.italic })
  }

  const toggleUnderline = () => {
    setEditFormatting({ ...editFormatting, underline: !editFormatting.underline })
  }

  const renderFormattedValue = () => {
    // Check if value contains HTML tags
    if (typeof value === "string" && value.includes("<")) {
      return <div dangerouslySetInnerHTML={{ __html: value }} />
    }

    return value
  }

  const getFormattingStyle = () => {
    const formattingStyle = { ...style }

    if (editFormatting.bold) {
      formattingStyle.fontWeight = "bold"
    }

    if (editFormatting.italic) {
      formattingStyle.fontStyle = "italic"
    }

    if (editFormatting.underline) {
      formattingStyle.textDecoration = "underline"
    }

    return formattingStyle
  }

  if (isEditing) {
    const EditComponent = multiline ? "textarea" : "input"
    const inputProps = {
      ref: inputRef,
      value: editValue,
      onChange: (e) => setEditValue(e.target.value),
      onKeyDown: handleKeyDown,
      onFocus: () => setShowToolbar(true),
      onBlur: (e) => {
        // Don't hide toolbar if clicking on toolbar buttons
        if (!e.relatedTarget || !e.relatedTarget.closest(".editable-toolbar")) {
          setShowToolbar(false)
        }
      },
      className: `editable-${multiline ? "textarea" : "input"} ${className}`,
      style: getFormattingStyle(),
    }

    if (multiline) {
      inputProps.rows = Math.max(3, (editValue.match(/\n/g) || []).length + 1)
    } else {
      inputProps.type = "text"
    }

    return (
      <div className="editable-container">
        {showToolbar && (
          <div className="editable-toolbar">
            <button
              type="button"
              className={`toolbar-btn ${editFormatting.bold ? "active" : ""}`}
              onClick={toggleBold}
              tabIndex={0}
            >
              B
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editFormatting.italic ? "active" : ""}`}
              onClick={toggleItalic}
              tabIndex={0}
            >
              I
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editFormatting.underline ? "active" : ""}`}
              onClick={toggleUnderline}
              tabIndex={0}
            >
              U
            </button>
          </div>
        )}
        <EditComponent {...inputProps} />
      </div>
    )
  }

  return (
    <div className={`editable-field ${className}`} onClick={onEdit} style={style}>
      {renderFormattedValue()}
    </div>
  )
}

export default EditableField
