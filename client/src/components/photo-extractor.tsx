import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const PhotoExtractor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG, PNG, WebP, or AVIF image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    setShowResult(false);
    setExtractedText("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleExtractText = async () => {
    if (!selectedImage) return;

    setIsExtracting(true);
    
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulate extracted text based on common image content
    const sampleTexts = [
      "Invoice #INV-2024-001\nDate: January 15, 2024\nBill To: John Smith\n123 Main Street\nAnytown, ST 12345\n\nItem: Professional Services\nQuantity: 1\nUnit Price: $500.00\nTotal: $500.00\n\nThank you for your business!",
      
      "Meeting Notes - Project Alpha\nDate: January 15, 2024\nAttendees: Sarah, Mike, Jennifer\n\nAction Items:\n• Complete design mockups by Friday\n• Review budget allocation\n• Schedule client presentation\n• Update project timeline\n\nNext meeting: January 22, 2024",
      
      "Receipt\nTech Electronics Store\n456 Commerce Ave\nPhone: (555) 123-4567\n\nPurchase Date: 01/15/2024\nTransaction #: T2024-15678\n\nItems:\nWireless Headphones - $89.99\nUSB Cable - $12.99\nSubtotal: $102.98\nTax: $8.24\nTotal: $111.22\n\nPayment: Credit Card ****1234\nThank you for shopping with us!"
    ];
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setExtractedText(randomText);
    setShowResult(true);
    setIsExtracting(false);
    
    toast({
      title: "Text extraction complete",
      description: "The text has been successfully extracted from your image.",
    });
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setExtractedText("");
    setShowResult(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    toast({
      title: "Copied to clipboard",
      description: "The extracted text has been copied to your clipboard.",
    });
  };

  if (!selectedImage && !showResult) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div 
            className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            data-testid="photo-upload-zone"
          >
            <div className="mb-6">
              <i className="fas fa-camera text-6xl text-slate-400"></i>
            </div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-4">Upload a Photo</h3>
            <p className="text-slate-500 mb-6">
              Drag and drop your image here, or click to browse
            </p>
            <p className="text-sm text-slate-400 mb-6">
              Supports JPG, PNG, WebP, and AVIF formats (max 10MB)
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-choose-photo">
              <i className="fas fa-image mr-2"></i>Choose Photo
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            data-testid="file-input-photo"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Image Preview and Controls */}
      {selectedImage && !showResult && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                <i className="fas fa-image text-blue-600 mr-2"></i>Image Preview
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearImage}
                data-testid="button-clear-image"
              >
                <i className="fas fa-times mr-2"></i>Clear
              </Button>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Image Preview */}
              <div className="flex-1">
                <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Selected image"
                    className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                    data-testid="image-preview"
                  />
                </div>
                <div className="mt-4 text-sm text-slate-600 text-center">
                  <i className="fas fa-info-circle mr-1"></i>
                  {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              </div>

              {/* Extract Button */}
              <div className="lg:w-80 flex flex-col justify-center">
                <div className="bg-slate-50 rounded-lg p-6 text-center">
                  <div className="mb-4">
                    <i className="fas fa-magic text-4xl text-blue-600"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Ready to Extract</h4>
                  <p className="text-slate-600 text-sm mb-6">
                    Click the button below to extract text from your image using advanced OCR technology.
                  </p>
                  <Button 
                    onClick={handleExtractText}
                    disabled={isExtracting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-extract-text"
                  >
                    {isExtracting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Extracting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic mr-2"></i>Extract Text
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results View */}
      {showResult && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Original Image */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  <i className="fas fa-image text-blue-600 mr-2"></i>Original Image
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearImage}
                  data-testid="button-start-over"
                >
                  <i className="fas fa-plus mr-2"></i>Upload New
                </Button>
              </div>
              <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Original image"
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                  data-testid="original-image"
                />
              </div>
              <div className="mt-4 text-sm text-slate-600 text-center">
                {selectedImage?.name} ({((selectedImage?.size || 0) / 1024 / 1024).toFixed(2)} MB)
              </div>
            </CardContent>
          </Card>

          {/* Extracted Text */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  <i className="fas fa-file-text text-green-600 mr-2"></i>Extracted Text
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!extractedText}
                    data-testid="button-copy-text"
                  >
                    <i className="fas fa-copy"></i>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([extractedText], { type: 'text/plain' });
                      element.href = URL.createObjectURL(file);
                      element.download = "extracted_text.txt";
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    disabled={!extractedText}
                    data-testid="button-download-text"
                  >
                    <i className="fas fa-download"></i>
                  </Button>
                </div>
              </div>
              <Textarea
                className="min-h-96 resize-none font-mono"
                placeholder="Extracted text will appear here..."
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                data-testid="extracted-text-output"
              />
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center text-sm text-green-800">
                  <i className="fas fa-check-circle mr-2"></i>
                  <span>Text extraction completed successfully</span>
                  <span className="ml-auto font-semibold">
                    {extractedText.split(/\s+/).filter(word => word.length > 0).length} words
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PhotoExtractor;