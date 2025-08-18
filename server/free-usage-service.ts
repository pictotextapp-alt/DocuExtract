import { Request } from "express";
import crypto from "crypto";

/**
 * Free Tier Usage Service
 * Tracks usage by IP + cookie combination
 * Allows 3 extractions per day for free users
 */

export interface FreeUsageData {
  ipAddress: string;
  cookieId: string;
  usageCount: number;
  canProcess: boolean;
  dailyLimit: number;
}

export class FreeUsageService {
  private static readonly DAILY_LIMIT = 3;
  private static readonly COOKIE_NAME = "pictotext_free_user";
  private usageMap = new Map<string, { count: number; lastReset: Date }>();

  /**
   * Get or create a unique identifier for free user
   */
  private getOrCreateCookieId(req: Request): string {
    let cookieId = req.headers.cookie
      ?.split(';')
      .find(c => c.trim().startsWith(`${FreeUsageService.COOKIE_NAME}=`))
      ?.split('=')[1];

    if (!cookieId) {
      cookieId = crypto.randomUUID();
    }

    return cookieId;
  }

  /**
   * Get client IP address
   */
  private getClientIP(req: Request): string {
    return req.ip || 
           req.connection.remoteAddress || 
           req.headers['x-forwarded-for']?.toString().split(',')[0] || 
           'unknown';
  }

  /**
   * Generate unique key for IP + cookie combination
   */
  private generateUsageKey(ipAddress: string, cookieId: string): string {
    return `${ipAddress}_${cookieId}`;
  }

  /**
   * Check if it's a new day and reset counter if needed
   */
  private shouldResetDaily(lastReset: Date): boolean {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return lastReset < yesterday;
  }

  /**
   * Get current usage status for a free user
   */
  getCurrentUsage(req: Request): FreeUsageData {
    const cookieId = this.getOrCreateCookieId(req);
    const ipAddress = this.getClientIP(req);
    const usageKey = this.generateUsageKey(ipAddress, cookieId);
    
    let usageData = this.usageMap.get(usageKey);
    
    // Reset daily counter if needed
    if (usageData && this.shouldResetDaily(usageData.lastReset)) {
      usageData = { count: 0, lastReset: new Date() };
      this.usageMap.set(usageKey, usageData);
    } else if (!usageData) {
      usageData = { count: 0, lastReset: new Date() };
      this.usageMap.set(usageKey, usageData);
    }

    return {
      ipAddress,
      cookieId,
      usageCount: usageData.count,
      canProcess: usageData.count < FreeUsageService.DAILY_LIMIT,
      dailyLimit: FreeUsageService.DAILY_LIMIT
    };
  }

  /**
   * Increment usage count for a free user
   */
  incrementUsage(req: Request): FreeUsageData {
    const cookieId = this.getOrCreateCookieId(req);
    const ipAddress = this.getClientIP(req);
    const usageKey = this.generateUsageKey(ipAddress, cookieId);
    
    let usageData = this.usageMap.get(usageKey);
    
    if (!usageData || this.shouldResetDaily(usageData.lastReset)) {
      usageData = { count: 0, lastReset: new Date() };
    }
    
    usageData.count++;
    this.usageMap.set(usageKey, usageData);

    return {
      ipAddress,
      cookieId,
      usageCount: usageData.count,
      canProcess: usageData.count < FreeUsageService.DAILY_LIMIT,
      dailyLimit: FreeUsageService.DAILY_LIMIT
    };
  }

  /**
   * Set cookie in response for tracking
   */
  setCookieInResponse(res: any, cookieId: string): void {
    res.cookie(FreeUsageService.COOKIE_NAME, cookieId, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
  }
}

export const freeUsageService = new FreeUsageService();