#!/usr/bin/env python
"""
Script to run both the PDF service and the Flask server
"""
import os
import sys
import subprocess
import time
import logging
import requests
import atexit
from app import app

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Global variable to store the PDF service process
pdf_service_process = None

def start_pdf_service():
    """Start the PDF generation service"""
    global pdf_service_process

    logger.info("Starting PDF generation service...")

    # Get the directory of the current script
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Command to start the PDF service
    service_cmd = ["node", "server.js"]

    try:
        # Start the service as a subprocess
        pdf_service_process = subprocess.Popen(
            service_cmd,
            cwd=current_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )

        logger.info(f"Service process started with PID: {pdf_service_process.pid}")

        # Start a thread to read and log the service output
        import threading

        def log_output(pipe, log_func):
            for line in pipe:
                log_func(f"[Service] {line.strip()}")

        threading.Thread(target=log_output, args=(pdf_service_process.stdout, logger.info), daemon=True).start()
        threading.Thread(target=log_output, args=(pdf_service_process.stderr, logger.error), daemon=True).start()

        logger.info("Waiting for PDF service to start...")
        max_retries = 30
        retry_interval = 1  # seconds

        for i in range(max_retries):
            try:
                # Check if the process is still running
                if pdf_service_process.poll() is not None:
                    exit_code = pdf_service_process.poll()
                    error_output = pdf_service_process.stderr.read() if pdf_service_process.stderr else "No error output available"
                    raise Exception(f"PDF service failed to start (exit code: {exit_code}). Error: {error_output}")

                # Try to connect to the service
                # First try the test-download endpoint
                try:
                    response = requests.get("http://localhost:3001/test-download?format=txt", timeout=1)
                    if response.status_code == 200:
                        logger.info("PDF service is up and running!")
                        return True
                except requests.RequestException:
                    # If that fails, try the very-simple-pdf endpoint
                    try:
                        response = requests.head("http://localhost:3001/very-simple-pdf", timeout=1)
                        if response.status_code == 200:
                            logger.info("PDF service is up and running (via very-simple-pdf endpoint)!")
                            return True
                    except requests.RequestException:
                        pass

            except Exception as e:
                logger.debug(f"Error checking PDF service: {str(e)}")

            # Service not ready yet, wait and retry
            time.sleep(retry_interval)
            logger.info(f"Waiting for PDF service... (attempt {i+1}/{max_retries})")

        # If we get here, the service didn't start in time
        logger.error("Timed out waiting for PDF service to start")
        return False

    except Exception as e:
        logger.error(f"Failed to start PDF service: {str(e)}")
        return False

def stop_pdf_service():
    """Stop the PDF generation service"""
    global pdf_service_process

    if pdf_service_process:
        logger.info(f"Stopping PDF service (PID: {pdf_service_process.pid})...")

        try:
            # Try to terminate gracefully first
            pdf_service_process.terminate()

            # Wait for the process to terminate
            pdf_service_process.wait(timeout=5)
            logger.info("PDF service stopped successfully")
        except subprocess.TimeoutExpired:
            # Force kill if it doesn't terminate in time
            logger.warning("PDF service did not terminate gracefully, forcing shutdown...")
            pdf_service_process.kill()
            logger.info("PDF service forcefully stopped")
        except Exception as e:
            logger.error(f"Error stopping PDF service: {str(e)}")

# Register the cleanup function to be called when the script exits
atexit.register(stop_pdf_service)

if __name__ == '__main__':
    # Start the PDF service first
    if start_pdf_service():
        # Then start the Flask server
        logger.info("Starting Flask server...")
        app.run(host='0.0.0.0', port=3002, debug=True)
    else:
        logger.error("Failed to start PDF service. Exiting.")
        sys.exit(1)
