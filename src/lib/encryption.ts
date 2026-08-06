// ============================================
// Data Encryption Layer
// Encrypt/decrypt sensitive data at rest
// ============================================

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

// Encryption key from env (32 bytes hex)
function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    // Derive from JWT_SECRET for development
    const fallback = process.env.JWT_SECRET || "stockflow-dev-only-secret-do-not-use-in-prod";
    return scryptSync(fallback, "stockflow-salt-v1", 32);
  }
  return Buffer.from(keyHex, "hex");
}

/**
 * Encrypt a string value
 * Returns: iv:authTag:ciphertext (all base64)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Decrypt an encrypted string
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const parts = encryptedData.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(parts[0], "base64");
  const authTag = Buffer.from(parts[1], "base64");
  const ciphertext = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(":");
  return parts.length === 3;
}

/**
 * Encrypt an object's sensitive fields
 */
export function encryptFields<T extends Record<string, any>>(
  data: T,
  sensitiveFields: string[]
): T {
  const result: any = { ...data };

  for (const field of sensitiveFields) {
    if (result[field] && typeof result[field] === "string" && !isEncrypted(result[field])) {
      result[field] = encrypt(result[field]);
    }
  }

  return result;
}

/**
 * Decrypt an object's sensitive fields
 */
export function decryptFields<T extends Record<string, any>>(
  data: T,
  sensitiveFields: string[]
): T {
  const result: any = { ...data };

  for (const field of sensitiveFields) {
    if (result[field] && typeof result[field] === "string" && isEncrypted(result[field])) {
      try {
        result[field] = decrypt(result[field]);
      } catch {}
    }
  }

  return result;
}

// ============================================
// FIELD DEFINITIONS
// ============================================

/**
 * Fields that should be encrypted at rest
 */
export const ENCRYPTED_FIELDS = {
  user: ["phone", "address"],
  customer: ["phone", "address", "national_id"],
  employee: ["phone", "address", "national_id", "bank_account"],
  store: ["phone", "address"],
  supplier: ["phone", "address", "bank_account"],
};

/**
 * Fields that should never be returned to client
 */
export const NEVER_RETURN_FIELDS = [
  "password",
  "password_hash",
  "hashed_password",
  "secret",
  "api_key",
  "apikey",
  "access_token",
  "refresh_token",
  "private_key",
  "encryption_key",
  "service_role",
  "otp",
  "otp_secret",
  "two_factor_secret",
];

/**
 * Hash a value (one-way, for comparison)
 */
export function hashValue(value: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = scryptSync(value, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a hashed value
 */
export function verifyHash(value: string, hashed: string): boolean {
  const [salt, hash] = hashed.split(":");
  const verifyHash = scryptSync(value, salt, 64).toString("hex");
  return hash === verifyHash;
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

/**
 * Mask sensitive data for display
 */
export function maskData(value: string, type: "phone" | "email" | "card" | "national_id"): string {
  if (!value) return "";

  switch (type) {
    case "phone":
      // 010****1234
      if (value.length >= 7) {
        return value.slice(0, 3) + "****" + value.slice(-4);
      }
      return "****";
    case "email":
      // u***@example.com
      const [local, domain] = value.split("@");
      if (local && domain) {
        return local[0] + "***@" + domain;
      }
      return "***";
    case "card":
      // **** **** **** 1234
      return "**** **** **** " + value.slice(-4);
    case "national_id":
      // 123******1234
      if (value.length >= 8) {
        return value.slice(0, 3) + "*******" + value.slice(-4);
      }
      return "*******";
    default:
      return "***";
  }
}
