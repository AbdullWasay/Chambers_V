import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UploadResume from './UploadResume';
import '../styles/ResumeUploadModal.css';

const ResumeUploadModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate();
  const auth = useAuth();

  const handleUploadSuccess = (data) => {
    setIsProcessing(true);
    
    // Process data with a slight delay to show the loading animation
    setTimeout(() => {
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
        Object.keys(data).forEach(key => {
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

        console.log("Final formatted data:", formattedData);
        
        // Store the resume data in sessionStorage to pass to editor
        sessionStorage.setItem('currentResumeData', JSON.stringify(formattedData));
        
        // Close modal and navigate to editor
        onClose();
        navigate('/editor');
      } else {
        console.error("Received undefined or null data in handleUploadSuccess");
      }
      
      setIsProcessing(false);
    }, 2000);
  };

  const handleUploadError = () => {
    console.error("Upload failed");
    setIsProcessing(false);
  };

  const renderStep1 = () => (
    <div className="upload-step">
      <div className="step-header">
        <h2>Upload Your Resume</h2>
        <p>Upload your current resume to get started with AI optimization</p>
      </div>
      
      <UploadResume 
        onSuccess={(data) => {
          // Store the data and move to next step
          sessionStorage.setItem('uploadedResumeData', JSON.stringify(data));
          setCurrentStep(2);
        }}
        onError={handleUploadError}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="upload-step">
      <div className="step-header">
        <h2>Job Description (Optional)</h2>
        <p>Add a job description to tailor your resume for a specific position</p>
      </div>
      
      <div className="job-description-section">
        <textarea
          placeholder="Paste the job description here to optimize your resume for this specific role..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="job-description-textarea"
          rows={8}
        />
      </div>
      
      <div className="step-actions">
        <button 
          className="btn-secondary"
          onClick={() => setCurrentStep(1)}
        >
          Back
        </button>
        <button 
          className="btn-primary"
          onClick={() => {
            // Get the uploaded data and process it
            const uploadedData = JSON.parse(sessionStorage.getItem('uploadedResumeData') || '{}');
            
            // Add job description to the data if provided
            if (jobDescription.trim()) {
              uploadedData.jobDescription = jobDescription;
            }
            
            handleUploadSuccess(uploadedData);
          }}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Continue to Editor'}
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="step-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadModal;
