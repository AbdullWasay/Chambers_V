"use client"

import { useEffect, useState } from "react"
import { getRewrittenResumeByKey, listRewrittenResumes } from "../services/awsService"
import "../styles/ResumeList.css"
import { convertAwsResumeToAppFormat } from "../utils/resumeConverter"

const ResumeList = ({ onSelectResume }) => {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true)
        const resumeFiles = await listRewrittenResumes()
        setResumes(resumeFiles)
        setError(null)
      } catch (err) {
        console.error("Error fetching resumes:", err)
        setError("Failed to load resumes. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchResumes()
  }, [])

  const handleResumeSelect = async (key) => {
    try {
      setLoading(true)
      const resumeData = await getRewrittenResumeByKey(key)
      const formattedData = convertAwsResumeToAppFormat(resumeData)
      onSelectResume(formattedData)
    } catch (err) {
      console.error("Error loading resume:", err)
      setError("Failed to load the selected resume.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && resumes.length === 0) {
    return (
      <div className="resume-list-container">
        <h2>Loading resumes...</h2>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error && resumes.length === 0) {
    return (
      <div className="resume-list-container">
        <h2>Error</h2>
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="resume-list-container">
      <h2>Available Resumes</h2>
      {resumes.length === 0 ? (
        <p>No resumes found. Upload a resume to get started.</p>
      ) : (
        <ul className="resume-list">
          {resumes.map((resume) => {
            // Extract filename from the key
            const filename = resume.Key.split("/").pop()
            return (
              <li key={resume.Key} className="resume-list-item">
                <button onClick={() => handleResumeSelect(resume.Key)}>
                  <span className="resume-filename">{filename}</span>
                  <span className="resume-date">{new Date(resume.LastModified).toLocaleString()}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default ResumeList
