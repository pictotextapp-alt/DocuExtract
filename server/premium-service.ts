/**
 * Premium Service
 * Handles premium user verification and PayPal payment processing
 */

import { randomUUID } from "crypto";
import type { PremiumUser, NewPremiumUser, User, NewUser } from "@shared/schema";

export interface PremiumUserData {
  id: string;
  email: string;
  paypalOrderId?: string;
  subscriptionStatus: "active" | "cancelled" | "expired";
}

export class PremiumService {
  private premiumUsers = new Map<string, PremiumUserData>();
  private premiumUsersByEmail = new Map<string, PremiumUserData>();
  private users = new Map<string, User & { monthlyUsageCount: number }>();
  private usersByEmail = new Map<string, User & { monthlyUsageCount: number }>();

  /**
   * Check if email is in premium users list (has paid via PayPal)
   */
  async isPremiumUser(email: string): Promise<boolean> {
    return this.premiumUsersByEmail.has(email);
  }

  /**
   * Add user to premium list after PayPal payment
   */
  async addPremiumUser(email: string, paypalOrderId?: string): Promise<PremiumUserData> {
    const premiumUser: PremiumUserData = {
      id: randomUUID(),
      email,
      paypalOrderId,
      subscriptionStatus: "active"
    };
    
    this.premiumUsers.set(premiumUser.id, premiumUser);
    this.premiumUsersByEmail.set(email, premiumUser);
    
    return premiumUser;
  }

  /**
   * Get premium user by email
   */
  async getPremiumUserByEmail(email: string): Promise<PremiumUserData | undefined> {
    return this.premiumUsersByEmail.get(email);
  }

  /**
   * Create actual user account (only after premium verification)
   */
  async createUser(userData: any): Promise<User> {
    // Check if email is premium first
    const isPremium = await this.isPremiumUser(userData.email);
    if (!isPremium) {
      throw new Error("Only premium subscribers can create accounts. Please purchase premium first.");
    }

    const user: User & { monthlyUsageCount: number } = {
      id: randomUUID(),
      username: userData.username,
      email: userData.email,
      passwordHash: userData.passwordHash || null,
      oauthProvider: userData.oauthProvider || null,
      oauthId: userData.oauthId || null,
      monthlyUsageCount: 0,
      lastUsageReset: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user);

    return user;
  }

  /**
   * Get user by email (only premium users can have accounts)
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersByEmail.get(email);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<any> {
    return this.users.get(id);
  }

  /**
   * Check and reset monthly usage if needed
   */
  async checkAndResetMonthlyUsage(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    const now = new Date();
    const lastReset = new Date(user.lastUsageReset);
    const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                           (now.getMonth() - lastReset.getMonth());

    if (monthsSinceReset >= 1) {
      user.monthlyUsageCount = 0;
      user.lastUsageReset = now;
      this.users.set(userId, user);
    }
  }

  /**
   * Increment monthly usage for premium user
   */
  async incrementMonthlyUsage(userId: string): Promise<number> {
    await this.checkAndResetMonthlyUsage(userId);
    
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    user.monthlyUsageCount++;
    this.users.set(userId, user);

    return user.monthlyUsageCount;
  }

  /**
   * Get monthly usage for premium user
   */
  async getMonthlyUsage(userId: string): Promise<{ count: number; limit: number; canProcess: boolean }> {
    await this.checkAndResetMonthlyUsage(userId);
    
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    const MONTHLY_LIMIT = 1500;
    return {
      count: user.monthlyUsageCount,
      limit: MONTHLY_LIMIT,
      canProcess: user.monthlyUsageCount < MONTHLY_LIMIT
    };
  }

  /**
   * Authenticate user by username/password
   */
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const bcrypt = await import("bcrypt");
    
    for (const [_, user] of this.users) {
      if (user.username === username && user.passwordHash) {
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (isValid) {
          return user;
        }
      }
    }
    return null;
  }

  /**
   * Find user by OAuth provider
   */
  async findUserByOAuth(provider: string, oauthId: string): Promise<User | undefined> {
    for (const [_, user] of this.users) {
      if (user.oauthProvider === provider && user.oauthId === oauthId) {
        return user;
      }
    }
    return undefined;
  }
}

export const premiumService = new PremiumService();