import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import passport from "passport";
import { freeUsageService } from "./free-usage-service";
import { premiumService } from "./premium-service";
// Removed old usage tracking imports - now using new tier system
import { OCRService } from "./ocr-service";
import { blogService } from "./blog-service";
import { insertUserSchema, loginSchema } from "@shared/schema";
import "./oauth-config"; // Initialize passport strategies
import { generateSitemap } from "./sitemap";

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

// Email collection for premium interest
const premiumInterestEmails = new Set<string>();

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
  // SEO endpoints
  app.get("/sitemap.xml", generateSitemap);
  app.get("/robots.txt", (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml

Crawl-delay: 1`);
  });

  // Authentication endpoints
  // Premium interest email collection
  app.post("/api/premium-interest", async (req, res) => {
    try {
      const emailSchema = z.object({
        email: z.string().email("Valid email is required")
      });
      
      const { email } = emailSchema.parse(req.body);
      
      // Add email to interest list
      premiumInterestEmails.add(email.toLowerCase());
      
      console.log(`Added email to premium interest list: ${email}`);
      console.log(`Total interested users: ${premiumInterestEmails.size}`);

      res.json({
        success: true,
        message: "Thank you for your interest! We'll notify you when premium features are available."
      });
    } catch (error: any) {
      console.error("Premium interest error:", error);
      res.status(400).json({ 
        error: error.message || "Failed to save email" 
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
        // Store pending registration data in session for after payment
        (req as any).session.pendingRegistration = {
          username: userData.username,
          email: userData.email,
          password: userData.password
        };

        return res.status(402).json({ 
          error: "Payment required to create premium account.",
          requiresPayment: true,
          email: userData.email
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
      const user = req.user as any; // Set by requirePremiumAuth middleware
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          monthlyUsageCount: user.monthlyUsageCount || 0,
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
  app.post("/api/extract-text", upload.single('file'), async (req, res) => {
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
            error: "Daily limit of 3 free extractions exceeded. Purchase premium for 1500 monthly extractions.",
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

  // Premium interest endpoint (PayPal integration removed)


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

  // Blog API endpoints
  app.get("/api/blog/articles", (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tag = req.query.tag as string;
      const search = req.query.search as string;

      let articles;
      
      if (tag) {
        articles = blogService.getArticlesByTag(tag);
        // Apply pagination to filtered results
        const total = articles.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedArticles = articles.slice(startIndex, startIndex + limit);
        
        res.json({
          articles: paginatedArticles,
          total,
          page,
          totalPages
        });
      } else if (search) {
        articles = blogService.searchArticles(search);
        // Apply pagination to search results
        const total = articles.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedArticles = articles.slice(startIndex, startIndex + limit);
        
        res.json({
          articles: paginatedArticles,
          total,
          page,
          totalPages,
          query: search
        });
      } else {
        const result = blogService.getArticlesPaginated(page, limit);
        res.json(result);
      }
    } catch (error) {
      console.error("Error fetching blog articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/blog/articles/:slug", (req, res) => {
    try {
      const article = blogService.getArticleBySlug(req.params.slug);
      
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching blog article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  app.get("/api/blog/tags", (req, res) => {
    try {
      const tags = blogService.getAllTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching blog tags:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });

  // Refresh blog cache endpoint (useful for development)
  app.post("/api/blog/refresh", (req, res) => {
    try {
      blogService.refreshCache();
      res.json({ message: "Blog cache refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing blog cache:", error);
      res.status(500).json({ error: "Failed to refresh cache" });
    }
  });

  // Return the HTTP server without listening (index.ts handles the listening)
  return createServer(app);
}