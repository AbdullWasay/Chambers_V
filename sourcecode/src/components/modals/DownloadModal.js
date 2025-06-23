"use client"

import { useState } from "react"
import { downloadResume } from "../../services/resumeService"
import "../../styles/modals/DownloadModal.css"

const DownloadModal = ({ onClose, resumeData, template, designSettings }) => {
  // Set default format to PDF since DOCX is no longer available
  const [downloadFormat, setDownloadFormat] = useState("pdf")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(null)
  const [fileName, setFileName] = useState("resume")

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadError(null)

    try {
      const finalFileName = fileName.trim() || "resume"
      console.log("Starting download with format:", downloadFormat, "and filename:", finalFileName)

      // Use the downloadResume function for all formats
      try {
        console.log(`Starting download with format: ${downloadFormat}`)
        await downloadResume(resumeData, template, designSettings, downloadFormat, finalFileName)
        console.log("Download initiated successfully")

        // Close the modal after a short delay
        setTimeout(() => {
          setIsDownloading(false)
          onClose()
        }, 500)
      } catch (downloadError) {
        console.error("Error in download process:", downloadError)
        throw downloadError
      }
    } catch (error) {
      console.error("Download error:", error)
      let errorMessage = "There was an error downloading your resume. Please try again."

      // Provide more specific error messages if available
      if (error.message) {
        console.error("Error message:", error.message)
        if (error.message.includes("Network Error")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. The server might be busy, please try again later."
        } else if (error.message.includes("Server error")) {
          errorMessage = "Server error. Please try again later or contact support."
        } else if (error.message.includes("Invalid response")) {
          errorMessage = "Invalid response from server. Please try again."
        }
      }

      setDownloadError(errorMessage)
      setIsDownloading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="download-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Download Resume</h2>
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

        <div className="download-options">
          <div className="filename-input">
            <label htmlFor="filename">File Name</label>
            <input
              type="text"
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="resume"
              className="filename-field"
            />
          </div>

          <h3>Select Format</h3>
          <div className="format-options">
            <div
              className={`format-option ${downloadFormat === "pdf" ? "selected" : ""}`}
              onClick={() => setDownloadFormat("pdf")}
            >
              <div className="format-icon pdf">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <span>PDF</span>
              <p>Best for printing and sharing</p>
              <p className="format-feature">Supports multi-page resumes</p>
            </div>

            <div
              className={`format-option ${downloadFormat === "txt" ? "selected" : ""}`}
              onClick={() => setDownloadFormat("txt")}
            >
              <div className="format-icon txt">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <span>TXT</span>
              <p>Plain text format</p>
            </div>
          </div>
        </div>

        {downloadError && <div className="download-error">{downloadError}</div>}

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose} disabled={isDownloading}>
            Cancel
          </button>
          <button className="download-button" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? "Downloading..." : `Download ${downloadFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DownloadModal
