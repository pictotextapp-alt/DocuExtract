export interface OCRResult {
  extractedText: string;
  confidence: number;
  wordCount: number;
  rawText?: string;
}

export class OCRService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OCR_SPACE_API_KEY || "";
    
    if (!this.apiKey) {
      throw new Error("OCR_SPACE_API_KEY environment variable is required");
    }
  }

  async extractTextFromImage(
    imageBuffer: Buffer, 
    useFiltering = false
  ): Promise<OCRResult> {
    try {
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.detectMimeType(imageBuffer);
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      // Prepare FormData for OCR.space API
      const formData = new FormData();
      formData.append("base64Image", dataUrl);
      formData.append("language", "eng");
      formData.append("OCREngine", "2"); // Engine 2 is more accurate
      formData.append("detectOrientation", "true");
      formData.append("scale", "true");
      formData.append("isOverlayRequired", "false");
      formData.append("isTable", "true"); // Better structure detection

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
          "apikey": this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OCR API request failed: ${response.statusText}`);
      }

      const ocrResult = await response.json();
      
      if (ocrResult.IsErroredOnProcessing) {
        throw new Error(ocrResult.ErrorMessage || "OCR processing failed");
      }

      let extractedText = ocrResult.ParsedResults?.[0]?.ParsedText || "";
      
      // Calculate confidence
      const confidence = this.calculateConfidence(extractedText, ocrResult);
      
      // Apply filtering if requested
      let filteredText = extractedText;
      if (useFiltering && extractedText) {
        filteredText = this.filterOCRText(extractedText);
      }

      const finalText = filteredText || extractedText;
      const wordCount = finalText.trim().split(/\s+/).filter(word => word.length > 0).length;

      return {
        extractedText: finalText,
        confidence,
        wordCount,
        rawText: extractedText !== finalText ? extractedText : undefined,
      };
    } catch (error) {
      console.error("OCR Service error:", error);
      throw error;
    }
  }

  private detectMimeType(buffer: Buffer): string {
    // Simple MIME type detection based on file headers
    const header = buffer.subarray(0, 4);
    
    // PNG
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
      return 'image/png';
    }
    
    // JPEG
    if (header[0] === 0xFF && header[1] === 0xD8) {
      return 'image/jpeg';
    }
    
    // WebP
    if (buffer.subarray(0, 12).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') {
      return 'image/webp';
    }
    
    // Default to JPEG
    return 'image/jpeg';
  }

  private filterOCRText(text: string): string {
    console.log("Original OCR text:", text);
    
    // Check for completely garbled OCR (lots of symbols but no real words)
    const hasRealWords = text.match(/\b[A-Za-z]{3,}\b/g);
    const weirdChars = (text.match(/[¥€£™®©§¶†‡•…‰′″‹›«»]/g) || []).length;
    const symbolRatio = (text.match(/[^\w\s]/g) || []).length / text.length;
    
    console.log("Real words found:", hasRealWords ? hasRealWords.length : 0);
    console.log("Weird chars:", weirdChars);
    console.log("Symbol ratio:", symbolRatio);
    
    // Only show error message for completely garbled text
    if ((!hasRealWords || hasRealWords.length < 3) && (weirdChars > 5 || symbolRatio > 0.6)) {
      return "OCR could not extract readable text from this image.\n\nThe text appears to be too stylized, decorative, or low resolution for accurate recognition.\n\nTry using:\n• Plain text documents\n• Screenshots with simple fonts\n• High-contrast images\n• Less decorative text styles";
    }
    
    // Clean up the text by removing obvious UI elements
    const lines = text.split(/\n+/).map(line => line.trim()).filter(line => line.length > 0);
    
    const cleanLines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      
      // Skip obvious UI noise but be less aggressive
      if (lowerLine.match(/^\d+(\.\d+)?[km]?\s*(like|follow|view|share)s?$/i)) return false;
      if (lowerLine.match(/^(manage|edit|more)$/i)) return false;
      if (lowerLine.match(/^@[a-z0-9_]+$/)) return false;
      
      // Keep lines with readable content
      const readableChars = line.match(/[A-Za-z]/g);
      return readableChars && readableChars.length >= 2;
    });
    
    const result = cleanLines.slice(0, 20).join('\n').trim();
    console.log("Filtered result:", result);
    return result;
  }

  private calculateConfidence(text: string, ocrResult: any): number {
    if (!text || text.length === 0) return 0;
    
    // Base confidence factors
    let confidence = 75; // Start with base confidence
    
    // Factor 1: Text length and structure
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount > 10) confidence += 5;
    if (wordCount > 30) confidence += 5;
    
    // Factor 2: Proper word ratio
    const properWords = text.match(/\b[A-Za-z]{3,}\b/g) || [];
    const totalTokens = text.split(/\s+/).length;
    const properWordRatio = properWords.length / Math.max(1, totalTokens);
    confidence += Math.floor(properWordRatio * 15);
    
    // Factor 3: Presence of readable sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 0) confidence += 5;
    if (sentences.length > 2) confidence += 5;
    
    // Factor 4: Low symbol noise
    const symbolRatio = (text.match(/[^\w\s]/g) || []).length / text.length;
    if (symbolRatio < 0.1) confidence += 10;
    else if (symbolRatio < 0.2) confidence += 5;
    
    // Factor 5: Proper capitalization patterns
    const capitalizedWords = text.match(/\b[A-Z][a-z]+/g) || [];
    if (capitalizedWords.length > 0) confidence += 5;
    
    return Math.min(99, Math.max(50, confidence));
  }
}