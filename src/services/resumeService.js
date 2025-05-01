import axios from 'axios';

const BASE_URL = 'http://localhost:3001'; // Change this to your actual backend URL if different

export const uploadResume = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });

    console.log("Resume uploaded:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading resume:", error);
    console.error("Error details:", error.response || error); // Log more details
    throw error;
}
};

export const fetchRewrittenResume = async (key) => {
  try {
    const response = await axios.get(`${BASE_URL}/rewritten`, {
      params: { key },
      responseType: 'blob', // Important for receiving file data
    });

    return response.data; // This is a Blob (PDF, etc.)
  } catch (error) {
    console.error("Error fetching rewritten resume:", error);
    throw error;
  }
};

export const saveResume = async (resumeData) => {
  try {
    const response = await axios.post(`${BASE_URL}/save`, resumeData);
    return response.data;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw error;
  }
};

export const downloadResume = async (resumeData, template, designSettings, format = "pdf") => {
  try {
    const response = await axios.post(
      `${BASE_URL}/generate`,
      { resumeData, template, designSettings, format },
      { responseType: 'blob' }
    );

    return URL.createObjectURL(response.data); // returns blob URL for downloading
  } catch (error) {
    console.error("Error downloading resume:", error);
    throw error;
  }
};
