const AWS = require('aws-sdk');

// Log the AWS configuration for debugging
console.log('AWS Configuration:');
console.log('Region:', process.env.AWS_REGION);
console.log('Bucket:', process.env.AWS_S3_BUCKET);
console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? '****' + process.env.AWS_ACCESS_KEY_ID.slice(-4) : 'Not set');
console.log('Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? '****' : 'Not set');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1' // Default to us-east-1 if not set
});

// Create S3 service object with specific endpoint
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  // Force path style for compatibility with some S3-compatible services
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

const listRewrittenResumes = async (req, res) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: 'rewritten-resumes/'
    };

    const data = await s3.listObjectsV2(params).promise();

    // Filter out the folder itself and only return actual files
    const files = data.Contents.filter(item => !item.Key.endsWith('/'));

    res.json(files);
  } catch (error) {
    console.error('Error listing rewritten resumes:', error);
    res.status(500).json({ error: 'Error listing rewritten resumes' });
  }
};

const getLatestRewrittenResume = async (req, res) => {
  try {
    console.log('Fetching latest rewritten resume...');

    // Check if a specific key was provided in the query
    const specificKey = req.query.key;
    if (specificKey) {
      console.log(`Specific key requested: ${specificKey}`);

      // Try to get the object with the specific key
      try {
        const getParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: specificKey
        };

        console.log('Fetching file with specific key:', specificKey);
        const fileData = await s3.getObject(getParams).promise();
        console.log('File found with specific key, size:', fileData.Body.length);

        try {
          const jsonContent = JSON.parse(fileData.Body.toString('utf-8'));
          console.log('JSON parsed successfully for specific key');

          res.setHeader('Content-Type', 'application/json');
          return res.send(jsonContent);
        } catch (parseError) {
          console.error('Error parsing JSON for specific key:', parseError);
          return res.status(500).json({
            error: 'Error parsing resume data',
            message: parseError.message
          });
        }
      } catch (getError) {
        console.error('Error getting object with specific key:', getError);

        // If the key starts with 'textract-output/', try to find the corresponding processed file
        if (specificKey.startsWith('textract-output/')) {
          console.log('Input file key detected. Trying to find corresponding processed file...');

          // Extract the filename from the key
          const filename = specificKey.split('/').pop();
          console.log('Extracted filename:', filename);

          // Try to find a processed file with a similar name in rewritten-resumes/
          try {
            const listParams = {
              Bucket: process.env.AWS_S3_BUCKET,
              Prefix: 'rewritten-resumes/'
            };

            const data = await s3.listObjectsV2(listParams).promise();
            console.log(`Found ${data.Contents ? data.Contents.length : 0} objects with prefix 'rewritten-resumes/'`);

            if (data.Contents && data.Contents.length > 0) {
              // Filter out the folder itself
              const files = data.Contents.filter(item => !item.Key.endsWith('/'));
              console.log(`Found ${files.length} files after filtering`);

              // Sort by LastModified date (newest first)
              files.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));

              // Try to find a file that contains parts of the original filename
              const filenameWithoutExt = filename.split('.')[0];
              const matchingFiles = files.filter(file => file.Key.includes(filenameWithoutExt));

              if (matchingFiles.length > 0) {
                console.log(`Found ${matchingFiles.length} matching files for ${filenameWithoutExt}`);
                console.log('Using the most recent matching file:', matchingFiles[0].Key);

                const getParams = {
                  Bucket: process.env.AWS_S3_BUCKET,
                  Key: matchingFiles[0].Key
                };

                const fileData = await s3.getObject(getParams).promise();
                const jsonContent = JSON.parse(fileData.Body.toString('utf-8'));

                res.setHeader('Content-Type', 'application/json');
                return res.send(jsonContent);
              } else {
                console.log('No matching processed files found, continuing to try other methods');
              }
            }
          } catch (listError) {
            console.error('Error listing objects:', listError);
          }
        }

        // Continue to try other methods
      }
    }

    // Try multiple prefixes to find the resume
    const prefixesToTry = [
      'rewritten-resumes/',
      'rewritten_resumes/',
      'rewrittenresumes/',
      'rewritten-resume/',
      'rewritten/'
    ];

    let allFiles = [];

    // Try each prefix
    for (const prefix of prefixesToTry) {
      console.log(`Trying prefix: ${prefix}`);

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: prefix
      };

      console.log('S3 list params:', JSON.stringify(params));

      try {
        // Try to list objects in the bucket with this prefix
        const data = await s3.listObjectsV2(params).promise();
        console.log(`Found ${data.Contents ? data.Contents.length : 0} objects with prefix '${prefix}'`);

        if (data.Contents && data.Contents.length > 0) {
          // Filter out the folder itself and only return actual files
          const files = data.Contents.filter(item => !item.Key.endsWith('/'));
          console.log(`Found ${files.length} files after filtering for prefix '${prefix}'`);

          // Add these files to our collection
          allFiles = [...allFiles, ...files];
        }
      } catch (listError) {
        console.error(`Error listing objects with prefix '${prefix}':`, listError);
      }
    }

    console.log(`Found a total of ${allFiles.length} files across all prefixes`);

    if (allFiles.length === 0) {
      console.error('No objects found in the bucket with any of the tried prefixes');

      // List all objects in the bucket to see what's available
      try {
        console.log('Listing all objects in the bucket to debug...');
        const allObjectsParams = {
          Bucket: process.env.AWS_S3_BUCKET
        };

        const allObjectsData = await s3.listObjectsV2(allObjectsParams).promise();
        console.log(`Found ${allObjectsData.Contents ? allObjectsData.Contents.length : 0} total objects in the bucket`);

        if (allObjectsData.Contents && allObjectsData.Contents.length > 0) {
          console.log('Sample of objects in the bucket:');
          allObjectsData.Contents.slice(0, 10).forEach((item, index) => {
            console.log(`${index + 1}. ${item.Key} (${item.LastModified})`);
          });

          // Check for files containing the user's name
          const namePatterns = ['AbdulWasay', 'Abdul', 'Wasay', 'CV'];
          for (const pattern of namePatterns) {
            const matchingObjects = allObjectsData.Contents.filter(item => item.Key.includes(pattern));
            if (matchingObjects.length > 0) {
              console.log(`Found ${matchingObjects.length} objects containing '${pattern}':`);
              matchingObjects.slice(0, 5).forEach((item, index) => {
                console.log(`${index + 1}. ${item.Key} (${item.LastModified})`);
              });

              // Add these files to our collection
              allFiles = [...allFiles, ...matchingObjects];
            }
          }
        }
      } catch (listAllError) {
        console.error('Error listing all objects:', listAllError);
      }
    }

    // If we still have no files, return 404
    if (allFiles.length === 0) {
      return res.status(404).json({
        error: 'No rewritten resumes found in the bucket',
        message: 'The server could not find any resume files in the S3 bucket',
        prefixesTried: prefixesToTry
      });
    }

    // Log all files for debugging
    console.log('All files found:');
    allFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.Key} (${file.LastModified})`);
    });

    // Sort by LastModified date (newest first)
    allFiles.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));

    // Log all files with their timestamps for debugging
    console.log('All files sorted by modification date:');
    allFiles.slice(0, 5).forEach((file, index) => {
      console.log(`${index + 1}. ${file.Key} - ${file.LastModified} (${new Date(file.LastModified).toISOString()})`);
    });

    // Get the most recent file
    const latestFile = allFiles[0];
    console.log('Latest file:', latestFile.Key);
    console.log('Last modified:', latestFile.LastModified, '(', new Date(latestFile.LastModified).toISOString(), ')');

    // Now fetch the content of this file
    const getParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: latestFile.Key
    };

    console.log('Fetching file content with params:', JSON.stringify(getParams));

    try {
      // Try to get the object
      const fileData = await s3.getObject(getParams).promise();
      console.log('File content received, size:', fileData.Body.length);

      try {
        // Try to parse the JSON
        const jsonContent = JSON.parse(fileData.Body.toString('utf-8'));
        console.log('JSON parsed successfully');
        console.log('JSON content keys:', Object.keys(jsonContent));

        res.setHeader('Content-Type', 'application/json');
        return res.send(jsonContent);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);

        // Log the raw content for debugging
        const rawContent = fileData.Body.toString('utf-8');
        console.log('Raw content (first 200 chars):', rawContent.substring(0, 200));

        return res.status(500).json({
          error: 'Error parsing resume data',
          message: parseError.message,
          rawData: rawContent.substring(0, 200) + '...' // Send first 200 chars for debugging
        });
      }
    } catch (getError) {
      console.error('Error getting object:', getError);
      return res.status(500).json({
        error: 'Error getting object from S3',
        message: getError.message,
        params: getParams
      });
    }
  } catch (error) {
    console.error('Error fetching latest rewritten resume:', error);
    return res.status(500).json({
      error: 'Error fetching latest rewritten resume',
      message: error.message
    });
  }
};

module.exports = { listRewrittenResumes, getLatestRewrittenResume };
