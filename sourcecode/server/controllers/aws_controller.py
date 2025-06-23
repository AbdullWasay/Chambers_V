import os
import json
import logging
import boto3
from flask import jsonify

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Log the AWS configuration for debugging
logger.info('AWS Configuration:')
logger.info(f'Region: {os.environ.get("AWS_REGION")}')
logger.info(f'Bucket: {os.environ.get("AWS_S3_BUCKET")}')
logger.info(f'Access Key ID: {"****" + os.environ.get("AWS_ACCESS_KEY_ID", "")[-4:] if os.environ.get("AWS_ACCESS_KEY_ID") else "Not set"}')
logger.info(f'Secret Access Key: {"****" if os.environ.get("AWS_SECRET_ACCESS_KEY") else "Not set"}')

# Configure AWS S3
s3 = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name=os.environ.get('AWS_REGION', 'us-east-1')
)

def list_rewritten_resumes():
    """
    List all rewritten resumes in the S3 bucket
    """
    try:
        params = {
            'Bucket': os.environ.get('AWS_S3_BUCKET'),
            'Prefix': 'rewritten-resumes/'
        }

        data = s3.list_objects_v2(**params)

        # Filter out the folder itself and only return actual files
        files = [item for item in data.get('Contents', []) if not item['Key'].endswith('/')]

        return jsonify(files)
    except Exception as error:
        logger.error(f'Error listing rewritten resumes: {error}')
        return jsonify({'error': 'Error listing rewritten resumes'}), 500

def get_latest_rewritten_resume(request):
    """
    Get the latest rewritten resume from S3
    """
    try:
        logger.info('Fetching latest rewritten resume...')

        # Check if a specific key was provided in the query
        specific_key = request.args.get('key')
        if specific_key:
            logger.info(f'Specific key requested: {specific_key}')

            # Try to get the object with the specific key
            try:
                get_params = {
                    'Bucket': os.environ.get('AWS_S3_BUCKET'),
                    'Key': specific_key
                }

                logger.info(f'Fetching file with specific key: {specific_key}')
                file_data = s3.get_object(**get_params)
                # Read the content once and store it
                file_content = file_data["Body"].read()
                logger.info(f'File found with specific key, size: {len(file_content)}')

                try:
                    json_content = json.loads(file_content.decode('utf-8'))
                    logger.info('JSON parsed successfully for specific key')

                    return jsonify(json_content)
                except json.JSONDecodeError as parse_error:
                    logger.error(f'Error parsing JSON for specific key: {parse_error}')
                    return jsonify({
                        'error': 'Error parsing resume data',
                        'message': str(parse_error)
                    }), 500
            except Exception as get_error:
                logger.error(f'Error getting object with specific key: {get_error}')

                # If the key starts with 'textract-output/', try to find the corresponding processed file
                if specific_key.startswith('textract-output/'):
                    logger.info('Input file key detected. Trying to find corresponding processed file...')

                    # Extract the filename from the key
                    filename = specific_key.split('/')[-1]
                    logger.info(f'Extracted filename: {filename}')

                    # Try to find a processed file with a similar name in rewritten-resumes/
                    try:
                        list_params = {
                            'Bucket': os.environ.get('AWS_S3_BUCKET'),
                            'Prefix': 'rewritten-resumes/'
                        }

                        data = s3.list_objects_v2(**list_params)
                        logger.info(f'Found {len(data.get("Contents", []))} objects with prefix "rewritten-resumes/"')

                        if data.get('Contents') and len(data['Contents']) > 0:
                            # Filter out the folder itself
                            files = [item for item in data['Contents'] if not item['Key'].endswith('/')]
                            logger.info(f'Found {len(files)} files after filtering')

                            # Sort by LastModified date (newest first)
                            files.sort(key=lambda x: x['LastModified'], reverse=True)

                            # Try to find a file that contains parts of the original filename
                            filename_without_ext = filename.split('.')[0]
                            matching_files = [file for file in files if filename_without_ext in file['Key']]

                            if matching_files:
                                logger.info(f'Found {len(matching_files)} matching files for {filename_without_ext}')
                                logger.info(f'Using the most recent matching file: {matching_files[0]["Key"]}')

                                get_params = {
                                    'Bucket': os.environ.get('AWS_S3_BUCKET'),
                                    'Key': matching_files[0]['Key']
                                }

                                file_data = s3.get_object(**get_params)

                                # Read the file content once
                                file_content = file_data['Body'].read().decode('utf-8')
                                json_content = json.loads(file_content)

                                return jsonify(json_content)
                            else:
                                logger.info('No matching processed files found, continuing to try other methods')
                    except Exception as list_error:
                        logger.error(f'Error listing objects: {list_error}')

        # Try multiple prefixes to find the resume
        prefixes_to_try = [
            'rewritten-resumes/',
            'rewritten_resumes/',
            'rewrittenresumes/',
            'rewritten-resume/',
            'rewritten/'
        ]

        all_files = []

        # Try each prefix
        for prefix in prefixes_to_try:
            logger.info(f'Trying prefix: {prefix}')

            params = {
                'Bucket': os.environ.get('AWS_S3_BUCKET'),
                'Prefix': prefix
            }

            logger.info(f'S3 list params: {json.dumps(params)}')

            try:
                # Try to list objects in the bucket with this prefix
                data = s3.list_objects_v2(**params)
                logger.info(f'Found {len(data.get("Contents", []))} objects with prefix "{prefix}"')

                if data.get('Contents') and len(data['Contents']) > 0:
                    # Filter out the folder itself and only return actual files
                    files = [item for item in data['Contents'] if not item['Key'].endswith('/')]
                    logger.info(f'Found {len(files)} files after filtering for prefix "{prefix}"')

                    # Add these files to our collection
                    all_files.extend(files)
            except Exception as list_error:
                logger.error(f'Error listing objects with prefix "{prefix}": {list_error}')

        logger.info(f'Found a total of {len(all_files)} files across all prefixes')

        if not all_files:
            logger.error('No objects found in the bucket with any of the tried prefixes')

            # List all objects in the bucket to see what's available
            try:
                logger.info('Listing all objects in the bucket to debug...')
                all_objects_params = {
                    'Bucket': os.environ.get('AWS_S3_BUCKET')
                }

                all_objects_data = s3.list_objects_v2(**all_objects_params)
                logger.info(f'Found {len(all_objects_data.get("Contents", []))} total objects in the bucket')

                if all_objects_data.get('Contents') and len(all_objects_data['Contents']) > 0:
                    logger.info('Sample of objects in the bucket:')
                    for index, item in enumerate(all_objects_data['Contents'][:10]):
                        logger.info(f'{index + 1}. {item["Key"]} ({item["LastModified"]})')

                    # Check for files containing the user's name
                    name_patterns = ['AbdulWasay', 'Abdul', 'Wasay', 'CV']
                    for pattern in name_patterns:
                        matching_objects = [item for item in all_objects_data['Contents'] if pattern in item['Key']]
                        if matching_objects:
                            logger.info(f'Found {len(matching_objects)} objects containing "{pattern}":')
                            for index, item in enumerate(matching_objects[:5]):
                                logger.info(f'{index + 1}. {item["Key"]} ({item["LastModified"]})')

                            # Add these files to our collection
                            all_files.extend(matching_objects)
            except Exception as list_all_error:
                logger.error(f'Error listing all objects: {list_all_error}')

        # If we still have no files, return 404
        if not all_files:
            return jsonify({
                'error': 'No rewritten resumes found in the bucket',
                'message': 'The server could not find any resume files in the S3 bucket',
                'prefixesTried': prefixes_to_try
            }), 404

        # Log all files for debugging
        logger.info('All files found:')
        for index, file in enumerate(all_files):
            logger.info(f'{index + 1}. {file["Key"]} ({file["LastModified"]})')

        # Sort by LastModified date (newest first)
        all_files.sort(key=lambda x: x['LastModified'], reverse=True)

        # Log all files with their timestamps for debugging
        logger.info('All files sorted by modification date:')
        for index, file in enumerate(all_files[:5]):
            logger.info(f'{index + 1}. {file["Key"]} - {file["LastModified"]} ({file["LastModified"].isoformat()})')

        # Get the most recent file
        latest_file = all_files[0]
        logger.info(f'Latest file: {latest_file["Key"]}')
        logger.info(f'Last modified: {latest_file["LastModified"]} ({latest_file["LastModified"].isoformat()})')

        # Now fetch the content of this file
        get_params = {
            'Bucket': os.environ.get('AWS_S3_BUCKET'),
            'Key': latest_file['Key']
        }

        logger.info(f'Fetching file content with params: {json.dumps(get_params)}')

        try:
            # Try to get the object
            file_data = s3.get_object(**get_params)
            # Read the content once and store it
            file_content = file_data["Body"].read()
            logger.info(f'File content received, size: {len(file_content)}')

            try:
                # Try to parse the JSON
                json_content = json.loads(file_content.decode('utf-8'))
                logger.info('JSON parsed successfully')
                logger.info(f'JSON content keys: {list(json_content.keys())}')

                return jsonify(json_content)
            except json.JSONDecodeError as parse_error:
                logger.error(f'Error parsing JSON: {parse_error}')

                # Log the raw content for debugging
                raw_content = file_content.decode('utf-8')
                logger.info(f'Raw content (first 200 chars): {raw_content[:200]}')

                return jsonify({
                    'error': 'Error parsing resume data',
                    'message': str(parse_error),
                    'rawData': raw_content[:200] + '...'  # Send first 200 chars for debugging
                }), 500
        except Exception as get_error:
            logger.error(f'Error getting object: {get_error}')
            return jsonify({
                'error': 'Error getting object from S3',
                'message': str(get_error),
                'params': get_params
            }), 500
    except Exception as error:
        logger.error(f'Error fetching latest rewritten resume: {error}')
        return jsonify({
            'error': 'Error fetching latest rewritten resume',
            'message': str(error)
        }), 500
