import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AuthProvider } from "./contexts/AuthContext"
import "./styles/theme.css"

// Add Google Fonts for better typography
const linkElement = document.createElement("link")
linkElement.rel = "stylesheet"
linkElement.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
document.head.appendChild(linkElement)

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
