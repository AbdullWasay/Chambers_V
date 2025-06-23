import axios from 'axios';

const BASE_URL = 'http://localhost:3001'; // Change this to your actual backend URL if different

// List all rewritten resumes from the S3 bucket
export const listRewrittenResumes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/list-rewritten-resumes`);
    return response.data;
  } catch (error) {
    console.error("Error listing rewritten resumes:", error);
    throw error;
  }
};

// Get a specific rewritten resume by its key
export const getRewrittenResumeByKey = async (key) => {
  try {
    const response = await axios.get(`${BASE_URL}/rewritten`, {
      params: { key },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching rewritten resume by key:", error);
    throw error;
  }
};

// Get the latest rewritten resume from S3
export const getLatestRewrittenResume = async (specificKey) => {
  try {
    console.log("Fetching latest rewritten resume from API...");

    // Only use a specific key if provided, otherwise let the server find the latest file
    const params = specificKey ? { key: specificKey } : {};

    console.log("Using params:", params);

    // Direct endpoint to get the latest resume
    const response = await axios.get(`${BASE_URL}/latest-rewritten-resume`, {
      params: params
    });

    console.log("Latest resume API response status:", response.status);
    console.log("Latest resume data type:", typeof response.data);

    if (typeof response.data === 'object') {
      console.log("Latest resume data keys:", Object.keys(response.data));

      // Check if the data has the expected structure
      if (response.data.basics) {
        console.log("Resume belongs to:", response.data.basics.name);
      } else {
        console.log("Warning: Resume data doesn't have a 'basics' section");
      }
    } else {
      console.log("Warning: Response data is not an object:", response.data);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching latest rewritten resume:", error);

    // Log more details about the error
    if (error.response) {
      console.error("Error response status:", error.response.status);
      console.error("Error response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }

    throw error;
  }
};
