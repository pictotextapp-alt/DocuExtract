import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PostResultsAd, SidebarAd, MobileBottomAd } from "@/components/AdUnit";
import { Upload, FileText, Download, Copy, CheckCircle, HelpCircle, Mail, VideoIcon, Eye } from "lucide-react";

interface OCRResult {
  extractedText: string;
  confidence: number;
  wordCount: number;
  processingTime: number;
}

interface RecentUpload {
  id: string;
  name: string;
  date: string;
  type: 'pdf' | 'image';
}

export function OCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recentUploads: RecentUpload[] = [
    { id: "1", name: "invoice.pdf", date: "2 hours ago", type: "pdf" },
    { id: "2", name: "receipt.jpg", date: "1 day ago", type: "image" },
    { id: "3", name: "contract.pdf", date: "3 days ago", type: "pdf" },
  ];

  const handleFileSelect = (file: File) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
      setOcrResult(null); // Clear previous results
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const processOCR = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate OCR processing with progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock OCR result - in real implementation, this would be an API call
      const mockResult: OCRResult = {
        extractedText: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
        confidence: 94.2,
        wordCount: 156,
        processingTime: 2.3
      };

      setProgress(100);
      setOcrResult(mockResult);
    } catch (error) {
      console.error('OCR processing failed:', error);
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const copyToClipboard = () => {
    if (ocrResult) {
      navigator.clipboard.writeText(ocrResult.extractedText);
    }
  };

  const downloadText = () => {
    if (ocrResult) {
      const blob = new Blob([ocrResult.extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-text.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (bytes: number) => {
    return bytes < 1024 * 1024 
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-background font-roboto">
      {/* Header */}
      <header className="bg-card shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <span className="material-icons text-primary text-2xl">document_scanner</span>
              <h1 className="text-xl font-medium text-foreground">OCR Scanner</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Home</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Upload Document for OCR</CardTitle>
              </CardHeader>
              <CardContent>
                {/* File Dropzone */}
                <div 
                  className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="file-dropzone"
                >
                  <div className="space-y-4">
                    <Upload className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-foreground">Drop your image here or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, PDF files up to 10MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileInputChange}
                      data-testid="file-input"
                    />
                    <Button variant="default" data-testid="button-choose-file">
                      Choose File
                    </Button>
                  </div>
                </div>

                {/* File Preview */}
                {selectedFile && (
                  <div className="mt-4" data-testid="file-preview">
                    <div className="flex items-center justify-between bg-muted p-4 rounded-md">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        data-testid="button-remove-file"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                {/* Process Button */}
                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    disabled={!selectedFile || isProcessing}
                    onClick={processOCR}
                    data-testid="button-process-ocr"
                  >
                    <span className="material-icons mr-2">psychology</span>
                    {isProcessing ? 'Processing...' : 'Process with OCR'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Processing Indicator */}
            {isProcessing && (
              <Card data-testid="processing-indicator">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <div>
                      <h3 className="font-medium text-foreground">Processing your document...</h3>
                      <p className="text-sm text-muted-foreground">This may take a few moments depending on document size</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={progress} className="w-full" data-testid="processing-progress" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* OCR Results */}
            {ocrResult && (
              <Card data-testid="ocr-results">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Extracted Text</CardTitle>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={copyToClipboard}
                        data-testid="button-copy-text"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={downloadText}
                        data-testid="button-download-text"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-4 bg-muted max-h-96 overflow-y-auto">
                    <p className="text-foreground whitespace-pre-wrap font-mono text-sm" data-testid="extracted-text">
                      {ocrResult.extractedText}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Confidence: <strong data-testid="confidence">{ocrResult.confidence}%</strong></span>
                    <span>Words detected: <strong data-testid="word-count">{ocrResult.wordCount}</strong></span>
                    <span>Processing time: <strong data-testid="processing-time">{ocrResult.processingTime}s</strong></span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Post Results Ad - Only show after OCR results are displayed */}
            <PostResultsAd show={!!ocrResult} />
            
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground">High accuracy OCR</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground">Multiple file formats</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground">Fast processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground">Secure & private</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground">Mobile friendly</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUploads.map((upload, index) => (
                    <div key={upload.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                      <div className="flex items-center space-x-2">
                        <span className="material-icons text-muted-foreground text-sm">
                          {upload.type === 'pdf' ? 'description' : 'image'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground" data-testid={`upload-name-${index}`}>{upload.name}</p>
                          <p className="text-xs text-muted-foreground" data-testid={`upload-date-${index}`}>{upload.date}</p>
                        </div>
                      </div>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-primary hover:text-primary/80 text-xs"
                        data-testid={`button-view-upload-${index}`}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Ad */}
            <SidebarAd />

            {/* Support Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a href="#" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors" data-testid="link-faq">
                    <HelpCircle className="h-4 w-4" />
                    <span className="text-sm">FAQ</span>
                  </a>
                  <a href="#" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors" data-testid="link-contact">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Contact Support</span>
                  </a>
                  <a href="#" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors" data-testid="link-tutorials">
                    <VideoIcon className="h-4 w-4" />
                    <span className="text-sm">Video Tutorials</span>
                  </a>
                </div>
              </CardContent>
            </Card>
            
          </div>
        </div>
      </div>

      {/* Mobile Bottom Ad */}
      <MobileBottomAd />

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="material-icons text-primary">document_scanner</span>
                <span className="font-medium">OCR Scanner</span>
              </div>
              <p className="text-gray-400 text-sm">Fast, accurate, and secure optical character recognition for all your document needs.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="#" className="text-gray-400 hover:text-white text-sm block transition-colors" data-testid="link-privacy">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm block transition-colors" data-testid="link-terms">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm block transition-colors" data-testid="link-api">API Documentation</a>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p data-testid="contact-email">support@ocrscanner.com</p>
                <p data-testid="contact-availability">Available 24/7</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p data-testid="copyright">&copy; 2024 OCR Scanner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
