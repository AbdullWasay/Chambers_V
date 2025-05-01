"use client"

import { useRef, useState } from "react"
import "../../styles/modals/RearrangeModal.css"

const RearrangeModal = ({ onClose, sections, onRearrange }) => {
  const [sectionsList, setSectionsList] = useState([...sections])
  const [draggedItem, setDraggedItem] = useState(null)
  const dragItemNode = useRef(null)

  const handleMoveUp = (index) => {
    if (index === 0) return
    const newSections = [...sectionsList]
    const temp = newSections[index]
    newSections[index] = newSections[index - 1]
    newSections[index - 1] = temp
    setSectionsList(newSections)
  }

  const handleMoveDown = (index) => {
    if (index === sectionsList.length - 1) return
    const newSections = [...sectionsList]
    const temp = newSections[index]
    newSections[index] = newSections[index + 1]
    newSections[index + 1] = temp
    setSectionsList(newSections)
  }

  const handleDragStart = (e, index) => {
    dragItemNode.current = e.target
    dragItemNode.current.addEventListener("dragend", handleDragEnd)
    setDraggedItem(index)

    setTimeout(() => {
      e.target.classList.add("dragging")
    }, 0)
  }

  const handleDragEnd = () => {
    dragItemNode.current.removeEventListener("dragend", handleDragEnd)
    dragItemNode.current.classList.remove("dragging")
    setDraggedItem(null)
    dragItemNode.current = null
  }

  const handleDragEnter = (e, targetIndex) => {
    if (draggedItem === null) return

    const newSections = [...sectionsList]
    const draggedSection = newSections[draggedItem]

    // Remove the dragged item
    newSections.splice(draggedItem, 1)
    // Insert it at the new position
    newSections.splice(targetIndex, 0, draggedSection)

    setDraggedItem(targetIndex)
    setSectionsList(newSections)
  }

  const handleSave = () => {
    onRearrange(sectionsList)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rearrange-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rearrange Sections</h2>
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
        <p className="modal-subtitle">Drag and drop sections to rearrange them on your resume</p>

        <div className="sections-list">
          {sectionsList.map((section, index) => (
            <div
              key={section.id}
              className="section-item-rearrange"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="section-drag-handle">
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
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </div>
              <div className="section-name">{section.title}</div>
              <div className="section-actions">
                <button className="section-move-btn" onClick={() => handleMoveUp(index)} disabled={index === 0}>
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
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </button>
                <button
                  className="section-move-btn"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === sectionsList.length - 1}
                >
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
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default RearrangeModal
