import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import '../../styles/common/LoadingAnimation.css';

/**
 * A reusable loading animation component with multiple animation types
 * 
 * @param {Object} props
 * @param {string} props.type - The type of animation ('spinner', 'progress', 'logo', 'dots', 'gears')
 * @param {string} props.text - The text to display with the animation
 * @param {string} props.size - The size of the animation ('small', 'medium', 'large')
 * @param {string} props.color - The primary color of the animation
 * @param {boolean} props.overlay - Whether to display as a full-screen overlay
 * @param {number} props.progress - The progress value (0-100) for progress bar type
 * @param {Array} props.messages - Array of messages to cycle through for animated text
 * @param {number} props.messageInterval - Interval in ms to cycle through messages
 */
const LoadingAnimation = ({ 
  type = 'spinner', 
  text = 'Loading...', 
  size = 'medium', 
  color = '#4a6cf7',
  overlay = false,
  progress = 0,
  messages = ['Processing...', 'Optimizing...', 'Almost there...'],
  messageInterval = 3000
}) => {
  // Add keyframes animation for spinner
  useEffect(() => {
    // Create a style element if it doesn't exist
    if (!document.getElementById('loading-animation-keyframes')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'loading-animation-keyframes';
      
      // Add the keyframes animations
      styleEl.innerHTML = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        @keyframes dots {
          0% { content: '.'; }
          33% { content: '..'; }
          66% { content: '...'; }
          100% { content: '.'; }
        }
        @keyframes gear-rotate-left {
          to { transform: rotate(-360deg); }
        }
        @keyframes gear-rotate-right {
          to { transform: rotate(360deg); }
        }
      `;
      
      // Append it to the document head
      document.head.appendChild(styleEl);
    }
    
    // Clean up on unmount
    return () => {
      // Only remove if no other instances are using it
      if (document.querySelectorAll('.loading-animation').length <= 1) {
        const styleEl = document.getElementById('loading-animation-keyframes');
        if (styleEl) {
          document.head.removeChild(styleEl);
        }
      }
    };
  }, []);

  // For animated text cycling
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
  
  useEffect(() => {
    if (type === 'animated-text' && messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, messageInterval);
      
      return () => clearInterval(interval);
    }
  }, [type, messages, messageInterval]);

  // Determine size class
  const sizeClass = `loading-animation-${size}`;
  
  // Wrapper component - either div or motion.div
  const Wrapper = overlay ? motion.div : 'div';
  
  // Wrapper props
  const wrapperProps = overlay ? {
    className: 'loading-animation-overlay',
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  } : {
    className: 'loading-animation-container'
  };

  // Render the appropriate animation based on type
  const renderAnimation = () => {
    switch (type) {
      case 'spinner':
        return (
          <div 
            className={`loading-animation loading-spinner ${sizeClass}`}
            style={{ 
              borderTopColor: color,
            }}
          />
        );
        
      case 'progress':
        return (
          <div className={`loading-animation loading-progress ${sizeClass}`}>
            <div className="loading-progress-container">
              <motion.div 
                className="loading-progress-bar"
                style={{ backgroundColor: color }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {progress > 0 && (
              <div className="loading-progress-text">{progress}%</div>
            )}
          </div>
        );
        
      case 'logo':
        // Spinning logo animation
        return (
          <div className={`loading-animation loading-logo ${sizeClass}`}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 12l-4 4-4-4M12 8v7" />
              </svg>
            </motion.div>
          </div>
        );
        
      case 'dots':
        // Animated dots
        return (
          <div className={`loading-animation loading-dots ${sizeClass}`}>
            <span className="dot" style={{ backgroundColor: color }}></span>
            <span className="dot" style={{ backgroundColor: color, animationDelay: '0.2s' }}></span>
            <span className="dot" style={{ backgroundColor: color, animationDelay: '0.4s' }}></span>
          </div>
        );
        
      case 'gears':
        // Animated gears
        return (
          <div className={`loading-animation loading-gears ${sizeClass}`}>
            <div className="gear gear-left" style={{ borderColor: color }}>
              <div className="gear-inner" style={{ backgroundColor: color }}></div>
            </div>
            <div className="gear gear-right" style={{ borderColor: color }}>
              <div className="gear-inner" style={{ backgroundColor: color }}></div>
            </div>
          </div>
        );
        
      case 'animated-text':
        // Animated text that cycles through messages
        return (
          <div className={`loading-animation loading-text ${sizeClass}`}>
            <motion.span
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {messages[currentMessageIndex]}
            </motion.span>
          </div>
        );
        
      default:
        return (
          <div 
            className={`loading-animation loading-spinner ${sizeClass}`}
            style={{ 
              borderTopColor: color,
            }}
          />
        );
    }
  };

  return (
    <Wrapper {...wrapperProps}>
      {renderAnimation()}
      {text && type !== 'animated-text' && (
        <div className="loading-animation-text">{text}</div>
      )}
    </Wrapper>
  );
};

export default LoadingAnimation;
