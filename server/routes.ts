import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ocrRequestSchema, type OCRResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // OCR text extraction endpoint
  app.post("/api/extract-text", async (req, res) => {
    try {
      console.log("OCR request received, validating data...");
      const { image, language = "eng", isTable = false } = ocrRequestSchema.parse(req.body);
      
      // Convert base64 to proper format for OCR.space
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
      console.log(`Processing image, base64 size: ${base64Data.length} characters`);
      
      // Prepare OCR.space API request
      const formData = new FormData();
      formData.append("base64Image", `data:image/jpeg;base64,${base64Data}`);
      formData.append("language", language);
      formData.append("isTable", isTable.toString());
      formData.append("OCREngine", "2"); // Use OCR Engine 2 for better accuracy
      formData.append("detectOrientation", "true");
      formData.append("scale", "true");
      formData.append("isOverlayRequired", "true"); // Request text overlay with coordinates
      
      console.log("Sending request to OCR.space API...");
      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
          "apikey": process.env.OCR_SPACE_API_KEY || "",
        },
        body: formData,
      });

      if (!response.ok) {
        console.error(`OCR API returned ${response.status}: ${response.statusText}`);
        throw new Error(`OCR API request failed: ${response.statusText}`);
      }

      const ocrResult = await response.json();
      console.log("OCR API response:", JSON.stringify(ocrResult, null, 2));
      
      if (ocrResult.IsErroredOnProcessing) {
        console.error("OCR processing error:", ocrResult.ErrorMessage);
        throw new Error(ocrResult.ErrorMessage || "OCR processing failed");
      }

      const extractedText = ocrResult.ParsedResults?.[0]?.ParsedText || "";
      const confidence = parseFloat(ocrResult.ParsedResults?.[0]?.TextOrientation) || 95; // Default confidence
      
      // Parse text regions with coordinates from TextOverlay
      const textRegions: any[] = [];
      const overlay = ocrResult.ParsedResults?.[0]?.TextOverlay;
      
      if (overlay?.Lines && overlay.Lines.length > 0) {
        overlay.Lines.forEach((line: any, lineIndex: number) => {
          if (line.Words && line.Words.length > 0) {
            line.Words.forEach((word: any, wordIndex: number) => {
              textRegions.push({
                id: `word-${lineIndex}-${wordIndex}`,
                text: word.WordText || "",
                x: parseFloat(word.Left) || 0,
                y: parseFloat(word.Top) || 0,
                width: parseFloat(word.Width) || 0,
                height: parseFloat(word.Height) || 0,
                confidence: parseFloat(word.Confidence) || confidence,
                isVisible: true,
              });
            });
          }
        });
      }
      
      // Count words in extracted text
      const wordCount = extractedText.trim() 
        ? extractedText.trim().split(/\s+/).length 
        : 0;

      console.log(`Extraction successful: ${wordCount} words, ${textRegions.length} regions, confidence: ${confidence}%`);

      const result: OCRResponse = {
        text: extractedText.trim(),
        confidence: Math.round(confidence * 100) / 100,
        words: wordCount,
        success: true,
        textRegions: textRegions,
      };

      res.json(result);
    } catch (error) {
      console.error("OCR extraction error:", error);
      
      const errorResult: OCRResponse = {
        text: "",
        confidence: 0,
        words: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
      
      res.status(500).json(errorResult);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
