import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple OCR text extraction endpoint
  app.post("/api/extract-text", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const useFiltering = req.body.useFiltering === 'true';
      
      // Check file size and compress if necessary, also apply preprocessing
      let processedBuffer = req.file.buffer;
      const fileSizeKB = req.file.buffer.length / 1024;
      
      if (fileSizeKB > 900) { // Compress if close to 1MB limit
        processedBuffer = await compressImage(req.file.buffer, req.file.mimetype);
      } else {
        // Apply image preprocessing for better OCR accuracy
        processedBuffer = await preprocessImage(req.file.buffer, req.file.mimetype);
      }
      
      // Convert buffer to base64
      const base64Image = processedBuffer.toString('base64');
      const mimeType = req.file.mimetype;
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      // Prepare OCR.space API request with enhanced settings
      const formData = new FormData();
      formData.append("base64Image", dataUrl);
      formData.append("language", "eng");
      formData.append("OCREngine", "2"); // Engine 2 is more accurate
      formData.append("detectOrientation", "true"); // Enable orientation detection
      formData.append("scale", "true");
      formData.append("isOverlayRequired", "false");
      formData.append("isTable", "true"); // Better structure detection
      formData.append("filetype", "jpg");
      
      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
          "apikey": process.env.OCR_SPACE_API_KEY || "",
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
      
      // Calculate confidence based on text quality indicators
      const confidence = calculateConfidence(extractedText, ocrResult);
      
      // Apply filtering if requested
      let filteredText = extractedText;
      if (useFiltering && extractedText) {
        filteredText = filterOCRText(extractedText);
      }

      const finalText = filteredText || extractedText;
      const wordCount = finalText.trim().split(/\s+/).filter(word => word.length > 0).length;

      res.json({
        extractedText: finalText,
        rawText: extractedText,
        confidence,
        wordCount,
      });

    } catch (error) {
      console.error('OCR extraction error:', error);
      res.status(500).json({ 
        error: 'Failed to extract text from image',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  function filterOCRText(text: string): string {
    console.log("Original OCR text:", text);
    
    // Check for completely garbled OCR (lots of symbols but no real words)
    const hasRealWords = text.match(/\b[A-Za-z]{3,}\b/g);
    const weirdChars = (text.match(/[¥€£™®©§¶†‡•…‰′″‹›«»]/g) || []).length;
    const symbolRatio = (text.match(/[^\w\s]/g) || []).length / text.length;
    
    console.log("Real words found:", hasRealWords ? hasRealWords.length : 0);
    console.log("Weird chars:", weirdChars);
    console.log("Symbol ratio:", symbolRatio);
    
    // Only show error message for completely garbled text (very high symbol ratio AND very few real words)
    if ((!hasRealWords || hasRealWords.length < 3) && (weirdChars > 5 || symbolRatio > 0.6)) {
      return "OCR could not extract readable text from this image.\n\nThe text appears to be too stylized, decorative, or low resolution for accurate recognition.\n\nTry using:\n• Plain text documents\n• Screenshots with simple fonts\n• High-contrast images\n• Less decorative text styles";
    }
    
    // Clean up the text by removing obvious social media UI elements but keep meaningful content
    const lines = text.split(/\n+/).map(line => line.trim()).filter(line => line.length > 0);
    
    const cleanLines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      
      // Skip obvious UI noise but be less aggressive
      if (lowerLine.match(/^\d+(\.\d+)?[km]?\s*(like|follow|view|share)s?$/i)) return false; // Only skip standalone like/follow counts
      if (lowerLine.match(/^(manage|edit|more)$/i)) return false; // Only skip standalone UI words
      if (lowerLine.match(/^@[a-z0-9_]+$/)) return false; // Skip standalone handles
      
      // Keep lines with any readable content (even single words)
      const readableChars = line.match(/[A-Za-z]/g);
      return readableChars && readableChars.length >= 2; // Keep if has at least 2 letters
    });
    
    const result = cleanLines.slice(0, 20).join('\n').trim(); // Increased limit to 20 lines
    console.log("Filtered result:", result);
    return result;
  }

  async function compressImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const { createCanvas, loadImage } = await import('canvas');
      
      loadImage(buffer).then((img: any) => {
        // Calculate new dimensions to keep under 900KB
        let { width, height } = img;
        const maxDimension = 1200;
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Apply preprocessing while compressing
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = false; // Better for text
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels until under 900KB
        let quality = 0.8;
        let compressedBuffer = canvas.toBuffer('image/jpeg', { quality });
        
        while (compressedBuffer.length > 900 * 1024 && quality > 0.3) {
          quality -= 0.1;
          compressedBuffer = canvas.toBuffer('image/jpeg', { quality });
        }
        
        resolve(compressedBuffer);
      }).catch(reject);
    });
  }

  async function preprocessImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const { createCanvas, loadImage } = await import('canvas');
      
      loadImage(buffer).then((img: any) => {
        const { width, height } = img;
        
        // Create canvas with slight upscaling for better OCR
        const scale = Math.min(2.0, Math.max(1.2, 1600 / Math.max(width, height)));
        const newWidth = Math.floor(width * scale);
        const newHeight = Math.floor(height * scale);
        
        const canvas = createCanvas(newWidth, newHeight);
        const ctx = canvas.getContext('2d');
        
        // White background for better contrast
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, newWidth, newHeight);
        
        // High quality scaling for text
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Enhance contrast slightly
        const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Simple contrast enhancement
          const factor = 1.1;
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));     // R
          data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // G
          data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const processedBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
        resolve(processedBuffer);
      }).catch(reject);
    });
  }

  function calculateConfidence(text: string, ocrResult: any): number {
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

  const httpServer = createServer(app);
  return httpServer;
}