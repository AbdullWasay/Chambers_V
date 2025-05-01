"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { fetchRewrittenResume, uploadResume } from "../services/resumeService"

const UploadResume = ({ onSuccess, onError }) => {
  const [file, setFile] = useState(null)
  const [rewrittenUrl, setRewrittenUrl] = useState(null); // ⬅️  add this to store final resume url

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

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
  
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const uploadResult = await uploadResume(formData);
  
      const uploadedKey = uploadResult.data.Key.split('/').pop(); // extract filename
      console.log("Uploaded key:", uploadedKey);
  
      setUploadProgress(100);
  
      // Wait and poll for rewritten resume
      let attempts = 0;
      const maxAttempts = 10;
      const interval = 3000; // 3 seconds
  
      const pollForResume = async () => {
        try {
          const blob = await fetchRewrittenResume(uploadedKey);
          const url = URL.createObjectURL(blob);
          setRewrittenUrl(url);
          console.log("Rewritten resume ready!");
        } catch (error) {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Rewritten resume not ready yet, retrying... (${attempts})`);
            setTimeout(pollForResume, interval);
          } else {
            console.error("Failed to get rewritten resume after multiple attempts.");
            onError && onError();
          }
        }
      };
  
      setTimeout(pollForResume, interval); // start polling after 3s
  
      setTimeout(() => {
        setIsUploading(false);
        onSuccess && onSuccess();
      }, 500);
    } catch (error) {
      setIsUploading(false);
      onError && onError();
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

      <div style={{ display: "flex", justifyContent: "center" }}>
        <motion.button
        
          style={{
            ...styles.uploadButton,
            ...(isHovered && !isUploading && file ? styles.uploadButtonHover : {}),
            ...(!file || isUploading ? styles.uploadButtonDisabled : {}),
          }}
          whileTap={{ scale: 0.98 }}
          disabled={!file || isUploading}
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
          {isUploading ? "Uploading..." : "Upload Resume"}
          {rewrittenUrl && (
  <div style={{ marginTop: "40px" }}>
    <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Updated Resume</h2>
    <iframe
      src={rewrittenUrl}
      style={{ width: "100%", height: "800px", border: "1px solid #ccc", borderRadius: "8px" }}
      title="Rewritten Resume"
    ></iframe>
  </div>
)}

        </motion.button>
      </div>
    </div>
  )
}

export default UploadResume
