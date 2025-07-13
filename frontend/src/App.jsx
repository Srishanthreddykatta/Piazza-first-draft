import { useState, useCallback } from 'react'
import { Upload, FileText, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import './App.css'

function App() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const validateFile = (file) => {
    const allowedTypes = ['application/pdf', 'image/png']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF and PNG files are allowed'
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB'
    }

    return null
  }

  const processFile = async (file) => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process file')
      }

      const data = await response.json()
      setExtractedData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const validationError = validateFile(droppedFile)
      
      if (validationError) {
        setError(validationError)
        return
      }

      setFile(droppedFile)
      processFile(droppedFile)
    }
  }, [])

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const validationError = validateFile(selectedFile)
      
      if (validationError) {
        setError(validationError)
        return
      }

      setFile(selectedFile)
      processFile(selectedFile)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setExtractedData(null)
    setError(null)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Document Upload & AI Extraction
          </h1>
          <p className="text-lg text-gray-600">
            Upload PDF or PNG documents to automatically extract names and email addresses
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Document
              </CardTitle>
              <CardDescription>
                Drag and drop a PDF or PNG file, or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.png"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {loading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-600">Processing document...</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center">
                    {file.type === 'application/pdf' ? (
                      <FileText className="h-12 w-12 text-red-500 mb-4" />
                    ) : (
                      <Image className="h-12 w-12 text-green-500 mb-4" />
                    )}
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetUpload}
                      className="mt-2"
                    >
                      Upload Different File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop your document here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports PDF and PNG files (max 10MB)
                    </p>
                    <Button variant="outline">Browse Files</Button>
                  </div>
                )}
              </div>

              {error && (
                <Alert className="mt-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Extracted Information
              </CardTitle>
              <CardDescription>
                AI-powered extraction results using Gemini API 2.0 Flash
              </CardDescription>
            </CardHeader>
            <CardContent>
              {extractedData ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-medium text-green-900 mb-2">
                      Extraction Successful
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Name:
                        </label>
                        <p className="text-gray-900">
                          {extractedData.name || 'Not found'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Email:
                        </label>
                        <p className="text-gray-900">
                          {extractedData.email || 'Not found'}
                        </p>
                      </div>
                      {extractedData.confidence && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Confidence:
                          </label>
                          <p className="text-gray-900">
                            {Math.round(extractedData.confidence * 100)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {extractedData.raw_text && (
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Extracted Text Preview
                      </h4>
                      <p className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                        {extractedData.raw_text.substring(0, 500)}
                        {extractedData.raw_text.length > 500 && '...'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    Upload a document to see extracted information
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Drag & Drop</h3>
                  <p className="text-sm text-gray-600">
                    Easy file upload with drag and drop support
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">PDF & PNG Support</h3>
                  <p className="text-sm text-gray-600">
                    Process both PDF documents and PNG images
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">AI Extraction</h3>
                  <p className="text-sm text-gray-600">
                    Powered by Gemini API 2.0 Flash for accurate results
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App

