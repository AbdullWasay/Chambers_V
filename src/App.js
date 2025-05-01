"use client"

import { useState } from "react"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Editor from "./components/Editor"
import Header from "./components/Header"
import UploadResume from "./components/UploadResume"
import "./styles/App.css"

function App() {
  const [resumeData, setResumeData] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null)

  const handleUploadSuccess = (data) => {
    setUploadStatus("success")
    // In a real app, this would be parsed from the uploaded file
    // For demo purposes, we'll use sample data
    setResumeData({
      name: "Your Name",
      title: "Your Professional Title",
      contact: {
        phone: "Phone Number",
        email: "email@example.com",
        linkedin: "linkedin.com/in/yourprofile",
      },
      summary:
        "A brief professional summary highlighting your experience, key skills, and career goals. This section should be 3-5 sentences that give employers a quick overview of your professional background and what you bring to the table.",
      experience: [
        {
          title: "Job Title",
          company: "Company Name",
          location: "City, State",
          period: "Start Date - End Date",
          bullets: [
            "Accomplishment or responsibility utilizing your skills",
            "Quantifiable achievement with measurable results (numbers, percentages)",
            "Notable project or initiative you led or contributed to",
          ],
        },
      ],
      education: [
        {
          degree: "Degree Name",
          school: "University or School Name",
          location: "City, State",
          year: "Graduation Year",
        },
      ],
      skills: [
        "Relevant Skill 1",
        "Relevant Skill 2",
        "Relevant Skill 3",
        "Relevant Skill 4",
        "Relevant Skill 5",
        "Relevant Skill 6",
      ],
    })
  }

  const handleUploadError = () => {
    setUploadStatus("error")
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <div className="upload-container">
                <h1>Chambers_V AI Resume Tailoring</h1>
                <p className="subtitle">Upload your resume and let our AI optimize it for your target job</p>
                <UploadResume onSuccess={handleUploadSuccess} onError={handleUploadError} />
                {uploadStatus === "success" && resumeData && <Navigate to="/editor" replace />}
                {uploadStatus === "error" && (
                  <div className="error-message">Error uploading resume. Please try again.</div>
                )}
              </div>
            }
          />
          <Route
            path="/editor"
            element={resumeData ? <Editor initialData={resumeData} /> : <Navigate to="/" replace />}
          />
        </Routes>
        <footer className="footer">
          <p>© {new Date().getFullYear()} Chambers_V AI. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App


