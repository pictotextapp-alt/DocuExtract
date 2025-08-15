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
      
      // Check file size and compress if necessary
      let processedBuffer = req.file.buffer;
      const fileSizeKB = req.file.buffer.length / 1024;
      
      if (fileSizeKB > 900) { // Compress if close to 1MB limit
        processedBuffer = await compressImage(req.file.buffer, req.file.mimetype);
      }
      
      // Convert buffer to base64
      const base64Image = processedBuffer.toString('base64');
      const mimeType = req.file.mimetype;
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      // Prepare OCR.space API request
      const formData = new FormData();
      formData.append("base64Image", dataUrl);
      formData.append("language", "eng");
      formData.append("OCREngine", "2");
      formData.append("detectOrientation", "false");
      formData.append("scale", "true");
      formData.append("isOverlayRequired", "false");
      
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
      const confidence = 85; // Default confidence since OCR.space doesn't provide this reliably
      
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
    return new Promise((resolve, reject) => {
      const { createCanvas, loadImage } = require('canvas');
      
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

  const httpServer = createServer(app);
  return httpServer;
}