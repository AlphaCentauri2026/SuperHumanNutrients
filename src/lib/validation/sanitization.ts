import DOMPurify from 'dompurify';

// Input sanitization utilities
export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHTML(input: string): string {
    if (typeof window === 'undefined') {
      // Server-side: use basic sanitization
      return this.basicSanitize(input);
    }

    // Client-side: use DOMPurify
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
      ALLOWED_ATTR: ['href', 'target'],
      ALLOW_DATA_ATTR: false,
    });
  }

  /**
   * Basic server-side sanitization
   */
  private static basicSanitize(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Sanitize user input for display
   */
  static sanitizeForDisplay(input: string): string {
    return this.sanitizeHTML(input);
  }

  /**
   * Sanitize user input for database storage
   */
  static sanitizeForStorage(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Sanitize array of strings
   */
  static sanitizeArray(inputs: string[]): string[] {
    return inputs.map(input => this.sanitizeForStorage(input));
  }

  /**
   * Sanitize object values recursively
   */
  static sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized = { ...obj } as Record<string, unknown>;

    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        sanitized[key] = InputSanitizer.sanitizeForStorage(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item =>
          typeof item === 'string'
            ? InputSanitizer.sanitizeForStorage(item)
            : item
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = InputSanitizer.sanitizeObject(
          value as Record<string, unknown>
        );
      }
    }

    return sanitized as T;
  }

  /**
   * Validate and sanitize email addresses
   */
  static sanitizeEmail(email: string): string | null {
    const sanitized = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(sanitized)) {
      return null;
    }

    return sanitized;
  }

  /**
   * Sanitize URLs
   */
  static sanitizeURL(url: string): string | null {
    const sanitized = url.trim();

    try {
      const parsed = new URL(sanitized);

      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }

      return parsed.toString();
    } catch {
      return null;
    }
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: string | number): number | null {
    if (typeof input === 'number') {
      return isFinite(input) ? input : null;
    }

    const parsed = parseFloat(input);
    return isFinite(parsed) ? parsed : null;
  }

  /**
   * Sanitize boolean input
   */
  static sanitizeBoolean(input: unknown): boolean {
    if (typeof input === 'boolean') {
      return input;
    }

    if (typeof input === 'string') {
      const lower = input.toLowerCase();
      return lower === 'true' || lower === '1' || lower === 'yes';
    }

    if (typeof input === 'number') {
      return input === 1;
    }

    return false;
  }
}

// Export convenience functions
export const sanitizeInput = InputSanitizer.sanitizeForStorage;
export const sanitizeHTML = InputSanitizer.sanitizeHTML;
export const sanitizeEmail = InputSanitizer.sanitizeEmail;
export const sanitizeURL = InputSanitizer.sanitizeURL;
export const sanitizeNumber = InputSanitizer.sanitizeNumber;
export const sanitizeBoolean = InputSanitizer.sanitizeBoolean;
export const sanitizeArray = InputSanitizer.sanitizeArray;
export const sanitizeObject = InputSanitizer.sanitizeObject;
