// ============================================
// Input Sanitization & Validation Middleware
// Comprehensive protection against injection attacks
// ============================================

import { sanitizeInput, hasSqlInjection } from "./security";

export interface ValidationRule {
  type: "string" | "number" | "email" | "phone" | "boolean" | "array" | "object";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: any[];
  custom?: (value: any) => string | null; // returns error message or null
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized: Record<string, any>;
}

// Dangerous patterns to detect
const DANGEROUS_PATTERNS = [
  // XSS
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /<iframe[\s>]/i,
  /<object[\s>]/i,
  /<embed[\s>]/i,
  /<form[\s>]/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
  /data:text\/html/i,

  // Path traversal
  /\.\.\//,
  /\.\.\\/,
  /\.\.%2f/i,
  /\.\.%5c/i,

  // Command injection
  /[;&|`$]/,
  /\$\(/,
  /`[^`]*`/,

  // LDAP injection
  /\(\|[a-z]*\)/i,

  // NoSQL injection
  /\$where/i,
  /\$gt/i,
  /\$ne/i,
  /\$regex/i,
];

/**
 * Sanitize a single string value
 */
function sanitizeString(value: string, rules: ValidationRule): { sanitized: string; error?: string } {
  let sanitized = sanitizeInput(value);

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      return { sanitized: "", error: "محتوى غير آمن" };
    }
  }

  // SQL injection check
  if (hasSqlInjection(sanitized)) {
    return { sanitized: "", error: "محتوى غير آمن" };
  }

  // Null byte check
  if (sanitized.includes("\0")) {
    return { sanitized: "", error: "محتوى غير آمن" };
  }

  // Length checks
  if (rules.minLength !== undefined && sanitized.length < rules.minLength) {
    return { sanitized, error: `الحد الأدنى ${rules.minLength} حرف` };
  }

  if (rules.maxLength !== undefined && sanitized.length > rules.maxLength) {
    sanitized = sanitized.substring(0, rules.maxLength);
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(sanitized)) {
    return { sanitized: "", error: "القيمة غير صحيحة" };
  }

  return { sanitized };
}

/**
 * Validate and sanitize an entire request body
 */
export function validateAndSanitize(
  body: Record<string, any>,
  schema: Record<string, ValidationRule>
): ValidationResult {
  const errors: string[] = [];
  const sanitized: Record<string, any> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field} مطلوب`);
      continue;
    }

    // Skip if not present and not required
    if (value === undefined || value === null) {
      sanitized[field] = null;
      continue;
    }

    // Type-specific validation
    switch (rules.type) {
      case "string": {
        if (typeof value !== "string") {
          errors.push(`${field} يجب أن يكون نص`);
          continue;
        }
        const result = sanitizeString(value, rules);
        if (result.error) {
          errors.push(`${field}: ${result.error}`);
        }
        sanitized[field] = result.sanitized;
        break;
      }

      case "number": {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`${field} يجب أن يكون رقم`);
          continue;
        }
        if (rules.min !== undefined && num < rules.min) {
          errors.push(`${field} يجب أن يكون على الأقل ${rules.min}`);
        }
        if (rules.max !== undefined && num > rules.max) {
          errors.push(`${field} يجب أن يكون على الأكثر ${rules.max}`);
        }
        sanitized[field] = num;
        break;
      }

      case "email": {
        if (typeof value !== "string") {
          errors.push(`${field} يجب أن يكون بريد إلكتروني`);
          continue;
        }
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(value) || value.length > 254) {
          errors.push(`${field} بريد إلكتروني غير صحيح`);
        }
        sanitized[field] = value.toLowerCase().trim();
        break;
      }

      case "phone": {
        if (typeof value !== "string") {
          errors.push(`${field} يجب أن يكون رقم هاتف`);
          continue;
        }
        const phoneRegex = /^(\+20|0)?1[0125]\d{8}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ""))) {
          errors.push(`${field} رقم هاتف غير صحيح`);
        }
        sanitized[field] = value.replace(/\s/g, "");
        break;
      }

      case "boolean": {
        sanitized[field] = Boolean(value);
        break;
      }

      case "array": {
        if (!Array.isArray(value)) {
          errors.push(`${field} يجب أن يكون مصفوفة`);
          continue;
        }
        // Sanitize each element
        sanitized[field] = value.map((item) => {
          if (typeof item === "string") {
            return sanitizeInput(item);
          }
          return item;
        });
        break;
      }

      case "object": {
        if (typeof value !== "object" || Array.isArray(value)) {
          errors.push(`${field} يجب أن يكون كائن`);
          continue;
        }
        // Deep sanitize string values
        sanitized[field] = deepSanitize(value);
        break;
      }

      default:
        sanitized[field] = value;
    }

    // Custom validation
    if (rules.custom) {
      const error = rules.custom(sanitized[field]);
      if (error) {
        errors.push(`${field}: ${error}`);
      }
    }
  }

  return { valid: errors.length === 0, errors, sanitized };
}

/**
 * Deep sanitize an object's string values
 */
function deepSanitize(obj: any): any {
  if (typeof obj === "string") return sanitizeInput(obj);
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(deepSanitize);

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = deepSanitize(value);
  }
  return result;
}

/**
 * Predefined schemas for common entities
 */
export const SCHEMAS = {
  product: {
    name: { type: "string" as const, required: true, maxLength: 200 },
    sku: { type: "string" as const, maxLength: 50 },
    price: { type: "number" as const, min: 0 },
    stock: { type: "number" as const, min: 0 },
    category: { type: "string" as const, maxLength: 100 },
    description: { type: "string" as const, maxLength: 2000 },
  },
  customer: {
    name: { type: "string" as const, required: true, maxLength: 200 },
    email: { type: "email" as const },
    phone: { type: "phone" as const },
    address: { type: "string" as const, maxLength: 500 },
  },
  order: {
    customerName: { type: "string" as const, required: true, maxLength: 200 },
    total: { type: "number" as const, min: 0 },
    status: { type: "string" as const, allowedValues: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] },
  },
  invoice: {
    customerName: { type: "string" as const, required: true, maxLength: 200 },
    total: { type: "number" as const, min: 0 },
    status: { type: "string" as const, allowedValues: ["paid", "unpaid", "partial"] },
  },
  expense: {
    description: { type: "string" as const, required: true, maxLength: 500 },
    amount: { type: "number" as const, required: true, min: 0 },
    category: { type: "string" as const, maxLength: 100 },
  },
  user: {
    email: { type: "email" as const, required: true },
    password: { type: "string" as const, required: true, minLength: 8, maxLength: 128 },
  },
};
