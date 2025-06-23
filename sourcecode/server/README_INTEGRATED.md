# Integrated Resume Optimizer Backend

This is the integrated version of the Resume Optimizer backend, which combines both the Python Flask server and the PDF generation service into a single application that can be started with one command.

## Overview

The system consists of two main components:

1. **Python Flask Server**: Handles most of the backend functionality including resume processing, AWS interactions, and API endpoints.

2. **PDF Generation Service**: Handles PDF generation and other document format conversions.

## How It Works

The integrated system:

1. Starts the PDF generation service as a background process
2. Waits for the PDF service to be ready
3. Then starts the Flask server
4. When the Flask server is stopped, it automatically stops the PDF service

## Setup

### Prerequisites

- Python 3.8 or higher
- AWS account with appropriate credentials

### Installation

1. Install Python dependencies:

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

## Running the Application


```bash
python run.py
```

This will:
1. Start the server on port 3002
2. Log output from  servers to the console

## API Endpoints

The system provides the following API endpoints:

### Flask Server (Port 3002)

- `POST /upload`: Upload a resume file to S3
- `GET /rewritten`: Get a rewritten resume by key
- `GET /list-rewritten-resumes`: List all rewritten resumes
- `GET /latest-rewritten-resume`: Get the latest rewritten resume
- `POST /generate`: Generate a resume in various formats (PDF, DOCX, TXT)
- `GET /very-simple-pdf`: Generate a simple PDF for testing

### Node.js Server (Port 3001)

- `POST /simple-pdf`: Generate a PDF from HTML content
- `GET /test-download`: Test file download functionality
- `GET /direct-pdf`: Generate a sample PDF resume

## Troubleshooting

If you encounter any issues:

1. Check that both servers are running:
   - Node.js server should be on port 3001
   - Flask server should be on port 3002

2. Check the logs for any error messages

3. Make sure your AWS credentials are correct in the `.env` file



