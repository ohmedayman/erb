// ============================================
// Input Sanitization & XSS Protection
// Enterprise-grade security utilities
// ============================================

// HTML entity map for escaping
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

/**
 * Sanitize string to prevent XSS attacks
 * Escapes all HTML entities
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize an object's string values recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === "string") return sanitizeInput(obj);
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}

/**
 * Validate email format (RFC 5322 simplified)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate phone number (Egyptian format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+20|0)?1[0125]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Validate password strength
 * Returns { valid: boolean, errors: string[] }
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) errors.push("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
  if (password.length > 128) errors.push("كلمة المرور طويلة جداً");
  if (!/[a-z]/.test(password)) errors.push("يجب أن تحتوي على حرف صغير");
  if (!/[A-Z]/.test(password)) errors.push("يجب أن تحتوي على حرف كبير");
  if (!/[0-9]/.test(password)) errors.push("يجب أن تحتوي على رقم");

  // Check for common passwords
  const commonPasswords = [
    "password", "123456", "12345678", "qwerty", "abc123",
    "password1", "admin", "letmein", "welcome", "monkey",
    "dragon", "master", "login", "princess", "football",
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("كلمة المرور ضعيفة جداً");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators
  let sanitized = filename.replace(/[\/\\]/g, "");
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");
  // Remove special characters except dots and hyphens
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split(".").pop();
    sanitized = sanitized.substring(0, 255 - (ext?.length || 0) - 1) + "." + ext;
  }
  return sanitized;
}

/**
 * Validate file type against allowed MIME types
 */
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_FILE_EXTENSIONS: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};

export function validateFileType(file: File): { valid: boolean; error?: string } {
  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: "نوع الملف غير مسموح" };
  }

  // Check extension matches MIME
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  const allowedExts = ALLOWED_FILE_EXTENSIONS[file.type];
  if (allowedExts && !allowedExts.includes(ext)) {
    return { valid: false, error: "امتداد الملف لا يتطابق مع النوع" };
  }

  return { valid: true };
}

/**
 * Validate file size (max 5MB)
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `حجم الملف يتجاوز ${maxSizeMB} ميجا` };
  }
  return { valid: true };
}

/**
 * Generate a safe random filename
 */
export function generateSafeFilename(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Sanitize URL to prevent open redirect
 */
export function sanitizeRedirectUrl(url: string, baseUrl: string): string {
  try {
    const parsed = new URL(url, baseUrl);
    // Only allow same-origin redirects
    if (parsed.origin !== baseUrl) {
      return "/";
    }
    return parsed.pathname + parsed.search;
  } catch {
    return "/";
  }
}

/**
 * Check for SQL injection patterns
 */
export function hasSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|FETCH|DECLARE|TRUNCATE|COMMENT)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(CHAR\(|CONCAT\(|0x[0-9a-f]+)/i,
  ];
  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize any user input
 */
export function validateInput(input: string, options: {
  maxLength?: number;
  minLength?: number;
  allowHtml?: boolean;
  checkSql?: boolean;
} = {}): { valid: boolean; sanitized: string; error?: string } {
  const { maxLength = 1000, minLength = 0, allowHtml = false, checkSql = true } = options;

  let sanitized = allowHtml ? input : sanitizeInput(input);

  // Length checks
  if (sanitized.length < minLength) {
    return { valid: false, sanitized: "", error: `الحد الأدنى ${minLength} حرف` };
  }
  if (sanitized.length > maxLength) {
    return { valid: false, sanitized: "", error: `الحد الأقصى ${maxLength} حرف` };
  }

  // SQL injection check
  if (checkSql && hasSqlInjection(sanitized)) {
    return { valid: false, sanitized: "", error: "محتوى غير مسموح" };
  }

  // Null byte check
  if (sanitized.includes("\0")) {
    return { valid: false, sanitized: "", error: "محتوى غير مسموح" };
  }

  return { valid: true, sanitized };
}
