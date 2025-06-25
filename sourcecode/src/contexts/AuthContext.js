import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const currentUser = userPool.getCurrentUser();

      if (currentUser) {
        currentUser.getSession((err, session) => {
          if (err) {
            console.error('Session error:', err);
            setIsLoading(false);
            return;
          }

          if (session && session.isValid()) {
            currentUser.getUserAttributes((err, attributes) => {
              if (err) {
                console.error('Error getting user attributes:', err);
                setIsLoading(false);
                return;
              }

              const userInfo = {};
              attributes.forEach(attr => {
                userInfo[attr.getName()] = attr.getValue();
              });

              setUser({
                profile: {
                  email: userInfo.email,
                  name: userInfo.name || userInfo.email,
                  ...userInfo
                }
              });
              setIsAuthenticated(true);
              setIsLoading(false);
            });
          } else {
            setIsLoading(false);
          }
        });
      } else {
        // Check for tokens in localStorage (from our custom auth)
        const accessToken = localStorage.getItem('accessToken');
        const idToken = localStorage.getItem('idToken');

        if (accessToken && idToken) {
          try {
            // Decode the ID token to get user info
            const payload = JSON.parse(atob(idToken.split('.')[1]));
            setUser({
              profile: {
                email: payload.email,
                name: payload.name || payload.email,
                ...payload
              }
            });
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Error parsing token:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('idToken');
          }
        }
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signinRedirect = () => {
    // This will be handled by our custom modal
    // We don't need to redirect anywhere
  };

  const removeUser = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }

    // Clear localStorage tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');

    setIsAuthenticated(false);
    setUser(null);
  };

  const handleAuthSuccess = (authData) => {
    setUser({
      profile: {
        email: authData.user.email,
        name: authData.user.name || authData.user.email,
        ...authData.user
      }
    });
    setIsAuthenticated(true);
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    error,
    signinRedirect,
    removeUser,
    handleAuthSuccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
