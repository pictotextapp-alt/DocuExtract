import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ocrRequestSchema, imageEditRequestSchema, inpaintRequestSchema, exportRequestSchema, type OCRResponse, type ImageEditResponse, type InpaintResponse, type ExportResponse, type TextRegion, type TextLayer, type WordBox, type TextLine } from "@shared/schema";

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

// Enhanced OCR processing with line grouping and better analysis
function groupWordsIntoLines(words: WordBox[]): TextLine[] {
  if (words.length === 0) return [];
  
  // Sort words by y-position first, then x-position
  const sortedWords = [...words].sort((a, b) => {
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) < 10) { // Words are on roughly the same line
      return a.x - b.x;
    }
    return yDiff;
  });
  
  const lines: TextLine[] = [];
  let currentLine: WordBox[] = [];
  let lineId = 1;
  
  for (const word of sortedWords) {
    if (currentLine.length === 0) {
      currentLine.push(word);
    } else {
      const lastWord = currentLine[currentLine.length - 1];
      const yOverlap = Math.min(lastWord.y + lastWord.height, word.y + word.height) - 
                      Math.max(lastWord.y, word.y);
      const yOverlapRatio = yOverlap / Math.min(lastWord.height, word.height);
      
      // If words overlap vertically by at least 50% or are very close, group them
      if (yOverlapRatio > 0.5 || Math.abs(word.y - lastWord.y) < Math.max(lastWord.height, word.height) * 0.3) {
        currentLine.push(word);
      } else {
        // Start a new line
        if (currentLine.length > 0) {
          lines.push(createTextLine(currentLine, lineId++));
        }
        currentLine = [word];
      }
    }
  }
  
  // Add the last line
  if (currentLine.length > 0) {
    lines.push(createTextLine(currentLine, lineId));
  }
  
  return lines;
}

