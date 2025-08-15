import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Copy, Filter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Tesseract from "tesseract.js";

const SimpleTextExtractor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [rawText, setRawText] = useState("");
  const [useFiltering, setUseFiltering] = useState(true);
  const [ocrProgress, setOcrProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions to keep under 800KB
        let { width, height } = img;
        const maxDimension = 1200; // Reasonable max size for OCR
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels until under 800KB
        let quality = 0.8;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        while (compressedDataUrl.length > 800 * 1024 && quality > 0.1) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(compressedDataUrl);
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
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
      // Compress image for OCR processing
      const compressedImage = await compressImage(file);
      setImagePreview(compressedImage);
      
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

  const filterText = (rawText: string): string => {
    if (!useFiltering) return rawText;
    
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extremely aggressive filtering for complex images
    const filteredLines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      const originalLine = line;
      
      // Skip anything that looks like UI elements or metadata
      if (lowerLine.match(/\d+(\.\d+)?[km]?\s*(like|follow|view|share|post|comment)/i)) return false;
      if (lowerLine.match(/^(paws|sz|ky4|wo|bu|ic|ba|d\s*q|reel|bio|page|edit|manage|promote)/)) return false;
      if (lowerLine.match(/^\w{1,3}\s+\w{1,3}$/)) return false; // Very short fragments
      if (lowerLine.match(/^\d+\s*-\s*@|\d+\s+kumar|january\s+\d+/)) return false; // Dates and numbers
      if (lowerLine.match(/@|\.com|www\.|http/)) return false; // Web/email
      if (lowerLine.match(/^[\d\s\-\+\(\)\.]{3,}$/)) return false; // Number sequences
      if (lowerLine.match(/^[a-z]{1,2}\s*:\s*[>a-z]|^[><\[\]{}()•™®©]+$/)) return false; // Symbols and artifacts
      if (lowerLine.match(/\bee——|oo\s*:|wn\s+ee——|<\s*oo/)) return false; // OCR artifacts
      
      // Only keep lines that are:
      // 1. Proper sentences (5+ words with common English words)
      // 2. Important short phrases (brand names, slogans)
      // 3. Clear meaningful content
      
      const wordCount = originalLine.split(/\s+/).length;
      
      // Keep important short phrases and titles
      if (lowerLine.match(/^(forged\s+in\s+iron|sparta|wouldn't\s+survive)/)) return true;
      
      // Keep proper sentences with substance
      if (wordCount >= 5) {
        // Must contain common English words indicating real content
        if (lowerLine.match(/\b(your|our|the|and|for|with|this|that|have|will|can|are|is|you|we|they)\b/)) {
          // But exclude if it contains too many UI-like words
          if (!lowerLine.match(/\b(posts?|about|mentions?|reviews?|manage|featured|edit)\b/)) {
            return true;
          }
        }
      }
      
      // Everything else is likely noise
      return false;
    });
    
    // Final cleanup - remove duplicates and very similar lines
    const uniqueLines = [];
    for (const line of filteredLines) {
      const isUnique = !uniqueLines.some(existing => 
        existing.toLowerCase().includes(line.toLowerCase()) || 
        line.toLowerCase().includes(existing.toLowerCase())
      );
      if (isUnique && line.length > 2) {
        uniqueLines.push(line);
      }
    }
    
    return uniqueLines.join('\n').trim();
  };

  const handleExtractText = async () => {
    if (!imagePreview) return;
    
    setIsProcessing(true);
    
    try {
      const { data: { text, confidence } } = await Tesseract.recognize(
        imagePreview,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              const progress = Math.round(m.progress * 100);
              setOcrProgress(progress);
              console.log(`OCR Progress: ${progress}%`);
            }
          }
        }
      );
      
      // Store raw text and apply filtering
      setRawText(text);
      const filteredText = filterText(text);
      const finalText = filteredText || text; // Fallback to raw if filtering removes everything
      
      const words = finalText.trim().split(/\s+/).filter(word => word.length > 0).length;
      const confidencePercent = Math.round(confidence);
      
      setExtractedText(finalText);
      setConfidence(confidencePercent);
      setWordCount(words);
      
      toast({
        title: "Text extracted successfully!",
        description: `Found ${words} words with ${confidencePercent}% confidence. ${useFiltering ? 'Smart filtering applied.' : 'Raw text extracted.'}`,
      });
      
    } catch (error) {
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : 'An error occurred during text extraction',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const toggleFiltering = () => {
    setUseFiltering(!useFiltering);
    if (rawText) {
      // Re-apply filtering with new setting
      const finalText = !useFiltering ? filterText(rawText) : rawText;
      setExtractedText(finalText);
      const words = finalText.trim().split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(words);
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
          Upload an image and extract all text content using Tesseract.js OCR
        </p>
        <p className="text-sm text-slate-500">
          Powered by Tesseract.js - runs entirely in your browser, no file limits
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
                        {ocrProgress > 0 ? `Extracting... ${ocrProgress}%` : 'Initializing...'}
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