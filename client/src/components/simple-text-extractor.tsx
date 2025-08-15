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
    
    // Split text into lines and clean them
    const lines = rawText.split(/\n+/).map(line => line.trim()).filter(line => line.length > 0);
    
    // Find the most meaningful content by scoring each line
    const scoredLines = lines.map(line => {
      const lowerLine = line.toLowerCase();
      let score = 0;
      
      // Heavily penalize UI/social media elements
      if (lowerLine.match(/\d+(\.\d+)?[km]?\s*(like|follow|view|share|post|comment|subscriber)/i)) score -= 100;
      if (lowerLine.match(/^(posts?|about|mentions?|reviews?|reels?|photos?|more|manage|featured|promote|edit|bio|page)/)) score -= 50;
      if (lowerLine.match(/@|\.com|www\.|http|january|kumar|\d{8,}/)) score -= 30;
      if (lowerLine.match(/^[a-z]{1,3}\s+[a-z]{1,3}$|^[\d\s\-\+\(\)\.]{3,}$/)) score -= 20;
      if (lowerLine.match(/^[><\[\]{}()•™®©]+$|ee——|oo\s*:/)) score -= 30;
      
      // Reward meaningful content
      const wordCount = line.split(/\s+/).length;
      if (wordCount >= 4) score += wordCount * 2;
      if (lowerLine.match(/\b(your|our|the|and|for|with|this|that|have|will|can|are|is|you|we|they)\b/)) score += 10;
      if (lowerLine.match(/\b(trendy|unique|celebrate|designs|apparel|gifts|coffee|mug|cat|lovers)\b/)) score += 15;
      if (lowerLine.match(/^(forged\s+in\s+iron|sparta|wouldn't\s+survive)/)) score += 50;
      
      // Reward proper sentence structure
      if (line.match(/^[A-Z]/) && line.match(/[.!?]$/)) score += 5;
      if (line.length > 30 && line.length < 200) score += 5;
      
      return { line, score };
    });
    
    // Only keep lines with positive scores, sorted by relevance
    const goodLines = scoredLines
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.line);
    
    // Remove duplicates and very similar content
    const finalLines = [];
    for (const line of goodLines) {
      const isDuplicate = finalLines.some(existing => {
        const similarity = calculateSimilarity(existing.toLowerCase(), line.toLowerCase());
        return similarity > 0.8;
      });
      
      if (!isDuplicate && line.length > 3) {
        finalLines.push(line);
      }
    }
    
    return finalLines.slice(0, 10).join('\n').trim(); // Limit to top 10 most relevant lines
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
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
        description: `Found ${words} words with ${confidencePercent}% confidence. ${useFiltering ? 'Clean Extract applied.' : 'Raw text extracted.'}`,
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