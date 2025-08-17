import { type User, insertUserSchema } from "@shared/schema";
import { type z } from "zod";

type InsertUser = z.infer<typeof insertUserSchema>;
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    
    // Handle password hashing if password is provided
    let passwordHash: string | null = null;
    if (insertUser.password) {
      const bcrypt = await import("bcrypt");
      passwordHash = await bcrypt.hash(insertUser.password, 12);
    }
    
    const user: User = { 
      id,
      username: insertUser.username,
      email: insertUser.email,
      passwordHash,
      oauthProvider: insertUser.oauthProvider || null,
      oauthId: insertUser.oauthId || null,
      isPremium: insertUser.isPremium || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
