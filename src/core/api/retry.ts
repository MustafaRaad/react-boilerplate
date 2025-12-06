/**
 * API Retry Logic with Exponential Backoff
 * Advanced retry mechanism for failed API requests
 */

export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries: number;

  /**
   * Initial delay between retries in milliseconds
   * @default 1000
   */
  initialDelay: number;

  /**
   * Maximum delay between retries in milliseconds
   * @default 30000
   */
  maxDelay: number;

  /**
   * Exponential backoff multiplier
   * @default 2
   */
  backoffMultiplier: number;

  /**
   * Add random jitter to delays to avoid thundering herd
   * @default true
   */
  jitter: boolean;

  /**
   * HTTP status codes that should trigger a retry
   * @default [408, 429, 500, 502, 503, 504]
   */
  retryableStatusCodes: number[];

  /**
   * Custom function to determine if a request should be retried
   */
  shouldRetry?: (error: RetryableError) => boolean;

  /**
   * Callback invoked before each retry attempt
   */
  onRetry?: (attempt: number, error: RetryableError, delay: number) => void;
}

export interface RetryableError {
  code: number;
  message: string;
  raw: unknown;
  isNetworkError?: boolean;
  isTimeout?: boolean;
}

export interface RetryState {
  attempt: number;
  maxRetries: number;
  nextDelay: number;
  startTime: number;
  errors: RetryableError[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Exponential backoff calculator
 */
export class ExponentialBackoffCalculator {
  private config: RetryConfig;
  private state: RetryState;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
    this.state = {
      attempt: 0,
      maxRetries: this.config.maxRetries,
      nextDelay: this.config.initialDelay,
      startTime: Date.now(),
      errors: [],
    };
  }

  /**
   * Check if another retry should be attempted
   */
  shouldRetry(error?: RetryableError): boolean {
    if (this.state.attempt >= this.config.maxRetries) {
      return false;
    }

    if (!error) {
      return true;
    }

    // Check custom retry logic
    if (this.config.shouldRetry) {
      return this.config.shouldRetry(error);
    }

    // Always retry network errors and timeouts
    if (error.isNetworkError || error.isTimeout) {
      return true;
    }

    // Check if status code is retryable
    if (this.config.retryableStatusCodes.includes(error.code)) {
      return true;
    }

    // Don't retry client errors (4xx except 408, 429)
    if (error.code >= 400 && error.code < 500) {
      return false;
    }

    // Retry server errors (5xx)
    return error.code >= 500;
  }

  /**
   * Get the delay for the next retry attempt
   */
  getDelay(): number {
    return this.state.nextDelay;
  }

  /**
   * Calculate and advance to the next retry attempt
   */
  nextAttempt(error?: RetryableError): number {
    if (error) {
      this.state.errors.push(error);
    }

    this.state.attempt++;

    // Calculate exponential backoff delay
    let delay =
      this.config.initialDelay *
      Math.pow(this.config.backoffMultiplier, this.state.attempt - 1);

    // Apply maximum delay cap
    delay = Math.min(delay, this.config.maxDelay);

    // Add jitter if enabled (randomize ±25%)
    if (this.config.jitter) {
      const jitterRange = delay * 0.25;
      const jitterValue = Math.random() * jitterRange * 2 - jitterRange;
      delay = delay + jitterValue;
    }

    this.state.nextDelay = Math.max(0, Math.floor(delay));

    // Invoke onRetry callback
    if (this.config.onRetry && error) {
      this.config.onRetry(this.state.attempt, error, this.state.nextDelay);
    }

    return this.state.nextDelay;
  }

  /**
   * Reset the retry state
   */
  reset(): void {
    this.state = {
      attempt: 0,
      maxRetries: this.config.maxRetries,
      nextDelay: this.config.initialDelay,
      startTime: Date.now(),
      errors: [],
    };
  }

  /**
   * Get current retry state
   */
  getState(): Readonly<RetryState> {
    return { ...this.state };
  }

  /**
   * Get total elapsed time since first attempt
   */
  getElapsedTime(): number {
    return Date.now() - this.state.startTime;
  }
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const calculator = new ExponentialBackoffCalculator(config);

  while (true) {
    try {
      const result = await fn();
      calculator.reset();
      return result;
    } catch (error) {
      const retryableError = normalizeError(error);

      if (!calculator.shouldRetry(retryableError)) {
        throw error;
      }

      const delay = calculator.nextAttempt(retryableError);
      await sleep(delay);
    }
  }
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalize errors to RetryableError format
 */
function normalizeError(error: unknown): RetryableError {
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    return {
      code: (err.code as number) ?? 0,
      message: (err.message as string) ?? "Unknown error",
      raw: error,
      isNetworkError:
        err.name === "NetworkError" ||
        err.message?.toString().includes("network"),
      isTimeout:
        err.name === "TimeoutError" ||
        err.message?.toString().includes("timeout"),
    };
  }

  return {
    code: 0,
    message: String(error),
    raw: error,
    isNetworkError: false,
    isTimeout: false,
  };
}

/**
 * Create a retry configuration for specific scenarios
 */
export function createRetryConfig(
  scenario: "fast" | "standard" | "persistent"
): RetryConfig {
  switch (scenario) {
    case "fast":
      // Fast retry for time-sensitive operations
      return {
        maxRetries: 2,
        initialDelay: 500,
        maxDelay: 2000,
        backoffMultiplier: 2,
        jitter: true,
        retryableStatusCodes: [408, 429, 502, 503, 504],
      };

    case "standard":
      // Standard retry for most operations
      return DEFAULT_RETRY_CONFIG;

    case "persistent":
      // Persistent retry for critical operations
      return {
        maxRetries: 5,
        initialDelay: 2000,
        maxDelay: 60000,
        backoffMultiplier: 2,
        jitter: true,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      };

    default:
      return DEFAULT_RETRY_CONFIG;
  }
}

/**
 * Retry decorator for class methods
 */
export function Retry(config: Partial<RetryConfig> = {}) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return withRetry(() => originalMethod.apply(this, args), config);
    };

    return descriptor;
  };
}
