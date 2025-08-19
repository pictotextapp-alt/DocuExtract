import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const Upload = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const runOcr = async (file: File) => {
    setIsLoading(true);
    setExtractedText("");
    setFileName(file.name);

    try {
      // size check
      if (file.size > MAX_SIZE) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      // build multipart form and call your Pages Function
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: form,
      });

      // handle common error statuses from your function (rate-limit, bad file, etc.)
      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
          // optional: surface backend raw errors if present
          if (j?.raw && typeof j.raw === "string") {
            console.warn("Backend raw:", j.raw);
          }
        } catch {
          // ignore JSON parse errors here
        }
        toast({
          title: "Extraction failed",
          description: msg,
          variant: "destructive",
        });
        return;
      }

      const data = await res.json(); // your function always returns JSON
      // our function normalizes OCR.space to { text, raw }
      const text: string =
        (data && typeof data.text === "string" && data.text) ||
        "";

      if (!text.trim()) {
        toast({
          title: "No text detected",
          description: "Try a clearer image with higher contrast.",
        });
      }

      setExtractedText(text);
      toast({
        title: "Extraction complete",
        description: "Text was extracted successfully.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    runOcr(file);
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText || "");
      toast({ title: "Copied", description: "Text copied to clipboard." });
    } catch {
      toast({
        title: "Copy failed",
        description: "Select and copy the text manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Upload Your Document</h1>
        <p className="text-xl text-slate-600">
          Drag and drop your image or click to browse. Supports PNG, JPG, and more.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone bg-white border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer mb-8 transition-all ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
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
        <Button className="bg-blue-600 hover:bg-blue-700" disabled={isLoading} data-testid="button-choose-files">
          <i className="fas fa-folder-open mr-2"></i>
          {isLoading ? "Processing..." : "Choose Files"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={false}
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          data-testid="file-input"
        />
      </div>

      {/* Result / Status */}
      {(isLoading || extractedText || fileName) && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {isLoading ? "Extracting..." : extractedText ? "Extracted Text" : "Selected File"}
              </h3>
              {fileName && <span className="text-slate-500 text-sm">{fileName}</span>}
            </div>

            {isLoading && (
              <div className="text-slate-600 text-sm">Please wait, extracting text…</div>
            )}

            {!isLoading && extractedText && (
              <>
                <pre className="whitespace-pre-wrap break-words bg-slate-50 p-4 rounded-lg text-slate-800 text-sm">
                  {extractedText}
                </pre>
                <div className="mt-4 flex gap-2">
                  <Button onClick={copyToClipboard} className="bg-slate-800 hover:bg-slate-900">
                    Copy Text
                  </Button>
                </div>
              </>
            )}

            {!isLoading && !extractedText && fileName && (
              <div className="text-slate-600 text-sm">
                No text was detected in this file. Try a clearer image with higher contrast.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info cards unchanged */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              <i className="fas fa-file-image text-blue-600 mr-2"></i>Supported Formats
            </h3>
            <div className="flex flex-wrap gap-2">
              {["JPG", "PNG", "TIFF", "BMP", "WEBP"].map((format) => (
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
    </div>
  );
};

export default Upload;
