// ============================================
// API Request Validation & Security
// Enterprise-grade API protection
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput, hasSqlInjection } from "./security";
import { auditSecurity } from "./audit";

/**
 * Validate request body against schema
 */
export function validateRequestBody(
  body: any,
  schema: Record<string, { type: string; required?: boolean; maxLength?: number; pattern?: RegExp }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field} مطلوب`);
      continue;
    }

    // Skip further validation if not present and not required
    if (value === undefined || value === null) continue;

    // Type check
    if (rules.type === "string" && typeof value !== "string") {
      errors.push(`${field} يجب أن يكون نص`);
    }

    if (rules.type === "number" && typeof value !== "number") {
      errors.push(`${field} يجب أن يكون رقم`);
    }

    if (rules.type === "email" && typeof value === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${field} بريد إلكتروني غير صحيح`);
      }
    }

    // Max length
    if (rules.maxLength && typeof value === "string" && value.length > rules.maxLength) {
      errors.push(`${field} طويل جداً (الحد الأقصى ${rules.maxLength})`);
    }

    // Pattern
    if (rules.pattern && typeof value === "string" && !rules.pattern.test(value)) {
      errors.push(`${field} غير صحيح`);
    }

    // XSS check for string fields
    if (typeof value === "string") {
      if (hasSqlInjection(value)) {
        errors.push(`${field} يحتوي على محتوى غير مسموح`);
      }
      // Check for script tags
      if (/<script[\s>]/i.test(value)) {
        errors.push(`${field} يحتوي على محتوى غير مسموح`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Security middleware for API routes
 */
export async function apiSecurityGuard(
  request: NextRequest,
  options: {
    rateLimitKey?: string;
    maxBodySize?: number;
    requireAuth?: boolean;
  } = {}
): Promise<{ allowed: boolean; response?: NextResponse }> {
  // 1. Check Content-Type for POST/PUT/PATCH
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json") && !contentType.includes("multipart/form-data")) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: "Content-Type غير مسموح" },
          { status: 415 }
        ),
      };
    }
  }

  // 2. Check for suspicious headers
  const suspiciousHeaders = ["x-forwarded-host", "x-host", "x-original-url", "x-rewrite-url"];
  for (const header of suspiciousHeaders) {
    const value = request.headers.get(header);
    if (value) {
      await auditSecurity("security.suspicious_activity", {
        details: { header, value, url: request.url },
        request,
      });
    }
  }

  // 3. Check request size
  const contentLength = parseInt(request.headers.get("content-length") || "0");
  const maxSize = options.maxBodySize || 10 * 1024 * 1024; // 10MB default
  if (contentLength > maxSize) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "حجم الطلب كبير جداً" },
        { status: 413 }
      ),
    };
  }

  // 4. Method not allowed
  const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
  if (!allowedMethods.includes(request.method)) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Method غير مسموح" },
        { status: 405 }
      ),
    };
  }

  return { allowed: true };
}

/**
 * Sanitize API response to remove sensitive fields
 */
export function sanitizeResponse(data: any, sensitiveFields: string[] = []): any {
  const defaultSensitive = [
    "password", "password_hash", "hashed_password", "secret",
    "api_key", "apikey", "access_token", "refresh_token",
    "service_role", "serviceKey", "private_key",
  ];

  const allSensitive = [...defaultSensitive, ...sensitiveFields];

  if (typeof data !== "object" || data === null) return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResponse(item, sensitiveFields));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (allSensitive.some((s) => lowerKey.includes(s.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * CORS configuration
 */
export const CORS_CONFIG = {
  origin: process.env.NODE_ENV === "production"
    ? ["https://stockflow.vexonet.online"]
    : ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
};

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get("origin");

  if (origin && CORS_CONFIG.origin.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set("Access-Control-Allow-Methods", CORS_CONFIG.methods.join(", "));
  response.headers.set("Access-Control-Allow-Headers", CORS_CONFIG.allowedHeaders.join(", "));
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", String(CORS_CONFIG.maxAge));

  return response;
}
