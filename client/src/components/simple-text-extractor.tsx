import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth, useUsage } from "@/hooks/useAuth";
import { AuthModal } from "./auth-modal";
import { PremiumUpgradeModal } from "./premium-upgrade-modal";
import { 
  Upload, 
  FileImage, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Download,
  Zap,
  Crown,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExtractionResult {
  extractedText: string;
  confidence: number;
  wordCount: number;
  rawText?: string;
}

export default function SimpleTextExtractor() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { data: usage, refetch: refetchUsage } = useUsage();
  const { toast } = useToast();

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // UI states
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [useFiltering, setUseFiltering] = useState(true);

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setExtractedText("");
    setResult(null);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const extractText = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image file first",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('useFiltering', useFiltering.toString());

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429 && errorData.limitExceeded) {
          // Show upgrade modal for limit exceeded
          setShowUpgradeModal(true);
          return;
        }
        
        throw new Error(errorData.error || 'OCR processing failed');
      }

      const data: ExtractionResult = await response.json();
      
      setResult(data);
      setExtractedText(data.extractedText);
      
      // Refresh usage data
      await refetchUsage();
      
      toast({
        title: "Success!",
        description: `Extracted ${data.wordCount} words with ${data.confidence}% confidence`,
      });

    } catch (error) {
      console.error('Text extraction error:', error);
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually",
        variant: "destructive",
      });
    }
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Text file saved to your downloads",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      setFile(null);
      setExtractedText("");
      setResult(null);
      toast({
        title: "Logged out",
        description: "Successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* User Status Bar */}
      {isAuthenticated && user && (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {user.isPremium ? (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">
                      Welcome, {user.username}
                      {user.isPremium && (
                        <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                          Premium
                        </Badge>
                      )}
                    </p>
                    {usage && (
                      <p className="text-sm text-muted-foreground">
                        {user.isPremium 
                          ? "Unlimited extractions" 
                          : `${usage.imageCount}/${usage.dailyLimit} images used today`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!user.isPremium && (
                  <Button 
                    onClick={() => setShowUpgradeModal(true)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    data-testid="button-upgrade"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade
                  </Button>
                )}
                <Button onClick={handleLogout} variant="outline" size="sm" data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Extractor */}
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <FileImage className="h-6 w-6 text-primary" />
            Extract Text from Images
          </CardTitle>
          <CardDescription>
            Upload an image and extract editable text using advanced OCR technology
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center space-y-4 transition-colors cursor-pointer
              ${file ? 'border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800' : 'border-gray-300 hover:border-primary hover:bg-primary/5'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file-input')?.click()}
            data-testid="file-drop-zone"
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              data-testid="file-input"
            />
            
            {file ? (
              <div className="space-y-3">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">{file.name}</p>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium">Drop your image here</p>
                  <p className="text-gray-500">or click to browse files</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Supports PNG, JPG, WebP • Max 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="filtering-switch" className="font-medium">
                Smart Text Filtering
              </Label>
              <p className="text-sm text-muted-foreground">
                Remove UI elements and noise for cleaner results
              </p>
            </div>
            <Switch
              id="filtering-switch"
              checked={useFiltering}
              onCheckedChange={setUseFiltering}
              data-testid="filtering-switch"
            />
          </div>

          {/* Extract Button */}
          <Button 
            onClick={extractText}
            disabled={!file || isProcessing}
            className="w-full h-12 text-lg font-semibold"
            data-testid="button-extract"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing... {processingProgress}%
              </>
            ) : isAuthenticated ? (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Extract Text
              </>
            ) : (
              "Login to Extract Text"
            )}
          </Button>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={processingProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Processing your image...
              </p>
            </div>
          )}

          {/* Results */}
          {result && extractedText && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Extracted Text
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {result.confidence}% confidence
                    </Badge>
                    <Badge variant="outline">
                      {result.wordCount} words
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="min-h-48 font-mono text-sm"
                  placeholder="Extracted text will appear here..."
                  data-testid="extracted-text-area"
                />
                
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={copyToClipboard} variant="outline" data-testid="button-copy">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button onClick={downloadText} variant="outline" data-testid="button-download">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Usage Warning for Non-Premium Users */}
          {isAuthenticated && !user?.isPremium && usage && usage.imageCount >= usage.dailyLimit - 1 && (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <Crown className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                {usage.imageCount >= usage.dailyLimit 
                  ? "Daily limit reached. Upgrade to Premium for unlimited extractions!"
                  : "Only 1 extraction remaining today. Upgrade to Premium for unlimited access!"
                }
                <Button 
                  onClick={() => setShowUpgradeModal(true)}
                  size="sm" 
                  className="ml-2 bg-amber-600 hover:bg-amber-700"
                  data-testid="button-upgrade-warning"
                >
                  Upgrade Now
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <PremiumUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        currentUsage={usage && usage.imageCount >= usage.dailyLimit ? {
          imageCount: usage.imageCount,
          dailyLimit: usage.dailyLimit
        } : undefined}
      />
    </div>
  );
}