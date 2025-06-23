import json
import boto3
import os
import urllib.parse
import time

# Initialize AWS clients
s3 = boto3.client('s3')
textract = boto3.client('textract')
bedrock = boto3.client('bedrock-runtime', region_name='us-east-2')  # Bedrock requires explicit region


def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(record['s3']['object']['key'])  # Decode S3 key correctly

        # Initialize job description
        job_description = ""

        # Get the S3 object metadata to check for job description
        try:
            # Get the S3 object metadata
            response = s3.head_object(Bucket=bucket, Key=key)

            # Log all metadata for debugging
            print(f"S3 object metadata: {response.get('Metadata', {})}")

            # Check if job description is directly in the metadata
            if 'Metadata' in response and 'job-description' in response['Metadata']:
                # URL-decode the job description
                encoded_job_description = response['Metadata']['job-description']
                try:
                    job_description = urllib.parse.unquote(encoded_job_description)
                    print(f"Job description found in metadata (decoded): {job_description[:100]}...")  # Log first 100 chars
                except Exception as decode_error:
                    print(f"Error decoding job description: {str(decode_error)}")
                    job_description = encoded_job_description
                    print(f"Using encoded job description: {job_description[:100]}...")  # Log first 100 chars

            # Check if job description is stored as a separate object
            elif 'Metadata' in response and 'has-job-description' in response['Metadata'] and response['Metadata']['has-job-description'] == 'true':
                job_desc_key = response['Metadata'].get('job-description-key')
                if job_desc_key:
                    print(f"Job description is stored as a separate object: {job_desc_key}")
                    try:
                        # Get the job description from S3
                        job_desc_response = s3.get_object(Bucket=bucket, Key=job_desc_key)
                        job_description = job_desc_response['Body'].read().decode('utf-8')
                        print(f"Job description retrieved from separate object: {job_description[:100]}...")  # Log first 100 chars
                    except Exception as e:
                        print(f"Error retrieving job description from separate object: {str(e)}")
            else:
                print("No job description found in metadata")
        except Exception as e:
            print(f"Error getting object metadata: {str(e)}")

        # Check if job description is included directly in the event (fallback)
        if not job_description and 'jobDescription' in event:
            job_description = event['jobDescription']
            print(f"Job description found in event: {job_description[:100]}...")  # Log first 100 chars

        print(f"Processing file from S3: {key}")

        try:
            file_extension = key.split('.')[-1].lower()

            if file_extension == 'pdf':
                # Start Textract asynchronous job
                response = textract.start_document_text_detection(
                    DocumentLocation={'S3Object': {'Bucket': bucket, 'Name': key}}
                )
                job_id = response['JobId']
                print(f"Started Textract job for PDF: {job_id}")

                # Wait for Textract job to complete (Simple polling, not production style)
                while True:
                    result = textract.get_document_text_detection(JobId=job_id)
                    status = result['JobStatus']
                    print(f"Textract job status: {status}")

                    if status in ['SUCCEEDED', 'FAILED']:
                        break
                    time.sleep(2)  # Wait before checking again

                if status == 'FAILED':
                    raise Exception('Textract job failed.')

                # Extract all text lines from Textract response
                extracted_text = ""
                for block in result['Blocks']:
                    if block['BlockType'] == 'LINE':
                        extracted_text += block['Text'] + "\n"

                print("Extracted text from document successfully.")

                # Prepare prompt for Bedrock
                prompt = (
                    "You are a professional resume parser and formatter. "
                    "Format the following resume content into a structured format using EXACTLY this JSON structure:\n\n"
                    "{\n"
                    "  'basics': {\n"
                    "    'name': '',\n"
                    "    'title': '',\n"
                    "    'email': '',\n"
                    "    'phone': '',\n"
                    "    'location': '',\n"
                    "    'summary': ''\n"
                    "  },\n"
                    "  'experience': [\n"
                    "    {\n"
                    "      'title': '',\n"
                    "      'company': '',\n"
                    "      'location': '',\n"
                    "      'startDate': '',\n"
                    "      'endDate': '',\n"
                    "      'highlights': []\n"
                    "    }\n"
                    "  ],\n"
                    "  'education': [\n"
                    "    {\n"
                    "      'degree': '',\n"
                    "      'school': '',\n"
                    "      'location': '',\n"
                    "      'graduationDate': ''\n"
                    "    }\n"
                    "  ],\n"
                    "  'skills': [\n"
                    "    {\n"
                    "      'category': '',\n"
                    "      'items': []\n"
                    "    }\n"
                    "  ],\n"
                    "  'projects': [\n"
                    "    {\n"
                    "      'name': '',\n"
                    "      'description': '',\n"
                    "      'technologies': [],\n"
                    "      'link': ''\n"
                    "    }\n"
                    "  ],\n"
                    "  'certifications': [\n"
                    "    {\n"
                    "      'name': '',\n"
                    "      'issuer': '',\n"
                    "      'date': '',\n"
                    "      'link': ''\n"
                    "    }\n"
                    "  ],\n"
                    "  'achievements': [\n"
                    "    {\n"
                    "      'title': '',\n"
                    "      'organization': '',\n"
                    "      'date': '',\n"
                    "      'description': ''\n"
                    "    }\n"
                    "  ],\n"
                    "  'languages': [\n"
                    "    {\n"
                    "      'language': '',\n"
                    "      'proficiency': ''\n"
                    "    }\n"
                    "  ],\n"
                    "  'volunteer': [\n"
                    "    {\n"
                    "      'organization': '',\n"
                    "      'role': '',\n"
                    "      'startDate': '',\n"
                    "      'endDate': '',\n"
                    "      'description': ''\n"
                    "    }\n"
                    "  ],\n"
                    "  'publications': [\n"
                    "    {\n"
                    "      'title': '',\n"
                    "      'publisher': '',\n"
                    "      'date': '',\n"
                    "      'link': ''\n"
                    "    }\n"
                    "  ],\n"
                    "  'interests': []\n"
                    "}\n\n"
                    "Update the resume with the following enhancements:\n"
                    "- Change the title at the top to reflect the target job role/industry (3-4 words).\n"
                    "- Rewrite the summary to highlight relevant strengths and experience (50–75 words, 3–4 sentences).\n"
                    "- For each work experience, update the role title to match the target job's industry/field if applicable, and include exactly 4 bullet points that describe transferable skills and achievements relevant to the target job. Each bullet point must be exactly 2 sentences long.\n"
                    "- Update the skills section with 5–7 relevant technical and soft skills (each with a brief description).\n"
                    "\n"
                    "Rules:\n"
                    "1. All dates must follow 'YYYY-MM' format.\n"
                    "2. Language must be professional and concise.\n"
                    "3. Include ALL sections, even if empty (use empty arrays [] or empty strings '').\n"
                    "4. Use 'Present' as the end date for current roles.\n"
                    "5. Group skills into appropriate categories.\n"
                    "6. Extract any projects mentioned in experience into the projects section.\n"
                    "7. Include all certifications, awards, and achievements found in the input.\n"
                    + ('' if not job_description else '8. IMPORTANT: Tailor the resume specifically for the following job description:\n' + job_description + '\n')
                    + "Here's the content to format:\n\n"
                    + extracted_text
                )

                # Log the prompt to verify job description is included
                if job_description:
                    print(f"Job description is included in prompt. Prompt excerpt: ...8. IMPORTANT: Tailor the resume specifically for the following job description:\n{job_description[:100]}...")
                else:
                    print("No job description included in prompt.")

                # Call Bedrock Nova Pro to rewrite resume
                bedrock_response = bedrock.invoke_model(
                    body=json.dumps({
                        "messages": [
                            {
                                "role": "user",
                                "content": [{"text": prompt}]  # Corrected content structure
                            }
                        ]
                    }),
                    modelId="arn:aws:bedrock:us-east-2:542993749514:inference-profile/us.amazon.nova-pro-v1:0",
                    accept="application/json",
                    contentType="application/json"
                )
                bedrock_body = json.loads(bedrock_response['body'].read())
                print(f"Bedrock Response Body: {bedrock_body}")  # CRUCIAL: Add this line

                # Extract the text and remove markdown code blocks
                raw_text = bedrock_body['output']['message']['content'][0]['text']
                rewritten_text = raw_text.replace('```json\n', '').replace('\n```', '').strip()

                print("Received rewritten resume from Bedrock.")

                # Parse the response to ensure it's valid JSON
                try:
                    formatted_resume = json.loads(rewritten_text)
                    # Save formatted JSON to S3
                    output_bucket = os.environ['OUTPUT_BUCKET']
                    new_key = key.replace('textract-output/', 'rewritten-resumes/').replace('.pdf', '.json')

                    s3.put_object(
                        Bucket=output_bucket,
                        Key=new_key,
                        Body=json.dumps(formatted_resume, indent=2).encode('utf-8'),
                        ContentType='application/json'
                    )

                    print(f"Saved formatted resume to S3 at {new_key}.")

                    return {
                        'statusCode': 200,
                        'body': json.dumps({
                            'message': f'Rewritten resume saved to {new_key}',
                            'data': formatted_resume
                        })
                    }
                except json.JSONDecodeError as e:
                    print(f"Error parsing Bedrock response as JSON: {e}")
                    print(f"Raw text received: {rewritten_text}")  # Add this line for debugging
                    return {
                        'statusCode': 500,
                        'body': json.dumps('Error formatting resume structure')
                    }
            else:
                raise ValueError("Unsupported file format. Only PDF supported for now.")

        except Exception as e:
            print(f"Error processing file {key}: {e}")
            return {
                'statusCode': 500,
                'body': json.dumps(f'Error processing the file: {str(e)}')
            }

    return {
        'statusCode': 200,
        'body': json.dumps('Done!')
    }




