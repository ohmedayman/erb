"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit3, Trash2, Clock, CircleDot } from "lucide-react";
import { auth } from "@/lib/firebase";

const actionConfig: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  create: { bg: "bg-green-50", text: "text-green-600", icon: PlusCircle, label: "إنشاء" },
  update: { bg: "bg-blue-50", text: "text-blue-600", icon: Edit3, label: "تعديل" },
  delete: { bg: "bg-red-50", text: "text-red-600", icon: Trash2, label: "حذف" },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
  return date.toLocaleDateString("ar-SA");
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/activity-logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLogs(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">سجل النشاطات</h1>
        <p className="text-muted-foreground text-sm mt-1">تتبع جميع العمليات والتعديلات</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "إجمالي النشاطات", value: logs.length, color: "text-foreground" },
          { label: "إنشاء", value: logs.filter((l) => l.action === "create").length, color: "text-green-600" },
          { label: "تعديل", value: logs.filter((l) => l.action === "update").length, color: "text-blue-600" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">جاري التحميل...</div>
        ) : logs.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <CircleDot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">لا توجد نشاطات بعد</p>
          </div>
        ) : (
          logs.map((log, i) => {
            const cfg = actionConfig[log.action] || actionConfig.create;
            const Icon = cfg.icon;
            return (
              <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-5 h-5 ${cfg.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    {log.entity && (
                      <span className="text-sm font-medium text-foreground">{log.entity}</span>
                    )}
                  </div>
                  {log.details && (
                    <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {log.userName && (
                      <span className="flex items-center gap-1">
                        <CircleDot className="w-3 h-3" /> {log.userName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(log.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
