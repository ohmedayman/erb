"use client";

import { useState, useEffect } from "react";
import {
  Users, Shield, User, MapPin, Monitor, Smartphone, Tablet,
  Globe, Clock, ChevronDown, ChevronUp, Check, X, Ban,
  Settings, Package, ShoppingCart, Receipt, UserCheck, Truck,
  BarChart3, FileText, Warehouse, CreditCard, Bell, Star,
  Eye, Edit, Trash2, AlertTriangle
} from "lucide-react";
import DataTable from "./DataTable";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/Toast";

const ALL_FEATURES = [
  { id: "products", label: "المنتجات", icon: Package },
  { id: "orders", label: "الأوردرات", icon: ShoppingCart },
  { id: "customers", label: "الزبائن", icon: UserCheck },
  { id: "invoices", label: "الفواتير", icon: Receipt },
  { id: "expenses", label: "المصروفات", icon: CreditCard },
  { id: "employees", label: "الموظفين", icon: Users },
  { id: "suppliers", label: "الموردين", icon: Truck },
  { id: "analytics", label: "التحليلات", icon: BarChart3 },
  { id: "reports", label: "التقارير", icon: FileText },
  { id: "warehouses", label: "المستودعات", icon: Warehouse },
  { id: "installments", label: "الأقساط", icon: CreditCard },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "ratings", label: "التقييمات", icon: Star },
  { id: "stockMovements", label: "حركات المخزون", icon: Package },
  { id: "team", label: "الفريق", icon: Users },
];

interface UsersManagerProps {
  users: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export default function UsersManager({ users, onEdit, onDelete }: UsersManagerProps) {
  const [userActivities, setUserActivities] = useState<Record<string, any[]>>({});
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

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

  const updateUserStatus = async (userId: string, status: string) => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from("registered_users")
        .update({ subscription_status: status })
        .eq("id", userId);

      if (error) throw error;
      toast.success(`تم ${status === "approved" ? "الموافقة" : status === "rejected" ? "الرفض" : "إيقاف"} الحساب`);
      window.location.reload();
    } catch (err: any) {
      toast.error("خطأ في تحديث الحساب");
    } finally {
      setUpdating(null);
    }
  };

  const toggleFeature = async (userId: string, features: string[], feature: string) => {
    const newFeatures = features.includes(feature)
      ? features.filter((f) => f !== feature)
      : [...features, feature];

    setUpdating(userId);
    try {
      const { error } = await supabase
        .from("registered_users")
        .update({ enabled_features: newFeatures })
        .eq("id", userId);

      if (error) throw error;
      toast.success("تم تحديث الميزات");
      window.location.reload();
    } catch (err: any) {
      toast.error("خطأ في تحديث الميزات");
    } finally {
      setUpdating(null);
    }
  };

  const openDetail = (user: any) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const columns = [
    {
      key: "full_name",
      label: "المستخدم",
      render: (item: any) => (
        <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/30 p-1 rounded-lg transition-colors" onClick={() => openDetail(item)}>
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
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          item.subscription_status === "active" || item.subscription_status === "approved"
            ? "bg-green-500/20 text-green-400"
            : item.subscription_status === "rejected"
            ? "bg-red-500/20 text-red-400"
            : item.subscription_status === "suspended"
            ? "bg-orange-500/20 text-orange-400"
            : "bg-amber-500/20 text-amber-400"
        }`}>
          {item.subscription_status === "active" ? "نشط" :
           item.subscription_status === "approved" ? "مقبول" :
           item.subscription_status === "rejected" ? "مرفوض" :
           item.subscription_status === "suspended" ? "معلق" :
           item.subscription_status || "جديد"}
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
            const features = item.enabled_features || [];
            return (
              <div className="p-4 bg-[#0f172a] rounded-lg border border-slate-700/50 space-y-4">
                {/* Account Status Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 ml-2">التحكم في الحساب:</span>
                  {item.subscription_status !== "approved" && item.subscription_status !== "active" && (
                    <button
                      onClick={() => updateUserStatus(item.id, "approved")}
                      disabled={updating === item.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" /> قبول
                    </button>
                  )}
                  {item.subscription_status !== "rejected" && (
                    <button
                      onClick={() => updateUserStatus(item.id, "rejected")}
                      disabled={updating === item.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3 h-3" /> رفض
                    </button>
                  )}
                  {item.subscription_status !== "suspended" && item.subscription_status !== "rejected" && (
                    <button
                      onClick={() => updateUserStatus(item.id, "suspended")}
                      disabled={updating === item.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-medium hover:bg-orange-500/30 transition-colors disabled:opacity-50"
                    >
                      <Ban className="w-3 h-3" /> إيقاف
                    </button>
                  )}
                  <button
                    onClick={() => openDetail(item)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> تفاصيل
                  </button>
                </div>

                {/* Feature Toggle */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
                    <Settings className="w-3 h-3" /> الميزات المتاحة
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_FEATURES.map((f) => {
                      const Icon = f.icon;
                      const isEnabled = features.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          onClick={() => toggleFeature(item.id, features, f.id)}
                          disabled={updating === item.id}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                            isEnabled
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-slate-800 text-slate-500 border border-slate-700/50 hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Activity Log */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> سجل النشاطات ({activities.length})
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
              </div>
            );
          }}
        />
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4 border border-slate-700/50">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedUser.role === "admin" ? "bg-orange-500/20" : "bg-slate-600/50"}`}>
                  {selectedUser.role === "admin" ? <Shield className="w-6 h-6 text-orange-400" /> : <User className="w-6 h-6 text-slate-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUser.full_name}</h3>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              {/* Status Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 ml-2">التحكم في الحساب:</span>
                {selectedUser.subscription_status !== "approved" && selectedUser.subscription_status !== "active" && (
                  <button
                    onClick={() => { updateUserStatus(selectedUser.id, "approved"); setShowDetailModal(false); }}
                    className="flex items-center gap-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm font-medium hover:bg-green-500/30 transition-colors"
                  >
                    <Check className="w-4 h-4" /> قبول
                  </button>
                )}
                {selectedUser.subscription_status !== "rejected" && (
                  <button
                    onClick={() => { updateUserStatus(selectedUser.id, "rejected"); setShowDetailModal(false); }}
                    className="flex items-center gap-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-colors"
                  >
                    <X className="w-4 h-4" /> رفض
                  </button>
                )}
                {selectedUser.subscription_status !== "suspended" && selectedUser.subscription_status !== "rejected" && (
                  <button
                    onClick={() => { updateUserStatus(selectedUser.id, "suspended"); setShowDetailModal(false); }}
                    className="flex items-center gap-1 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-xl text-sm font-medium hover:bg-orange-500/30 transition-colors"
                  >
                    <Ban className="w-4 h-4" /> إيقاف
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">رقم الهاتف</p>
                  <p className="text-sm text-white font-medium">{selectedUser.phone || "—"}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">اسم المتجر</p>
                  <p className="text-sm text-white font-medium">{selectedUser.store_name || "—"}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">الموقع</p>
                  <p className="text-sm text-white font-medium">
                    {selectedUser.last_city ? `${selectedUser.last_city}, ` : ""}{selectedUser.last_country || "—"}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">الجهاز</p>
                  <p className="text-sm text-white font-medium">{selectedUser.last_device || "—"}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">المتصفح</p>
                  <p className="text-sm text-white font-medium">{selectedUser.last_browser || "—"}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">نظام التشغيل</p>
                  <p className="text-sm text-white font-medium">{selectedUser.last_os || "—"}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">IP</p>
                  <p className="text-sm text-white font-mono">{selectedUser.last_ip || "—"}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">تاريخ التسجيل</p>
                  <p className="text-sm text-white font-medium">
                    {selectedUser.signup_at ? new Date(selectedUser.signup_at).toLocaleDateString("ar-EG") : "—"}
                  </p>
                </div>
              </div>

              {/* Feature Control */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-orange-400" /> الميزات المتاحة
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {ALL_FEATURES.map((f) => {
                    const Icon = f.icon;
                    const isEnabled = (selectedUser.enabled_features || []).includes(f.id);
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggleFeature(selectedUser.id, selectedUser.enabled_features || [], f.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all ${
                          isEnabled
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-slate-800 text-slate-500 border border-slate-700/50 hover:bg-slate-700/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Activity */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" /> آخر النشاطات
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(userActivities[selectedUser.id] || []).slice(0, 10).map((act, i) => (
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
                        <span className="text-slate-500">{act.browser}</span>
                      </div>
                      <span className="text-slate-500">{new Date(act.created_at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
