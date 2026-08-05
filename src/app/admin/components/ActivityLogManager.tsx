"use client";

import { Activity, Store, ShoppingCart, Package, Receipt, UserCog, Wallet } from "lucide-react";

interface ActivityLogManagerProps {
  logs: any[];
  stores: any[];
}

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  create: { label: "إنشاء", color: "text-green-400", bg: "bg-green-500/20", icon: Package },
  update: { label: "تعديل", color: "text-blue-400", bg: "bg-blue-500/20", icon: Activity },
  delete: { label: "حذف", color: "text-red-400", bg: "bg-red-500/20", icon: Activity },
  approve: { label: "approve", color: "text-green-400", bg: "bg-green-500/20", icon: ShoppingCart },
  reject: { label: "رفض", color: "text-red-400", bg: "bg-red-500/20", icon: Activity },
  login: { label: "دخول", color: "text-purple-400", bg: "bg-purple-500/20", icon: UserCog },
  sale: { label: "بيع", color: "text-orange-400", bg: "bg-orange-500/20", icon: Receipt },
};

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
  return new Date(dateStr).toLocaleDateString("ar-EG");
}

export default function ActivityLogManager({ logs, stores }: ActivityLogManagerProps) {
  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store?.name || "غير محدد";
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">سجل النشاطات</h2>
        <p className="text-slate-400 text-sm">{logs.length} نشاط مسجل</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        {logs.length === 0 ? (
          <p className="text-slate-500 text-center py-12">لا توجد نشاطات بعد</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.update;
              return (
                <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <config.icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-slate-400 text-xs">{log.entity_type}</span>
                      {log.store_id && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Store className="w-3 h-3" />
                          {getStoreName(log.store_id)}
                        </span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-slate-300 text-sm mt-1">{log.details}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {log.user_name && <span className="text-slate-500 text-xs">{log.user_name}</span>}
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-500 text-xs">{timeAgo(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
