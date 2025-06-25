import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';
import ResumeUploadModal from './ResumeUploadModal';

const Dashboard = () => {
  const auth = useAuth();
  const [userResumes, setUserResumes] = useState([]);
  const [userStats, setUserStats] = useState({
    totalResumes: 0,
    viewsThisMonth: 0,
    downloadRate: 0,
    responseRate: 0
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    // Load user's resumes from localStorage
    const resumes = JSON.parse(localStorage.getItem('userResumes') || '[]');
    const userSpecificResumes = resumes.filter(resume =>
      resume.userId === auth.user?.profile?.sub || resume.userId === auth.user?.profile?.email
    );
    setUserResumes(userSpecificResumes);

    // Calculate user stats
    setUserStats({
      totalResumes: userSpecificResumes.length,
      viewsThisMonth: Math.floor(Math.random() * 200) + 50, // Mock data
      downloadRate: Math.floor(Math.random() * 50) + 20,
      responseRate: Math.floor(Math.random() * 30) + 10
    });
  }, [auth.user]);

  const getUserDisplayName = () => {
    if (auth.user?.profile?.name) return auth.user.profile.name;
    if (auth.user?.profile?.email) return auth.user.profile.email.split('@')[0];
    return 'User';
  };

  const getUserEmail = () => {
    return auth.user?.profile?.email || 'user@example.com';
  };
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">
              <span>C</span>
            </div>
            <span className="logo-text">Chambers</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
            </div>
            <span>Dashboard</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <span>Resumes</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span>Cover Letters</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span>Templates</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4v12l-4-2-4 2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2z"/>
              </svg>
            </div>
            <span>Analytics</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span>Profile</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </div>
            <span>Settings</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
            </div>
            <span>Help Center</span>
          </div>
          <div className="nav-item" onClick={() => auth.removeUser()}>
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </div>
            <span>Logout</span>
          </div>
        </nav>

        {/* User Profile at Bottom */}
        <div className="sidebar-footer">
          <div className="user-profile-sidebar">
            <div className="user-avatar-sidebar">
              {getUserDisplayName().charAt(0).toUpperCase()}
            </div>
            <div className="user-info-sidebar">
              <span className="user-name-sidebar">{getUserDisplayName()}</span>
              <span className="user-email-sidebar">{getUserEmail()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-header">
              <div className="stat-label">TOTAL RESUMES</div>
              <div className="stat-indicator blue"></div>
            </div>
            <div className="stat-number">12</div>
            <div className="stat-change positive">+3 from last month</div>
          </div>
          <div className="stat-card green">
            <div className="stat-header">
              <div className="stat-label">VIEWS THIS MONTH</div>
              <div className="stat-indicator green"></div>
            </div>
            <div className="stat-number">148</div>
            <div className="stat-change positive">+24% from last month</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-header">
              <div className="stat-label">DOWNLOAD RATE</div>
              <div className="stat-indicator orange"></div>
            </div>
            <div className="stat-number">32%</div>
            <div className="stat-change positive">+5% from last month</div>
          </div>
          <div className="stat-card red">
            <div className="stat-header">
              <div className="stat-label">RESPONSE RATE</div>
              <div className="stat-indicator red"></div>
            </div>
            <div className="stat-number">18%</div>
            <div className="stat-change positive">+3% from last month</div>
          </div>
        </div>

        {/* My Resumes Section */}
        <div className="section">
          <div className="section-header">
            <h2>My Resumes</h2>
            <button
              className="create-btn"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Create New
            </button>
          </div>
          <div className="resumes-grid">
            <div className="resume-card">
              <div className="resume-preview">
                <div className="resume-lines">
                  <div className="line blue"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line short"></div>
                </div>
              </div>
              <div className="resume-info">
                <h3>Software Engineer</h3>
                <p className="resume-views">12 views</p>
                <div className="resume-actions">
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn view">View</button>
                </div>
              </div>
            </div>

            <div className="resume-card">
              <div className="resume-preview">
                <div className="resume-lines">
                  <div className="line blue"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line short"></div>
                </div>
              </div>
              <div className="resume-info">
                <h3>Product Manager</h3>
                <p className="resume-views">24 views</p>
                <div className="resume-actions">
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn view">View</button>
                </div>
              </div>
            </div>

            <div className="resume-card">
              <div className="resume-preview">
                <div className="resume-lines">
                  <div className="line blue"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line short"></div>
                </div>
              </div>
              <div className="resume-info">
                <h3>UX Designer</h3>
                <p className="resume-views">8 views</p>
                <div className="resume-actions">
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn view">View</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Cover Letters Section */}
        <div className="section">
          <div className="section-header">
            <h2>My Cover Letters</h2>
            <button className="create-btn">Create New</button>
          </div>
          <div className="resumes-grid">
            <div className="resume-card">
              <div className="resume-preview cover-letter">
                <div className="resume-lines">
                  <div className="line blue"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line short"></div>
                </div>
              </div>
              <div className="resume-info">
                <h3>Software Engineer Cover Letter</h3>
                <p>Updated 1 day ago</p>
                <div className="resume-actions">
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn view">View</button>
                </div>
              </div>
            </div>

            <div className="resume-card">
              <div className="resume-preview cover-letter">
                <div className="resume-lines">
                  <div className="line blue"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line short"></div>
                </div>
              </div>
              <div className="resume-info">
                <h3>Product Manager Cover Letter</h3>
                <p>Updated 1 week ago</p>
                <div className="resume-actions">
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn view">View</button>
                </div>
              </div>
            </div>

            <div className="resume-card">
              <div className="resume-preview cover-letter">
                <div className="resume-lines">
                  <div className="line blue"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line short"></div>
                </div>
              </div>
              <div className="resume-info">
                <h3>UX Designer Cover Letter</h3>
                <p>Updated 2 weeks ago</p>
                <div className="resume-actions">
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn view">View</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon blue">C</div>
              <div className="activity-content">
                <p>Your "Software Engineer" resume was viewed by a recruiter at Google</p>
                <span className="activity-time">2 min ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon green">✓</div>
              <div className="activity-content">
                <p>Your "Product Manager" resume was downloaded</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon red">!</div>
              <div className="activity-content">
                <p>You received a rejection email for the "UX Designer" position</p>
                <span className="activity-time">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
