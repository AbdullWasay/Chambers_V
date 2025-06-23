import React, { useEffect, useState } from 'react';
import { getLatestRewrittenResume } from '../services/awsService';

const LatestResume = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestResume = async () => {
      try {
        setLoading(true);
        console.log("Fetching latest resume...");
        const data = await getLatestRewrittenResume();
        console.log("Latest resume data received:", data);
        setResumeData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching latest resume:", err);
        setError("Failed to load the latest resume. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResume();
  }, []);

  if (loading) {
    return (
      <div className="latest-resume-container">
        <h2>Loading latest resume...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="latest-resume-container">
        <h2>Error</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="latest-resume-container">
        <h2>No Resume Found</h2>
        <p>No resumes have been uploaded yet. Please upload a resume first.</p>
      </div>
    );
  }

  return (
    <div className="latest-resume-container">
      <h2>Latest Optimized Resume</h2>
      <div className="resume-json-display">
        <pre>{JSON.stringify(resumeData, null, 2)}</pre>
      </div>

      {/* Display basic information in a more readable format */}
      {resumeData && resumeData.basics && (
        <div className="resume-basics">
          <h3>Basic Information</h3>
          <div className="basics-content">
            <p><strong>Name:</strong> {resumeData.basics.name}</p>
            <p><strong>Title:</strong> {resumeData.basics.title}</p>
            <p><strong>Email:</strong> {resumeData.basics.email}</p>
            <p><strong>Phone:</strong> {resumeData.basics.phone}</p>
            <p><strong>Location:</strong> {resumeData.basics.location}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestResume;
