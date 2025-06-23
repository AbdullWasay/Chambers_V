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
      console.log('Upload request received');
      console.log('Request body:', req.body);
      console.log('Request file:', req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file');

      const file = req.file;
      // Check if job description was provided
      const jobDescription = req.body.jobDescription || '';

      console.log('Job description from request body:', jobDescription ?
        (jobDescription.length > 100 ? jobDescription.substring(0, 100) + '...' : jobDescription) :
        'None provided');

      // Generate a unique ID for this upload
      const uploadId = uuidv4();
      const key = `textract-output/${uploadId}-${file.originalname}`;

      // Prepare S3 upload parameters
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      // Add job description as metadata if provided
      // Note: S3 metadata has limitations - ASCII characters only and size limits
      if (jobDescription) {
        // For simplicity and reliability, we'll store a flag in metadata
        // and the actual job description as a separate object if it's too long
        if (jobDescription.length > 1000) {
          // If job description is too long, store it as a separate object
          console.log('Job description is too long for metadata, storing as separate object');

          // Store job description in S3
          const jobDescKey = `job-descriptions/${uploadId}.txt`;
          await s3.upload({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: jobDescKey,
            Body: jobDescription,
            ContentType: 'text/plain'
          }).promise();

          // Add a reference to the job description in metadata
          params.Metadata = {
            'has-job-description': 'true',
            'job-description-key': jobDescKey
          };
        } else {
          // If job description is short enough, store it directly in metadata
          // Ensure it only contains ASCII characters and is URL-encoded
          // S3 metadata has strict requirements
          const asciiJobDesc = encodeURIComponent(jobDescription.replace(/[^\x00-\x7F]/g, ''));
          console.log('ASCII and URL-encoded job description:', asciiJobDesc.substring(0, 100) + '...');

          params.Metadata = {
            'job-description': asciiJobDesc
          };
        }
      }

      if (jobDescription) {
        console.log('Job description provided, length:', jobDescription.length);
        console.log('Adding job description as metadata');
        console.log('First 100 chars of job description:', jobDescription.substring(0, 100));

        // Log the params object to verify metadata is set correctly
        console.log('S3 upload params:', JSON.stringify({
          Bucket: params.Bucket,
          Key: params.Key,
          ContentType: params.ContentType,
          Metadata: params.Metadata
        }));
      } else {
        console.log('No job description provided');
      }

      console.log('S3 upload params:', {
        Bucket: params.Bucket,
        Key: params.Key,
        ContentType: params.ContentType,
        Metadata: params.Metadata
      });

      const data = await s3.upload(params).promise();
      console.log('S3 upload response:', JSON.stringify(data));

      // Verify the metadata was set correctly by getting the object metadata
      try {
        const headResponse = await s3.headObject({
          Bucket: params.Bucket,
          Key: params.Key
        }).promise();

        console.log('S3 object metadata after upload:', headResponse.Metadata);
      } catch (headError) {
        console.error('Error getting object metadata after upload:', headError);
      }

      res.json({ message: 'File uploaded successfully', data });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Error uploading file' });
    }
  };


  const getRewrittenResume = async (req, res) => {
    try {
      const { key } = req.query; // frontend will send the key

      console.log('Fetching rewritten resume with key:', key);

      if (!key) {
        return res.status(400).json({ error: 'Missing key parameter' });
      }

      // First try to find the exact file with the key
      try {
        const params = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `rewritten-resumes/${key}`, // Try the exact key first
        };

        console.log('Trying exact key S3 params:', params);
        const data = await s3.getObject(params).promise();
        console.log('S3 data received with exact key, content length:', data.Body.length);

        const jsonContent = JSON.parse(data.Body.toString('utf-8'));
        console.log('JSON parsed successfully');

        res.setHeader('Content-Type', 'application/json');
        return res.send(jsonContent);
      } catch (exactKeyError) {
        console.log('Exact key not found, trying to find file with key in the name...');

        // If exact key fails, try to find a file that contains the key in its name
        try {
          // List all files in the rewritten-resumes folder
          const listParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Prefix: 'rewritten-resumes/'
          };

          const listData = await s3.listObjectsV2(listParams).promise();
          console.log(`Found ${listData.Contents.length} objects in the bucket`);

          // Filter out the folder itself and only return actual files
          const files = listData.Contents.filter(item => !item.Key.endsWith('/'));
          console.log(`Found ${files.length} files after filtering`);

          // Try to find a file that contains the key in its name
          const matchingFile = files.find(file => file.Key.includes(key));

          if (matchingFile) {
            console.log('Found matching file:', matchingFile.Key);

            const getParams = {
              Bucket: process.env.AWS_S3_BUCKET,
              Key: matchingFile.Key
            };

            const fileData = await s3.getObject(getParams).promise();
            console.log('File content received, size:', fileData.Body.length);

            const jsonContent = JSON.parse(fileData.Body.toString('utf-8'));
            console.log('JSON parsed successfully');

            res.setHeader('Content-Type', 'application/json');
            return res.send(jsonContent);
          } else {
            // If no matching file is found, return the latest file
            console.log('No matching file found, returning the latest file...');

            // Sort by LastModified date (newest first)
            files.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));

            if (files.length > 0) {
              // Get the most recent file
              const latestFile = files[0];
              console.log('Latest file:', latestFile.Key, 'Last modified:', latestFile.LastModified);

              const getParams = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: latestFile.Key
              };

              const fileData = await s3.getObject(getParams).promise();
              console.log('Latest file content received, size:', fileData.Body.length);

              const jsonContent = JSON.parse(fileData.Body.toString('utf-8'));
              console.log('JSON parsed successfully');

              res.setHeader('Content-Type', 'application/json');
              return res.send(jsonContent);
            } else {
              return res.status(404).json({
                error: 'No resumes found in the bucket',
                details: `No files found in rewritten-resumes/ in bucket ${process.env.AWS_S3_BUCKET}`
              });
            }
          }
        } catch (listError) {
          console.error('Error listing or processing files:', listError);
          throw listError;
        }
      }
    } catch (error) {
      console.error('Fetch rewritten resume error:', error);
      res.status(500).json({
        error: 'Error fetching resume',
        message: error.message
      });
    }
  };


module.exports = { uploadResume, getRewrittenResume };


