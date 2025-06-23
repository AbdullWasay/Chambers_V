"use client"

import { useState, useEffect } from "react"
import "../styles/LoadingAnimation.css"

const LoadingAnimation = ({ message = "Processing...", type = "spinner", showProgress = false }) => {
  const [progressValue, setProgressValue] = useState(0)
  const [loadingText, setLoadingText] = useState(message)
  
  // Simulate progress for progress bar
  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setProgressValue((prev) => {
          // Slow down as we approach 100%
          const increment = prev < 70 ? 5 : prev < 90 ? 2 : 0.5
          const newValue = Math.min(prev + increment, 99)
          return newValue
        })
      }, 300)
      
      return () => clearInterval(interval)
    }
  }, [showProgress])
  
  // Cycle through loading messages
  useEffect(() => {
    if (message === "Processing...") {
      const messages = [
        "Processing...",
        "Optimizing...",
        "Almost there...",
        "Finalizing...",
      ]
      let index = 0
      
      const interval = setInterval(() => {
        index = (index + 1) % messages.length
        setLoadingText(messages[index])
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [message])
  
  return (
    <div className="loading-animation-container">
      <div className="loading-content">
        {type === "spinner" && (
          <div className="spinner">
            <div className="spinner-inner"></div>
          </div>
        )}
        
        {type === "logo" && (
          <div className="spinning-logo">
            <img src="/logo.jpg" alt="Loading" />
          </div>
        )}
        
        {type === "gears" && (
          <div className="gears">
            <div className="gear-large"></div>
            <div className="gear-small"></div>
          </div>
        )}
        
        {type === "dots" && (
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <div className="loading-text">{loadingText}</div>
        
        {showProgress && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progressValue}%` }}></div>
            <div className="progress-text">{Math.round(progressValue)}%</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingAnimation
