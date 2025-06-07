import Redis from "ioredis";
import { config } from "../config/env";
import logger from "../utils/logger";

class CacheService {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    if (config.redis.url) {
      this.connect();
    }
  }

  private connect() {
    try {
      this.client = new Redis(config.redis.url!, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.client.on("connect", () => {
        this.isConnected = true;
        logger.info("Redis connected successfully");
      });

      this.client.on("error", (error) => {
        logger.error("Redis connection error:", error);
        this.isConnected = false;
      });
    } catch (error) {
      logger.error("Failed to initialize Redis:", error);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(
    key: string,
    value: string,
    ttl: number = config.redis.ttl
  ): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.set(key, value, "EX", ttl);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(":")}`;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;