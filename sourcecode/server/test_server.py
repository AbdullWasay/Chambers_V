#!/usr/bin/env python
"""
Simple script to test the Flask server
"""
import requests
import json
import os
import sys

BASE_URL = 'http://localhost:3001'

def test_very_simple_pdf():
    """Test the very-simple-pdf endpoint"""
    print("Testing very-simple-pdf endpoint...")
    response = requests.get(f"{BASE_URL}/very-simple-pdf")
    
    if response.status_code == 200:
        # Save the PDF to a file
        with open('test-simple.pdf', 'wb') as f:
            f.write(response.content)
        print("✅ very-simple-pdf endpoint works! PDF saved to test-simple.pdf")
    else:
        print(f"❌ very-simple-pdf endpoint failed with status code {response.status_code}")
        print(f"Response: {response.text}")

def test_list_rewritten_resumes():
    """Test the list-rewritten-resumes endpoint"""
    print("Testing list-rewritten-resumes endpoint...")
    response = requests.get(f"{BASE_URL}/list-rewritten-resumes")
    
    if response.status_code == 200:
        print("✅ list-rewritten-resumes endpoint works!")
        print(f"Found {len(response.json())} rewritten resumes")
    else:
        print(f"❌ list-rewritten-resumes endpoint failed with status code {response.status_code}")
        print(f"Response: {response.text}")

def test_latest_rewritten_resume():
    """Test the latest-rewritten-resume endpoint"""
    print("Testing latest-rewritten-resume endpoint...")
    response = requests.get(f"{BASE_URL}/latest-rewritten-resume")
    
    if response.status_code == 200:
        print("✅ latest-rewritten-resume endpoint works!")
        print(f"Resume keys: {list(response.json().keys())}")
    else:
        print(f"❌ latest-rewritten-resume endpoint failed with status code {response.status_code}")
        print(f"Response: {response.text}")

def main():
    """Run all tests"""
    print("Testing Flask server at", BASE_URL)
    
    # Test very-simple-pdf endpoint
    test_very_simple_pdf()
    
    # Test list-rewritten-resumes endpoint
    test_list_rewritten_resumes()
    
    # Test latest-rewritten-resume endpoint
    test_latest_rewritten_resume()
    
    print("All tests completed!")

if __name__ == '__main__':
    main()
