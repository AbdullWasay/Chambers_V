"use client"

import { useEffect, useRef, useState } from "react"
import "../styles/AIChatbot.css"

const AIChatbot = ({ resumeData, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your resume assistant. How can I help you improve your resume today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message to chat
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // In a real implementation, this would call an API to get a response from an AI model
      // For now, we'll simulate a response
      setTimeout(() => {
        const aiResponse = generateAIResponse(input, resumeData)
        setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error getting AI response:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
      setIsLoading(false)
    }
  }

  // Simple function to generate responses based on keywords
  // In a real implementation, this would be replaced with an API call to a language model
  const generateAIResponse = (userInput, resumeData) => {
    const input = userInput.toLowerCase()
    
    // Check for common resume improvement questions
    if (input.includes("improve") || input.includes("better")) {
      if (input.includes("summary")) {
        return "To improve your summary, focus on highlighting your most relevant skills and achievements. Keep it concise (3-4 sentences) and tailor it to the specific job you're applying for. Include keywords from the job description."
      } else if (input.includes("experience") || input.includes("work")) {
        return "To improve your work experience section, use strong action verbs and quantify your achievements when possible. For example, instead of 'Responsible for managing team', say 'Led a team of 5 developers, increasing productivity by 20%'."
      } else if (input.includes("skills")) {
        return "For your skills section, organize them by category and prioritize the most relevant ones for the job you're applying for. Include both technical skills and soft skills, and consider adding a proficiency level for each."
      } else {
        return "To improve your resume overall, ensure it's tailored to each job you apply for, use action verbs, quantify achievements, keep it concise (1-2 pages), and proofread carefully for errors. Would you like specific advice for a particular section?"
      }
    } else if (input.includes("ats") || input.includes("applicant tracking")) {
      return "To make your resume more ATS-friendly: 1) Use standard section headings, 2) Include keywords from the job description, 3) Avoid tables, headers/footers, and complex formatting, 4) Use a clean, simple layout, 5) Submit in PDF format unless otherwise specified."
    } else if (input.includes("keywords") || input.includes("job description")) {
      return "To incorporate keywords from a job description, identify the skills, qualifications, and experiences mentioned in the posting. Then naturally weave these terms into your resume, especially in your summary and skills sections. Don't just copy and paste - integrate them in a way that accurately reflects your background."
    } else if (input.includes("format") || input.includes("layout")) {
      return "For optimal resume formatting: 1) Use a clean, professional design, 2) Include clear section headings, 3) Use bullet points for readability, 4) Maintain consistent formatting (fonts, spacing, etc.), 5) Ensure adequate white space, 6) Keep it to 1-2 pages depending on experience level."
    } else if (input.includes("gaps") || input.includes("employment gap")) {
      return "To address employment gaps, be honest but strategic. Consider using a functional resume format to emphasize skills over chronology. You can also briefly explain significant gaps in your cover letter. If you developed skills during the gap (through volunteering, freelancing, or education), include those experiences."
    } else if (input.includes("thank") || input.includes("thanks")) {
      return "You're welcome! Is there anything else you'd like help with regarding your resume?"
    } else {
      return "I'm here to help with your resume questions. You can ask about improving specific sections, ATS optimization, formatting, addressing employment gaps, or any other resume-related topics. What would you like to know more about?"
    }
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>Resume AI Assistant</h3>
        <button className="close-button" onClick={onClose}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chatbot-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your resume..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  )
}

export default AIChatbot
