import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ocrRequestSchema, imageEditRequestSchema, type OCRResponse, type ImageEditResponse } from "@shared/schema";

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
              const originalText = word.WordText || "";
              textRegions.push({
                id: `word-${lineIndex}-${wordIndex}`,
                text: originalText,
                originalText: originalText,
                x: parseFloat(word.Left) || 0,
                y: parseFloat(word.Top) || 0,
                width: parseFloat(word.Width) || 0,
                height: parseFloat(word.Height) || 0,
                confidence: parseFloat(word.Confidence) || confidence,
                isVisible: true,
                isDeleted: false,
                isEdited: false,
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

  // Image editing endpoint - modifies original image based on text region changes
  app.post("/api/edit-image", async (req, res) => {
    try {
      console.log("Image edit request received...");
      const { originalImage, textRegions } = imageEditRequestSchema.parse(req.body);
      
      const { createCanvas, loadImage } = await import('canvas');
      
      // Load the original image
      const base64Data = originalImage.replace(/^data:image\/[a-z]+;base64,/, "");
      const imgBuffer = Buffer.from(base64Data, 'base64');
      const img = await loadImage(imgBuffer);
      
      // Create canvas with same dimensions
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Process each text region
      textRegions.forEach(region => {
        if (region.isDeleted || !region.isVisible) {
          // Remove text by filling with background color (simple inpainting)
          // Get surrounding pixels to estimate background color
          const imageData = ctx.getImageData(
            Math.max(0, region.x - 10), 
            Math.max(0, region.y - 10), 
            Math.min(canvas.width - region.x + 10, 20), 
            Math.min(canvas.height - region.y + 10, 20)
          );
          
          // Simple background color estimation (average of surrounding pixels)
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            r += imageData.data[i];
            g += imageData.data[i + 1];
            b += imageData.data[i + 2];
            count++;
          }
          
          const avgR = Math.round(r / count);
          const avgG = Math.round(g / count);
          const avgB = Math.round(b / count);
          
          // Fill the text region with estimated background color
          ctx.fillStyle = `rgb(${avgR}, ${avgG}, ${avgB})`;
          ctx.fillRect(region.x, region.y, region.width, region.height);
          
          // Add some texture/noise to make it less obvious
          for (let i = 0; i < 50; i++) {
            const x = region.x + Math.random() * region.width;
            const y = region.y + Math.random() * region.height;
            const variation = 20;
            ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, avgR + (Math.random() - 0.5) * variation))}, ${Math.max(0, Math.min(255, avgG + (Math.random() - 0.5) * variation))}, ${Math.max(0, Math.min(255, avgB + (Math.random() - 0.5) * variation))})`;
            ctx.fillRect(x, y, 2, 2);
          }
        } else if (region.isEdited && region.text !== region.originalText) {
          // Replace text with new text
          // First, remove the original text (same as deletion)
          const imageData = ctx.getImageData(
            Math.max(0, region.x - 10), 
            Math.max(0, region.y - 10), 
            Math.min(canvas.width - region.x + 10, 20), 
            Math.min(canvas.height - region.y + 10, 20)
          );
          
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            r += imageData.data[i];
            g += imageData.data[i + 1];
            b += imageData.data[i + 2];
            count++;
          }
          
          const avgR = Math.round(r / count);
          const avgG = Math.round(g / count);
          const avgB = Math.round(b / count);
          
          ctx.fillStyle = `rgb(${avgR}, ${avgG}, ${avgB})`;
          ctx.fillRect(region.x, region.y, region.width, region.height);
          
          // Add new text
          const fontSize = Math.max(12, region.height * 0.8);
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          
          // Add text with stroke for visibility
          ctx.strokeText(region.text, region.x, region.y + region.height * 0.8);
          ctx.fillText(region.text, region.x, region.y + region.height * 0.8);
        }
      });
      
      // Convert modified canvas back to base64
      const modifiedImageData = canvas.toDataURL('image/jpeg', 0.9);
      
      const result: ImageEditResponse = {
        modifiedImage: modifiedImageData,
        success: true,
      };
      
      console.log("Image editing completed successfully");
      res.json(result);
    } catch (error) {
      console.error("Image editing error:", error);
      
      const errorResult: ImageEditResponse = {
        modifiedImage: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
      
      res.status(500).json(errorResult);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