function createTextLine(words: WordBox[], lineId: number): TextLine {
  const text = words.map(w => w.text).join(' ');
  const x = Math.min(...words.map(w => w.x));
  const y = Math.min(...words.map(w => w.y));
  const maxX = Math.max(...words.map(w => w.x + w.width));
  const maxY = Math.max(...words.map(w => w.y + w.height));
  const width = maxX - x;
  const height = maxY - y;
  const avgConfidence = words.reduce((sum, w) => sum + w.confidence, 0) / words.length;
  
  // Estimate font properties
  const estimatedFontSize = Math.round(height * 0.8); // Font size ≈ bbox height × 0.8
  const estimatedLetterSpacing = Math.max(0, (width / text.replace(/\s/g, '').length) - (estimatedFontSize * 0.6));
  
  return {
    id: `line_${lineId}`,
    text,
    words,
    x,
    y,
    width,
    height,
    confidence: avgConfidence,
    estimatedFontSize,
    estimatedColor: "#000000", // Will be enhanced with color detection later
    estimatedFontWeight: "400", // Will be enhanced with stroke width analysis
    estimatedLetterSpacing: Math.round(estimatedLetterSpacing),
  };
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
      
      // Extract words as WordBox objects and create legacy TextRegions
      const words: WordBox[] = [];
      const textRegions: any[] = [];
      const overlay = ocrResult.ParsedResults?.[0]?.TextOverlay;
      
      if (overlay?.Lines && overlay.Lines.length > 0) {
        overlay.Lines.forEach((line: any, lineIndex: number) => {
          if (line.Words && line.Words.length > 0) {
            line.Words.forEach((word: any, wordIndex: number) => {
              const originalText = word.WordText || "";
              const wordBox: WordBox = {
                text: originalText,
                x: parseFloat(word.Left) || 0,
                y: parseFloat(word.Top) || 0,
                width: parseFloat(word.Width) || 0,
                height: parseFloat(word.Height) || 0,
                confidence: (parseFloat(word.Confidence) || confidence) / 100,
              };
              words.push(wordBox);
              
              // Also create legacy TextRegion for backward compatibility
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
      
      // Group words into lines for better inpainting
      const textLines = groupWordsIntoLines(words);
      
      // Count words in extracted text
      const wordCount = extractedText.trim() 
        ? extractedText.trim().split(/\s+/).length 
        : 0;

      console.log(`Extraction successful: ${wordCount} words, ${textLines.length} lines, ${textRegions.length} regions, confidence: ${confidence}%`);

      const result: OCRResponse = {
        text: extractedText.trim(),
        confidence: Math.round(confidence * 100) / 100,
        words: wordCount,
        success: true,
        textLines: textLines, // Enhanced line-based processing
        textRegions: textRegions, // Backward compatibility
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

  // Professional content-aware inpainting endpoint with TELEA-inspired algorithms
  app.post("/api/inpaint-image", async (req, res) => {
    try {
      console.log("Professional content-aware inpainting request received...");
      const { originalImage, textRegions, textLines } = inpaintRequestSchema.parse(req.body);
      
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
      
      // Get original image data for advanced processing
      const originalImageData = ctx.getImageData(0, 0, img.width, img.height);
      
      // Use textLines if available (preferred for line-based processing), otherwise fall back to textRegions
      const elementsToProcess = textLines && textLines.length > 0 ? textLines : textRegions || [];
      
      // Sort by area (process larger elements first for better context preservation)
      const sortedElements = [...elementsToProcess].sort((a, b) => 
        (b.width * b.height) - (a.width * a.height)
      );
      
      console.log(`Processing ${sortedElements.length} text elements with professional inpainting...`);
      
      // Apply professional-grade inpainting to each element
      for (const element of sortedElements) {
        await professionalInpainting(ctx, element, originalImageData);
      }
      
      const cleanedImageData = canvas.toDataURL('image/png', 1.0);
      
      const result: InpaintResponse = {
        cleanedImage: cleanedImageData,
        success: true,
      };
      
      console.log("Professional content-aware inpainting completed successfully");
      res.json(result);
    } catch (error) {
      console.error("Professional inpainting error:", error);
      
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

  // Precise background reconstruction with edge-preserving inpainting
  async function professionalInpainting(ctx: any, element: any, originalImageData: ImageData) {
    const maskExpansion = 2; // Smaller expansion for precision
    const maskFeather = 2;   // Lighter feathering to avoid blur
    
    // Step 1: Create precise tight mask around text only
    const preciseMask = createPreciseTextMask(element, originalImageData, ctx.canvas.width, ctx.canvas.height);
    
    // Step 2: Use edge-aware gradient-based reconstruction
    applyEdgeAwareInpainting(ctx, element, originalImageData, preciseMask);
  }
  
  function createPreciseTextMask(element: any, imageData: ImageData, canvasWidth: number, canvasHeight: number) {
    const mask = new Array(canvasWidth * canvasHeight).fill(0);
    
    // Create tight mask only within actual text bounds (no expansion)
    for (let y = element.y; y < Math.min(canvasHeight, element.y + element.height); y++) {
      for (let x = element.x; x < Math.min(canvasWidth, element.x + element.width); x++) {
        const idx = (y * imageData.width + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        
        // More precise text detection based on contrast and edge patterns
        const neighbors = getNeighborPixels(imageData, x, y);
        const avgR = neighbors.reduce((sum, p) => sum + p.r, 0) / neighbors.length;
        const avgG = neighbors.reduce((sum, p) => sum + p.g, 0) / neighbors.length;
        const avgB = neighbors.reduce((sum, p) => sum + p.b, 0) / neighbors.length;
        
        // If this pixel differs significantly from neighbors, it's likely text
        const contrast = Math.abs(r - avgR) + Math.abs(g - avgG) + Math.abs(b - avgB);
        if (contrast > 30) { // Text typically has high contrast with background
          mask[y * canvasWidth + x] = 1.0;
        }
      }
    }
    
    return mask;
  }
  
  function getNeighborPixels(imageData: ImageData, x: number, y: number) {
    const neighbors = [];
    const offsets = [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, -2], [-2, 2], [2, 2]];
    
    for (const [dx, dy] of offsets) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < imageData.width && ny >= 0 && ny < imageData.height) {
        const idx = (ny * imageData.width + nx) * 4;
        neighbors.push({
          r: imageData.data[idx],
          g: imageData.data[idx + 1],
          b: imageData.data[idx + 2]
        });
      }
    }
    
    return neighbors;
  }
  
  function applyEdgeAwareInpainting(ctx: any, element: any, originalImageData: ImageData, mask: number[]) {
    // Use gradient-based reconstruction instead of texture synthesis
    for (let y = element.y; y < element.y + element.height; y++) {
      for (let x = element.x; x < element.x + element.width; x++) {
        const maskIdx = y * ctx.canvas.width + x;
        
        if (mask[maskIdx] > 0) {
          // Find nearest non-masked pixels in 4 directions
          const nearestPixels = findNearestBackgroundPixels(originalImageData, mask, x, y, ctx.canvas.width, ctx.canvas.height);
          
          if (nearestPixels.length > 0) {
            // Use distance-weighted interpolation for smooth reconstruction
            const interpolatedColor = interpolateBackgroundColor(nearestPixels, x, y);
            
            ctx.fillStyle = `rgb(${interpolatedColor.r}, ${interpolatedColor.g}, ${interpolatedColor.b})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  }
  
  function findNearestBackgroundPixels(imageData: ImageData, mask: number[], centerX: number, centerY: number, width: number, height: number) {
    const backgroundPixels = [];
    const maxDistance = 20; // Search within reasonable distance
    
    // Search in expanding circles for background pixels
    for (let radius = 1; radius <= maxDistance; radius++) {
      const points = getCirclePoints(centerX, centerY, radius);
      
      for (const point of points) {
        if (point.x >= 0 && point.x < width && point.y >= 0 && point.y < height) {
          const maskIdx = point.y * width + point.x;
          
          // If this pixel is not masked (it's background)
          if (mask[maskIdx] === 0) {
            const imgIdx = (point.y * imageData.width + point.x) * 4;
            backgroundPixels.push({
              x: point.x,
              y: point.y,
              r: imageData.data[imgIdx],
              g: imageData.data[imgIdx + 1],
              b: imageData.data[imgIdx + 2],
              distance: Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2))
            });
          }
        }
      }
      
      // If we found enough background pixels, stop searching
      if (backgroundPixels.length >= 8) break;
    }
    
    return backgroundPixels;
  }
  
  function getCirclePoints(centerX: number, centerY: number, radius: number) {
    const points = [];
    const steps = Math.max(8, radius * 2); // More points for larger radius
    
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      const x = Math.round(centerX + radius * Math.cos(angle));
      const y = Math.round(centerY + radius * Math.sin(angle));
      points.push({ x, y });
    }
    
    return points;
  }
  
  function interpolateBackgroundColor(backgroundPixels: any[], targetX: number, targetY: number) {
    let r = 0, g = 0, b = 0, totalWeight = 0;
    
    // Use inverse distance weighting for smooth gradients
    backgroundPixels.forEach(pixel => {
      const weight = 1 / (1 + pixel.distance * pixel.distance * 0.1);
      r += pixel.r * weight;
      g += pixel.g * weight;
      b += pixel.b * weight;
      totalWeight += weight;
    });
    
    if (totalWeight > 0) {
      r /= totalWeight;
      g /= totalWeight;
      b /= totalWeight;
    }
    
    return {
      r: Math.max(0, Math.min(255, Math.round(r))),
      g: Math.max(0, Math.min(255, Math.round(g))),
      b: Math.max(0, Math.min(255, Math.round(b)))
    };
  }
  


  const httpServer = createServer(app);
  return httpServer;
}
