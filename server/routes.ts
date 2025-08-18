import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import passport from "passport";
import { freeUsageService } from "./free-usage-service";
import { premiumService } from "./premium-service";
// Removed old usage tracking imports - now using new tier system
import { OCRService } from "./ocr-service";
import { insertUserSchema, loginSchema, paypalPaymentSchema } from "@shared/schema";
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

// Premium authentication middleware - only premium users can log in
async function requirePremiumAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  const user = await premiumService.getUserById(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }
  
  req.user = user;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  // PayPal payment endpoint - MUST be called before registration
  app.post("/api/payment/paypal", async (req, res) => {
    try {
      const paymentData = paypalPaymentSchema.parse(req.body);
      
      // TODO: Integrate with actual PayPal SDK
      // For now, simulate successful payment
      const mockPaypalOrderId = `PAYPAL_${Date.now()}`;
      
      // Add user to premium list after payment
      await premiumService.addPremiumUser(paymentData.email, mockPaypalOrderId);
      
      res.json({
        success: true,
        message: "Payment successful! You can now create your account.",
        paypalOrderId: mockPaypalOrderId
      });
    } catch (error: any) {
      console.error("PayPal payment error:", error);
      res.status(400).json({ 
        error: error.message || "Payment processing failed" 
      });
    }
  });

  // Registration endpoint - ONLY for premium users who have already paid
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email is in premium users list
      const isPremium = await premiumService.isPremiumUser(userData.email);
      if (!isPremium) {
        return res.status(403).json({ 
          error: "Only premium subscribers can create accounts. Please purchase premium first." 
        });
      }
      
      // Hash password if provided
      let passwordHash: string | undefined;
      if (userData.password) {
        const bcrypt = await import("bcrypt");
        passwordHash = await bcrypt.hash(userData.password, 12);
      }
      
      const user = await premiumService.createUser({
        ...userData,
        passwordHash
      });
      
      // Automatically log in the user after registration
      (req as any).session.userId = user.id;
      
      res.json({
        message: "Premium account created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ 
        error: error.message || "Failed to create account" 
      });
    }
  });

  // Login endpoint - ONLY for premium users
  app.post("/api/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await premiumService.authenticateUser(credentials.username, credentials.password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Create session
      (req as any).session.userId = user.id;
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ 
        error: error.message || "Login failed" 
      });
    }
  });

  app.post("/api/logout", (req, res) => {
    (req as any).session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Get current user - ONLY for premium authenticated users
  app.get("/api/user", requirePremiumAuth, async (req, res) => {
    try {
      const user = req.user; // Set by requirePremiumAuth middleware
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          monthlyUsageCount: user.monthlyUsageCount,
          isPremium: true // All users who can access this endpoint are premium
        }
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Usage endpoint - supports both free (anonymous) and premium users
  app.get("/api/usage", async (req, res) => {
    try {
      const session = (req as any).session;
      
      if (session.userId) {
        // Premium authenticated user
        const usage = await premiumService.getMonthlyUsage(session.userId);
        res.json({
          imageCount: usage.count,
          monthlyLimit: usage.limit,
          canProcess: usage.canProcess,
          userType: "premium"
        });
      } else {
        // Free anonymous user
        const usage = freeUsageService.getCurrentUsage(req);
        // Set cookie for tracking
        freeUsageService.setCookieInResponse(res, usage.cookieId);
        res.json({
          imageCount: usage.usageCount,
          dailyLimit: usage.dailyLimit,
          canProcess: usage.canProcess,
          userType: "free"
        });
      }
    } catch (error) {
      console.error("Usage tracking error:", error);
      res.status(500).json({ error: "Failed to get usage data" });
    }
  });

  // OCR Processing endpoint - supports both free and premium users
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

      let canProcess = false;
      let isPremium = !!session.userId;

      if (isPremium) {
        // Premium authenticated user
        const usage = await premiumService.getMonthlyUsage(session.userId);
        canProcess = usage.canProcess;
        
        if (!canProcess) {
          return res.status(429).json({ 
            error: "Monthly limit of 1500 extractions exceeded",
            limitExceeded: true,
            userType: "premium"
          });
        }
      } else {
        // Free anonymous user
        const usage = freeUsageService.getCurrentUsage(req);
        canProcess = usage.canProcess;
        
        if (!canProcess) {
          return res.status(429).json({ 
            error: "Daily limit of 3 free extractions exceeded. Purchase premium for unlimited access.",
            limitExceeded: true,
            userType: "free",
            requiresPayment: true // Tell frontend to show payment options
          });
        }
      }

      // Process the image with OCR
      const result = await ocrService.extractTextFromImage(req.file.buffer, useFiltering);
      
      // Record the usage
      if (isPremium) {
        await premiumService.incrementMonthlyUsage(session.userId);
      } else {
        const usage = freeUsageService.incrementUsage(req);
        freeUsageService.setCookieInResponse(res, usage.cookieId);
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

  app.post("/api/paypal/order", async (req, res) => {
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

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    try {
      const { orderID } = req.params;
      const userId = (req as any).session.userId;
      
      // For development, simulate successful capture
      // In production, this would capture the PayPal payment
      // Note: Payment verification is handled in /api/payment/paypal endpoint
      
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
      // Check if user needs payment first
      const user = req.user as any;
      if (user && user.needsPayment) {
        // Store OAuth data in session temporarily and redirect to payment flow
        (req as any).session.pendingOAuth = {
          email: user.email,
          oauthData: user.oauthData
        };
        console.log('Google OAuth requires payment for:', user.email);
        res.redirect('/?payment=required&email=' + encodeURIComponent(user.email));
        return;
      }
      
      // Successful authentication for premium user
      if (user && user.id) {
        (req as any).session.userId = user.id;
        console.log('Google OAuth success for premium user:', user.email);
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