// Memory-based storage for development when database is not configured
import bcrypt from "bcrypt";
import { PublicUser, NewUser, LoginCredentials } from "@shared/schema";

interface InMemoryUser extends PublicUser {
  passwordHash: string;
}

interface UsageRecord {
  userId: string;
  date: string;
  imageCount: number;
}

// In-memory storage
let users: InMemoryUser[] = [];
let usageRecords: UsageRecord[] = [];
let sessions: Map<string, string> = new Map(); // sessionId -> userId

const SALT_ROUNDS = 12;

export class MemoryStorage {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async createUser(userData: NewUser): Promise<PublicUser> {
    // Check if username or email already exists
    const existingUser = users.find(
      user => user.username === userData.username || user.email === userData.email
    );

    if (existingUser) {
      if (existingUser.username === userData.username) {
        throw new Error("Username already exists");
      }
      if (existingUser.email === userData.email) {
        throw new Error("Email already exists");
      }
    }

    const passwordHash = await this.hashPassword(userData.password);
    
    const newUser: InMemoryUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: userData.username,
      email: userData.email,
      passwordHash,
      isPremium: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);

    // Return user without password hash
    const { passwordHash: _, ...publicUser } = newUser;
    return publicUser;
  }

  static async authenticateUser(credentials: LoginCredentials): Promise<PublicUser> {
    const user = users.find(u => u.username === credentials.username);

    if (!user) {
      throw new Error("Invalid username or password");
    }

    const isValidPassword = await this.verifyPassword(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid username or password");
    }

    // Return user without password hash
    const { passwordHash: _, ...publicUser } = user;
    return publicUser;
  }

  static async getUserById(id: string): Promise<PublicUser | null> {
    const user = users.find(u => u.id === id);

    if (!user) {
      return null;
    }

    // Return user without password hash
    const { passwordHash: _, ...publicUser } = user;
    return publicUser;
  }

  static async updateUserPremiumStatus(userId: string, isPremium: boolean): Promise<void> {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.isPremium = isPremium;
      user.updatedAt = new Date();
    }
  }

  static async getDailyUsage(userId: string, date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];
    
    const usage = usageRecords.find(
      record => record.userId === userId && record.date === dateStr
    );

    const DAILY_LIMIT_FREE = 3;

    return {
      imageCount: usage?.imageCount || 0,
      dailyLimit: DAILY_LIMIT_FREE,
      canProcess: (usage?.imageCount || 0) < DAILY_LIMIT_FREE,
    };
  }

  static async canProcessImage(userId: string): Promise<{
    canProcess: boolean;
    reason?: string;
    usage: { imageCount: number; dailyLimit: number };
  }> {
    // Get user to check premium status
    const user = users.find(u => u.id === userId);

    if (!user) {
      return {
        canProcess: false,
        reason: "User not found",
        usage: { imageCount: 0, dailyLimit: 3 },
      };
    }

    // Premium users have unlimited access
    if (user.isPremium) {
      return {
        canProcess: true,
        usage: { imageCount: 0, dailyLimit: -1 }, // -1 indicates unlimited
      };
    }

    // Check daily usage for free users
    const usage = await this.getDailyUsage(userId);
    
    if (!usage.canProcess) {
      return {
        canProcess: false,
        reason: "Daily limit exceeded. Upgrade to Premium for unlimited access.",
        usage: { imageCount: usage.imageCount, dailyLimit: usage.dailyLimit },
      };
    }

    return {
      canProcess: true,
      usage: { imageCount: usage.imageCount, dailyLimit: usage.dailyLimit },
    };
  }

  static async recordImageProcessing(
    userId: string, 
    extractedWords: number, 
    confidence: number
  ): Promise<void> {
    const dateStr = new Date().toISOString().split('T')[0];
    
    const existingRecord = usageRecords.find(
      record => record.userId === userId && record.date === dateStr
    );

    if (existingRecord) {
      existingRecord.imageCount += 1;
    } else {
      usageRecords.push({
        userId,
        date: dateStr,
        imageCount: 1,
      });
    }
  }

  // Session management
  static setSession(sessionId: string, userId: string): void {
    sessions.set(sessionId, userId);
  }

  static getSession(sessionId: string): string | undefined {
    return sessions.get(sessionId);
  }

  static clearSession(sessionId: string): void {
    sessions.delete(sessionId);
  }
}