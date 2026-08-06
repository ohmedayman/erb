// ============================================
// Web Application Firewall (WAF)
// Real-time request filtering and blocking
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { recordSecurityEvent } from "./security-monitor";
import { blockIP, isIPBlocked, checkRateLimit, getRateLimitHeaders } from "./rate-limiter";

// ============================================
// 1. ATTACK SIGNATURE DATABASE
// ============================================

const SQL_INJECTION_PATTERNS = [
  // UNION-based injection
  /(\bUNION\b\s+(ALL\s+)?SELECT\b)/i,
  /(\bUNION\b.*\bSELECT\b.*\bFROM\b)/i,
  // Boolean-based blind
  /(\b(SELECT|INSERT|UPDATE|DELETE)\b.*\b(WHERE|AND|OR)\b.*\d+\s*=\s*\d+)/i,
  // Time-based blind
  /(SLEEP\s*\(\s*\d+\s*\))/i,
  /(WAITFOR\s+DELAY\s+['"])/i,
  /(BENCHMARK\s*\()/i,
  // Stacked queries
  /(;(\s*)?(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b)/i,
  // Comment injection
  /(\/\*[\s\S]*?\*\/)/,
  /(--\s*$)/m,
  // Special characters
  /(\bSELECT\b.*\bINTO\b.*\bOUTFILE\b)/i,
  /(\bLOAD_FILE\b\s*\()/i,
  /(\bINTO\b\s+(OUT|DUMP)FILE)/i,
  // Hex encoding
  /(0x[0-9a-fA-F]{8,})/i,
  // CHAR/CONCAT functions
  /(CHAR\s*\(\s*\d+)/i,
  /(CONCAT\s*\()/i,
  // INFORMATION_SCHEMA
  /(INFORMATION_SCHEMA)/i,
  // pg_sleep, dbms_lock
  /(pg_sleep\s*\()/i,
  /(DBMS_PIPE\.RECEIVE_MESSAGE)/i,
];

const XSS_PATTERNS = [
  // Script tags
  /<script[\s>]/i,
  /<\/script>/i,
  // Event handlers
  /\bon\w+\s*=\s*["']/i,
  // JavaScript protocol
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  // Expression/eval
  /expression\s*\(/i,
  /eval\s*\(/i,
  /Function\s*\(/i,
  // DOM manipulation
  /document\.(cookie|domain|write|location)/i,
  /window\.(location|open|eval)/i,
  // Alert/confirm/prompt
  /(alert|confirm|prompt)\s*\(/i,
  // SVG/IMG/IFRAME injection
  /<svg[\s>].*?onload/i,
  /<img[\s>].*?onerror/i,
  /<iframe[\s>]/i,
  /<object[\s>]/i,
  /<embed[\s>]/i,
  /<applet[\s>]/i,
  // Base tag
  /<base[\s>]/i,
  // Form injection
  /<form[\s>]/i,
  // CSS expression
  /url\s*\(\s*['"]?\s*javascript/i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /\.\.%2f/i,
  /\.\.%5c/i,
  /%2e%2e/i,
  /\.\.%252f/i,
  /etc\/passwd/i,
  /etc\/shadow/i,
  /proc\/self/i,
  /windows\/system32/i,
  /win\.ini/i,
  /boot\.ini/i,
  /\/bin\/(ba)?sh/i,
];

const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$]/,
  /\$\(/,
  /`[^`]*`/,
  /\|\s*(cat|ls|id|whoami|uname|wget|curl|nc|netcat)/i,
  /&&\s*(cat|ls|id|whoami)/i,
  />\/dev\/null/i,
  /\bexec\b\s*\(/i,
  /\bsystem\b\s*\(/i,
  /\bpassthru\b\s*\(/i,
  /\bshell_exec\b\s*\(/i,
  /\bproc_open\b\s*\(/i,
];

const LDAP_INJECTION_PATTERNS = [
  /\(\|[a-z]*\)/i,
  /\)\(\&/,
  /\)\(\|/,
  /\(\!/,
];

const NOSQL_INJECTION_PATTERNS = [
  /\$where/i,
  /\$gt/i,
  /\$ne/i,
  /\$regex/i,
  /\$exists/i,
  /\$in/i,
  /\$nin/i,
  /\$or/i,
  /\$and/i,
  /\$not/i,
  /\$nor/i,
  /\$elemMatch/i,
];

const HEADER_INJECTION_PATTERNS = [
  /\r\n/i,
  /\n\s*(content-type|location|set-cookie|host)/i,
  /\x00/,
];

// ============================================
// 2. BLOCKED USER AGENTS
// ============================================

const BLOCKED_USER_AGENTS = [
  // Scanners
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /dirbuster/i,
  /dirb/i,
  /gobuster/i,
  /wfuzz/i,
  /ffuf/i,
  /havij/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /burpsuite/i,
  /owasp/i,
  /paros/i,
  /webscarab/i,
  /w3af/i,
  /arachni/i,
  /skipfish/i,
  /wpscan/i,
  /joomscan/i,
  /droopescan/i,
  // Bots
  /bot\b/i,
  /spider\b/i,
  /crawler\b/i,
  /scraper\b/i,
  /harvest/i,
  // Tools
  /curl/i,
  /wget/i,
  /python-requests/i,
  /go-http-client/i,
  /java\//i,
  /perl/i,
  /ruby/i,
  /php\//i,
];

// ============================================
// 3. ATTACK PATH PROBING
// ============================================

const ATTACK_PATHS = [
  // WordPress
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/wp-content/i,
  /\/wp-includes/i,
  /\/xmlrpc\.php/i,
  // PHPMyAdmin
  /\/phpmyadmin/i,
  /\/pma/i,
  /\/myadmin/i,
  // Common configs
  /\/\.env/i,
  /\/\.git/i,
  /\/\.svn/i,
  /\/\.htaccess/i,
  /\/config\.php/i,
  /\/wp-config\.php/i,
  /\/configuration\.php/i,
  /\/settings\.py/i,
  /\/web\.config/i,
  // Shell backdoors
  /\/shell/i,
  /\/cmd/i,
  /\/eval/i,
  /\/c99/i,
  /\/r57/i,
  /\/webshell/i,
  // Admin panels
  /\/admin\.php/i,
  /\/administrator/i,
  /\/manager/i,
  /\/console/i,
  // Backup files
  /\/backup/i,
  /\/db_backup/i,
  /\/database/i,
  /\.sql$/i,
  /\.bak$/i,
  /\.old$/i,
  /\.orig$/i,
  // CGI
  /\/cgi-bin/i,
  // Debug
  /\/debug/i,
  /\/trace/i,
  /\/actuator/i,
  /\/swagger/i,
  /\/api-docs/i,
];

// ============================================
// 4. WAF ENGINE
// ============================================

export interface WAFResult {
  blocked: boolean;
  reason?: string;
  severity: "low" | "medium" | "high" | "critical";
  patterns: string[];
}

/**
 * Main WAF inspection function
 * Inspects all parts of an HTTP request
 */
export function inspectRequest(request: NextRequest): WAFResult {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";
  const url = new URL(request.url);
  const pathname = url.pathname;
  const searchParams = url.searchParams.toString();
  const method = request.method;

  const patterns: string[] = [];
  let maxSeverity: "low" | "medium" | "high" | "critical" = "low";

  // 1. Check IP blocklist
  if (isIPBlocked(ip)) {
    return {
      blocked: true,
      reason: "IP blocked",
      severity: "critical",
      patterns: ["ip_blocklist"],
    };
  }

  // 2. Check User Agent
  for (const pattern of BLOCKED_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      patterns.push(`blocked_ua:${pattern.source}`);
      maxSeverity = "high";
    }
  }

  // 3. Check URL Path
  for (const pattern of ATTACK_PATHS) {
    if (pattern.test(pathname)) {
      patterns.push(`attack_path:${pattern.source}`);
      maxSeverity = "critical";
    }
  }

  // 4. Check Path Traversal
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(pathname) || pattern.test(searchParams)) {
      patterns.push(`path_traversal:${pattern.source}`);
      maxSeverity = "critical";
    }
  }

  // 5. Check Query Parameters for SQL Injection
  for (const pattern of SQL_INJECTION_PATTERNS) {
    for (const [key, value] of url.searchParams) {
      if (pattern.test(value) || pattern.test(key)) {
        patterns.push(`sql_injection:${pattern.source}`);
        maxSeverity = "critical";
      }
    }
  }

  // 6. Check Query Parameters for XSS
  for (const pattern of XSS_PATTERNS) {
    for (const [key, value] of url.searchParams) {
      if (pattern.test(value) || pattern.test(key)) {
        patterns.push(`xss:${pattern.source}`);
        maxSeverity = "high";
      }
    }
  }

  // 7. Check headers for injection
  const dangerousHeaders = [
    "x-forwarded-host",
    "x-host",
    "x-original-url",
    "x-rewrite-url",
    "x-forwarded-for",
    "x-real-ip",
  ];

  for (const header of dangerousHeaders) {
    const value = request.headers.get(header);
    if (value) {
      for (const pattern of HEADER_INJECTION_PATTERNS) {
        if (pattern.test(value)) {
          patterns.push(`header_injection:${header}`);
          maxSeverity = "high";
        }
      }
    }
  }

  // 8. Check Referer for injection
  const referer = request.headers.get("referer") || "";
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(referer)) {
      patterns.push(`referer_xss:${pattern.source}`);
      maxSeverity = "high";
    }
  }

  // 9. Check for oversized cookies
  const cookies = request.headers.get("cookie") || "";
  if (cookies.length > 8192) {
    patterns.push("oversized_cookie");
    maxSeverity = "medium";
  }

  // 10. Check for null bytes
  if (pathname.includes("%00") || searchParams.includes("%00")) {
    patterns.push("null_byte");
    maxSeverity = "critical";
  }

  // Determine if should block
  const shouldBlock =
    maxSeverity === "critical" ||
    (maxSeverity === "high" && patterns.length > 1) ||
    patterns.length > 3;

  return {
    blocked: shouldBlock,
    reason: shouldBlock ? `WAF blocked: ${patterns.join(", ")}` : undefined,
    severity: maxSeverity,
    patterns,
  };
}

/**
 * Inspect POST/PUT/PATCH body
 */
export async function inspectBody(request: NextRequest): Promise<WAFResult> {
  const patterns: string[] = [];
  let maxSeverity: "low" | "medium" | "high" | "critical" = "low";

  try {
    const clone = request.clone();
    const body = await clone.text();

    // Check body size (10MB limit)
    if (body.length > 10 * 1024 * 1024) {
      return {
        blocked: true,
        reason: "Body too large",
        severity: "high",
        patterns: ["body_too_large"],
      };
    }

    // Check body for SQL injection
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(body)) {
        patterns.push(`body_sql:${pattern.source}`);
        maxSeverity = "critical";
      }
    }

    // Check body for XSS
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(body)) {
        patterns.push(`body_xss:${pattern.source}`);
        maxSeverity = "high";
      }
    }

    // Check body for command injection
    for (const pattern of COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(body)) {
        patterns.push(`body_cmd:${pattern.source}`);
        maxSeverity = "critical";
      }
    }

    // Check body for NoSQL injection
    for (const pattern of NOSQL_INJECTION_PATTERNS) {
      if (pattern.test(body)) {
        patterns.push(`body_nosql:${pattern.source}`);
        maxSeverity = "high";
      }
    }

    // Check body for LDAP injection
    for (const pattern of LDAP_INJECTION_PATTERNS) {
      if (pattern.test(body)) {
        patterns.push(`body_ldap:${pattern.source}`);
        maxSeverity = "high";
      }
    }

    // Check for null bytes
    if (body.includes("\0")) {
      patterns.push("body_null_byte");
      maxSeverity = "critical";
    }
  } catch {
    // Body parsing failed - not necessarily malicious
  }

  const shouldBlock =
    maxSeverity === "critical" ||
    (maxSeverity === "high" && patterns.length > 1) ||
    patterns.length > 2;

  return {
    blocked: shouldBlock,
    reason: shouldBlock ? `WAF body blocked: ${patterns.join(", ")}` : undefined,
    severity: maxSeverity,
    patterns,
  };
}

/**
 * Process WAF result and take action
 */
export async function processWAFResult(
  request: NextRequest,
  result: WAFResult
): Promise<NextResponse | null> {
  if (!result.blocked) return null;

  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Record security event
  await recordSecurityEvent({
    type: result.severity === "critical" ? "sql_injection" : "xss_attempt",
    ip,
    userAgent,
    path: new URL(request.url).pathname,
    severity: result.severity,
    details: result.reason || "WAF blocked request",
    blocked: true,
  });

  // Auto-block IPs with critical attacks
  if (result.severity === "critical") {
    const { checkRateLimit: check } = await import("./rate-limiter");
    const { allowed } = check(`waf:${ip}`, 3, 300000); // 3 attempts per 5 min
    if (!allowed) {
      blockIP(ip);
    }
  }

  return new NextResponse(
    JSON.stringify({
      error: "Request blocked",
      code: "WAF_BLOCKED",
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        "X-WAF-Blocked": "true",
        "X-WAF-Reason": result.severity,
      },
    }
  );
}

// ============================================
// 5. UTILITY FUNCTIONS
// ============================================

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Get WAF statistics
 */
export function getWAFStats(): {
  blockedIPs: number;
  totalPatterns: number;
  attackTypes: string[];
} {
  return {
    blockedIPs: 0, // Would need to track in production
    totalPatterns:
      SQL_INJECTION_PATTERNS.length +
      XSS_PATTERNS.length +
      PATH_TRAVERSAL_PATTERNS.length +
      COMMAND_INJECTION_PATTERNS.length +
      LDAP_INJECTION_PATTERNS.length +
      NOSQL_INJECTION_PATTERNS.length,
    attackTypes: [
      "SQL Injection",
      "XSS",
      "Path Traversal",
      "Command Injection",
      "LDAP Injection",
      "NoSQL Injection",
      "Header Injection",
      "Attack Path Probing",
    ],
  };
}
