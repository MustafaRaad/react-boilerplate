/**
 * Rate Limiting Utilities
 *
 * Implements client-side rate limiting and request throttling
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();

  /**
   * Check if a request should be allowed
   * @param key - Unique identifier for the rate limit (e.g., endpoint + user ID)
   * @param config - Rate limit configuration
   * @returns true if request is allowed, false if rate limited
   */
  public check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.requests.get(key);

    // No previous requests or window expired
    if (!record || now >= record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Within rate limit
    if (record.count < config.maxRequests) {
      record.count++;
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Get time until rate limit resets
   */
  public getRetryAfter(key: string): number {
    const record = this.requests.get(key);
    if (!record) return 0;

    const now = Date.now();
    return Math.max(0, record.resetTime - now);
  }

  /**
   * Reset rate limit for a specific key
   */
  public reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limit records
   */
  public clearAll(): void {
    this.requests.clear();
  }

  /**
   * Clean up expired records (call periodically)
   */
  public cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now >= record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Cleanup expired records every 5 minutes
if (typeof window !== "undefined") {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

/**
 * Default rate limit configurations for different endpoint types
 */
export const DEFAULT_RATE_LIMITS = {
  // Authentication endpoints
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many login attempts. Please try again in 15 minutes.",
  },

  // Registration
  register: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many registration attempts. Please try again later.",
  },

  // Password reset
  resetPassword: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many password reset requests. Please try again later.",
  },

  // General API calls
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many requests. Please slow down.",
  },

  // File uploads
  upload: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many upload attempts. Please wait a moment.",
  },

  // Search/filter operations
  search: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many search requests. Please slow down.",
  },
} as const;

/**
 * Exponential backoff utility for retrying failed requests
 */
export class ExponentialBackoff {
  private attempt: number = 0;
  private readonly maxAttempts: number;
  private readonly baseDelay: number;
  private readonly maxDelay: number;

  constructor(
    maxAttempts: number = 5,
    baseDelay: number = 1000,
    maxDelay: number = 30000
  ) {
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
  }

  /**
   * Calculate delay for current attempt
   */
  public getDelay(): number {
    const exponentialDelay = this.baseDelay * Math.pow(2, this.attempt);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
    return Math.min(exponentialDelay + jitter, this.maxDelay);
  }

  /**
   * Check if should retry
   */
  public shouldRetry(): boolean {
    return this.attempt < this.maxAttempts;
  }

  /**
   * Increment attempt counter
   */
  public nextAttempt(): void {
    this.attempt++;
  }

  /**
   * Reset attempt counter
   */
  public reset(): void {
    this.attempt = 0;
  }

  /**
   * Get current attempt number
   */
  public getAttempt(): number {
    return this.attempt;
  }
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Create a rate-limited version of an async function
 */
export function createRateLimitedFunction<
  T extends (...args: unknown[]) => Promise<unknown>
>(
  func: T,
  rateLimitKey: string,
  config: RateLimitConfig
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    if (!rateLimiter.check(rateLimitKey, config)) {
      const retryAfter = rateLimiter.getRetryAfter(rateLimitKey);
      throw new Error(
        config.message ||
          `Rate limit exceeded. Retry after ${Math.ceil(
            retryAfter / 1000
          )} seconds.`
      );
    }

    return func(...args) as ReturnType<T>;
  };
}
