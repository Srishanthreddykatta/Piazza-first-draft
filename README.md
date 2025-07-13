# Document Upload & AI Extraction System

A full-stack web application that provides drag-and-drop document upload functionality with automatic extraction of names and email addresses using Google's Gemini API 2.0 Flash.

## Features

- **Drag & Drop Interface**: Modern, responsive React frontend with intuitive file upload
- **File Support**: PDF and PNG documents (single-page only, max 10MB)
- **AI-Powered Extraction**: Uses Gemini API 2.0 Flash for accurate name and email extraction
- **Real-time Processing**: Instant feedback and results display
- **Error Handling**: Comprehensive validation and error messages
- **Cross-Origin Support**: CORS-enabled for frontend-backend communication

## Technology Stack

### Frontend
- **React 18** with Vite build system
- **Tailwind CSS** for styling
- **shadcn/ui** components for modern UI
- **Lucide React** icons
- **Framer Motion** for animations

### Backend
- **Flask** web framework
- **Google Generative AI** (Gemini 2.0 Flash)
- **PyPDF2** for PDF text extraction
- **Pillow** for image processing
- **Flask-CORS** for cross-origin requests

## LLM Requirements

The system uses **Google Gemini API 2.0 Flash** for:

1. **PDF Text Extraction**: Direct text extraction from PDF documents
2. **Image OCR**: Optical Character Recognition for PNG images
3. **Information Extraction**: AI-powered identification of names and email addresses
4. **Confidence Scoring**: Reliability assessment of extracted data

### Why Gemini 2.0 Flash?

- **Multimodal Capabilities**: Handles both text and image inputs
- **High Accuracy**: Advanced language understanding for information extraction
- **Fast Processing**: Optimized for real-time applications
- **Cost Effective**: Efficient API usage for document processing

## Project Structure

```
document-upload-system/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
├── backend/                 # Flask application
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   │   └── extraction.py  # Document processing logic
│   │   ├── models/         # Database models
│   │   ├── static/         # Built frontend files
│   │   └── main.py         # Flask application
│   ├── venv/               # Python virtual environment
│   └── requirements.txt    # Python dependencies
└── README.md               # This file
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.11+
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure API key**:
   - Update the `GEMINI_API_KEY` in `src/routes/extraction.py`
   - Replace `"AIzaSyAmhef-_cGsFZgcyM9x7SgvwBYljvo0T8w"` with your actual API key

5. **Start the Flask server**:
   ```bash
   python src/main.py
   ```
   The backend will run on `http://localhost:5002`

### Frontend Setup (Development)

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Production Deployment

For production, the frontend is built and served by the Flask backend:

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Copy build files to Flask static directory**:
   ```bash
   cp -r dist/* ../backend/src/static/
   ```

3. **Start the Flask server**:
   ```bash
   cd ../backend
   source venv/bin/activate
   python src/main.py
   ```

The complete application will be available at `http://localhost:5002`

## API Endpoints

### POST /api/extract
Processes uploaded documents and extracts name and email information.

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body: file (PDF or PNG, max 10MB)

**Response**:
```json
{
  "success": true,
  "name": "John Smith",
  "email": "john.smith@example.com",
  "confidence": 0.95,
  "raw_text": "Extracted text preview...",
  "file_type": "pdf",
  "extraction_method": "gemini_api"
}
```

### GET /api/health
Health check endpoint for monitoring.

**Response**:
```json
{
  "status": "healthy",
  "gemini_api": "configured",
  "supported_formats": ["PDF", "PNG"],
  "max_file_size": "10MB"
}
```

## Usage

1. **Access the application** at `http://localhost:5002`
2. **Upload a document** by:
   - Dragging and dropping a PDF or PNG file into the upload zone
   - Clicking "Browse Files" to select a file
3. **View results** in the "Extracted Information" panel
4. **Review confidence score** and raw text preview

## File Validation

- **Supported formats**: PDF, PNG only
- **File size limit**: 10MB maximum
- **Page restriction**: Single-page documents only
- **Content requirements**: Must contain extractable text

## Error Handling

The system provides comprehensive error handling for:
- Invalid file formats
- File size exceeded
- Multi-page documents
- Network connectivity issues
- API rate limits
- Extraction failures

## Security Considerations

- **File validation**: Strict format and size checking
- **CORS configuration**: Controlled cross-origin access
- **API key protection**: Server-side API key storage
- **Input sanitization**: Safe file processing
- **Error messages**: No sensitive information exposure

## Testing

Test the system with sample documents containing:
- Clear name and email information
- Various PDF layouts and fonts
- PNG images with text content
- Edge cases (missing information, multiple contacts)

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure valid Gemini API key is configured
2. **CORS Issues**: Verify Flask-CORS is properly installed
3. **File Upload Fails**: Check file format and size limits
4. **Extraction Accuracy**: Try documents with clearer text formatting

### Debug Mode

Enable Flask debug mode for development:
```python
app.run(host='0.0.0.0', port=5002, debug=True)
```

## License

This project is provided as-is for demonstration purposes.

## Support

For issues or questions, please refer to the documentation or check the console logs for detailed error messages.

