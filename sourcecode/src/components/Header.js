"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "../styles/Header.css"
import CognitoAuth from "./CognitoAuth"

const Header = () => {
  const auth = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false)



  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img
            src="/logo.jpg"
            alt="Chambers_V Logo"
            className="logo-image"
          />
          <span style={{ color: "white", fontWeight: "600" }}>Chambers_V</span>
        </Link>
      </div>
      <div className="user-actions">
        {auth.isAuthenticated ? (
          <div className="user-menu">
            <span className="user-email">{auth.user?.profile?.email}</span>
            <button onClick={() => auth.removeUser()} className="signout-btn">
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)} className="signin-btn">
            Sign In
          </button>
        )}
      </div>



      <CognitoAuth
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={auth.handleAuthSuccess}
      />
    </header>
  )
}

export default Header
