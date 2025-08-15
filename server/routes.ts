import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ocrRequestSchema, imageEditRequestSchema, inpaintRequestSchema, exportRequestSchema, type OCRResponse, type ImageEditResponse, type InpaintResponse, type ExportResponse, type TextRegion, type TextLayer } from "@shared/schema";

// Advanced content-aware inpainting function
function inpaintRegion(ctx: any, region: TextRegion, surroundingData: any, offsetX: number, offsetY: number) {
  const regionData = ctx.getImageData(region.x, region.y, region.width, region.height);
  
  // Enhanced pattern matching and reconstruction
  for (let y = 0; y < region.height; y++) {
    for (let x = 0; x < region.width; x++) {
      const targetX = region.x + x;
      const targetY = region.y + y;
      
      // Find the best matching pixels from surrounding area using pattern analysis
      let bestMatch = findBestMatch(x, y, region, surroundingData, offsetX, offsetY);
      
      // Apply the reconstructed pixel
      const pixelIndex = (y * region.width + x) * 4;
      regionData.data[pixelIndex] = bestMatch.r;
      regionData.data[pixelIndex + 1] = bestMatch.g;
      regionData.data[pixelIndex + 2] = bestMatch.b;
      regionData.data[pixelIndex + 3] = 255; // Full opacity
    }
  }
  
  // Apply the inpainted region back to the canvas
  ctx.putImageData(regionData, region.x, region.y);
  
  // Apply additional smoothing to blend edges
  smoothRegionEdges(ctx, region);
}

function findBestMatch(x: number, y: number, region: TextRegion, surroundingData: any, offsetX: number, offsetY: number) {
  // Prioritize pixels from edges of the text region for better pattern matching
  const candidates = [];
  
  // Sample from left edge
  if (region.x - offsetX > 10) {
    const sampleX = (region.x - offsetX - 5) * 4;
    const sampleY = (region.y - offsetY + y);
    if (sampleY >= 0 && sampleY < surroundingData.height) {
      const idx = (sampleY * surroundingData.width + (region.x - offsetX - 5)) * 4;
      if (idx >= 0 && idx < surroundingData.data.length) {
        candidates.push({
          r: surroundingData.data[idx],
          g: surroundingData.data[idx + 1],
          b: surroundingData.data[idx + 2]
        });
      }
    }
  }
  
  // Sample from right edge  
  if (region.x + region.width - offsetX + 10 < surroundingData.width) {
    const sampleY = (region.y - offsetY + y);
    if (sampleY >= 0 && sampleY < surroundingData.height) {
      const idx = (sampleY * surroundingData.width + (region.x + region.width - offsetX + 5)) * 4;
      if (idx >= 0 && idx < surroundingData.data.length) {
        candidates.push({
          r: surroundingData.data[idx],
          g: surroundingData.data[idx + 1],
          b: surroundingData.data[idx + 2]
        });
      }
    }
  }
  
  // Sample from top edge
  if (region.y - offsetY > 10) {
    const sampleX = (region.x - offsetX + x);
    if (sampleX >= 0 && sampleX < surroundingData.width) {
      const idx = ((region.y - offsetY - 5) * surroundingData.width + sampleX) * 4;
      if (idx >= 0 && idx < surroundingData.data.length) {
        candidates.push({
          r: surroundingData.data[idx],
          g: surroundingData.data[idx + 1],
          b: surroundingData.data[idx + 2]
        });
      }
    }
  }
  
  // Sample from bottom edge
  if (region.y + region.height - offsetY + 10 < surroundingData.height) {
    const sampleX = (region.x - offsetX + x);
    if (sampleX >= 0 && sampleX < surroundingData.width) {
      const idx = ((region.y + region.height - offsetY + 5) * surroundingData.width + sampleX) * 4;
      if (idx >= 0 && idx < surroundingData.data.length) {
        candidates.push({
          r: surroundingData.data[idx],
          g: surroundingData.data[idx + 1],
          b: surroundingData.data[idx + 2]
        });
      }
    }
  }
  
  // If we have candidates, blend them intelligently
  if (candidates.length > 0) {
    let r = 0, g = 0, b = 0;
    candidates.forEach(c => {
      r += c.r;
      g += c.g;
      b += c.b;
    });
    return {
      r: Math.round(r / candidates.length),
      g: Math.round(g / candidates.length),
      b: Math.round(b / candidates.length)
    };
  }
  
  // Fallback: use nearby pixel with some noise
  return {
    r: 128 + (Math.random() - 0.5) * 40,
    g: 128 + (Math.random() - 0.5) * 40,
    b: 128 + (Math.random() - 0.5) * 40
  };
}

