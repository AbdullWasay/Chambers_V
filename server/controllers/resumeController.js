const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const uploadResume = async (req, res) => {
    try {
      const file = req.file;
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `textract-output/${uuidv4()}-${file.originalname}`, // corrected path
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const data = await s3.upload(params).promise();
      res.json({ message: 'File uploaded successfully', data });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Error uploading file' });
    }
  };
  

  const getRewrittenResume = async (req, res) => {
    try {
      const { key } = req.query; // frontend will send the key
  
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `rewritten/${key}`, // rewritten location
      };
  
      const data = await s3.getObject(params).promise();
      const jsonContent = JSON.parse(data.Body.toString('utf-8')); // Parse the JSON content
  
      res.setHeader('Content-Type', 'application/json');
      res.send(jsonContent); // Send the JSON content to the frontend
    } catch (error) {
      console.error('Fetch rewritten resume error:', error);
      res.status(404).json({ error: 'Updated resume not found yet' });
    }
  };
  
  
module.exports = { uploadResume, getRewrittenResume };
  

