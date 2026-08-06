// ============================================
// Security Monitor & Threat Detection
// Real-time security event processing
// ============================================

import { supabase } from "./supabase";
import { getSecurityStats, blockIP, unblockIP, isIPBlocked } from "./rate-limiter";

export interface SecurityEvent {
  id: string;
  type: "brute_force" | "xss_attempt" | "sql_injection" | "rate_limit" | "suspicious_header" | "unauthorized_access" | "data_breach_attempt" | "suspicious_activity" | "path_traversal" | "command_injection" | "scanner_detected" | "attack_path_probing" | "session_hijack" | "ids_block";
  ip: string;
  userAgent: string;
  path: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  details: string;
  blocked: boolean;
}

export interface SecurityReport {
  totalEvents: number;
  criticalEvents: number;
  blockedIPs: number;
  topThreats: Array<{ type: string; count: number }>;
  recentEvents: SecurityEvent[];
  stats: ReturnType<typeof getSecurityStats>;
}

// In-memory event buffer (last 1000 events)
const eventBuffer: SecurityEvent[] = [];
const MAX_BUFFER_SIZE = 1000;

/**
 * Record a security event
 */
export function recordSecurityEvent(event: Omit<SecurityEvent, "id" | "timestamp">): void {
  const fullEvent: SecurityEvent = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  eventBuffer.unshift(fullEvent);

  // Trim buffer
  if (eventBuffer.length > MAX_BUFFER_SIZE) {
    eventBuffer.length = MAX_BUFFER_SIZE;
  }

  // Auto-block IPs with critical events
  if (event.severity === "critical" && !isIPBlocked(event.ip)) {
    const criticalCount = eventBuffer.filter(
      (e) => e.ip === event.ip && e.severity === "critical"
    ).length;

    if (criticalCount >= 3) {
      blockIP(event.ip);
    }
  }

  // Log to console in dev
  if (process.env.NODE_ENV === "development") {
    const emoji = {
      low: "ℹ️",
      medium: "⚠️",
      high: "🔶",
      critical: "🚨",
    }[event.severity];
    console.log(`[SECURITY] ${emoji} ${event.type} from ${event.ip} - ${event.path}`);
  }
}

/**
 * Get recent security events
 */
export function getRecentEvents(limit: number = 100): SecurityEvent[] {
  return eventBuffer.slice(0, limit);
}

/**
 * Get events by IP
 */
export function getEventsByIP(ip: string): SecurityEvent[] {
  return eventBuffer.filter((e) => e.ip === ip);
}

/**
 * Get events by type
 */
export function getEventsByType(type: SecurityEvent["type"]): SecurityEvent[] {
  return eventBuffer.filter((e) => e.type === type);
}

/**
 * Generate security report
 */
export function generateSecurityReport(): SecurityReport {
  const now = Date.now();
  const last24h = eventBuffer.filter(
    (e) => now - new Date(e.timestamp).getTime() < 86400000
  );

  const typeCounts: Record<string, number> = {};
  last24h.forEach((e) => {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  });

  const topThreats = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalEvents: last24h.length,
    criticalEvents: last24h.filter((e) => e.severity === "critical").length,
    blockedIPs: getSecurityStats().blockedIPs,
    topThreats,
    recentEvents: last24h.slice(0, 50),
    stats: getSecurityStats(),
  };
}

/**
 * Check if a request pattern looks like an attack
 */
export function detectAttackPattern(
  ip: string,
  path: string,
  userAgent: string
): { isAttack: boolean; type?: string; severity?: SecurityEvent["severity"] } {
  // Check for scanner patterns
  const scannerPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /dirb/i,
    /gobuster/i,
    /wfuzz/i,
    /burpsuite/i,
    /owasp/i,
    /havij/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
  ];

  for (const pattern of scannerPatterns) {
    if (pattern.test(userAgent)) {
      return { isAttack: true, type: "scanner_detected", severity: "high" };
    }
  }

  // Check for path traversal attempts
  const traversalPatterns = [
    /\.\.\//,
    /\.\.\\/,
    /etc\/passwd/,
    /etc\/shadow/,
    /proc\/self/,
    /windows\/system32/i,
  ];

  for (const pattern of traversalPatterns) {
    if (pattern.test(path)) {
      return { isAttack: true, type: "path_traversal", severity: "critical" };
    }
  }

  // Check for common attack paths
  const attackPaths = [
    "/wp-admin",
    "/wp-login",
    "/phpmyadmin",
    "/admin/config",
    "/.env",
    "/.git",
    "/config.php",
    "/wp-config.php",
    "/cgi-bin",
    "/shell",
    "/cmd",
    "/eval",
  ];

  for (const attackPath of attackPaths) {
    if (path.toLowerCase().includes(attackPath)) {
      return { isAttack: true, type: "attack_path_probing", severity: "medium" };
    }
  }

  // Check for excessive requests to auth endpoints
  if (path.includes("/auth") || path.includes("/login") || path.includes("/signup")) {
    const recentAuthAttempts = eventBuffer.filter(
      (e) =>
        e.ip === ip &&
        (e.path.includes("/auth") || e.path.includes("/login")) &&
        now - new Date(e.timestamp).getTime() < 300000 // 5 minutes
    ).length;

    if (recentAuthAttempts > 10) {
      return { isAttack: true, type: "brute_force", severity: "critical" };
    }
  }

  return { isAttack: false };
}

const now = Date.now();

/**
 * Middleware to detect and block attacks
 */
export function attackDetectionMiddleware(
  ip: string,
  path: string,
  userAgent: string
): { blocked: boolean; response?: Response } {
  // Check IP blocklist
  if (isIPBlocked(ip)) {
    return {
      blocked: true,
      response: new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  // Detect attack patterns
  const detection = detectAttackPattern(ip, path, userAgent);

  if (detection.isAttack) {
    recordSecurityEvent({
      type: detection.type as any || "suspicious_header",
      ip,
      userAgent,
      path,
      severity: detection.severity || "medium",
      details: `Attack pattern detected: ${detection.type}`,
      blocked: true,
    });

    return {
      blocked: true,
      response: new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { blocked: false };
}
