import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import CanvaTextEditor from "./canva-text-editor";
import type { OCRRequest, OCRResponse, TextRegion, TextLayer, TextLine } from "@shared/schema";

const PhotoExtractor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState("");
  const [textRegions, setTextRegions] = useState<TextRegion[]>([]);
  const [textLines, setTextLines] = useState<TextLine[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [cleanedImage, setCleanedImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-inpainting mutation for seamless workflow
  const autoInpaintMutation = useMutation({
    mutationFn: async ({ originalImage, textLines, textRegions }: { originalImage: string; textLines?: TextLine[]; textRegions: TextRegion[] }) => {
      const response = await fetch("/api/inpaint-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalImage,
          textLines: textLines,
          textRegions: textRegions,
          maskExpansion: 4,
          maskFeather: 3,
          useAdvancedInpainting: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCleanedImage(data.cleanedImage);
        toast({
          title: "Text extraction complete!",
          description: "Your editable text elements are ready. You can now move, style, and edit each text element independently.",
        });
      } else {
        toast({
          title: "Processing failed",
          description: data.error || "Failed to process the image.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Processing error",
        description: "An error occurred while creating editable text. Please try again.",
        variant: "destructive",
      });
      console.error("Auto-inpainting error:", error);
    },
  });

  const triggerAutoInpainting = (ocrData: OCRResponse) => {
    if (!imagePreview) return;
    
    autoInpaintMutation.mutate({
      originalImage: imagePreview,
      textLines: ocrData.textLines,
      textRegions: ocrData.textRegions || [],
    });
  };

  const extractTextMutation = useMutation({
    mutationFn: async (ocrRequest: OCRRequest): Promise<OCRResponse> => {
      const response = await fetch("/api/extract-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ocrRequest),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data: OCRResponse) => {
      if (data.success) {
        setExtractedText(data.text);
        setTextRegions(data.textRegions || []);
        setTextLines(data.textLines || []);
        setConfidence(data.confidence);
        setWordCount(data.words);
        setShowResult(true);
        
        // Enable Canva-style editor if we have text lines or regions with coordinates
        const hasTextData = (data.textLines && data.textLines.length > 0) || 
                           (data.textRegions && data.textRegions.length > 0);
        
        if (hasTextData) {
          setShowAdvancedEditor(true);
          const lineCount = data.textLines?.length || 0;
          
          toast({
            title: "Text detected, creating editable version...",
            description: `Found ${data.words} words in ${lineCount > 0 ? `${lineCount} lines` : `${data.textRegions?.length || 0} regions`}. Processing...`,
          });
          
          // Automatically trigger inpainting process
          setTimeout(() => {
            triggerAutoInpainting(data);
          }, 500);
        } else {
          setShowAdvancedEditor(false);
          toast({
            title: "Text extraction complete",
            description: `Successfully extracted ${data.words} words from your image.`,
          });
        }
      } else {
        toast({
          title: "Extraction failed",
          description: data.error || "Failed to extract text from the image.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Extraction error",
        description: "An error occurred while processing your image. Please try again.",
        variant: "destructive",
      });
      console.error("OCR extraction error:", error);
    },
  });



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
    setTextRegions([]);
    setShowAdvancedEditor(false);
    setTextLayers([]);

    // Create optimized preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        optimizeImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const optimizeImage = (originalDataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (max 1920px width)
      let { width, height } = img;
      const maxWidth = 1920;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setImagePreview(optimizedDataUrl);
    };
    img.src = originalDataUrl;
  };

  const handleTextRegionsChange = (regions: TextRegion[]) => {
    setTextRegions(regions);
  };

  const handleApplyChanges = () => {
    if (!imagePreview) {
      toast({
        title: "No image selected",
        description: "Please select an image first.",
        variant: "destructive",
      });
      return;
    }

    const changedRegions = textRegions.filter(region => region.isDeleted || region.isEdited);
    
    if (changedRegions.length === 0) {
      toast({
        title: "No changes to apply",
        description: "Please edit or delete some text regions first.",
        variant: "destructive",
      });
      return;
    }

    const imageEditRequest: ImageEditRequest = {
      originalImage: imagePreview,
      textRegions: textRegions,
    };

    editImageMutation.mutate(imageEditRequest);
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
    if (!selectedImage || !imagePreview) return;

    const ocrRequest: OCRRequest = {
      image: imagePreview,
      language: "eng",
      isTable: false,
    };

    extractTextMutation.mutate(ocrRequest);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setExtractedText("");
    setTextRegions([]);
    setTextLines([]);
    setShowResult(false);
    setShowAdvancedEditor(false);
    setTextLayers([]);
    setCleanedImage("");
    setConfidence(0);
    setWordCount(0);
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
            <h3 className="text-2xl font-semibold text-slate-700 mb-4">Upload Image for Text Extraction</h3>
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
                    disabled={extractTextMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-extract-text"
                  >
                    {extractTextMutation.isPending ? (
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
        <div className="space-y-6">
          {/* Simple Text Display */}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearImage}
                    data-testid="button-start-over"
                  >
                    <i className="fas fa-plus mr-2"></i>Upload New
                  </Button>
                </div>
              </div>
              <Textarea
                className="min-h-48 resize-none font-mono"
                placeholder="Extracted text will appear here..."
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                data-testid="extracted-text-output"
              />
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between text-sm text-green-800 mb-2">
                  <span className="flex items-center">
                    <i className="fas fa-check-circle mr-2"></i>
                    Text extraction completed successfully
                  </span>
                  <span className="font-semibold">{wordCount} words</span>
                </div>
                {confidence > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-700">
                    <span>Confidence Score</span>
                    <span className="font-semibold">{confidence.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Canva-Style Text Editor */}
          {showAdvancedEditor && textRegions.length > 0 && (
            <CanvaTextEditor
              originalImage={imagePreview}
              textRegions={textRegions}
              textLines={textLines}
              cleanedImage={cleanedImage}
              onTextLayersChange={setTextLayers}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoExtractor;