import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth/SignIn.css';

const SignIn = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle sign in logic here
    console.log('Sign in attempt:', formData);

    // For now, simulate successful login and navigate to dashboard
    onClose();
    navigate('/dashboard');
  };

  const handleSocialLogin = (provider) => {
    // Handle social login logic here
    console.log(`${provider} login attempt`);

    // For now, simulate successful login and navigate to dashboard
    onClose();
    navigate('/dashboard');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="signin-modal" onClick={(e) => e.stopPropagation()}>
        {/* Left Side - Branding */}
        <div className="signin-left">
          <div className="signin-branding">
            <div className="brand-icon">
              <div className="star-icon">⭐</div>
            </div>
            <h2>Create a resume you are proud of</h2>
            <p>Professional templates designed to help you stand out</p>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon blue">📋</div>
                <div className="feature-text">
                  <h4>Professional Templates</h4>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon green">🤖</div>
                <div className="feature-text">
                  <h4>AI-Powered Optimization</h4>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon orange">⚡</div>
                <div className="feature-text">
                  <h4>Ready in Minutes</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="signin-right">
          <div className="signin-form-container">
            <button className="close-button" onClick={onClose}>×</button>
          
          <div className="signin-header">
            <h1>Sign in your account</h1>
          </div>

          {/* Social Login Buttons */}
          <div className="social-login-section">
            <button
              className="social-button linkedin"
              onClick={() => handleSocialLogin('LinkedIn')}
            >
              <div className="social-icon linkedin-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <span>LinkedIn</span>
            </button>

            <button
              className="social-button google"
              onClick={() => handleSocialLogin('Google')}
            >
              <div className="social-icon google-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <span>Google</span>
            </button>

            <button
              className="social-button facebook"
              onClick={() => handleSocialLogin('Facebook')}
            >
              <div className="social-icon facebook-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span>Facebook</span>
            </button>
          </div>

          <div className="divider">
            <span>or use your email</span>
          </div>

          {/* Email/Password Form */}
          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="signin-button">
              Sign In
            </button>
          </form>

          {/* Footer Links */}
          <div className="signin-footer">
            <p>First time here?</p>
            <div className="footer-links">
              <button onClick={onSwitchToSignUp} className="link-primary">Create an account</button>
              <button className="link-secondary">Forgot your password?</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SignIn;