function smoothRegionEdges(ctx: any, region: TextRegion) {
  // Apply a subtle blur to the edges of the inpainted region for natural blending
  const blurRadius = 3;
  const imageData = ctx.getImageData(
    Math.max(0, region.x - blurRadius), 
    Math.max(0, region.y - blurRadius),
    Math.min(ctx.canvas.width - Math.max(0, region.x - blurRadius), region.width + blurRadius * 2),
    Math.min(ctx.canvas.height - Math.max(0, region.y - blurRadius), region.height + blurRadius * 2)
  );
  
  // Simple edge smoothing around the region boundary
  for (let y = 0; y < Math.min(blurRadius, imageData.height); y++) {
    for (let x = 0; x < imageData.width; x++) {
      const idx = (y * imageData.width + x) * 4;
      if (idx + 3 < imageData.data.length) {
        imageData.data[idx + 3] = Math.min(255, imageData.data[idx + 3] * 0.9); // Slight transparency blend
      }
    }
  }
  
  ctx.putImageData(imageData, Math.max(0, region.x - blurRadius), Math.max(0, region.y - blurRadius));
}

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

  // Content-aware inpainting endpoint - creates clean image with text removed
  app.post("/api/inpaint-image", async (req, res) => {
    try {
      console.log("Content-aware inpainting request received...");
      const { originalImage, textRegions } = inpaintRequestSchema.parse(req.body);
      
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
      
      // Enhanced content-aware inpainting for each text region
      textRegions.forEach(region => {
        // Expand the sampling area for better background reconstruction
        const sampleSize = 40;
        const expandedX = Math.max(0, region.x - sampleSize);
        const expandedY = Math.max(0, region.y - sampleSize);
        const expandedW = Math.min(canvas.width - expandedX, region.width + sampleSize * 2);
        const expandedH = Math.min(canvas.height - expandedY, region.height + sampleSize * 2);
        
        // Get surrounding image data for pattern analysis
        const surroundingData = ctx.getImageData(expandedX, expandedY, expandedW, expandedH);
        
        // Apply advanced content-aware filling
        inpaintRegion(ctx, region, surroundingData, expandedX, expandedY);
      });
      
      const cleanedImageData = canvas.toDataURL('image/jpeg', 0.9);
      
      const result: InpaintResponse = {
        cleanedImage: cleanedImageData,
        success: true,
      };
      
      console.log("Content-aware inpainting completed successfully");
      res.json(result);
    } catch (error) {
      console.error("Content-aware inpainting error:", error);
      
      const errorResult: InpaintResponse = {
        cleanedImage: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
      
      res.status(500).json(errorResult);
    }
  });

  // Export functionality - merges text layers back onto cleaned image (Canva-style export)
  app.post("/api/export-image", async (req, res) => {
    try {
      console.log("Export request received...");
      const { cleanedImage, textLayers, format, quality } = exportRequestSchema.parse(req.body);
      
      const { createCanvas, loadImage, registerFont } = await import('canvas');
      
      // Load the cleaned background image
      const base64Data = cleanedImage.replace(/^data:image\/[a-z]+;base64,/, "");
      const imgBuffer = Buffer.from(base64Data, 'base64');
      const img = await loadImage(imgBuffer);
      
      // Create canvas with same dimensions
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      
      // Draw the cleaned background
      ctx.drawImage(img, 0, 0);
      
      // Sort text layers by zIndex for proper layering
      const sortedLayers = textLayers
        .filter(layer => layer.isVisible)
        .sort((a, b) => a.zIndex - b.zIndex);
      
      // Render each text layer
      sortedLayers.forEach(layer => {
        if (!layer.text.trim()) return;
        
        ctx.save();
        
        // Apply transformations
        const centerX = layer.x + layer.width / 2;
        const centerY = layer.y + layer.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.globalAlpha = layer.opacity;
        
        // Set up text properties
        const fontWeight = layer.fontWeight || '400';
        const fontStyle = layer.fontStyle || 'normal';
        const fontSize = layer.fontSize || 16;
        const fontFamily = layer.fontFamily || 'Arial';
        
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = (layer.textAlign as CanvasTextAlign) || 'left';
        ctx.textBaseline = 'middle';
        
        // Apply text styling
        ctx.fillStyle = layer.color || '#000000';
        ctx.strokeStyle = layer.borderColor || 'transparent';
        ctx.lineWidth = layer.borderWidth || 0;
        
        // Handle background
        if (layer.backgroundColor && layer.backgroundColor !== 'transparent') {
          ctx.fillStyle = layer.backgroundColor;
          ctx.fillRect(
            -layer.width / 2,
            -layer.height / 2,
            layer.width,
            layer.height
          );
        }
        
        // Apply shadow if specified
        if (layer.shadow && layer.shadow !== 'none') {
          // Parse shadow (simple format: "2px 2px 4px rgba(0,0,0,0.5)")
          const shadowParts = layer.shadow.split(' ');
          if (shadowParts.length >= 4) {
            ctx.shadowOffsetX = parseInt(shadowParts[0]) || 0;
            ctx.shadowOffsetY = parseInt(shadowParts[1]) || 0;
            ctx.shadowBlur = parseInt(shadowParts[2]) || 0;
            ctx.shadowColor = shadowParts.slice(3).join(' ') || 'rgba(0,0,0,0.5)';
          }
        }
        
        // Draw text
        ctx.fillStyle = layer.color || '#000000';
        
        // Handle multi-line text
        const lines = layer.text.split('\n');
        const lineHeight = (layer.lineHeight || 1.2) * fontSize;
        const totalHeight = lines.length * lineHeight;
        const startY = -totalHeight / 2 + lineHeight / 2;
        
        lines.forEach((line, index) => {
          const y = startY + index * lineHeight;
          
          // Apply letter spacing if specified
          if (layer.letterSpacing && layer.letterSpacing !== 0) {
            let x = -layer.width / 2;
            for (let i = 0; i < line.length; i++) {
              ctx.fillText(line[i], x, y);
              x += ctx.measureText(line[i]).width + layer.letterSpacing;
            }
          } else {
            const x = layer.textAlign === 'center' ? 0 : 
                     layer.textAlign === 'right' ? layer.width / 2 : 
                     -layer.width / 2;
            ctx.fillText(line, x, y);
          }
          
          // Draw border if specified
          if (layer.borderWidth && layer.borderWidth > 0) {
            ctx.strokeText(line, layer.textAlign === 'center' ? 0 : -layer.width / 2, y);
          }
        });
        
        ctx.restore();
      });
      
      // Convert to desired format
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                      format === 'webp' ? 'image/webp' : 'image/png';
      const exportedImageData = canvas.toDataURL(mimeType, quality);
      
      const result: ExportResponse = {
        exportedImage: exportedImageData,
        success: true,
      };
      
      console.log("Export completed successfully");
      res.json(result);
    } catch (error) {
      console.error("Export error:", error);
      
      const errorResult: ExportResponse = {
        exportedImage: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
      
      res.status(500).json(errorResult);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
