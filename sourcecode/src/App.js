"use client"

import { useState } from "react"
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom"
import Dashboard from "./components/Dashboard"
import Editor from "./components/Editor"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import LoadingAnimation from "./components/LoadingAnimation"
import Onboarding from "./components/Onboarding"
import { useAuth } from "./contexts/AuthContext"
import LatestResumePage from "./pages/LatestResumePage"
import "./styles/App.css"

function AppContent() {
  const location = useLocation();
  const auth = useAuth();
  const [resumeData, setResumeData] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingType, setLoadingType] = useState("spinner")

  const showHeader = location.pathname !== '/dashboard' && location.pathname !== '/onboarding';

  // Check if user has completed onboarding
  const hasCompletedOnboarding = () => {
    if (!auth.user?.profile?.sub && !auth.user?.profile?.email) return false;
    const userId = auth.user.profile.sub || auth.user.profile.email;
    return localStorage.getItem(`onboarding_completed_${userId}`) === 'true';
  };

  // Mark onboarding as completed
  const markOnboardingCompleted = () => {
    if (auth.user?.profile?.sub || auth.user?.profile?.email) {
      const userId = auth.user.profile.sub || auth.user.profile.email;
      localStorage.setItem(`onboarding_completed_${userId}`, 'true');
    }
  };

  // Handle authentication loading and errors
  if (auth.isLoading) {
    return <LoadingAnimation type="spinner" showProgress={true} />;
  }

  if (auth.error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>Authentication Error</h2>
        <p>{auth.error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

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
    <div className="app">
      {showHeader && <Header />}
      {isLoading && <LoadingAnimation type={loadingType} showProgress={true} />}
        <Routes>
          <Route
            path="/"
            element={
              auth.isAuthenticated ? (
                hasCompletedOnboarding() ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/onboarding" replace />
                )
              ) : (
                <div className="home-page">
                  <HeroSection />
                </div>
              )
            }
          />
          <Route
            path="/onboarding"
            element={
              auth.isAuthenticated ? (
                <Onboarding />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/editor"
            element={
              auth.isAuthenticated ? (
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
          <Route
            path="/dashboard"
            element={
              auth.isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App


