import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Onboarding.css';
import UploadResume from './UploadResume';

const Onboarding = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const markOnboardingCompleted = () => {
    if (auth.user?.profile?.sub || auth.user?.profile?.email) {
      const userId = auth.user.profile.sub || auth.user.profile.email;
      localStorage.setItem(`onboarding_completed_${userId}`, 'true');
    }
  };

  const handleResumeChoice = (choice) => {
    setCurrentStep(2);
  };

  const handleUploadSuccess = (data) => {
    setIsProcessing(true);

    // Process data with a slight delay to show the loading animation
    setTimeout(() => {
      if (data) {
        // Store resume data in sessionStorage for the editor
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

        // Include all other sections from the data
        Object.keys(data).forEach(key => {
          if (key !== 'basics' && key !== 'name' && key !== 'title' && key !== 'summary') {
            formattedData[key] = data[key];
          }
        });

        sessionStorage.setItem('currentResumeData', JSON.stringify(formattedData));
        setCurrentStep(3);
      }
      setIsProcessing(false);
    }, 2000);
  };

  const handleTemplateSelection = (template) => {
    setSelectedTemplate(template);
    setCurrentStep(4);
  };

  const handleLinkedinStep = () => {
    setCurrentStep(5);
  };

  const handleSkipLinkedin = () => {
    completeOnboarding();
  };

  const handleImportLinkedin = () => {
    // Here you would implement LinkedIn import logic
    completeOnboarding();
  };

  const completeOnboarding = () => {
    markOnboardingCompleted();
    navigate('/editor');
  };

  const templates = [
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional clean layout',
      preview: (
        <div className="template-preview">
          <div className="template-line black"></div>
          <div className="template-line"></div>
          <div className="template-line"></div>
          <div className="template-line short"></div>
        </div>
      )
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design',
      preview: (
        <div className="template-preview">
          <div className="template-line blue"></div>
          <div className="template-line"></div>
          <div className="template-line"></div>
          <div className="template-line short"></div>
        </div>
      )
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold and distinctive',
      preview: (
        <div className="template-preview">
          <div className="template-line orange"></div>
          <div className="template-line"></div>
          <div className="template-line"></div>
          <div className="template-line short"></div>
        </div>
      )
    },
    {
      id: 'executive',
      name: 'Executive',
      description: 'Professional executive style',
      preview: (
        <div className="template-preview">
          <div className="template-line black"></div>
          <div className="template-line"></div>
          <div className="template-line"></div>
          <div className="template-line"></div>
          <div className="template-line short"></div>
        </div>
      )
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and clean',
      preview: (
        <div className="template-preview">
          <div className="template-line black"></div>
          <div className="template-line"></div>
          <div className="template-line"></div>
          <div className="template-line short"></div>
        </div>
      )
    }
  ];

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4, 5].map((step) => (
        <div
          key={step}
          className={`step-number ${
            step < currentStep ? 'completed' : step === currentStep ? 'active' : ''
          }`}
        >
          {step < currentStep ? '✓' : step}
        </div>
      ))}
      <button className="sign-in-btn">Sign In</button>
    </div>
  );

  const renderWelcome = () => (
    <div className="onboarding-step">
      <div className="onboarding-content">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>

        <h2>Got Resume?</h2>

        <div className="choice-buttons">
          <button
            className="choice-btn yes-btn"
            onClick={() => handleResumeChoice('yes')}
          >
            Yes
          </button>
          <button
            className="choice-btn no-btn"
            onClick={() => handleResumeChoice('no')}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );

  const renderUploadStep = () => (
    <div className="onboarding-step">
      <div className="onboarding-content">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>

        <h2>Upload Your Resume</h2>
        <p className="subtitle">Let our AI optimize it for your target job</p>

        {isProcessing ? (
          <div className="processing-state">
            <div className="processing-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#4A90E2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <p className="processing-text">Processing your resume...</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p className="attempt-text">(Attempt 23/50)</p>
          </div>
        ) : (
          <UploadResume onUploadSuccess={handleUploadSuccess} />
        )}
      </div>
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="onboarding-step">
      <div className="onboarding-content">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="user-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>

        <h2>Please select a template for your resume.</h2>
        <p className="subtitle">You can always change it later.</p>

        <div className="templates-grid">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              {template.preview}
              <div className="template-info">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          className="continue-btn"
          onClick={() => handleTemplateSelection(selectedTemplate)}
          disabled={!selectedTemplate}
        >
          Continue with Template
        </button>
      </div>
    </div>
  );

  const renderLinkedinStep = () => (
    <div className="onboarding-step">
      <div className="onboarding-content">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>

        <h2>Finally, would you like to save time by importing your LinkedIn?</h2>

        <div className="linkedin-section">
          <div className="linkedin-input">
            <div className="linkedin-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <input
              type="url"
              placeholder="https://linkedin.com/in/"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="linkedin-url-input"
            />
          </div>

          <button
            className="import-linkedin-btn"
            onClick={handleImportLinkedin}
            disabled={!linkedinUrl}
          >
            Import LinkedIn Profile
          </button>

          <button
            className="skip-btn"
            onClick={handleSkipLinkedin}
          >
            Skip This Step
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="onboarding-container">
      {renderStepIndicator()}
      <div className="onboarding-modal">
        {currentStep === 1 && renderWelcome()}
        {currentStep === 2 && renderUploadStep()}
        {currentStep === 3 && renderTemplateSelection()}
        {currentStep === 4 && renderLinkedinStep()}
      </div>
    </div>
  );
};

export default Onboarding;
