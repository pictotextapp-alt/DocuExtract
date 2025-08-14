import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          if (prev === 100) {
            toast({
              title: "Upload complete",
              description: `${file.name} has been uploaded successfully.`,
            });
          }
          return prev;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Upload Your Document</h1>
        <p className="text-xl text-slate-600">Drag and drop your image or click to browse. Supports PNG, JPG, PDF, and more.</p>
      </div>

      {/* Upload Zone */}
      <div 
        className={`upload-zone bg-white border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer mb-8 transition-all ${
          isDragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="upload-zone"
      >
        <div className="mb-6">
          <i className="fas fa-cloud-upload-alt text-6xl text-slate-400"></i>
        </div>
        <h3 className="text-2xl font-semibold text-slate-700 mb-4">Drop your files here</h3>
        <p className="text-slate-500 mb-6">or click to browse from your computer</p>
        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-choose-files">
          <i className="fas fa-folder-open mr-2"></i>Choose Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,.pdf"
          onChange={(e) => handleFileSelect(e.target.files)}
          data-testid="file-input"
        />
      </div>

      {/* File Format Support */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              <i className="fas fa-file-image text-blue-600 mr-2"></i>Supported Formats
            </h3>
            <div className="flex flex-wrap gap-2">
              {['JPG', 'PNG', 'PDF', 'TIFF', 'BMP', 'WEBP'].map((format) => (
                <span key={format} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {format}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              <i className="fas fa-info-circle text-green-600 mr-2"></i>Upload Guidelines
            </h3>
            <ul className="text-slate-600 space-y-2 text-sm">
              <li><i className="fas fa-check text-green-500 mr-2"></i>Maximum file size: 10MB</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i>Clear, high-resolution images work best</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i>Good lighting and contrast recommended</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              <i className="fas fa-upload text-blue-600 mr-2"></i>Uploading Files
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">document.pdf</span>
                <span className="text-green-600" data-testid="upload-progress">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                  data-testid="progress-bar"
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;
