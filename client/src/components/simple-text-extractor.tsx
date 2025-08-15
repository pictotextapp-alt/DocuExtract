import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Copy } from "lucide-react";

const SimpleTextExtractor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset previous results
    setExtractedText("");
    setConfidence(0);
    setWordCount(0);
  };

  const handleExtractText = async () => {
    if (!imagePreview) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imagePreview,
          language: 'eng',
          isTable: false 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Text extraction failed');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Text extraction failed');
      }
      
      setExtractedText(data.text);
      setConfidence(data.confidence);
      setWordCount(data.words);
      
      toast({
        title: "Text extracted successfully!",
        description: `Found ${data.words} words with ${data.confidence}% confidence.`,
      });
      
    } catch (error) {
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : 'An error occurred during text extraction',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          📄 Text Extractor
        </h1>
        <p className="text-lg text-slate-600">
          Upload an image and extract all text content for easy editing
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
                        Extracting Text...
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
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Words: {wordCount}</span>
                    <span>Confidence: {confidence}%</span>
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
                  <p className="text-sm text-slate-500">
                    You can edit the text above and copy it when ready.
                  </p>
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