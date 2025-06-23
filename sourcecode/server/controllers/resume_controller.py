import os
import json
import logging
import uuid
import boto3
from flask import jsonify
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure AWS S3
s3 = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name=os.environ.get('AWS_REGION', 'us-east-1')
)

def upload_resume(request):
    """
    Upload a resume file to S3
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Generate a unique filename
        unique_id = str(uuid.uuid4())
        original_filename = secure_filename(file.filename)
        key = f"textract-output/{unique_id}-{original_filename}"

        # Upload to S3
        s3.upload_fileobj(
            file,
            os.environ.get('AWS_S3_BUCKET'),
            key,
            ExtraArgs={
                'ContentType': file.content_type
            }
        )

        return jsonify({
            'message': 'File uploaded successfully',
            'data': {
                'Bucket': os.environ.get('AWS_S3_BUCKET'),
                'Key': key
            }
        })
    except Exception as error:
        logger.error(f'Upload error: {error}')
        return jsonify({'error': 'Error uploading file'}), 500

def get_rewritten_resume(request):
    """
    Get a rewritten resume from S3 by key
    """
    try:
        key = request.args.get('key')
        logger.info(f'Fetching rewritten resume with key: {key}')

        if not key:
            return jsonify({'error': 'Missing key parameter'}), 400

        # First try to find the exact file with the key
        try:
            params = {
                'Bucket': os.environ.get('AWS_S3_BUCKET'),
                'Key': f"rewritten-resumes/{key}"  # Try the exact key first
            }

            logger.info(f'Trying exact key S3 params: {params}')
            data = s3.get_object(**params)
            # Read the content once and store it
            file_content = data["Body"].read()
            logger.info(f'S3 data received with exact key, content length: {len(file_content)}')

            json_content = json.loads(file_content.decode('utf-8'))
            logger.info('JSON parsed successfully')

            return jsonify(json_content)
        except Exception as exact_key_error:
            logger.info('Exact key not found, trying to find file with key in the name...')

            # If exact key fails, try to find a file that contains the key in its name
            try:
                # List all files in the rewritten-resumes folder
                list_params = {
                    'Bucket': os.environ.get('AWS_S3_BUCKET'),
                    'Prefix': 'rewritten-resumes/'
                }

                list_data = s3.list_objects_v2(**list_params)
                logger.info(f'Found {len(list_data.get("Contents", []))} objects in the bucket')

                # Filter out the folder itself and only return actual files
                files = [item for item in list_data.get('Contents', []) if not item['Key'].endswith('/')]
                logger.info(f'Found {len(files)} files after filtering')

                # Try to find a file that contains the key in its name
                matching_file = next((file for file in files if key in file['Key']), None)

                if matching_file:
                    logger.info(f'Found matching file: {matching_file["Key"]}')

                    get_params = {
                        'Bucket': os.environ.get('AWS_S3_BUCKET'),
                        'Key': matching_file['Key']
                    }

                    file_data = s3.get_object(**get_params)
                    # Read the content once and store it
                    file_content = file_data["Body"].read()
                    logger.info(f'File content received, size: {len(file_content)}')

                    json_content = json.loads(file_content.decode('utf-8'))
                    logger.info('JSON parsed successfully')

                    return jsonify(json_content)
                else:
                    # If no matching file is found, return the latest file
                    logger.info('No matching file found, returning the latest file...')

                    # Sort by LastModified date (newest first)
                    files.sort(key=lambda x: x['LastModified'], reverse=True)

                    if files:
                        # Get the most recent file
                        latest_file = files[0]
                        logger.info(f'Latest file: {latest_file["Key"]}, Last modified: {latest_file["LastModified"]}')

                        get_params = {
                            'Bucket': os.environ.get('AWS_S3_BUCKET'),
                            'Key': latest_file['Key']
                        }

                        file_data = s3.get_object(**get_params)
                        # Read the content once and store it
                        file_content = file_data["Body"].read()
                        logger.info(f'Latest file content received, size: {len(file_content)}')

                        json_content = json.loads(file_content.decode('utf-8'))
                        logger.info('JSON parsed successfully')

                        return jsonify(json_content)
                    else:
                        return jsonify({
                            'error': 'No resumes found in the bucket',
                            'details': f'No files found in rewritten-resumes/ in bucket {os.environ.get("AWS_S3_BUCKET")}'
                        }), 404
            except Exception as list_error:
                logger.error(f'Error listing or processing files: {list_error}')
                raise list_error
    except Exception as error:
        logger.error(f'Fetch rewritten resume error: {error}')
        return jsonify({
            'error': 'Error fetching resume',
            'message': str(error)
        }), 500
