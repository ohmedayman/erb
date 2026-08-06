import { supabase } from "./supabase";

interface UserActivityData {
  userId: string;
  email: string;
  name?: string;
  eventType: "signup" | "login" | "logout";
}

function parseUserAgent(ua: string) {
  let browser = "Unknown";
  let browserVersion = "";
  let os = "Unknown";
  let osVersion = "";
  let deviceType = "desktop";

  // Device type
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    deviceType = /iPad|iPod|tablet/i.test(ua) ? "tablet" : "mobile";
  }

  // Browser
  if (ua.includes("Firefox/")) {
    browser = "Firefox";
    browserVersion = ua.split("Firefox/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Edg/")) {
    browser = "Edge";
    browserVersion = ua.split("Edg/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Chrome/")) {
    browser = "Chrome";
    browserVersion = ua.split("Chrome/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Safari/") && ua.includes("Version/")) {
    browser = "Safari";
    browserVersion = ua.split("Version/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Opera") || ua.includes("OPR/")) {
    browser = "Opera";
    browserVersion = ua.split("OPR/")[1]?.split(" ")[0] || "";
  }

  // OS
  if (ua.includes("Windows NT 10")) { os = "Windows"; osVersion = "10/11"; }
  else if (ua.includes("Windows NT 6.3")) { os = "Windows"; osVersion = "8.1"; }
  else if (ua.includes("Windows NT 6.1")) { os = "Windows"; osVersion = "7"; }
  else if (ua.includes("Windows")) { os = "Windows"; }
  else if (ua.includes("Mac OS X")) { os = "macOS"; osVersion = ua.split("Mac OS X ")[1]?.split(" ")[0]?.replace(/_/g, ".") || ""; }
  else if (ua.includes("Android")) { os = "Android"; osVersion = ua.split("Android ")[1]?.split(";")[0] || ""; }
  else if (ua.includes("iPhone") || ua.includes("iPad")) { os = "iOS"; osVersion = ua.split("OS ")[1]?.split(" ")[0]?.replace(/_/g, ".") || ""; }
  else if (ua.includes("Linux")) { os = "Linux"; }
  else if (ua.includes("CrOS")) { os = "ChromeOS"; }

  return { browser, browserVersion, os, osVersion, deviceType };
}

export async function trackUserActivity(data: UserActivityData) {
  try {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const parsed = parseUserAgent(ua);
    const lang = typeof navigator !== "undefined" ? navigator.language : "";
    const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
    const screen = typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "";

    // Get IP and location
    let ip = "";
    let country = "";
    let city = "";
    try {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const loc = await res.json();
        ip = loc.ip || "";
        country = loc.country_name || "";
        city = loc.city || "";
      }
    } catch {
      // Fallback - try another service
      try {
        const res = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const d = await res.json();
          ip = d.ip || "";
        }
      } catch {}
    }

    // Insert activity record
    await supabase.from("user_activity").insert({
      user_id: data.userId,
      user_email: data.email,
      user_name: data.name,
      event_type: data.eventType,
      ip_address: ip,
      country,
      city,
      device_type: parsed.deviceType,
      browser: parsed.browser,
      browser_version: parsed.browserVersion,
      os: parsed.os,
      os_version: parsed.osVersion,
      screen_resolution: screen,
      language: lang,
      timezone: tz,
      user_agent: ua,
    });

    // Update registered_users with latest info
    if (data.eventType === "signup" || data.eventType === "login") {
      await supabase.from("registered_users").update({
        last_ip: ip,
        last_country: country,
        last_city: city,
        last_device: `${parsed.deviceType} - ${parsed.os}`,
        last_browser: `${parsed.browser} ${parsed.browserVersion}`,
        last_os: `${parsed.os} ${parsed.osVersion}`,
        ...(data.eventType === "signup" ? { signup_at: new Date().toISOString() } : {}),
        last_login_at: new Date().toISOString(),
      }).eq("id", data.userId);
    }
  } catch (err) {
    console.error("Error tracking user activity:", err);
  }
}

export async function getUserActivity(userId?: string) {
  let query = supabase.from("user_activity").select("*").order("created_at", { ascending: false });
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query.limit(500);
  if (error) throw error;
  return data || [];
}

export async function getUserLocationFromIP() {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}
