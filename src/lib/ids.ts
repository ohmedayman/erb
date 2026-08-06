// ============================================
// Intrusion Detection System (IDS)
// Advanced attack pattern detection & response
// ============================================

import { NextRequest } from "next/server";
import { recordSecurityEvent } from "./security-monitor";
import { blockIP, checkRateLimit } from "./rate-limiter";

// ============================================
// 1. THREAT INTELLIGENCE DATABASE
// ============================================

interface ThreatPattern {
  id: string;
  name: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detect: (request: RequestData) => boolean;
  response: "log" | "rate_limit" | "block" | "alert";
}

interface RequestData {
  ip: string;
  userAgent: string;
  method: string;
  pathname: string;
  searchParams: string;
  body: string;
  headers: Record<string, string>;
  timestamp: number;
}

// ============================================
// 2. ATTACK DETECTION PATTERNS
// ============================================

const THREAT_PATTERNS: ThreatPattern[] = [
  // ---- Reconnaissance ----
  {
    id: "RECON_SCANNER",
    name: "Port/Service Scanner",
    severity: "high",
    description: "Automated scanning tool detected",
    detect: (data) => {
      const scanners = /sqlmap|nikto|nmap|masscan|dirb|gobuster|wfuzz|ffuf|acunetix|nessus|openvas|burpsuite|wpscan|joomscan|skipfish/i;
      return scanners.test(data.userAgent);
    },
    response: "block",
  },
  {
    id: "RECON_DIR_TRAVERSAL",
    name: "Directory Traversal Attack",
    severity: "critical",
    description: "Path traversal attempt detected",
    detect: (data) => {
      const patterns = /\.\.\/|\.\.\\|%2e%2e|%252e%252e|etc\/passwd|etc\/shadow|proc\/self|boot\.ini/i;
      return patterns.test(data.pathname + data.searchParams + data.body);
    },
    response: "block",
  },
  {
    id: "RECON_CONFIG_LEAK",
    name: "Config File Probing",
    severity: "high",
    description: "Attempt to access configuration files",
    detect: (data) => {
      const paths = /\.env|\.git|\.svn|\.htaccess|config\.php|wp-config|web\.config|settings\.py|configuration\.php/i;
      return paths.test(data.pathname);
    },
    response: "block",
  },

  // ---- SQL Injection ----
  {
    id: "SQLI_UNION",
    name: "SQL Injection - UNION Based",
    severity: "critical",
    description: "UNION-based SQL injection attempt",
    detect: (data) => {
      const pattern = /UNION\s+(ALL\s+)?SELECT\s+.*\s+FROM\s+/i;
      return pattern.test(data.searchParams + data.body);
    },
    response: "block",
  },
  {
    id: "SQLI_BOOLEAN",
    name: "SQL Injection - Boolean Blind",
    severity: "critical",
    description: "Boolean-based blind SQL injection",
    detect: (data) => {
      const pattern = /(AND|OR)\s+\d+\s*=\s*\d+/i;
      return pattern.test(data.searchParams + data.body);
    },
    response: "block",
  },
  {
    id: "SQLI_TIME",
    name: "SQL Injection - Time Based",
    severity: "critical",
    description: "Time-based blind SQL injection",
    detect: (data) => {
      const pattern = /(SLEEP\s*\(|WAITFOR\s+DELAY|BENCHMARK\s*\(|pg_sleep\s*\()/i;
      return pattern.test(data.searchParams + data.body);
    },
    response: "block",
  },
  {
    id: "SQLI_STACKED",
    name: "SQL Injection - Stacked Queries",
    severity: "critical",
    description: "Stacked queries SQL injection",
    detect: (data) => {
      const pattern = /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b/i;
      return pattern.test(data.searchParams + data.body);
    },
    response: "block",
  },

  // ---- XSS ----
  {
    id: "XSS_SCRIPT",
    name: "XSS - Script Tag Injection",
    severity: "high",
    description: "Script tag injection attempt",
    detect: (data) => {
      const pattern = /<script[\s>]/i;
      return pattern.test(data.searchParams + data.body + data.headers.referer || "");
    },
    response: "block",
  },
  {
    id: "XSS_EVENT",
    name: "XSS - Event Handler Injection",
    severity: "high",
    description: "Event handler injection attempt",
    detect: (data) => {
      const pattern = /\bon\w+\s*=\s*["']/i;
      return pattern.test(data.searchParams + data.body);
    },
    response: "block",
  },
  {
    id: "XSS_PROTOCOL",
    name: "XSS - Protocol Handler",
    severity: "high",
    description: "JavaScript/vbscript protocol handler",
    detect: (data) => {
      const pattern = /(javascript|vbscript|data\s*:\s*text\/html)\s*:/i;
      return pattern.test(data.searchParams + data.body);
    },
    response: "block",
  },

  // ---- Command Injection ----
  {
    id: "CMD_INJECTION",
    name: "Command Injection",
    severity: "critical",
    description: "OS command injection attempt",
    detect: (data) => {
      const pattern = /(\|\s*(cat|ls|id|whoami|uname|wget|curl|nc|netcat|bash|sh|python|perl|ruby|php)|`[^`]*`|\$\(|&&\s*(cat|ls|id|whoami))/i;
      return pattern.test(data.searchParams + data.body);
    },
    response: "block",
  },

  // ---- SSRF ----
  {
    id: "SSRF_ATTEMPT",
    name: "Server-Side Request Forgery",
    severity: "critical",
    description: "SSRF attempt to access internal resources",
    detect: (data) => {
      const pattern = /(127\.0\.0\.1|localhost|0\.0\.0\.0|169\.254|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|metadata\.google|169\.254\.169\.254)/i;
      return pattern.test(data.searchParams + data.body);
    },
    response: "block",
  },

  // ---- File Upload ----
  {
    id: "UPLOAD_MALICIOUS",
    name: "Malicious File Upload",
    severity: "critical",
    description: "Attempt to upload executable file",
    detect: (data) => {
      const pattern = /\.(php|php3|php4|php5|phtml|phps|asp|aspx|jsp|cgi|exe|bat|cmd|com|msi|scr|vbs|js|wsf|ps1|sh|bash|rb|py|pl)\b/i;
      return pattern.test(data.body);
    },
    response: "block",
  },

  // ---- Authentication Attacks ----
  {
    id: "BRUTE_FORCE",
    name: "Brute Force Attack",
    severity: "high",
    description: "Multiple failed authentication attempts",
    detect: (data) => {
      return data.pathname.includes("/auth") || data.pathname.includes("/login");
    },
    response: "rate_limit",
  },
  {
    id: "CREDENTIAL_STUFFING",
    name: "Credential Stuffing",
    severity: "high",
    description: "Automated credential testing",
    detect: (data) => {
      const isAuthEndpoint = data.pathname.includes("/auth") || data.pathname.includes("/login");
      const hasBotUA = /bot|spider|crawler|harvest/i.test(data.userAgent);
      return isAuthEndpoint && hasBotUA;
    },
    response: "block",
  },

  // ---- Data Exfiltration ----
  {
    id: "DATA_EXFIL",
    name: "Data Exfiltration Attempt",
    severity: "high",
    description: "Unusual data access pattern",
    detect: (data) => {
      const largeDownload = data.pathname.includes("/export") || data.pathname.includes("/download");
      const unusualMethod = data.method === "POST" && data.pathname.includes("/export");
      return largeDownload && unusualMethod;
    },
    response: "alert",
  },

  // ---- API Abuse ----
  {
    id: "API_ENUMERATION",
    name: "API Enumeration",
    severity: "medium",
    description: "Sequential API endpoint scanning",
    detect: (data) => {
      const sequential = /\b\d{1,6}\b/.test(data.pathname);
      const apiEndpoint = data.pathname.startsWith("/api/");
      return sequential && apiEndpoint && data.method === "GET";
    },
    response: "rate_limit",
  },

  // ---- Header Attacks ----
  {
    id: "HOST_HEADER",
    name: "Host Header Injection",
    severity: "high",
    description: "Malicious host header",
    detect: (data) => {
      const host = data.headers.host || "";
      const forwardedHost = data.headers["x-forwarded-host"] || "";
      const hasLocalhost = /localhost|127\.0\.0\.1|0\.0\.0\.0/i;
      return hasLocalhost.test(forwardedHost) && !hasLocalhost.test(host);
    },
    response: "block",
  },

  // ---- NoSQL Injection ----
  {
    id: "NOSQL_INJECTION",
    name: "NoSQL Injection",
    severity: "critical",
    description: "NoSQL injection attempt",
    detect: (data) => {
      const pattern = /(\$where|\$gt|\$ne|\$regex|\$exists|\$in|\$nin|\$or|\$and|\$not|\$nor|\$elemMatch)/i;
      return pattern.test(data.body);
    },
    response: "block",
  },
];

// ============================================
// 3. BEHAVIORAL ANALYSIS
// ============================================

interface IPActivity {
  ip: string;
  requests: Array<{ path: string; timestamp: number; status: number }>;
  uniquePaths: Set<string>;
  errorCount: number;
  lastSeen: number;
}

const activityMap = new Map<string, IPActivity>();
const MAX_ACTIVITY_ENTRIES = 10000;
const ACTIVITY_WINDOW = 600000; // 10 minutes
const ALERT_THRESHOLDS = {
  requestsPerMinute: 60,
  uniquePathsPerMinute: 30,
  errorsPerMinute: 20,
  scanPatternThreshold: 5,
};

function trackActivity(ip: string, path: string, status: number): void {
  const now = Date.now();
  let activity = activityMap.get(ip);

  if (!activity) {
    if (activityMap.size > MAX_ACTIVITY_ENTRIES) {
      // Evict oldest entries
      const entries = Array.from(activityMap.entries())
        .sort((a, b) => a[1].lastSeen - b[1].lastSeen);
      for (let i = 0; i < 100; i++) {
        activityMap.delete(entries[i][0]);
      }
    }

    activity = {
      ip,
      requests: [],
      uniquePaths: new Set(),
      errorCount: 0,
      lastSeen: now,
    };
    activityMap.set(ip, activity);
  }

  activity.requests.push({ path, timestamp: now, status });
  activity.uniquePaths.add(path);
  activity.lastSeen = now;

  if (status >= 400) {
    activity.errorCount++;
  }

  // Clean old entries
  activity.requests = activity.requests.filter(
    (r) => now - r.timestamp < ACTIVITY_WINDOW
  );
}

function analyzeActivity(ip: string): {
  isSuspicious: boolean;
  reasons: string[];
  severity: "low" | "medium" | "high" | "critical";
} {
  const activity = activityMap.get(ip);
  if (!activity) return { isSuspicious: false, reasons: [], severity: "low" };

  const now = Date.now();
  const recentRequests = activity.requests.filter(
    (r) => now - r.timestamp < 60000
  );

  const reasons: string[] = [];
  let maxSeverity: "low" | "medium" | "high" | "critical" = "low";

  // High request rate
  if (recentRequests.length > ALERT_THRESHOLDS.requestsPerMinute) {
    reasons.push(`${recentRequests.length} requests/min (threshold: ${ALERT_THRESHOLDS.requestsPerMinute})`);
    maxSeverity = "high";
  }

  // Path enumeration
  const uniqueRecentPaths = new Set(recentRequests.map((r) => r.path)).size;
  if (uniqueRecentPaths > ALERT_THRESHOLDS.uniquePathsPerMinute) {
    reasons.push(`${uniqueRecentPaths} unique paths/min (possible scanning)`);
    maxSeverity = "high";
  }

  // High error rate
  const recentErrors = recentRequests.filter((r) => r.status >= 400).length;
  if (recentErrors > ALERT_THRESHOLDS.errorsPerMinute) {
    reasons.push(`${recentErrors} errors/min (possible brute force)`);
    maxSeverity = "medium";
  }

  // Sequential path access (scanning)
  const pathNumbers = recentRequests
    .map((r) => {
      const match = r.path.match(/\/(\d+)/);
      return match ? parseInt(match[1]) : null;
    })
    .filter((n) => n !== null) as number[];

  if (pathNumbers.length > ALERT_THRESHOLDS.scanPatternThreshold) {
    const sorted = [...pathNumbers].sort((a, b) => a - b);
    const isSequential = sorted.every(
      (val, i) => i === 0 || val === sorted[i - 1] + 1
    );
    if (isSequential) {
      reasons.push("Sequential ID access pattern (possible enumeration)");
      maxSeverity = "high";
    }
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
    severity: maxSeverity,
  };
}

// ============================================
// 4. MAIN IDS ENGINE
// ============================================

export async function runIDS(
  request: NextRequest
): Promise<{ blocked: boolean; response?: Response }> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  const method = request.method;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const searchParams = url.searchParams.toString();

  // Read body for POST/PUT/PATCH
  let body = "";
  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      const clone = request.clone();
      body = await clone.text();
    } catch {}
  }

  const requestData: RequestData = {
    ip,
    userAgent,
    method,
    pathname,
    searchParams,
    body,
    headers: {
      host: request.headers.get("host") || "",
      referer: request.headers.get("referer") || "",
      "x-forwarded-host": request.headers.get("x-forwarded-host") || "",
      "x-original-url": request.headers.get("x-original-url") || "",
    },
    timestamp: Date.now(),
  };

  // 1. Run threat pattern detection
  for (const pattern of THREAT_PATTERNS) {
    try {
      if (pattern.detect(requestData)) {
        // Record the event
        await recordSecurityEvent({
          type: "suspicious_header",
          ip,
          userAgent,
          path: pathname,
          severity: pattern.severity,
          details: `${pattern.name}: ${pattern.description}`,
          blocked: pattern.response === "block",
        });

        // Take response action
        if (pattern.response === "block") {
          // Track for auto-blocking
          const { allowed } = checkRateLimit(`ids:${ip}`, 3, 300000);
          if (!allowed) {
            blockIP(ip);
          }

          return {
            blocked: true,
            response: new Response(
              JSON.stringify({
                error: "Access denied",
                code: "IDS_BLOCKED",
              }),
              {
                status: 403,
                headers: {
                  "Content-Type": "application/json",
                  "X-IDS-Blocked": "true",
                  "X-IDS-Pattern": pattern.id,
                },
              }
            ),
          };
        }

        if (pattern.response === "rate_limit") {
          const { allowed, remaining, resetAt } = checkRateLimit(
            `ids:${ip}:${pathname}`,
            10,
            60000
          );
          if (!allowed) {
            return {
              blocked: true,
              response: new Response(
                JSON.stringify({ error: "Rate limit exceeded" }),
                {
                  status: 429,
                  headers: {
                    "Content-Type": "application/json",
                    "Retry-After": String(
                      Math.ceil((resetAt - Date.now()) / 1000)
                    ),
                  },
                }
              ),
            };
          }
        }

        // "log" and "alert" continue to next pattern
      }
    } catch {}
  }

  // 2. Behavioral analysis
  trackActivity(ip, pathname, 200); // Status will be updated later
  const behavior = analyzeActivity(ip);

  if (behavior.isSuspicious) {
    await recordSecurityEvent({
      type: "suspicious_activity",
      ip,
      userAgent,
      path: pathname,
      severity: behavior.severity,
      details: behavior.reasons.join("; "),
      blocked: false,
    });

    if (behavior.severity === "critical") {
      blockIP(ip);
      return {
        blocked: true,
        response: new Response(
          JSON.stringify({ error: "Access denied" }),
          { status: 403 }
        ),
      };
    }
  }

  return { blocked: false };
}

/**
 * Get IDS statistics
 */
export function getIDSStats(): {
  trackedIPs: number;
  threatPatterns: number;
  suspiciousIPs: number;
} {
  const suspiciousIPs = Array.from(activityMap.values()).filter(
    (a) => a.errorCount > 10 || a.uniquePaths.size > 20
  ).length;

  return {
    trackedIPs: activityMap.size,
    threatPatterns: THREAT_PATTERNS.length,
    suspiciousIPs,
  };
}
