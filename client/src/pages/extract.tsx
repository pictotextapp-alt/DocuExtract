import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const Extract = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState("auto");
  const [outputFormat, setOutputFormat] = useState("plain");
  const { toast } = useToast();

  const handleExtraction = async () => {
    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate extracted text
    const sampleText = "Sample extracted text would appear here after processing. This is a demonstration of how the extracted content would be displayed in an editable format.";
    setExtractedText(sampleText);
    setConfidence(98.7);
    setIsProcessing(false);
    
    toast({
      title: "Extraction complete",
      description: "Text has been extracted successfully.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    toast({
      title: "Copied to clipboard",
      description: "Extracted text has been copied to your clipboard.",
    });
  };

  const downloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([extractedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "extracted_text.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download started",
      description: "Your extracted text file is being downloaded.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Extract Text</h1>
        <p className="text-xl text-slate-600">Process your uploaded documents and extract text with AI precision.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Document Preview */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              <i className="fas fa-image text-blue-600 mr-2"></i>Document Preview
            </h3>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
              <i className="fas fa-file-alt text-4xl text-slate-400 mb-4"></i>
              <p className="text-slate-500">Upload a document to see preview</p>
            </div>
            
            {/* Processing Controls */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Language Detection</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Output Format</label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger className="w-40" data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plain">Plain Text</SelectItem>
                    <SelectItem value="formatted">Formatted Text</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV (Tables)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleExtraction}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-start-extraction"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>Start Extraction
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Extracted Text */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                <i className="fas fa-align-left text-green-600 mr-2"></i>Extracted Text
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!extractedText}
                  data-testid="button-copy"
                >
                  <i className="fas fa-copy"></i>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadText}
                  disabled={!extractedText}
                  data-testid="button-download"
                >
                  <i className="fas fa-download"></i>
                </Button>
              </div>
            </div>

            {/* Text Output Area */}
            <div className="relative">
              <Textarea
                className="min-h-96 resize-none"
                placeholder="Extracted text will appear here..."
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                data-testid="extracted-text"
              />
              
              {/* Processing Indicator */}
              {isProcessing && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Processing document...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Confidence Score */}
            {confidence > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">Confidence Score</span>
                  <span className="text-sm font-semibold text-green-800" data-testid="confidence-score">
                    {confidence}%
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/history">
          <Button className="bg-slate-600 hover:bg-slate-700" data-testid="button-save-history">
            <i className="fas fa-save mr-2"></i>Save to History
          </Button>
        </Link>
        <Button variant="outline" data-testid="button-edit-text">
          <i className="fas fa-edit mr-2"></i>Edit Text
        </Button>
        <Button variant="outline" data-testid="button-share-result">
          <i className="fas fa-share mr-2"></i>Share Result
        </Button>
      </div>
    </div>
  );
};

export default Extract;
