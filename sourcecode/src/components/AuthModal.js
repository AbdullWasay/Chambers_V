import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [currentMode, setCurrentMode] = useState(initialMode);

  const handleSwitchToSignUp = () => {
    setCurrentMode('signup');
  };

  const handleSwitchToSignIn = () => {
    setCurrentMode('signin');
  };

  const handleClose = () => {
    setCurrentMode('signin'); // Reset to signin when closing
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {currentMode === 'signin' && (
        <SignIn 
          isOpen={true}
          onClose={handleClose}
          onSwitchToSignUp={handleSwitchToSignUp}
        />
      )}
      {currentMode === 'signup' && (
        <SignUp 
          isOpen={true}
          onClose={handleClose}
          onSwitchToSignIn={handleSwitchToSignIn}
        />
      )}
    </>
  );
};

export default AuthModal;
