"use client";

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Globe, Monitor, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SecurityEvent {
  id: string;
  action: string;
  user_email: string;
  entity_type: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  severity: string;
  details: any;
  created_at: string;
}

export default function SecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    failed: 0,
    critical: 0,
    today: 0,
  });

  useEffect(() => {
    loadSecurityLogs();
  }, []);

  const loadSecurityLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("security_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        setEvents(data);
        const today = new Date().toISOString().split("T")[0];
        setStats({
          total: data.length,
          failed: data.filter((e) => !e.success).length,
          critical: data.filter((e) => e.severity === "critical").length,
          today: data.filter((e) => e.created_at?.startsWith(today)).length,
        });
      }
    } catch (err) {
      console.error("Error loading security logs:", err);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "warning": return "bg-amber-500/20 text-amber-400";
      default: return "bg-blue-500/20 text-blue-400";
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      "auth.login": "تسجيل دخول",
      "auth.login_failed": "محاولة دخول فاشلة",
      "auth.logout": "تسجيل خروج",
      "auth.signup": "تسجيل حساب جديد",
      "auth.password_change": "تغيير كلمة المرور",
      "auth.password_reset": "إعادة تعيين كلمة المرور",
      "admin.approve_subscription": "الموافقة على اشتراك",
      "admin.reject_subscription": "رفض اشتراك",
      "admin.delete_user": "حذف مستخدم",
      "admin.update_user_role": "تغيير دور مستخدم",
      "data.create": "إضافة بيانات",
      "data.update": "تعديل بيانات",
      "data.delete": "حذف بيانات",
      "file.upload": "رفع ملف",
      "security.rate_limit": "تجاوز حد المحاولات",
      "security.suspicious_activity": "نشاط مشبوه",
      "security.xss_attempt": "محاولة XSS",
      "security.sql_injection_attempt": "محاولة SQL Injection",
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">إجمالي الأحداث</p>
            </div>
          </div>
        </div>
        <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.failed}</p>
              <p className="text-xs text-slate-400">أحداث فاشلة</p>
            </div>
          </div>
        </div>
        <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.critical}</p>
              <p className="text-xs text-slate-400">أحداث حرجة</p>
            </div>
          </div>
        </div>
        <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.today}</p>
              <p className="text-xs text-slate-400">أحداث اليوم</p>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">سجل الأحداث الأمنية</h3>
        <button
          onClick={loadSecurityLogs}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>

      {/* Events table */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">لا توجد أحداث أمنية مسجلة</p>
            <p className="text-slate-500 text-xs mt-1">شغّل الجدول في Supabase أولاً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">الحدث</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">المستخدم</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">IP</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">الخطورة</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{getActionLabel(event.action)}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{event.user_email || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Globe className="w-3 h-3" />
                        <span className="font-mono text-xs">{event.ip_address || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {event.success ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          <CheckCircle className="w-3 h-3" /> نجح
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          <XCircle className="w-3 h-3" /> فشل
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                        {event.severity === "critical" ? "حرج" : event.severity === "warning" ? "تحذير" : "معلومة"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(event.created_at).toLocaleString("ar-EG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
