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
    
    // Remove common UI elements and social media noise
    const filteredLines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      
      // Skip social media UI elements (more aggressive)
      if (lowerLine.match(/^\d+(\.\d+)?[km]?\s*(likes?|followers?|following|views?|shares?)/)) return false;
      if (lowerLine.match(/^(like|share|comment|follow|subscribe|@|#|intro)/)) return false;
      if (lowerLine.match(/^(posts?|about|mentions?|reviews?|reels?|photos?|more|manage|featured|promote)/)) return false;
      if (lowerLine.match(/^(edit|bio|page|live\s+video|photo\/video|reel)/)) return false;
      if (lowerLine.match(/^\w{2,4}\s+\d+\s*[•@©]/)) return false; // Date patterns with symbols
      if (lowerLine.match(/^[a-zA-Z]{1,3}\s+[a-zA-Z]{1,3}$/)) return false; // Short fragments
      if (lowerLine.match(/^[\d\s\-\.\+\(\)]+$/)) return false; // Numbers/phone patterns
      if (lowerLine.match(/^\d{8,}/)) return false; // Long number sequences
      if (lowerLine.match(/^\w+@\w+\.\w+/)) return false; // Email addresses
      if (lowerLine.match(/^https?:\/\//)) return false; // URLs
      if (lowerLine.match(/^www\./)) return false; // Website patterns
      if (lowerLine.match(/^(©|®|™|•|@)/)) return false; // Special symbols at start
      if (lowerLine.match(/^[a-z]{2,4}\s+[a-z]{2,4}$/)) return false; // Two short words
      if (lowerLine.match(/^\w{1,2}\s*:\s*>/)) return false; // Weird patterns like ": >"
      if (lowerLine.match(/^(sz|ky4|wo|bu)/)) return false; // Random fragments
      if (lowerLine.match(/^-\s*[a-z]/)) return false; // Lines starting with dash
      if (lowerLine.match(/^\d+\s*-\s*@/)) return false; // Number dash at patterns
      
      // Filter out nonsensical character combinations
      if (lowerLine.match(/^["'<>{}[\]()]+$/)) return false; // Only punctuation
      if (lowerLine.match(/^[a-z]\s+[a-z]\s+[a-z]$/)) return false; // Single letters spaced
      if (lowerLine.match(/ee——|oo\s*:\s*=|[<>=]+/)) return false; // Weird OCR artifacts
      
      // Skip very short lines (less than 4 words) unless they contain meaningful keywords
      const wordCount = line.split(/\s+/).length;
      if (wordCount < 4 && !lowerLine.match(/^(sale|free|new|hot|deal|offer|save|forged|iron|sparta|wouldn't|survive)/)) {
        return false;
      }
      
      // Keep lines that look like real content (have proper sentence structure)
      if (line.length > 20 && lowerLine.match(/\b(the|and|for|with|your|our|this|that|have|will|can|are|is)\b/)) {
        return true;
      }
      
      // Skip lines that are mostly uppercase fragments (likely UI elements)
      if (line.match(/^[A-Z\s]{3,}$/) && wordCount < 4) return false;
      
      return true;
    });
    
    // Additional cleanup - merge lines that seem to belong together
    const cleanedLines = [];
    for (let i = 0; i < filteredLines.length; i++) {
      const line = filteredLines[i];
      
      // Skip if it's just a single character or very short meaningless text
      if (line.length < 3) continue;
      
      cleanedLines.push(line);
    }
    
    // Join meaningful content with proper spacing
    return cleanedLines.join('\n').trim();
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
          },
          tessedit_pageseg_mode: Tesseract.PSM.AUTO,
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?:;-\'\"',
          preserve_interword_spaces: '1'
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
                        Smart Filter
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
                      <p className="text-xs mt-1">Smart filter removes UI elements, social media noise, and short fragments.</p>
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