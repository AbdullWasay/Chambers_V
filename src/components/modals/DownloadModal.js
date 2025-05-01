"use client"

import { useState } from "react"
import { downloadResume } from "../../services/resumeService"
import "../../styles/modals/DownloadModal.css"

const DownloadModal = ({ onClose, resumeData, template, designSettings }) => {
  const [downloadFormat, setDownloadFormat] = useState("pdf")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(null)
  const [fileName, setFileName] = useState("resume")

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadError(null)

    try {
      const finalFileName = fileName.trim() || "resume"
      const downloadUrl = await downloadResume(resumeData, template, designSettings, downloadFormat, finalFileName)

      // Create a temporary link element to trigger the download
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `${finalFileName}.${downloadFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsDownloading(false)
      onClose()
    } catch (error) {
      console.error("Download error:", error)
      setDownloadError("There was an error downloading your resume. Please try again.")
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
            </div>

            <div
              className={`format-option ${downloadFormat === "docx" ? "selected" : ""}`}
              onClick={() => setDownloadFormat("docx")}
            >
              <div className="format-icon docx">
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
              <span>DOCX</span>
              <p>Editable in Microsoft Word</p>
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
          <button className="cancel-button" onClick={onClose}>
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
