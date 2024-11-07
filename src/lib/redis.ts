import Redis from "ioredis-json";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL environment variable is not defined");
}

let redis: Redis;

try {
  redis = new Redis(process.env.REDIS_URL);

  redis.on("error", (error: any) => {
    console.error("Redis connection error:", error);
  });

  redis.on("connect", () => {
    console.log("Successfully connected to Redis");
  });
} catch (error) {
  console.error("Failed to initialize Redis:", error);
  // Fallback to use local state if Redis fails
  redis = {
    json: {
      get: async () => null,
      set: async () => null,
    },
  } as any;
}

export default redis;
