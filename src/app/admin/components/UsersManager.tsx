"use client";

import { useState, useEffect } from "react";
import { Users, Shield, User, MapPin, Monitor, Smartphone, Tablet, Globe, Clock, ChevronDown, ChevronUp } from "lucide-react";
import DataTable from "./DataTable";
import { supabase } from "@/lib/supabase";

interface UsersManagerProps {
  users: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export default function UsersManager({ users, onEdit, onDelete }: UsersManagerProps) {
  const [userActivities, setUserActivities] = useState<Record<string, any[]>>({});
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const { data } = await supabase
        .from("user_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (data) {
        const grouped: Record<string, any[]> = {};
        data.forEach((act) => {
          if (!grouped[act.user_id]) grouped[act.user_id] = [];
          grouped[act.user_id].push(act);
        });
        setUserActivities(grouped);
      }
    } catch {}
  };

  const getDeviceIcon = (device: string) => {
    if (device?.includes("mobile")) return <Smartphone className="w-4 h-4" />;
    if (device?.includes("tablet")) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const columns = [
    {
      key: "full_name",
      label: "المستخدم",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.role === "admin" ? "bg-orange-500/20" : "bg-slate-600/50"}`}>
            {item.role === "admin" ? <Shield className="w-4 h-4 text-orange-400" /> : <User className="w-4 h-4 text-slate-400" />}
          </div>
          <div>
            <span className="text-white font-medium block text-sm">{item.full_name}</span>
            <span className="text-slate-500 text-xs">{item.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "last_ip",
      label: "IP",
      render: (item: any) => (
        <div className="text-xs">
          {item.last_ip ? (
            <span className="bg-slate-700/50 px-2 py-1 rounded font-mono text-slate-300">{item.last_ip}</span>
          ) : (
            <span className="text-slate-600">—</span>
          )}
        </div>
      ),
    },
    {
      key: "last_country",
      label: "الموقع",
      render: (item: any) => (
        <div className="text-xs">
          {item.last_country ? (
            <div className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3 h-3 text-orange-400" />
              <span>{item.last_city ? `${item.last_city}, ` : ""}{item.last_country}</span>
            </div>
          ) : (
            <span className="text-slate-600">—</span>
          )}
        </div>
      ),
    },
    {
      key: "last_device",
      label: "الجهاز",
      render: (item: any) => (
        <div className="text-xs">
          {item.last_device ? (
            <div className="flex items-center gap-1 text-slate-300">
              {getDeviceIcon(item.last_device)}
              <span>{item.last_device}</span>
            </div>
          ) : (
            <span className="text-slate-600">—</span>
          )}
        </div>
      ),
    },
    {
      key: "last_browser",
      label: "المتصفح",
      render: (item: any) => (
        <div className="text-xs">
          {item.last_browser ? (
            <div className="flex items-center gap-1 text-slate-300">
              <Globe className="w-3 h-3 text-blue-400" />
              <span>{item.last_browser}</span>
            </div>
          ) : (
            <span className="text-slate-600">—</span>
          )}
        </div>
      ),
    },
    {
      key: "last_os",
      label: "نظام التشغيل",
      render: (item: any) => (
        <span className="text-xs text-slate-300">{item.last_os || "—"}</span>
      ),
    },
    {
      key: "subscription_status",
      label: "الاشتراك",
      render: (item: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.subscription_status === "active" || item.subscription_status === "approved" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
          {item.subscription_status === "active" ? "نشط" : item.subscription_status === "approved" ? "مقبول" : item.subscription_status || "جديد"}
        </span>
      ),
    },
    {
      key: "signup_at",
      label: "تاريخ التسجيل",
      render: (item: any) => (
        <span className="text-xs text-slate-400">
          {item.signup_at ? new Date(item.signup_at).toLocaleDateString("ar-EG") : new Date(item.created_at).toLocaleDateString("ar-EG")}
        </span>
      ),
    },
    {
      key: "last_login_at",
      label: "آخر دخول",
      render: (item: any) => (
        <div className="text-xs">
          {item.last_login_at ? (
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{new Date(item.last_login_at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</span>
            </div>
          ) : (
            <span className="text-slate-600">لم يسجل دخول</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">إدارة المستخدمين</h2>
        <p className="text-slate-400 text-sm">{users.length} مستخدم مسجل</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        <DataTable
          columns={columns}
          data={users}
          searchKeys={["full_name", "email", "phone", "last_ip", "last_country", "last_city"]}
          searchPlaceholder="بحث بالاسم أو البريد أو IP..."
          onEdit={onEdit}
          onDelete={onDelete}
          expandable
          renderExpanded={(item: any) => {
            const activities = userActivities[item.id] || [];
            return (
              <div className="p-4 bg-[#0f172a] rounded-lg border border-slate-700/50">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  سجل النشاطات ({activities.length})
                </h4>
                {activities.length === 0 ? (
                  <p className="text-slate-500 text-xs">لا توجد نشاطات مسجلة</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {activities.map((act, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            act.event_type === "signup" ? "bg-green-500/20 text-green-400" :
                            act.event_type === "login" ? "bg-blue-500/20 text-blue-400" :
                            "bg-slate-500/20 text-slate-400"
                          }`}>
                            {act.event_type === "signup" ? "تسجيل" : act.event_type === "login" ? "دخول" : act.event_type}
                          </span>
                          <span className="text-slate-400">{act.ip_address}</span>
                          <span className="text-slate-500">{act.country}{act.city ? `, ${act.city}` : ""}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                          <span>{act.browser} / {act.os}</span>
                          <span>{act.device_type}</span>
                          <span>{new Date(act.created_at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
