import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
    });

    redis.on("connect", () => {
      console.log("[Redis] Connected successfully");
    });
  }
  return redis;
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis();
    const data = await r.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    console.error("[Redis] getCache error:", err);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 300,
): Promise<void> {
  try {
    const r = getRedis();
    await r.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    console.error("[Redis] setCache error:", err);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const r = getRedis();
    const keys = await r.keys(pattern);
    if (keys.length > 0) {
      await r.del(...keys);
    }
  } catch (err) {
    console.error("[Redis] invalidateCache error:", err);
  }
}

export const CACHE_KEYS = {
  projects: () => "ember:projects",
  project: (id: string) => `ember:project:${id}`,
};
