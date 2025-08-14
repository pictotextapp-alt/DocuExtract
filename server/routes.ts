import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ocrRequestSchema, type OCRResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // OCR text extraction endpoint
  app.post("/api/extract-text", async (req, res) => {
    try {
      const { image, language = "eng", isTable = false } = ocrRequestSchema.parse(req.body);
      
      // Convert base64 to proper format for OCR.space
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
      
      // Prepare OCR.space API request
      const formData = new FormData();
      formData.append("base64Image", `data:image/png;base64,${base64Data}`);
      formData.append("language", language);
      formData.append("isTable", isTable.toString());
      formData.append("OCREngine", "2"); // Use OCR Engine 2 for better accuracy
      formData.append("detectOrientation", "true");
      formData.append("scale", "true");
      
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

      const extractedText = ocrResult.ParsedResults?.[0]?.ParsedText || "";
      const confidence = ocrResult.ParsedResults?.[0]?.TextOrientation || 0;
      
      // Count words in extracted text
      const wordCount = extractedText.trim() 
        ? extractedText.trim().split(/\s+/).length 
        : 0;

      const result: OCRResponse = {
        text: extractedText.trim(),
        confidence: Math.round(confidence * 100) / 100,
        words: wordCount,
        success: true,
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
