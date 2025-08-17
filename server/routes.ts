import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import passport from "passport";
import { createUser, authenticateUser, getUserById } from "./auth";
import { 
  canProcessImage, 
  getDailyUsage, 
  recordImageProcessing,
  getAnonymousUsage,
  canProcessImageAnonymous,
  recordAnonymousImageProcessing
} from "./usage-tracking";
import { OCRService } from "./ocr-service";
import { insertUserSchema, loginSchema } from "@shared/schema";
import "./oauth-config"; // Initialize passport strategies

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Initialize OCR service
let ocrService: OCRService;
try {
  ocrService = new OCRService();
} catch (error) {
  console.warn("OCR Service not initialized:", error);
}

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await createUser(userData);
      
      // Create session
      (req as any).session.userId = user.id;
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isPremium: user.isPremium,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await authenticateUser(credentials);
      
      // Create session
      (req as any).session.userId = user.id;
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isPremium: user.isPremium,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    (req as any).session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const user = await getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Anonymous usage endpoint
  app.get("/api/usage", async (req, res) => {
    try {
      const session = (req as any).session;
      
      if (session.userId) {
        // Authenticated user
        const usage = await getDailyUsage(session.userId);
        res.json(usage);
      } else {
        // Anonymous user - use session ID for tracking
        if (!session.id) {
          return res.status(400).json({ error: "Session not available" });
        }
        const usage = await getAnonymousUsage(session.id);
        res.json(usage);
      }
    } catch (error) {
      console.error("Usage check error:", error);
      res.status(500).json({ error: "Failed to check usage" });
    }
  });

  // OCR Processing endpoint - now supports anonymous users
  app.post("/api/extract-text", upload.single('image'), async (req, res) => {
    try {
      const session = (req as any).session;
      const useFiltering = req.body.useFiltering === 'true';
      
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Check if OCR service is available
      if (!ocrService) {
        return res.status(503).json({ 
          error: "OCR service is not available. Please check OCR_SPACE_API_KEY configuration." 
        });
      }

      let usageCheck: any;
      let isAuthenticated = !!session.userId;

      if (isAuthenticated) {
        // Authenticated user
        usageCheck = await canProcessImage(session.userId);
      } else {
        // Anonymous user - use session ID for tracking
        if (!session.id) {
          return res.status(400).json({ error: "Session not available" });
        }
        usageCheck = await canProcessImageAnonymous(session.id);
      }

      // Check usage limits
      if (!usageCheck.canProcess) {
        return res.status(429).json({ 
          error: usageCheck.reason,
          limitExceeded: true,
          usage: usageCheck.usage,
          requiresAuth: !isAuthenticated // Tell frontend to show auth modal
        });
      }

      // Process the image with OCR
      const result = await ocrService.extractTextFromImage(req.file.buffer, useFiltering);
      
      // Record the usage
      if (isAuthenticated) {
        await recordImageProcessing(session.userId, result.wordCount, result.confidence);
      } else {
        await recordAnonymousImageProcessing(session.id, result.wordCount, result.confidence);
      }
      
      res.json(result);
    } catch (error) {
      console.error("OCR processing error:", error);
      
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      
      res.status(500).json({ error: "Failed to process image" });
    }
  });

  // PayPal integration endpoints
  app.get("/api/paypal/setup", async (req, res) => {
    try {
      // For development, return mock client token
      // In production, this would generate actual PayPal client token
      res.json({
        clientToken: "development-client-token",
      });
    } catch (error) {
      console.error("PayPal setup error:", error);
      res.status(500).json({ error: "Failed to setup PayPal" });
    }
  });

  app.post("/api/paypal/order", requireAuth, async (req, res) => {
    try {
      const { amount, currency, intent } = req.body;
      
      if (!amount || !currency) {
        return res.status(400).json({ error: "Amount and currency are required" });
      }

      // For development, simulate successful order creation
      // In production, this would use PayPal SDK
      const mockOrder = {
        id: `ORDER_${Date.now()}`,
        status: "CREATED",
        amount: amount,
        currency: currency,
        intent: intent
      };
      
      res.json(mockOrder);
    } catch (error) {
      console.error("PayPal order creation error:", error);
      res.status(500).json({ error: "Failed to create PayPal order" });
    }
  });

  app.post("/api/paypal/order/:orderID/capture", requireAuth, async (req, res) => {
    try {
      const { orderID } = req.params;
      const userId = (req as any).session.userId;
      
      // For development, simulate successful capture and upgrade user
      // In production, this would capture the PayPal payment
      const { updateUserPremiumStatus } = await import("./auth");
      await updateUserPremiumStatus(userId, true);
      
      res.json({
        id: orderID,
        status: "COMPLETED",
        purchaseUnits: [{
          amount: { value: "4.99", currency_code: "USD" }
        }]
      });
    } catch (error) {
      console.error("PayPal capture error:", error);
      res.status(500).json({ error: "Failed to capture PayPal order" });
    }
  });

  // Google OAuth routes
  app.get("/api/auth/google", 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get("/api/auth/google/callback", 
    passport.authenticate('google', { 
      failureRedirect: '/?error=auth_failed',
      failureMessage: true 
    }),
    (req, res) => {
      // Successful authentication
      const user = req.user as any;
      if (user) {
        (req as any).session.userId = user.id;
        console.log('Google OAuth success for user:', user.email);
        res.redirect('/?auth=success'); // Redirect to main app with success indicator
      } else {
        console.log('Google OAuth failed: no user returned');
        res.redirect('/?error=auth_failed');
      }
    }
  );

  // Add logout route
  app.post("/api/logout", (req, res) => {
    (req as any).session.destroy();
    res.json({ success: true });
  });

  // Return the HTTP server without listening (index.ts handles the listening)
  return createServer(app);
}