import { MemoryStorage } from "./memory-storage";
import { type PublicUser, type NewUser, type LoginCredentials } from "@shared/schema";

// For development, use memory storage when database is not configured
let useDatabase = false;
let db: any = null;

// Try to initialize database
try {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    db = require("./database").db;
    useDatabase = true;
    console.log("[auth] Using database storage");
  } else {
    console.log("[auth] DATABASE_URL not configured, using memory storage");
  }
} catch (error) {
  console.log("[auth] Database initialization failed, using memory storage:", error.message);
}

export async function createUser(userData: NewUser): Promise<PublicUser> {
  if (useDatabase && db) {
    // Use database implementation
    const bcrypt = await import("bcrypt");
    const { eq } = await import("drizzle-orm");
    const { users } = await import("@shared/schema");

    const existingUser = await db.query.users.findFirst({
      where: (users: any, { or, eq }: any) => or(
        eq(users.username, userData.username),
        eq(users.email, userData.email)
      ),
    });

    if (existingUser) {
      if (existingUser.username === userData.username) {
        throw new Error("Username already exists");
      }
      if (existingUser.email === userData.email) {
        throw new Error("Email already exists");
      }
    }

    const passwordHash = await bcrypt.hash(userData.password, 12);
    
    const [newUser] = await db.insert(users).values({
      username: userData.username,
      email: userData.email,
      passwordHash,
      isPremium: false,
    }).returning();

    const { passwordHash: _, ...publicUser } = newUser;
    return publicUser;
  } else {
    // Use memory storage
    return MemoryStorage.createUser(userData);
  }
}

export async function authenticateUser(credentials: LoginCredentials): Promise<PublicUser> {
  if (useDatabase && db) {
    // Use database implementation
    const bcrypt = await import("bcrypt");
    const { eq } = await import("drizzle-orm");
    const { users } = await import("@shared/schema");

    const user = await db.query.users.findFirst({
      where: eq(users.username, credentials.username),
    });

    if (!user) {
      throw new Error("Invalid username or password");
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid username or password");
    }

    const { passwordHash: _, ...publicUser } = user;
    return publicUser;
  } else {
    // Use memory storage
    return MemoryStorage.authenticateUser(credentials);
  }
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  if (useDatabase && db) {
    // Use database implementation
    const { eq } = await import("drizzle-orm");
    const { users } = await import("@shared/schema");

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return null;
    }

    const { passwordHash: _, ...publicUser } = user;
    return publicUser;
  } else {
    // Use memory storage
    return MemoryStorage.getUserById(id);
  }
}

export async function updateUserPremiumStatus(userId: string, isPremium: boolean): Promise<void> {
  if (useDatabase && db) {
    // Use database implementation
    const { eq } = await import("drizzle-orm");
    const { users } = await import("@shared/schema");

    await db.update(users)
      .set({ 
        isPremium, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  } else {
    // Use memory storage
    return MemoryStorage.updateUserPremiumStatus(userId, isPremium);
  }
}