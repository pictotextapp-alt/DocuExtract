import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Copy, Filter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


const SimpleTextExtractor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [rawText, setRawText] = useState("");
  const [useFiltering, setUseFiltering] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageForPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    
    try {
      // Keep original image for preview
      const originalImage = await handleImageForPreview(file);
      setImagePreview(originalImage);
      
      // Reset previous results
      setExtractedText("");
      setRawText("");
      setConfidence(0);
      setWordCount(0);
      
    } catch (error) {
      toast({
        title: "Image processing failed",
        description: "Unable to process the image. Please try another file.",
        variant: "destructive",
      });
    }
  };



  const handleExtractText = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setExtractedText("");
    setRawText("");
    setConfidence(0);
    setWordCount(0);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('useFiltering', useFiltering.toString());

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      setRawText(result.rawText || "");
      setExtractedText(result.extractedText);
      setConfidence(result.confidence);
      setWordCount(result.wordCount);
      
      toast({
        title: "Text extracted successfully!",
        description: `Found ${result.wordCount} words with ${result.confidence}% confidence. ${useFiltering ? 'Clean Extract applied.' : 'Raw text extracted.'}`,
      });
      
    } catch (error) {
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : 'Failed to extract text from the image. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFiltering = () => {
    setUseFiltering(!useFiltering);
    // User will need to re-extract text with new filtering setting
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    toast({
      title: "Text copied",
      description: "The extracted text has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-6">
          <svg width="80" height="80" viewBox="0 0 80 80" className="mr-4">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <rect width="80" height="80" rx="16" fill="url(#logoGradient)" />
            <rect x="12" y="12" width="56" height="42" rx="4" fill="white" opacity="0.9" />
            <rect x="16" y="16" width="12" height="2" rx="1" fill="#3B82F6" />
            <rect x="16" y="20" width="20" height="2" rx="1" fill="#3B82F6" />
            <rect x="16" y="24" width="16" height="2" rx="1" fill="#3B82F6" />
            <rect x="16" y="28" width="24" height="2" rx="1" fill="#3B82F6" />
            <rect x="16" y="32" width="18" height="2" rx="1" fill="#3B82F6" />
            <rect x="16" y="36" width="14" height="2" rx="1" fill="#3B82F6" />
            <rect x="16" y="40" width="22" height="2" rx="1" fill="#3B82F6" />
            <rect x="16" y="44" width="20" height="2" rx="1" fill="#3B82F6" />
            <path d="M20 58 L32 66 L44 58 L56 66" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="24" cy="62" r="2" fill="white" />
            <circle cx="36" cy="62" r="2" fill="white" />
            <circle cx="48" cy="62" r="2" fill="white" />
          </svg>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PictoText
          </h1>
        </div>
        <p className="text-xl text-slate-700 font-medium mb-2">
          Transform Images to Editable Text
        </p>
        <p className="text-base text-slate-500">
          Professional OCR technology that extracts text from any image with precision
        </p>
        <p className="text-sm text-slate-400 mt-3">
          Supports JPG, PNG, WEBP, GIF, BMP • Max file size: 10MB
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              data-testid="button-upload"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Image
            </Button>
          </div>
          {selectedImage && (
            <p className="text-center mt-4 text-slate-600">
              Selected: {selectedImage.name}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Content - Side by Side Layout */}
      {imagePreview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Original Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-slate-900">
                <FileText className="mr-2 h-5 w-5" />
                Original Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Uploaded image"
                  className="w-full h-auto max-h-96 object-contain rounded-lg border"
                  data-testid="img-preview"
                />
                <div className="mt-4">
                  <Button
                    onClick={handleExtractText}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                    data-testid="button-extract"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing with OCR.space API...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-5 w-5" />
                        Extract Text
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Extracted Text */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-slate-900">
                <span className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Extracted Text
                </span>
                {extractedText && (
                  <Button
                    onClick={handleCopyText}
                    variant="outline"
                    size="sm"
                    data-testid="button-copy"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {confidence > 0 && (
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <div className="flex items-center gap-4">
                      <span>Words: {wordCount}</span>
                      <span>Confidence: {confidence}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="filter-mode"
                        checked={useFiltering}
                        onCheckedChange={toggleFiltering}
                        data-testid="switch-filter"
                      />
                      <Label htmlFor="filter-mode" className="text-xs">
                        <Filter className="h-3 w-3 inline mr-1" />
                        Clean Extract
                      </Label>
                    </div>
                  </div>
                )}
                <Textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder={extractedText ? "" : "Extracted text will appear here..."}
                  className="min-h-96 w-full p-4 text-base"
                  data-testid="textarea-extracted"
                />
                {extractedText && (
                  <div className="text-sm text-slate-500">
                    <p>You can edit the text above and copy it when ready.</p>
                    {useFiltering && (
                      <p className="text-xs mt-1">Clean Extract mode shows only meaningful content - removes all UI elements and social media noise.</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimpleTextExtractor;