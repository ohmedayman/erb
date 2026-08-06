// ============================================
// Security Audit Logging System
// Enterprise-grade audit trail
// ============================================

import { supabase } from "./supabase";

export type AuditAction =
  | "auth.login"
  | "auth.login_failed"
  | "auth.logout"
  | "auth.signup"
  | "auth.password_change"
  | "auth.password_reset"
  | "auth.session_expired"
  | "admin.approve_subscription"
  | "admin.reject_subscription"
  | "admin.delete_user"
  | "admin.update_user_role"
  | "admin.update_settings"
  | "data.create"
  | "data.update"
  | "data.delete"
  | "data.export"
  | "file.upload"
  | "file.delete"
  | "security.rate_limit"
  | "security.suspicious_activity"
  | "security.xss_attempt"
  | "security.sql_injection_attempt";

export interface AuditLogEntry {
  action: AuditAction;
  userId?: string;
  userEmail?: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  success: boolean;
  severity: "info" | "warning" | "critical";
}

/**
 * Get client IP address from request
 */
export function getClientIP(request?: Request): string {
  if (!request) return "unknown";
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Get user agent from request
 */
export function getUserAgent(request?: Request): string {
  if (!request) return "unknown";
  return request.headers.get("user-agent") || "unknown";
}

/**
 * Log a security audit event
 * This is non-blocking and won't break the application if it fails
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Get current user from localStorage if available
    let userId = entry.userId;
    let userEmail = entry.userEmail;

    if (!userId && typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        userId = user.id;
        userEmail = user.email;
      } catch {}
    }

    const logEntry = {
      action: entry.action,
      user_id: userId || "system",
      user_email: userEmail || "unknown",
      entity_type: entry.entityType || "system",
      entity_id: entry.entityId || null,
      details: entry.details ? JSON.stringify(entry.details) : null,
      ip_address: entry.ipAddress || "unknown",
      user_agent: entry.userAgent || "unknown",
      country: entry.country || null,
      city: entry.city || null,
      success: entry.success,
      severity: entry.severity,
      created_at: new Date().toISOString(),
    };

    // Try to save to Supabase
    await supabase.from("security_audit_log").insert(logEntry);

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      const emoji = entry.severity === "critical" ? "🚨" : entry.severity === "warning" ? "⚠️" : "ℹ️";
      console.log(`[AUDIT] ${emoji} ${entry.action} - ${entry.success ? "SUCCESS" : "FAILED"} - ${userEmail || "unknown"}`);
    }
  } catch (error) {
    // Audit logging should never break the application
    console.error("Audit log error:", error);
  }
}

/**
 * Log authentication events
 */
export async function auditAuth(
  action: "auth.login" | "auth.login_failed" | "auth.logout" | "auth.signup" | "auth.password_change" | "auth.password_reset",
  data: {
    userId?: string;
    email?: string;
    success: boolean;
    reason?: string;
    request?: Request;
  }
): Promise<void> {
  await auditLog({
    action,
    userId: data.userId,
    userEmail: data.email,
    details: { reason: data.reason },
    ipAddress: getClientIP(data.request),
    userAgent: getUserAgent(data.request),
    success: data.success,
    severity: data.success ? "info" : "warning",
  });
}

/**
 * Log admin actions
 */
export async function auditAdmin(
  action: "admin.approve_subscription" | "admin.reject_subscription" | "admin.delete_user" | "admin.update_user_role" | "admin.update_settings",
  data: {
    targetType: string;
    targetId: string;
    details?: Record<string, any>;
    request?: Request;
  }
): Promise<void> {
  await auditLog({
    action,
    entityType: data.targetType,
    entityId: data.targetId,
    details: data.details,
    ipAddress: getClientIP(data.request),
    userAgent: getUserAgent(data.request),
    success: true,
    severity: "critical",
  });
}

/**
 * Log data operations
 */
export async function auditData(
  action: "data.create" | "data.update" | "data.delete" | "data.export",
  data: {
    entityType: string;
    entityId: string;
    details?: Record<string, any>;
  }
): Promise<void> {
  await auditLog({
    action,
    entityType: data.entityType,
    entityId: data.entityId,
    details: data.details,
    success: true,
    severity: "info",
  });
}

/**
 * Log security threats
 */
export async function auditSecurity(
  action: "security.rate_limit" | "security.suspicious_activity" | "security.xss_attempt" | "security.sql_injection_attempt",
  data: {
    details?: Record<string, any>;
    request?: Request;
  }
): Promise<void> {
  await auditLog({
    action,
    details: data.details,
    ipAddress: getClientIP(data.request),
    userAgent: getUserAgent(data.request),
    success: false,
    severity: "critical",
  });
}

/**
 * Create the security_audit_log table SQL
 */
export const SECURITY_AUDIT_LOG_SQL = `
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  user_id TEXT,
  user_email TEXT,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  success BOOLEAN DEFAULT true,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_audit_action ON security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_user ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_ip ON security_audit_log(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON security_audit_log(severity);
CREATE INDEX IF NOT EXISTS idx_audit_created ON security_audit_log(created_at DESC);

-- RLS: only admins can read, authenticated users can insert their own logs
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs" ON security_audit_log
  FOR SELECT USING (
    current_setting('request.jwt.claims', true)::json->>'email' IN (
      'admin@stockflow.com',
      'm44408335@gmail.com',
      'admin@stockflow.vexonet.online'
    )
  );

CREATE POLICY "Authenticated users can insert audit logs" ON security_audit_log
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );
`;
