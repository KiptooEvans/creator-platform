import { createClient, RedisClientType } from 'redis';
import { config } from '../config/config';

export class RedisService {
  private static client: RedisClientType;

  public static async initialize(): Promise<void> {
    try {
      this.client = createClient({
        url: config.redisUrl,
        socket: {
          connectTimeout: 5000
        },
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('🔗 Redis connecting...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis connected successfully');
      });

      this.client.on('end', () => {
        console.log('📦 Redis connection closed');
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      // Don't throw error, allow app to run without Redis
      console.warn('⚠️ Continuing without Redis caching...');
    }
  }

  public static async get(key: string): Promise<string | null> {
    try {
      if (!this.client?.isOpen) {
        console.warn('⚠️ Redis not available, skipping cache get');
        return null;
      }
      return await this.client.get(key);
    } catch (error) {
      console.error('❌ Redis GET error:', error);
      return null;
    }
  }

  public static async set(
    key: string,
    value: string,
    ttl?: number
  ): Promise<boolean> {
    try {
      if (!this.client?.isOpen) {
        console.warn('⚠️ Redis not available, skipping cache set');
        return false;
      }

      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('❌ Redis SET error:', error);
      return false;
    }
  }

  public static async del(key: string): Promise<boolean> {
    try {
      if (!this.client?.isOpen) {
        console.warn('⚠️ Redis not available, skipping cache delete');
        return false;
      }
      
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('❌ Redis DEL error:', error);
      return false;
    }
  }

  public static async exists(key: string): Promise<boolean> {
    try {
      if (!this.client?.isOpen) {
        return false;
      }
      
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('❌ Redis EXISTS error:', error);
      return false;
    }
  }

  public static async setJSON(
    key: string,
    value: any,
    ttl?: number
  ): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString, ttl);
    } catch (error) {
      console.error('❌ Redis SET JSON error:', error);
      return false;
    }
  }

  public static async getJSON<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.get(key);
      if (!jsonString) return null;
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('❌ Redis GET JSON error:', error);
      return null;
    }
  }

  public static async increment(key: string, by: number = 1): Promise<number> {
    try {
      if (!this.client?.isOpen) {
        console.warn('⚠️ Redis not available, skipping increment');
        return 0;
      }
      
      return await this.client.incrBy(key, by);
    } catch (error) {
      console.error('❌ Redis INCREMENT error:', error);
      return 0;
    }
  }

  public static async expire(key: string, ttl: number): Promise<boolean> {
    try {
      if (!this.client?.isOpen) {
        return false;
      }
      
      const result = await this.client.expire(key, ttl);
      return result;
    } catch (error) {
      console.error('❌ Redis EXPIRE error:', error);
      return false;
    }
  }

  public static async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      if (!this.client?.isOpen) {
        return 0;
      }
      
      return await this.client.lPush(key, values);
    } catch (error) {
      console.error('❌ Redis LPUSH error:', error);
      return 0;
    }
  }

  public static async rpop(key: string): Promise<string | null> {
    try {
      if (!this.client?.isOpen) {
        return null;
      }
      
      return await this.client.rPop(key);
    } catch (error) {
      console.error('❌ Redis RPOP error:', error);
      return null;
    }
  }

  public static async lrange(
    key: string,
    start: number = 0,
    end: number = -1
  ): Promise<string[]> {
    try {
      if (!this.client?.isOpen) {
        return [];
      }
      
      return await this.client.lRange(key, start, end);
    } catch (error) {
      console.error('❌ Redis LRANGE error:', error);
      return [];
    }
  }

  public static async flushAll(): Promise<boolean> {
    try {
      if (!this.client?.isOpen) {
        return false;
      }
      
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('❌ Redis FLUSH ALL error:', error);
      return false;
    }
  }

  // Session Management
  public static async setSession(
    sessionId: string,
    data: any,
    ttl: number = 3600 // 1 hour default
  ): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await this.setJSON(key, data, ttl);
  }

  public static async getSession<T>(sessionId: string): Promise<T | null> {
    const key = `session:${sessionId}`;
    return await this.getJSON<T>(key);
  }

  public static async deleteSession(sessionId: string): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await this.del(key);
  }

  // Rate Limiting
  public static async checkRateLimit(
    key: string,
    limit: number,
    window: number
  ): Promise<{ allowed: boolean; count: number; resetTime: number }> {
    try {
      if (!this.client?.isOpen) {
        return { allowed: true, count: 0, resetTime: Date.now() + window * 1000 };
      }

      const now = Date.now();
      const windowStart = now - window * 1000;
      
      // Use Redis pipeline for atomic operations
      const pipeline = this.client.multi();
      pipeline.zRemRangeByScore(key, '-inf', windowStart);
      pipeline.zCard(key);
      pipeline.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
      pipeline.expire(key, window);
      
      const results = await pipeline.exec();
      const count = results[1] as number;
      
      return {
        allowed: count < limit,
        count,
        resetTime: now + window * 1000
      };
    } catch (error) {
      console.error('❌ Redis rate limit check error:', error);
      return { allowed: true, count: 0, resetTime: Date.now() + window * 1000 };
    }
  }

  public static async close(): Promise<void> {
    try {
      if (this.client?.isOpen) {
        await this.client.quit();
      }
    } catch (error) {
      console.error('❌ Error closing Redis connection:', error);
    }
  }
}