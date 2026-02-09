/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 * 
 * Error Handling Utilities
 * Centralized error handling patterns for consistent error management
 */

/**
 * Extract error message from unknown error type
 * Handles various error formats (Error, string, API errors, etc.)
 */
export function getErrorMessage(error: unknown, fallback = "An error occurred"): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  if (error && typeof error === "object") {
    // Handle API error responses
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    
    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }
  }
  
  return fallback;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("NetworkError")
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("401") ||
      error.message.includes("unauthorized") ||
      error.message.includes("authentication")
    );
  }
  
  if (error && typeof error === "object") {
    if ("status" in error && error.status === 401) {
      return true;
    }
  }
  
  return false;
}

/**
 * Create a standardized error object
 */
export interface StandardError {
  message: string;
  code?: string | number;
  status?: number;
  isNetworkError: boolean;
  isAuthError: boolean;
}

export function createStandardError(error: unknown): StandardError {
  return {
    message: getErrorMessage(error),
    isNetworkError: isNetworkError(error),
    isAuthError: isAuthError(error),
  };
}
