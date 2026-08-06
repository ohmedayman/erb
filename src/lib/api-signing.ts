// ============================================
// API Request Signing & Validation
// Verify request integrity and authenticity
// ============================================

import { createHmac, createHash, randomBytes } from "crypto";
import { NextRequest } from "next/server";

const SIGNING_SECRET = process.env.API_SIGNING_SECRET || "stockflow-api-signing-secret-2026";
const TIMESTAMP_TOLERANCE = 300000; // 5 minutes

/**
 * Generate a request signature
 */
export function signRequest(
  method: string,
  path: string,
  body: string,
  timestamp: number,
  nonce: string
): string {
  const payload = `${method}:${path}:${timestamp}:${nonce}:${body}`;
  return createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
}

/**
 * Verify a request signature
 */
export function verifySignature(
  method: string,
  path: string,
  body: string,
  timestamp: number,
  nonce: string,
  signature: string
): boolean {
  const expected = signRequest(method, path, body, timestamp, nonce);

  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;

  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Validate request timestamp (prevent replay attacks)
 */
export function validateTimestamp(timestamp: number): boolean {
  const now = Date.now();
  return Math.abs(now - timestamp) <= TIMESTAMP_TOLERANCE;
}

/**
 * Generate a nonce (one-time random value)
 */
export function generateNonce(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Validate API request signature
 */
export function validateAPIRequest(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  const timestamp = parseInt(request.headers.get("x-request-timestamp") || "0");
  const nonce = request.headers.get("x-request-nonce") || "";
  const signature = request.headers.get("x-request-signature") || "";

  // Check required headers
  if (!timestamp || !nonce || !signature) {
    // Allow unsigned requests for now (optional signing)
    return { valid: true };
  }

  // Validate timestamp
  if (!validateTimestamp(timestamp)) {
    return { valid: false, error: "Request timestamp expired" };
  }

  // Check nonce replay
  if (isNonceReused(nonce)) {
    return { valid: false, error: "Nonce already used (replay attack)" };
  }

  // Verify signature
  const method = request.method;
  const path = new URL(request.url).pathname;

  // For GET requests, body is empty
  let body = "";
  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      // We can't read the body here without consuming it
      // So we use a hash of the content-length as a proxy
      body = request.headers.get("content-length") || "0";
    } catch {}
  }

  const valid = verifySignature(method, path, body, timestamp, nonce, signature);

  if (!valid) {
    return { valid: false, error: "Invalid request signature" };
  }

  // Store nonce to prevent replay
  storeNonce(nonce);

  return { valid: true };
}

// ============================================
// NONCE STORAGE (prevent replay attacks)
// ============================================

const nonceStore = new Map<string, number>();
const NONCE_EXPIRY = 600000; // 10 minutes

// Cleanup old nonces every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [nonce, timestamp] of nonceStore) {
    if (now - timestamp > NONCE_EXPIRY) {
      nonceStore.delete(nonce);
    }
  }
}, 300000);

function isNonceReused(nonce: string): boolean {
  return nonceStore.has(nonce);
}

function storeNonce(nonce: string): void {
  nonceStore.set(nonce, Date.now());
}

/**
 * Generate request headers for API calls
 */
export function generateRequestHeaders(
  method: string,
  path: string,
  body: string = ""
): Record<string, string> {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const signature = signRequest(method, path, body, timestamp, nonce);

  return {
    "x-request-timestamp": String(timestamp),
    "x-request-nonce": nonce,
    "x-request-signature": signature,
  };
}

/**
 * Generate a client token (for API authentication)
 */
export function generateClientToken(
  clientId: string,
  permissions: string[]
): string {
  const payload = JSON.stringify({
    clientId,
    permissions,
    iat: Date.now(),
    exp: Date.now() + 3600000, // 1 hour
  });

  const hash = createHash("sha256")
    .update(payload + SIGNING_SECRET)
    .digest("hex");

  return Buffer.from(payload).toString("base64") + "." + hash;
}

/**
 * Verify a client token
 */
export function verifyClientToken(
  token: string
): { valid: boolean; clientId?: string; permissions?: string[] } {
  try {
    const [payloadB64, hash] = token.split(".");
    if (!payloadB64 || !hash) return { valid: false };

    const payload = Buffer.from(payloadB64, "base64").toString("utf8");
    const expectedHash = createHash("sha256")
      .update(payload + SIGNING_SECRET)
      .digest("hex");

    // Constant-time comparison
    if (hash.length !== expectedHash.length) return { valid: false };
    let result = 0;
    for (let i = 0; i < hash.length; i++) {
      result |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
    }
    if (result !== 0) return { valid: false };

    const data = JSON.parse(payload);

    // Check expiry
    if (Date.now() > data.exp) return { valid: false };

    return {
      valid: true,
      clientId: data.clientId,
      permissions: data.permissions,
    };
  } catch {
    return { valid: false };
  }
}
