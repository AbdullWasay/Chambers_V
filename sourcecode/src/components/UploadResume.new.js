"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { uploadResume } from "../services/resumeService"
import { getLatestRewrittenResume } from "../services/awsService"

const UploadResume = ({ onSuccess, onError }) => {
  const [file, setFile] = useState(null)
  const [rewrittenUrl, setRewrittenUrl] = useState(null); // ⬅️  add this to store final resume url
  const [resumeData, setResumeData] = useState(null); // ⬅️  add this to store final resume data

  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false) // Add state for processing status
  const [processingAttempts, setProcessingAttempts] = useState(0) // Track polling attempts
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("") // Add state for error messages

  // Simulate upload progress
  useEffect(() => {
    if (isUploading) {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5
          if (newProgress >= 100) {
            clearInterval(interval)
            return 100
          }
          return newProgress
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isUploading])

  // Reset progress when file changes
  useEffect(() => {
    setUploadProgress(0)
  }, [file])

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0]
    setFile(selectedFile)
  }, [])

  const handleUpload = async () => {
    if (!file) return;
  
    setIsUploading(true);
    setIsProcessing(false);
    setProcessingAttempts(0);
    setResumeData(null); // Reset any previous resume data
    setErrorMessage(""); // Clear any previous error messages
  
    try {
      // Step 1: Upload the file
      const formData = new FormData();
      formData.append("file", file);
  
      console.log("Uploading file:", file.name);
      const uploadResult = await uploadResume(formData);
  
      console.log("Upload result:", uploadResult);
      
      // File is uploaded, now we'll wait and then fetch the latest resume
      setUploadProgress(100);
      setIsUploading(false);
      setIsProcessing(true); // Start processing state
      
      // Step 2: Poll for the latest resume
      let attempts = 0;
      const maxAttempts = 20; // Increase max attempts
      const interval = 10000; // 10 seconds between attempts - give more time for processing
      
      const pollForLatestResume = async () => {
        try {
          attempts++;
          setProcessingAttempts(attempts);
          console.log(`Attempt ${attempts}: Fetching latest resume...`);
          
          // Simply get the latest resume from S3
          const latestResume = await getLatestRewrittenResume();
          
          if (latestResume) {
            console.log("Latest resume data received:", latestResume);
            
            // Store the data in state
            setResumeData(latestResume);
            setIsProcessing(false);
            
            // Create a URL for display
            const jsonString = JSON.stringify(latestResume, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            setRewrittenUrl(url);
            
            console.log("Resume processing complete!");
            
            // Call the success callback with the data
            if (onSuccess) {
              console.log("Calling onSuccess with data");
              onSuccess(latestResume);
            }
            
            return; // Exit the polling loop
          } else {
            throw new Error("Received empty data");
          }
        } catch (error) {
          console.log(`Attempt ${attempts}: Latest resume not ready yet, will retry in ${interval/1000} seconds`);
          
          if (attempts < maxAttempts) {
            setTimeout(pollForLatestResume, interval);
          } else {
            console.error("Failed to get latest resume after multiple attempts.");
            setIsProcessing(false);
            setErrorMessage("We couldn't retrieve your processed resume. Please try again or check the Latest Resume page later.");
            if (onError) onError();
          }
        }
      };
      
      // Start polling after a longer delay to give time for processing
      setTimeout(pollForLatestResume, 15000); // Wait 15 seconds before first attempt
      
    } catch (error) {
      console.error("Error during upload:", error);
      setIsUploading(false);
      setIsProcessing(false);
      setErrorMessage("Error uploading your resume. Please try again.");
      if (onError) onError();
    }
};

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  })

  // Add a style tag for the spinner animation
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    // Add the keyframes animation
    styleEl.innerHTML = `
      @keyframes spinAnimation {
        to { transform: rotate(360deg); }
      }
    `;
    // Append it to the document head
    document.head.appendChild(styleEl);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const styles = {
    container: {
      width: "100%",
    },
    dropzone: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      borderWidth: "2px",
      borderRadius: "12px",
      borderColor: isDragActive ? (isDragAccept ? "#4caf50" : "#f44336") : "#e0e0e0",
      borderStyle: "dashed",
      backgroundColor: isDragActive
        ? isDragAccept
          ? "rgba(76, 175, 80, 0.05)"
          : "rgba(244, 67, 54, 0.05)"
        : "#fafafa",
      color: "#666",
      outline: "none",
      transition: "border .2s ease-in-out, background-color .2s ease-in-out",
      cursor: "pointer",
      minHeight: "200px",
    },
    icon: {
      marginBottom: "16px",
      color: isDragActive ? (isDragAccept ? "#4caf50" : "#f44336") : "#9e9e9e",
    },
    text: {
      fontSize: "16px",
      textAlign: "center",
      marginBottom: "8px",
    },
    hint: {
      fontSize: "14px",
      color: "#9e9e9e",
      textAlign: "center",
    },
    fileInfo: {
      display: "flex",
      alignItems: "center",
      marginTop: "20px",
      padding: "12px 16px",
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      width: "100%",
    },
    fileName: {
      marginLeft: "12px",
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    removeButton: {
      background: "none",
      border: "none",
      color: "#f44336",
      cursor: "pointer",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "14px",
      transition: "background-color 0.2s",
    },
    uploadButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "24px",
      padding: "12px 24px",
      backgroundColor: "#4a6cf7",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.2s, transform 0.1s",
      boxShadow: "0 4px 6px rgba(74, 108, 247, 0.2)",
    },
    uploadButtonHover: {
      backgroundColor: "#3a5ce5",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 8px rgba(74, 108, 247, 0.25)",
    },
    uploadButtonDisabled: {
      backgroundColor: "#c5c5c5",
      cursor: "not-allowed",
      boxShadow: "none",
    },
    progressContainer: {
      width: "100%",
      height: "8px",
      backgroundColor: "#e0e0e0",
      borderRadius: "4px",
      marginTop: "24px",
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      backgroundColor: "#4a6cf7",
      borderRadius: "4px",
      transition: "width 0.2s ease-out",
    },
    buttonIcon: {
      marginRight: "8px",
    },
  }

  const [isHovered, setIsHovered] = useState(false)

  return (
    <div style={styles.container}>
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        <div style={styles.icon}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <p style={styles.text}>
          {isDragActive
            ? isDragAccept
              ? "Drop your resume here"
              : "This file type is not supported"
            : "Drag & drop your resume here"}
        </p>
        <p style={styles.hint}>or click to browse files (PDF, DOC, DOCX)</p>
      </div>

      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={styles.fileInfo}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4a6cf7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span style={styles.fileName}>{file.name}</span>
            <button
              style={styles.removeButton}
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
              }}
            >
              Remove
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isUploading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.progressContainer}>
          <motion.div
            style={{
              ...styles.progressBar,
              width: `${uploadProgress}%`,
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${uploadProgress}%` }}
          />
        </motion.div>
      )}

      {/* Error message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#ffebee",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#f44336",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "10px"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <span style={{ fontWeight: "500", color: "#f44336" }}>
              Error
            </span>
          </div>
          <p style={{ margin: "0", fontSize: "14px", color: "#666", textAlign: "center" }}>
            {errorMessage}
          </p>
        </motion.div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e8f4ff",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <div style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "3px solid #e0e0e0",
              borderTopColor: "#4a6cf7",
              animation: "spinAnimation 1s linear infinite",
              marginRight: "10px"
            }} />
            <span style={{ fontWeight: "500", color: "#4a6cf7" }}>
              Processing your resume...
            </span>
          </div>
          <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
            This may take a few moments. We're extracting and formatting your resume data.
          </p>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
            Attempt {processingAttempts} of 20
          </p>
        </motion.div>
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <motion.button
          style={{
            ...styles.uploadButton,
            ...(isHovered && !isUploading && !isProcessing && file ? styles.uploadButtonHover : {}),
            ...(!file || isUploading || isProcessing ? styles.uploadButtonDisabled : {}),
          }}
          whileTap={{ scale: 0.98 }}
          disabled={!file || isUploading || isProcessing}
          onClick={handleUpload}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span style={styles.buttonIcon}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </span>
          {isUploading ? "Uploading..." : isProcessing ? "Processing..." : "Upload Resume"}
        </motion.button>
      </div>

      {/* Success message when resume is processed */}
      {resumeData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e8fff0",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            marginBottom: "20px"
          }}
        >
          <div style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#4caf50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "10px"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span style={{ fontWeight: "500", color: "#4caf50" }}>
            Resume processed successfully!
          </span>
        </motion.div>
      )}

      {/* Display resume data if available */}
      {resumeData && (
        <div style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Processed Resume Data</h2>

          {/* Basic information section */}
          {resumeData.basics && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: "8px", color: "#4a6cf7" }}>
                Basic Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "10px" }}>
                <p><strong>Name:</strong> {resumeData.basics.name}</p>
                <p><strong>Title:</strong> {resumeData.basics.title}</p>
                <p><strong>Email:</strong> {resumeData.basics.email}</p>
                <p><strong>Phone:</strong> {resumeData.basics.phone}</p>
                <p><strong>Location:</strong> {resumeData.basics.location}</p>
              </div>
            </div>
          )}

          {/* Full JSON data */}
          <div>
            <h3 style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: "8px", color: "#4a6cf7" }}>
              Complete JSON Data
            </h3>
            <pre style={{
              textAlign: "left",
              maxHeight: "400px",
              overflow: "auto",
              padding: "15px",
              backgroundColor: "#f5f5f5",
              borderRadius: "5px"
            }}>
              {JSON.stringify(resumeData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadResume
