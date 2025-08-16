import { MemoryStorage } from "./memory-storage";

// For development, use memory storage when database is not configured
let useDatabase = false;
let db: any = null;

// Try to initialize database
try {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    db = require("./database").db;
    useDatabase = true;
    console.log("[usage-tracking] Using database storage");
  } else {
    console.log("[usage-tracking] DATABASE_URL not configured, using memory storage");
  }
} catch (error) {
  console.log("[usage-tracking] Database initialization failed, using memory storage:", error instanceof Error ? error.message : String(error));
}

// Anonymous usage tracking using session ID
export async function getAnonymousUsage(sessionId: string, date = new Date()) {
  // Always use memory storage for anonymous users
  return MemoryStorage.getDailyUsage(`anon_${sessionId}`, date);
}

export async function getDailyUsage(userId: string, date = new Date()) {
  if (useDatabase && db) {
    // Use database implementation
    const { eq, and, gte, lt, count } = await import("drizzle-orm");
    const { usageLogs } = await import("@shared/schema");

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [result] = await db
      .select({ count: count() })
      .from(usageLogs)
      .where(
        and(
          eq(usageLogs.userId, userId),
          gte(usageLogs.imageProcessed, startOfDay),
          lt(usageLogs.imageProcessed, endOfDay)
        )
      );

    return {
      imageCount: result.count,
      dailyLimit: 3,
      canProcess: result.count < 3,
    };
  } else {
    // Use memory storage
    return MemoryStorage.getDailyUsage(userId, date);
  }
}

export async function canProcessImageAnonymous(sessionId: string): Promise<{
  canProcess: boolean;
  reason?: string;
  usage: { imageCount: number; dailyLimit: number };
}> {
  const usage = await getAnonymousUsage(sessionId);
  
  return {
    canProcess: usage.canProcess,
    reason: usage.canProcess ? undefined : "Daily limit reached for anonymous users",
    usage: {
      imageCount: usage.imageCount,
      dailyLimit: usage.dailyLimit,
    },
  };
}

export async function canProcessImage(userId: string): Promise<{
  canProcess: boolean;
  reason?: string;
  usage: { imageCount: number; dailyLimit: number };
}> {
  if (useDatabase && db) {
    // Use database implementation
    const { eq } = await import("drizzle-orm");
    const { users } = await import("@shared/schema");

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

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
    const usage = await getDailyUsage(userId);
    
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
  } else {
    // Use memory storage
    return MemoryStorage.canProcessImage(userId);
  }
}

export async function recordAnonymousImageProcessing(
  sessionId: string,
  extractedWords: number,
  confidence: number
): Promise<void> {
  // Always use memory storage for anonymous users
  return MemoryStorage.recordImageProcessing(`anon_${sessionId}`, extractedWords, confidence);
}

export async function recordImageProcessing(
  userId: string, 
  extractedWords: number, 
  confidence: number
): Promise<void> {
  if (useDatabase && db) {
    // Use database implementation
    const { usageLogs } = await import("@shared/schema");

    await db.insert(usageLogs).values({
      userId,
      extractedWords,
      confidence,
    });
  } else {
    // Use memory storage
    return MemoryStorage.recordImageProcessing(userId, extractedWords, confidence);
  }
}