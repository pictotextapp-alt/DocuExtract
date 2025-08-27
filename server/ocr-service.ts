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
      // Try OCR.space API first with a single attempt for speed
      try {
        console.log(`OCR.space API attempt (fast mode)`);
        return await this.extractWithOCRSpace(imageBuffer, useFiltering);
      } catch (error) {
        const errorMsg = (error as Error).message;
        console.log(`OCR.space failed:`, errorMsg);
        
        // Check if it's a timeout or connection error
        if (errorMsg.includes('timeout') || errorMsg.includes('aborted') || errorMsg.includes('fetch')) {
          console.log("Network/timeout issue detected, skipping to Tesseract");
        } else {
          console.log("OCR.space API error, falling back to Tesseract");
        }
        
        // Immediate fallback to local Tesseract processing
        return await this.extractWithTesseract(imageBuffer, useFiltering);
      }
      
    } catch (error) {
      console.error("All OCR methods failed:", error);
      throw new Error("OCR processing failed. Please try again with a different image.");
    }
  }

  private async extractWithOCRSpace(
    imageBuffer: Buffer, 
    useFiltering = false
  ): Promise<OCRResult> {
    // Compress image if it's too large (OCR.space has 1MB limit)
    let processedBuffer = imageBuffer;
    const maxSize = 1024 * 1024; // 1MB limit for OCR.space
    
    if (imageBuffer.length > maxSize) {
      console.log(`Image size ${Math.round(imageBuffer.length / 1024)}KB exceeds limit, compressing...`);
      processedBuffer = await this.compressImage(imageBuffer);
      console.log(`Compressed to ${Math.round(processedBuffer.length / 1024)}KB`);
    }

    // Convert buffer to base64
    const base64Image = processedBuffer.toString('base64');
    const mimeType = this.detectMimeType(processedBuffer);
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Prepare FormData for OCR.space API with optimized settings
    const formData = new FormData();
    formData.append("base64Image", dataUrl);
    formData.append("language", "eng");
    formData.append("OCREngine", "1"); // Use OCR Engine 1 for faster processing
    formData.append("detectOrientation", "false"); // Disable for faster processing
    formData.append("scale", "false"); // Disable for faster processing
    formData.append("isOverlayRequired", "false");
    formData.append("isTable", "false"); // Disable table detection for better general text extraction
    formData.append("detectCheckbox", "false");
    formData.append("checkboxTemplate", "0");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "apikey": this.apiKey,
      },
      body: formData,
      signal: AbortSignal.timeout(20000) // Reduced to 20 seconds timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OCR API error details:`, errorText);
      throw new Error(`OCR API request failed: ${response.status} ${response.statusText} - ${errorText}`);
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
    const wordCount = finalText.trim().split(/\s+/).filter((word: string) => word.length > 0).length;

    return {
      extractedText: finalText,
      confidence,
      wordCount,
      rawText: extractedText !== finalText ? extractedText : undefined,
    };
  }

  private async extractWithTesseract(
    imageBuffer: Buffer, 
    useFiltering = false
  ): Promise<OCRResult> {
    try {
      const Tesseract = await import('tesseract.js');
      
      console.log("Using local Tesseract OCR as fallback...");
      
      const { data: { text, confidence } } = await Tesseract.default.recognize(
        imageBuffer,
        'eng',
        {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              console.log(`Tesseract progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

    let extractedText = text || "";
    
      // Apply filtering if requested
      let filteredText = extractedText;
      if (useFiltering && extractedText) {
        filteredText = this.filterOCRText(extractedText);
      }

      const finalText = filteredText || extractedText;
      const wordCount = finalText.trim().split(/\s+/).filter((word: string) => word.length > 0).length;

      return {
        extractedText: finalText,
        confidence: confidence || 85, // Tesseract typically provides good confidence
        wordCount,
        rawText: extractedText !== finalText ? extractedText : undefined,
      };
    } catch (tesseractError) {
      console.error("Tesseract OCR failed:", tesseractError);
      throw new Error("Local OCR fallback failed. Please try a different image.");
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

  private async compressImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const { createCanvas, loadImage } = await import('canvas');
      
      // Load the image
      const image = await loadImage(imageBuffer);
      const originalWidth = image.width;
      const originalHeight = image.height;
      
      // Calculate new dimensions to stay under 1MB
      // Start with 70% quality and adjust size if needed
      let quality = 0.7;
      let scale = 1.0;
      
      // If image is very large, scale it down
      const maxDimension = 2048;
      if (originalWidth > maxDimension || originalHeight > maxDimension) {
        scale = Math.min(maxDimension / originalWidth, maxDimension / originalHeight);
      }
      
      const newWidth = Math.round(originalWidth * scale);
      const newHeight = Math.round(originalHeight * scale);
      
      // Create canvas and draw resized image
      const canvas = createCanvas(newWidth, newHeight);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, newWidth, newHeight);
      
      // Convert to JPEG with compression
      let compressedBuffer = canvas.toBuffer('image/jpeg', { quality });
      
      // If still too large, reduce quality further
      while (compressedBuffer.length > 1024 * 1024 && quality > 0.3) {
        quality -= 0.1;
        compressedBuffer = canvas.toBuffer('image/jpeg', { quality });
      }
      
      return compressedBuffer;
    } catch (error) {
      console.error('Image compression failed:', error);
      // If compression fails, try to use original but throw error if too large
      if (imageBuffer.length > 1024 * 1024) {
        throw new Error('File size exceeds the maximum size limit. Maximum size limit 1024 KB');
      }
      return imageBuffer;
    }
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
    const wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;
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