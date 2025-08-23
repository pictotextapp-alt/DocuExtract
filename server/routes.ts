import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { OCRService } from "./ocr-service";
import { FreeUsageService } from "./free-usage-service";

const upload = multer({ storage: multer.memoryStorage() });
const ocrService = new OCRService();
const usageService = new FreeUsageService();

export async function registerRoutes(app: Express): Promise<Server> {
  // OCR Text Extraction Endpoint
  app.post("/api/extract-text", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const useFiltering = req.body.useFiltering === 'true';
      
      // Check usage limits for anonymous users
      const sessionId = req.sessionID;
      const canProcess = await usageService.canProcess(sessionId);
      
      if (!canProcess.allowed) {
        return res.status(429).json({ 
          error: "Daily limit exceeded", 
          limitExceeded: true,
          requiresAuth: true 
        });
      }

      // Process the image
      const result = await ocrService.extractTextFromImage(req.file.buffer, useFiltering);
      
      // Track usage
      await usageService.trackUsage(sessionId);

      res.json({
        ok: true,
        extractedText: result.extractedText,
        text: result.extractedText,
        confidence: result.confidence,
        words: result.wordCount,
        wordCount: result.wordCount
      });
    } catch (error) {
      console.error("OCR processing error:", error);
      res.status(500).json({ error: "OCR processing failed" });
    }
  });

  // Usage tracking endpoint
  app.get("/api/usage", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const usage = await usageService.getUsage(sessionId);
      
      res.json({
        imageCount: usage.count,
        dailyLimit: usage.limit,
        canProcess: usage.count < usage.limit
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get usage" });
    }
  });

  // User endpoint (mock for now)
  app.get("/api/user", (req, res) => {
    res.status(401).json({ error: "Not authenticated" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
