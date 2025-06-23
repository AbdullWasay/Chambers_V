# Resume Optimizer Backend (Python)

This is the Python implementation of the Resume Optimizer backend. It provides the same functionality as the original Node.js version but implemented in Python using Flask.

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- AWS account with appropriate credentials

### Installation

1. Create a virtual environment (recommended):

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the server directory with the following content:

```
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=resume-craft-files-ai
PORT=3001
```

Replace the placeholder values with your actual AWS credentials.

## Running the Server

Start the server with:

```bash
python app.py
```

The server will run on port 3001 by default (or the port specified in your `.env` file).

## API Endpoints

The server provides the following endpoints:

- `POST /upload`: Upload a resume file to S3
- `GET /rewritten`: Get a rewritten resume by key
- `GET /list-rewritten-resumes`: List all rewritten resumes
- `GET /latest-rewritten-resume`: Get the latest rewritten resume
- `POST /generate`: Generate a resume in various formats (PDF, DOCX, TXT)
- `GET /very-simple-pdf`: Generate a simple PDF for testing

## Lambda Function

The Lambda function (`lambda_function.py` in the project root) is triggered when a file is uploaded to the S3 bucket. It:

1. Extracts text from the PDF using Amazon Textract
2. Sends the extracted text to Amazon Bedrock for optimization
3. Saves the optimized resume as JSON in S3

## Project Structure

- `app.py`: Main server file
- `controllers/`: Contains controller modules
  - `resume_controller.py`: Handles resume upload and retrieval
  - `aws_controller.py`: Handles AWS S3 operations
  - `generate_controller.py`: Handles resume generation in various formats
- `temp/`: Temporary directory for generated files

## Differences from Node.js Version

This Python implementation provides the same functionality as the original Node.js version, with a few differences:

- Uses Flask instead of Express.js
- Uses boto3 instead of the AWS SDK for JavaScript
- Uses ReportLab for PDF generation instead of PDFKit
- Uses Python's built-in file handling instead of Node.js streams

## Troubleshooting

If you encounter any issues:

1. Check that your AWS credentials are correct in the `.env` file
2. Ensure the S3 bucket exists and you have appropriate permissions
3. Check the server logs for detailed error messages

### Common Issues

#### S3 Stream Errors

If you see errors related to "seek" or issues with reading S3 object streams, this is likely due to how boto3 handles S3 object streams. The solution is to read the content once and store it in a variable, rather than trying to read from the stream multiple times.

For example, instead of:

```python
file_data = s3.get_object(**params)
logger.info(f'Size: {len(file_data["Body"].read())}')
file_data['Body'].seek(0)  # Reset position
content = file_data['Body'].read().decode('utf-8')
```

Use:

```python
file_data = s3.get_object(**params)
file_content = file_data['Body'].read()  # Read once
logger.info(f'Size: {len(file_content)}')
content = file_content.decode('utf-8')
```

#### Testing the Server

You can use the included `test_server.py` script to test the server:

```bash
python test_server.py
```

This will test the basic endpoints to ensure they're working correctly.

## License

This project is licensed under the MIT License.
