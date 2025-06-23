"use client"

import { useState } from "react"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Editor from "./components/Editor"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import LoadingAnimation from "./components/LoadingAnimation"
import UploadResume from "./components/UploadResume"
import LatestResumePage from "./pages/LatestResumePage"
import "./styles/App.css"

function App() {
  const [resumeData, setResumeData] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingType, setLoadingType] = useState("spinner")

  const handleUploadSuccess = (data) => {
    // Show loading animation
    setIsLoading(true)
    setLoadingType("logo") // Use spinning logo animation

    // Process data with a slight delay to show the loading animation
    setTimeout(() => {
      setUploadStatus("success")

      // Check if data exists and has the expected structure
      if (data) {
        console.log("Received data:", data);

        // Create a safe formatted data object with defaults for basic info
        const formattedData = {
          name: data.basics?.name || data.name || "Your Name",
          title: data.basics?.title || data.title || "Your Professional Title",
          contact: {
            phone: data.basics?.phone || data.phone || "Phone Number",
            email: data.basics?.email || data.email || "email@example.com",
            linkedin: data.basics?.linkedin || data.linkedin || "linkedin.com/in/yourprofile",
          },
          summary: data.basics?.summary || data.summary || "Professional summary goes here...",
        };

        // Dynamically include all properties from the data object
        // This ensures any section in the JSON will be included, regardless of its name
        Object.keys(data).forEach(key => {
          // Skip 'basics' since we've already handled those fields
          if (key !== 'basics' && key !== 'name' && key !== 'title' && key !== 'summary') {
            formattedData[key] = data[key];
          }
        });

        // Ensure common sections exist (even if empty) to prevent errors in templates
        const commonSections = [
          'experience', 'education', 'skills', 'projects', 'certifications',
          'achievements', 'languages', 'volunteer', 'publications', 'interests'
        ];

        commonSections.forEach(section => {
          if (!formattedData[section]) {
            formattedData[section] = [];
          }
        });

        // Log the final formatted data for debugging
        console.log("Final formatted data:", formattedData);
        console.log("Sections included:", Object.keys(formattedData));

        setResumeData(formattedData)
      } else {
        console.error("Received undefined or null data in handleUploadSuccess");
      }

      // Hide loading animation
      setIsLoading(false)
    }, 2000); // 2 second delay to show the loading animation
  }

  const handleUploadError = () => {
    setUploadStatus("error")
  }

  return (
    <Router>
      <div className="app">
        <Header />
        {isLoading && <LoadingAnimation type={loadingType} showProgress={true} />}
        <Routes>
          <Route
            path="/"
            element={
              <div className="home-page">
                <HeroSection
                  onCreateResume={() => document.querySelector('.upload-container').scrollIntoView({ behavior: 'smooth' })}
                />

                <div className="features-section">
                  <h2>Why Choose Chambers_V</h2>
                  <div className="features-grid">
                    <div className="feature-card">
                      <div className="feature-icon">📈</div>
                      <h3>ATS Optimization</h3>
                      <p>Our AI analyzes your resume against job descriptions to maximize your chances of passing ATS systems</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">🎨</div>
                      <h3>Professional Templates</h3>
                      <p>Choose from our collection of professionally designed templates that stand out</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">⚡</div>
                      <h3>Instant Results</h3>
                      <p>Get your optimized resume in seconds, not hours</p>
                    </div>
                  </div>
                </div>

                <div className="upload-container" id="upload-section">
                  <h2>Upload Your Resume</h2>
                  <p className="subtitle">Let our AI optimize it for your target job</p>
                  <UploadResume onSuccess={handleUploadSuccess} onError={handleUploadError} />
                  {uploadStatus === "success" && resumeData && <Navigate to="/editor" replace />}
                  {uploadStatus === "error" && (
                    <div className="error-message">Error uploading resume. Please try again.</div>
                  )}
                </div>


              </div>
            }
          />
          <Route
            path="/editor"
            element={
              resumeData ? (
                <Editor initialData={resumeData} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/latest-resume"
            element={<LatestResumePage />}
          />
        </Routes>
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-logo">
              <h3>Chambers_V</h3>
              <p>AI-Powered Resume Optimization</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <ul>
                  <li><a href="#">Features</a></li>
                  <li><a href="#">Templates</a></li>
                  <li><a href="#">Pricing</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <ul>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Guides</a></li>
                  <li><a href="#">Support</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <ul>
                  <li><a href="#">About Us</a></li>
                  <li><a href="#">Careers</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Chambers_V AI. All rights reserved.</p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter"><span>Twitter</span></a>
              <a href="#" aria-label="LinkedIn"><span>LinkedIn</span></a>
              <a href="#" aria-label="Facebook"><span>Facebook</span></a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App


