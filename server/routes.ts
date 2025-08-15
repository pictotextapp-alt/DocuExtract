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
      
      // Convert buffer to base64
      const base64Image = req.file.buffer.toString('base64');
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
    // Check for OCR garbage - text with too many symbols or unreadable characters
    const hasRealWords = text.match(/\b[A-Za-z]{3,}\b/g);
    const weirdChars = (text.match(/[¥€£™®©§¶†‡•…‰′″‹›«»]/g) || []).length;
    const symbolRatio = (text.match(/[^\w\s]/g) || []).length / text.length;
    
    // If OCR failed (few real words OR lots of weird symbols OR high symbol ratio)
    if (!hasRealWords || hasRealWords.length < 2 || weirdChars > 2 || symbolRatio > 0.4) {
      return "OCR could not extract readable text from this image.\n\nThe text appears to be too stylized, decorative, or low resolution for accurate recognition.\n\nTry using:\n• Plain text documents\n• Screenshots with simple fonts\n• High-contrast images\n• Less decorative text styles";
    }
    
    // Clean up the text by removing obvious social media UI elements
    const lines = text.split(/\n+/).map(line => line.trim()).filter(line => line.length > 0);
    
    const cleanLines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      
      // Skip social media UI elements
      if (lowerLine.match(/\d+(\.\d+)?[km]?\s*(like|follow|view|share|post)/i)) return false;
      if (lowerLine.match(/^(posts?|about|mentions?|reviews?|reels?|manage|edit)/)) return false;
      if (lowerLine.match(/@|\.com|www\.|http/)) return false;
      
      // Keep lines with at least some readable content
      const readableWords = line.split(/\s+/).filter(word => word.match(/^[A-Za-z]{2,}$/));
      return readableWords.length >= 1;
    });
    
    return cleanLines.slice(0, 10).join('\n').trim();
  }

  const httpServer = createServer(app);
  return httpServer;
}