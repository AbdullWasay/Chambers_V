import React from 'react';
import LatestResume from '../components/LatestResume';
import '../styles/LatestResume.css';

const LatestResumePage = () => {
  return (
    <div className="latest-resume-page">
      <h1>Latest Optimized Resume</h1>
      <p className="subtitle">View your most recently processed resume</p>
      <LatestResume />
    </div>
  );
};

export default LatestResumePage;
