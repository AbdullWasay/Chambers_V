import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { useState } from 'react';
import '../styles/auth/CognitoAuth.css';

const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

const CognitoAuth = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [cognitoUser, setCognitoUser] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const attributeList = [
      {
        Name: 'email',
        Value: formData.email
      },
      {
        Name: 'name',
        Value: formData.name
      }
    ];

    userPool.signUp(formData.email, formData.password, attributeList, null, (err, result) => {
      setLoading(false);
      if (err) {
        setError(err.message || 'Sign up failed');
        return;
      }
      setCognitoUser(result.user);
      setShowVerification(true);
    });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const authenticationDetails = new AuthenticationDetails({
      Username: formData.email,
      Password: formData.password,
    });

    const userData = {
      Username: formData.email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        setLoading(false);
        const accessToken = result.getAccessToken().getJwtToken();
        const idToken = result.getIdToken().getJwtToken();
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('idToken', idToken);
        
        onSuccess({
          accessToken,
          idToken,
          user: result.getIdToken().payload
        });
        onClose();
      },
      onFailure: (err) => {
        setLoading(false);
        setError(err.message || 'Sign in failed');
      },
    });
  };

  const handleVerification = (e) => {
    e.preventDefault();
    setLoading(true);

    cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
      setLoading(false);
      if (err) {
        setError(err.message || 'Verification failed');
        return;
      }
      setShowVerification(false);
      setIsSignUp(false);
      setError('');
      alert('Account verified! Please sign in.');
    });
  };

  const handleGoogleSignIn = () => {
    // For Google sign-in, we'll need to redirect to Cognito's hosted UI
    const domain = process.env.REACT_APP_COGNITO_DOMAIN;
    const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin);
    
    const googleSignInUrl = `https://${domain}.auth.us-west-2.amazoncognito.com/oauth2/authorize?identity_provider=Google&redirect_uri=${redirectUri}&response_type=CODE&client_id=${clientId}&scope=email+openid+profile`;
    
    window.location.href = googleSignInUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>

        {showVerification ? (
          <div className="auth-container">
            {/* Left Side - Branding */}
            <div className="auth-left-side">
              <div className="auth-logo">
                <div className="logo-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>

              <h2>Almost there!</h2>
              <p>Check your email and enter the verification code to complete your account setup</p>

              <div className="feature-icons">
                <div className="feature-item">
                  <div className="feature-icon blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span>Secure Verification</span>
                </div>

                <div className="feature-item">
                  <div className="feature-icon green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <span>Account Protection</span>
                </div>

                <div className="feature-item">
                  <div className="feature-icon orange">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <span>Quick Setup</span>
                </div>
              </div>
            </div>

            {/* Right Side - Verification Form */}
            <div className="auth-right-side">
              <div className="auth-form-header">
                <h3>Verify Your Email</h3>
                <p>Please enter the verification code sent to {formData.email}</p>
              </div>

              <form onSubmit={handleVerification} className="auth-form">
                <input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  className="verification-input"
                />
                {error && <div className="auth-error">{error}</div>}
                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>

              <div className="auth-footer">
                <span>Didn't receive the code?</span>
                <div className="auth-links">
                  <button className="auth-link" onClick={() => console.log('Resend code')}>
                    Resend verification code
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="auth-container">
            {/* Left Side - Branding */}
            <div className="auth-left-side">
              <div className="auth-logo">
                <div className="logo-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>

              <h2>Create a resume you are proud of</h2>
              <p>Professional templates designed to help you stand out</p>

              <div className="feature-icons">
                <div className="feature-item">
                  <div className="feature-icon blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <span>Professional Templates</span>
                </div>

                <div className="feature-item">
                  <div className="feature-icon green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <span>AI-Powered Optimization</span>
                </div>

                <div className="feature-item">
                  <div className="feature-icon orange">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <span>Ready in Minutes</span>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-right-side">
              <div className="auth-form-header">
                <h3>Sign in your account</h3>
              </div>

              {/* Social Login Buttons */}
              <div className="social-login-buttons">
                <button className="social-btn linkedin" onClick={() => console.log('LinkedIn login')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </button>

                <button className="social-btn google" onClick={handleGoogleSignIn}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button className="social-btn facebook" onClick={() => console.log('Facebook login')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              <div className="auth-divider">
                <span>or use your email</span>
              </div>

              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="auth-form">
                {isSignUp && (
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                )}

                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />

                {isSignUp && (
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                )}

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Loading...' : 'Sign In'}
                </button>
              </form>

              <div className="auth-footer">
                <span>First time here?</span>
                <div className="auth-links">
                  <button
                    className="auth-link"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? 'Sign in instead' : 'Create an account'}
                  </button>
                  <button className="auth-link">Forgot your password?</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CognitoAuth;
