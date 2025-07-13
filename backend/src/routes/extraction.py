import os
import io
import re
import base64
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import google.generativeai as genai
from PyPDF2 import PdfReader
from PIL import Image

extraction_bp = Blueprint('extraction', __name__)

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyAmhef-_cGsFZgcyM9x7SgvwBYljvo0T8w"
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-2.0-flash-exp')

ALLOWED_EXTENSIONS = {'pdf', 'png'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_content):
    """Extract text from PDF file"""
    try:
        pdf_reader = PdfReader(io.BytesIO(file_content))
        
        # Check if it's single page only
        if len(pdf_reader.pages) > 1:
            return None, "Only single-page documents are supported"
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        return text, None
    except Exception as e:
        return None, f"Error extracting text from PDF: {str(e)}"

def extract_text_from_image(file_content):
    """Extract text from image using Gemini Vision API"""
    try:
        # Convert file content to PIL Image
        image = Image.open(io.BytesIO(file_content))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Create prompt for text extraction
        prompt = """
        Please extract all text from this image. Return only the extracted text without any additional commentary or formatting.
        """
        
        # Use Gemini to extract text from image
        response = model.generate_content([prompt, image])
        
        if response.text:
            return response.text.strip(), None
        else:
            return "", "No text found in image"
            
    except Exception as e:
        return None, f"Error extracting text from image: {str(e)}"

def extract_name_and_email(text):
    """Use Gemini API to extract name and email from text"""
    try:
        prompt = f"""
        Analyze the following text and extract the person's name and email address.
        
        Text: {text}
        
        Please respond in the following JSON format only:
        {{
            "name": "extracted name or null if not found",
            "email": "extracted email or null if not found",
            "confidence": 0.95
        }}
        
        Rules:
        - Extract the full name of the person (first and last name if available)
        - Extract valid email addresses only
        - If multiple names/emails are found, extract the most prominent one
        - Set confidence between 0.0 and 1.0 based on how certain you are
        - Return null for name or email if not found
        - Respond with valid JSON only, no additional text
        """
        
        response = model.generate_content(prompt)
        
        if response.text:
            # Try to parse the JSON response
            import json
            try:
                result = json.loads(response.text.strip())
                return result, None
            except json.JSONDecodeError:
                # Fallback: try to extract using regex
                return extract_with_regex(text), None
        else:
            return extract_with_regex(text), None
            
    except Exception as e:
        # Fallback to regex extraction
        return extract_with_regex(text), f"Gemini API error: {str(e)}"

def extract_with_regex(text):
    """Fallback method using regex to extract name and email"""
    # Email regex pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    
    # Simple name extraction (this is basic and may need improvement)
    # Look for patterns like "Name: John Doe" or lines that look like names
    name_patterns = [
        r'Name:\s*([A-Za-z\s]+)',
        r'Full Name:\s*([A-Za-z\s]+)',
        r'^([A-Z][a-z]+\s+[A-Z][a-z]+)',  # First Last pattern at start of line
    ]
    
    name = None
    for pattern in name_patterns:
        matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
        if matches:
            name = matches[0].strip()
            break
    
    return {
        "name": name,
        "email": emails[0] if emails else None,
        "confidence": 0.7 if (name or emails) else 0.1
    }

@extraction_bp.route('/extract', methods=['POST'])
def extract_document():
    """Main endpoint for document extraction"""
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF and PNG files are allowed'}), 400
        
        # Read file content
        file_content = file.read()
        
        # Check file size
        if len(file_content) > MAX_FILE_SIZE:
            return jsonify({'error': 'File size exceeds 10MB limit'}), 400
        
        # Extract text based on file type
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        
        if file_extension == 'pdf':
            extracted_text, error = extract_text_from_pdf(file_content)
        elif file_extension == 'png':
            extracted_text, error = extract_text_from_image(file_content)
        else:
            return jsonify({'error': 'Unsupported file type'}), 400
        
        if error:
            return jsonify({'error': error}), 400
        
        if not extracted_text or extracted_text.strip() == "":
            return jsonify({'error': 'No text could be extracted from the document'}), 400
        
        # Extract name and email using Gemini API
        extraction_result, extraction_error = extract_name_and_email(extracted_text)
        
        # Prepare response
        response_data = {
            'success': True,
            'name': extraction_result.get('name'),
            'email': extraction_result.get('email'),
            'confidence': extraction_result.get('confidence', 0.5),
            'raw_text': extracted_text[:1000],  # Limit raw text for response size
            'file_type': file_extension,
            'extraction_method': 'gemini_api' if not extraction_error else 'regex_fallback'
        }
        
        if extraction_error:
            response_data['warning'] = f"Used fallback method: {extraction_error}"
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@extraction_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'gemini_api': 'configured',
        'supported_formats': ['PDF', 'PNG'],
        'max_file_size': '10MB'
    }), 200

