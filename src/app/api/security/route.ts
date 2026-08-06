// ============================================
// Security API - Admin endpoints
// Security monitoring and management
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { createSecureHandler } from "@/lib/secure-api";
import { generateSecurityReport, getRecentEvents, recordSecurityEvent } from "@/lib/security-monitor";
import { blockIP, unblockIP, getSecurityStats } from "@/lib/rate-limiter";
import { ADMIN_EMAILS } from "@/lib/admin-config";

/**
 * GET /api/security - Get security report (admin only)
 */
export const GET = createSecureHandler(
  async (request) => {
    const report = generateSecurityReport();
    return NextResponse.json(report);
  },
  { requireAuth: true, requireAdmin: true, rateLimit: { maxRequests: 30, windowMs: 60000 } }
);

/**
 * POST /api/security - Block/Unblock IP (admin only)
 */
export const POST = createSecureHandler(
  async (request, { user }) => {
    const body = await request.json();
    const { action, ip } = body;

    if (!ip || typeof ip !== "string") {
      return NextResponse.json({ error: "IP مطلوب" }, { status: 400 });
    }

    // Validate IP format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return NextResponse.json({ error: "IP غير صحيح" }, { status: 400 });
    }

    if (action === "block") {
      blockIP(ip);
      recordSecurityEvent({
        type: "unauthorized_access",
        ip: user!.email,
        userAgent: "admin-action",
        path: "/api/security",
        severity: "medium",
        details: `Admin blocked IP: ${ip}`,
        blocked: true,
      });
      return NextResponse.json({ success: true, message: `تم حظر IP: ${ip}` });
    }

    if (action === "unblock") {
      unblockIP(ip);
      return NextResponse.json({ success: true, message: `تم فتح IP: ${ip}` });
    }

    return NextResponse.json({ error: "Action غير صحيح" }, { status: 400 });
  },
  { requireAuth: true, requireAdmin: true }
);
