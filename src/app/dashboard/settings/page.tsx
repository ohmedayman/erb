"use client";

import { useState, useEffect } from "react";
import {
  Store, User, Bell, Shield, Save, Camera, MapPin, Phone,
  Mail, Globe, Building2, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";
import { getDocsFromCollection, updateDocInCollection } from "@/lib/localdb";
import { supabase } from "@/lib/supabase";

const tabs = [
  { id: "store", label: "معلومات المحل", icon: Store },
  { id: "owner", label: "معلومات صاحب المحل", icon: User },
  { id: "address", label: "العنوان", icon: MapPin },
  { id: "business", label: "الأعمال", icon: Building2 },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "security", label: "الأمان", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store");
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const filters = user.storeId ? [{ field: "id", op: "==", value: user.storeId }] : [];
        const data = await getDocsFromCollection("stores", filters);
        setStoreData(data[0] || { name: "", phone: "", email: "" });
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  const handleSave = async () => {
    if (storeData?.id) {
      await updateDocInCollection("stores", storeData.id, storeData);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async () => {
    setPasswordMsg(null);
    if (!passwords.current || !passwords.new) {
      setPasswordMsg({ type: "error", text: "املأ كل الحقول" });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordMsg({ type: "error", text: "كلمتين السر مش متطابقين" });
      return;
    }
    if (passwords.new.length < 6) {
      setPasswordMsg({ type: "error", text: "كلمة السر لازم 6 أحرف على الأقل" });
      return;
    }
    setPasswordLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.email) {
        setPasswordMsg({ type: "error", text: "مفيش مستخدم مسجل دخول" });
        setPasswordLoading(false);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.current,
      });
      if (signInError) {
        setPasswordMsg({ type: "error", text: "كلمة السر الحالية غلط" });
        setPasswordLoading(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      setPasswordMsg({ type: "success", text: "تم تحديث كلمة السر بنجاح" });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err?.message || "حصلت مشكلة" });
    }
    setPasswordLoading(false);
  };

  const updateField = (field: string, value: any) => {
    setStoreData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">بيتحمّل الإعدادات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
          <p className="text-muted-foreground text-sm mt-1">إعدادات وتفضيلات محلّك</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
          <Save className="w-4 h-4" /> حفظ التغييرات
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle className="w-4 h-4" /> اتعمل بنجاح!
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <nav className="bg-card rounded-xl border border-border p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === "store" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">معلومات المحل</h2>
                <p className="text-sm text-muted-foreground mt-1">تحديث تفاصيل محلّك وعلامتك التجارية</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">اسم المحل</label>
                    <input type="text" value={storeData?.name || ""} onChange={(e) => updateField("name", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">الوصف</label>
                    <textarea value={storeData?.description || ""} onChange={(e) => updateField("description", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">الموقع الإلكتروني</label>
                    <div className="relative">
                      <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="url" value={storeData?.website || ""} onChange={(e) => updateField("website", e.target.value)} className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="https://mystore.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">الصنف</label>
                    <select value={storeData?.category || "Electronics"} onChange={(e) => updateField("category", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>إلكترونيات</option><option>أثاث</option><option>ملابس</option><option>أغذية ومشروبات</option><option>صناعي</option><option>أخرى</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "owner" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">معلومات صاحب المحل</h2>
                <p className="text-sm text-muted-foreground mt-1">معلومات حسابك الشخصي</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">الاسم الكامل</label>
                  <input type="text" value={storeData?.ownerName || ""} onChange={(e) => updateField("ownerName", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" value={storeData?.ownerEmail || ""} onChange={(e) => updateField("ownerEmail", e.target.value)} className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="tel" value={storeData?.ownerPhone || ""} onChange={(e) => updateField("ownerPhone", e.target.value)} className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="010 1234 5678" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">العنوان</h2>
                <p className="text-sm text-muted-foreground mt-1">الموقع الفعلي لمحلّك</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">العنوان</label>
                  <input type="text" value={storeData?.address || ""} onChange={(e) => updateField("address", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="شارع التحرير" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">المدينة</label>
                    <input type="text" value={storeData?.city || ""} onChange={(e) => updateField("city", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">المنطقة</label>
                    <input type="text" value={storeData?.state || ""} onChange={(e) => updateField("state", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">الرمز البريدي</label>
                    <input type="text" value={storeData?.zipCode || ""} onChange={(e) => updateField("zipCode", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">الدولة</label>
                    <select value={storeData?.country || ""} onChange={(e) => updateField("country", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>مصر</option><option>المملكة العربية السعودية</option><option>الإمارات</option><option>الولايات المتحدة</option><option>المملكة المتحدة</option><option>كندا</option><option>ألمانيا</option><option>فرنسا</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "business" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">إعدادات الأعمال</h2>
                <p className="text-sm text-muted-foreground mt-1">تكوين الإعدادات المتعلقة بالأعمال</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">العملة</label>
                    <select value={storeData?.currency || "EGP"} onChange={(e) => updateField("currency", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="EGP">EGP - جنيه مصري</option><option value="SAR">SAR - ريال سعودي</option><option value="AED">AED - درهم إماراتي</option><option value="USD">USD - دولار أمريكي</option><option value="EUR">EUR - يورو</option><option value="GBP">GBP - جنيه إسترليني</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">المنطقة الزمنية</label>
                  <select value={storeData?.timezone || "Africa/Cairo"} onChange={(e) => updateField("timezone", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="Africa/Cairo">القاهرة (GMT+2)</option><option value="Asia/Riyadh">الرياض (GMT+3)</option><option value="Asia/Dubai">دبي (GMT+4)</option><option value="Europe/London">لندن (GMT+0)</option><option value="America/New_York">الوقت الشرقي (GMT-5)</option><option value="America/Chicago">الوقت المركزي (GMT-6)</option><option value="America/Denver">وقت الجبال (GMT-7)</option><option value="America/Los_Angeles">الوقت الهادئ (GMT-8)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">الإشعارات</h2>
                <p className="text-sm text-muted-foreground mt-1">اختار الإشعارات اللي عايز تستلمها</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: "emailNotifs", label: "إشعارات البريد الإلكتروني", desc: "استلام تحديثات عبر البريد الإلكتروني حول نشاط محلّك" },
                  { key: "orderAlerts", label: "تنبيهات الأوردرات", desc: "استلام إشعار عند تقديم أوردرات جديدة" },
                  { key: "lowStockAlerts", label: "تنبيهات المخزون القليل", desc: "تنبيه عند انخفاض المنتجات عن الحد الأدنى" },
                  { key: "weeklyReports", label: "التقارير الأسبوعية", desc: "استلام ملخص أسبوعي لأداء محلّك" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <button onClick={() => updateField(item.key, !storeData[item.key])}
                      className={`relative w-11 h-6 rounded-full transition-colors ${storeData[item.key] ? "bg-primary" : "bg-border"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${storeData[item.key] ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">الأمان</h2>
                <p className="text-sm text-muted-foreground mt-1">إدارة كلمة السر وإعدادات الأمان</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">كلمة السر الحالية</label>
                  <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="أدخل كلمة السر الحالية" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">كلمة السر الجديدة</label>
                  <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="8 أحرف على الأقل" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">تأكيد كلمة السر الجديدة</label>
                  <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="أكد كلمة السر الجديدة" />
                </div>
                {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
                  <div className="flex items-center gap-2 text-red-500 text-sm"><AlertCircle className="w-4 h-4" /> كلمتين السر مش متطابقين</div>
                )}
                {passwordMsg && (
                  <div className={`flex items-center gap-2 text-sm ${passwordMsg.type === "success" ? "text-green-600" : "text-red-500"}`}>
                    {passwordMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {passwordMsg.text}
                  </div>
                )}
                <button onClick={handlePasswordChange} disabled={passwordLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2">
                  {passwordLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحديث...</> : "تحديث كلمة السر"}
                </button>
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-foreground mb-2">المصادقة الثنائية</h3>
                  <p className="text-xs text-muted-foreground mb-3">أضف طبقة أمان إضافية لحسابك</p>
                  <button className="px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-border transition-colors">تفعيل المصادقة الثنائية</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
