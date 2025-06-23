import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import boto3
from dotenv import load_dotenv
import tempfile
import uuid
import shutil
from pathlib import Path

# Import controllers
from controllers.resume_controller import upload_resume, get_rewritten_resume
from controllers.aws_controller import list_rewritten_resumes, get_latest_rewritten_resume
from controllers.generate_controller import generate_resume, generate_pdf, generate_docx, generate_txt

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    logger.info(f"Loading environment variables from {dotenv_path}")
    load_dotenv(dotenv_path)
else:
    logger.error(f"ERROR: .env file not found at {dotenv_path}")
    # Create a sample .env file with instructions
    sample_env_content = """# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=resume-craft-files-ai
PORT=3001
"""
    with open(os.path.join(os.path.dirname(__file__), '.env.sample'), 'w') as f:
        f.write(sample_env_content)
    logger.info('Created .env.sample file with instructions')

# Log environment variables for debugging
logger.info('Environment Variables:')
logger.info(f"AWS_REGION: {os.environ.get('AWS_REGION')}")
logger.info(f"AWS_S3_BUCKET: {os.environ.get('AWS_S3_BUCKET')}")
logger.info(f"AWS_ACCESS_KEY_ID: {'****' + os.environ.get('AWS_ACCESS_KEY_ID', '')[-4:] if os.environ.get('AWS_ACCESS_KEY_ID') else 'Not set'}")
logger.info(f"AWS_SECRET_ACCESS_KEY: {'****' if os.environ.get('AWS_SECRET_ACCESS_KEY') else 'Not set'}")
logger.info(f"PORT: {os.environ.get('PORT')}")

# Helper function to format dates
def format_date(date_string):
    if not date_string:
        return ''

    try:
        # Parse YYYY-MM format
        year, month = date_string.split('-')
        if year and month:
            date = datetime(int(year), int(month), 1)
            month_name = date.strftime('%B')
            return f"{month_name} {year}"
        return date_string
    except Exception as error:
        logger.error(f'Error formatting date: {error}')
        return date_string

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure maximum request size (50MB)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

# Create temp directory if it doesn't exist
temp_dir = os.path.join(os.path.dirname(__file__), 'temp')
os.makedirs(temp_dir, exist_ok=True)

# Middleware to log request details
@app.before_request
def log_request_info():
    logger.info(f"{request.method} {request.url}")
    logger.info(f"Content-Type: {request.headers.get('Content-Type')}")
    logger.info(f"Request body type: {type(request.get_json(silent=True))}")
    if request.is_json:
        logger.info(f"Request body keys: {request.get_json().keys() if request.get_json() else 'None'}")

# Routes
@app.route('/upload', methods=['POST'])
def handle_upload():
    return upload_resume(request)

@app.route('/rewritten', methods=['GET'])
def handle_get_rewritten():
    return get_rewritten_resume(request)

@app.route('/list-rewritten-resumes', methods=['GET'])
def handle_list_rewritten():
    return list_rewritten_resumes()

@app.route('/latest-rewritten-resume', methods=['GET'])
def handle_latest_rewritten():
    return get_latest_rewritten_resume(request)

@app.route('/generate', methods=['POST'])
def handle_generate():
    return generate_resume(request)

@app.route('/check-ats-compatibility', methods=['POST'])
def handle_ats_check():
    try:
        logger.info('ATS compatibility check endpoint called')
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        resume_data = data.get('resume')
        job_description = data.get('jobDescription')

        if not resume_data:
            return jsonify({'error': 'No resume data provided'}), 400

        # Perform ATS compatibility check using the improved controller
        from controllers.improved_ats_controller import check_ats_compatibility as improved_check_ats_compatibility
        result = improved_check_ats_compatibility(resume_data, job_description)

        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as error:
        logger.error(f'Error in ATS compatibility check: {error}')
        return jsonify({
            'error': 'ATS compatibility check failed',
            'message': str(error)
        }), 500

# Very simple PDF download endpoint
@app.route('/very-simple-pdf', methods=['GET'])
def very_simple_pdf():
    try:
        logger.info('Very simple PDF endpoint called')

        # Create a temporary directory for the PDF
        temp_dir = os.path.join(os.path.dirname(__file__), 'temp')
        os.makedirs(temp_dir, exist_ok=True)

        # Generate a unique filename
        timestamp = int(datetime.now().timestamp())
        output_path = os.path.join(temp_dir, f"simple-resume-{timestamp}.pdf")

        # Create a simple PDF using ReportLab
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4

        c = canvas.Canvas(output_path, pagesize=A4)
        c.setFont("Helvetica", 25)
        c.drawString(100, 750, "Sample Resume")
        c.setFont("Helvetica", 15)
        c.drawString(100, 700, "This is a sample PDF file for testing download functionality.")
        c.setFont("Helvetica", 12)
        c.drawString(100, 650, "If you can see this text, the PDF download is working correctly.")
        c.setFont("Helvetica", 10)
        c.drawString(100, 600, f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        c.save()

        logger.info('Simple PDF created successfully')

        # Send the file
        return send_file(
            output_path,
            as_attachment=True,
            download_name="simple-resume.pdf",
            mimetype="application/pdf"
        )
    except Exception as error:
        logger.error(f'Error in very simple PDF endpoint: {error}')
        return jsonify({
            'error': 'Simple PDF generation failed',
            'message': str(error)
        }), 500

# Error handling middleware
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {str(e)}")
    return jsonify({"error": "Something went wrong!"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=port, debug=True)
