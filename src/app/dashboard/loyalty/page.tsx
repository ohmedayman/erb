"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  Percent,
  Star,
  Save,
  ToggleLeft,
  ToggleRight,
  Coins,
  TrendingUp,
  Users,
  Award,
  Info,
} from "lucide-react";
import { getDocsFromCollection, addDocToCollection, updateDocInCollection } from "@/lib/localdb";
import { toast } from "@/components/Toast";

interface LoyaltySettings {
  id?: string;
  cashbackEnabled: boolean;
  cashbackRate: number;
  pointsEnabled: boolean;
  pointsRate: number;
  pointsValue: number;
  minPurchase: number;
  welcomeBonus: number;
  tierThresholds: {
    silver: number;
    gold: number;
    platinum: number;
  };
}

const defaultSettings: LoyaltySettings = {
  cashbackEnabled: true,
  cashbackRate: 5,
  pointsEnabled: true,
  pointsRate: 10,
  pointsValue: 0.10,
  minPurchase: 100,
  welcomeBonus: 0,
  tierThresholds: {
    silver: 5000,
    gold: 15000,
    platinum: 30000,
  },
};

const tierConfig = [
  { key: "bronze", label: "برونزي", color: "bg-orange-100 text-orange-700 border-orange-200", icon: "🥉", min: 0 },
  { key: "silver", label: "فضي", color: "bg-gray-100 text-gray-700 border-gray-200", icon: "🥈", min: 5000 },
  { key: "gold", label: "ذهبي", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "🥇", min: 15000 },
  { key: "platinum", label: "بلاتيني", color: "bg-purple-100 text-purple-700 border-purple-200", icon: "💎", min: 30000 },
];

export default function LoyaltyPage() {
  const [settings, setSettings] = useState<LoyaltySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const filters = user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : [];

      const [settingsData, customersData] = await Promise.all([
        getDocsFromCollection("loyaltySettings", filters),
        getDocsFromCollection("customers", filters),
      ]);

      if (settingsData.length > 0) {
        const s = settingsData[0];
        setSettings({
          id: s.id,
          cashbackEnabled: s.cashbackEnabled ?? true,
          cashbackRate: s.cashbackRate ?? 5,
          pointsEnabled: s.pointsEnabled ?? true,
          pointsRate: s.pointsRate ?? 10,
          pointsValue: s.pointsValue ?? 0.10,
          minPurchase: s.minPurchase ?? 100,
          welcomeBonus: s.welcomeBonus ?? 0,
          tierThresholds: s.tierThresholds ?? defaultSettings.tierThresholds,
        });
      }

      setCustomers(customersData);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const data = { ...settings, storeId: user.storeId };

      if (settings.id) {
        await updateDocInCollection("loyaltySettings", settings.id, data);
      } else {
        await addDocToCollection("loyaltySettings", data);
      }
      toast.success("تم حفظ إعدادات الولاء بنجاح");
    } catch {
      toast.error("فيه مشكلة حصلت");
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    totalCustomers: customers.length,
    totalCashback: customers.reduce((s: number, c: any) => s + (c.cashbackBalance || 0), 0),
    totalPoints: customers.reduce((s: number, c: any) => s + (c.points || 0), 0),
    totalSpent: customers.reduce((s: number, c: any) => s + (c.totalSpent || 0), 0),
    byTier: tierConfig.map((t) => ({
      ...t,
      count: customers.filter((c: any) => {
        const spent = c.totalSpent || 0;
        if (t.key === "platinum") return spent >= (settings.tierThresholds.platinum || 30000);
        if (t.key === "gold") return spent >= (settings.tierThresholds.gold || 15000) && spent < (settings.tierThresholds.platinum || 30000);
        if (t.key === "silver") return spent >= (settings.tierThresholds.silver || 5000) && spent < (settings.tierThresholds.gold || 15000);
        return spent < (settings.tierThresholds.silver || 5000);
      }).length,
    })),
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">نظام الولاء والمكافآت</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة الكاش باك والنقاط والمستويات</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الزبائن</p>
              <p className="text-lg font-bold text-foreground">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">كاش باك معلق</p>
              <p className="text-lg font-bold text-green-600">{stats.totalCashback.toLocaleString("ar-EG")} ج.م</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي النقاط</p>
              <p className="text-lg font-bold text-yellow-600">{stats.totalPoints.toLocaleString("ar-EG")}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
              <p className="text-lg font-bold text-purple-600">{stats.totalSpent.toLocaleString("ar-EG")} ج.م</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cashback Settings */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-green-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">الكاش باك</h3>
                <p className="text-xs text-muted-foreground">اعاده جزء من المبلغ للزبون</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, cashbackEnabled: !settings.cashbackEnabled })}
              className="p-1"
            >
              {settings.cashbackEnabled ? (
                <ToggleRight className="w-10 h-10 text-green-600" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
        {settings.cashbackEnabled && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  نسبة الكاش باك (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={settings.cashbackRate}
                    onChange={(e) => setSettings({ ...settings, cashbackRate: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  على كل فاتورة — مثال: فاتورة 1000 ج.م × {settings.cashbackRate}% = {(1000 * settings.cashbackRate / 100).toFixed(2)} ج.م كاش باك
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  الحد الأدنى للفاتورة (ج.م)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.minPurchase}
                  onChange={(e) => setSettings({ ...settings, minPurchase: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">الفواتير الأقل من هذا المبلغ لا تحصل على كاش باك</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Points Settings */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-yellow-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">النقاط</h3>
                <p className="text-xs text-muted-foreground">اجمع نقاط مع كل عملية شراء</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, pointsEnabled: !settings.pointsEnabled })}
              className="p-1"
            >
              {settings.pointsEnabled ? (
                <ToggleRight className="w-10 h-10 text-yellow-600" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
        {settings.pointsEnabled && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  نقطة كل كام جنيه
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.pointsRate}
                  onChange={(e) => setSettings({ ...settings, pointsRate: parseInt(e.target.value) || 10 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  مثال: 1 نقطة كل {settings.pointsRate} ج.م — فاتورة 1000 ج.م = {Math.floor(1000 / settings.pointsRate)} نقطة
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  قيمة النقطة (ج.م)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.pointsValue}
                  onChange={(e) => setSettings({ ...settings, pointsValue: parseFloat(e.target.value) || 0.10 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  100 نقطة × {settings.pointsValue} ج.م = {(100 * settings.pointsValue).toFixed(2)} ج.م خصم
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                مكافأة التسجيل (نقاط)
              </label>
              <input
                type="number"
                min="0"
                value={settings.welcomeBonus}
                onChange={(e) => setSettings({ ...settings, welcomeBonus: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1">نقاط مجانية عند تسجيل الزبون</p>
            </div>
          </div>
        )}
      </div>

      {/* Tier Thresholds */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-purple-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">مستويات الولاء</h3>
              <p className="text-xs text-muted-foreground">تحديد العتبات لكل مستوى</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">🥈 الحد الأدنى للفضي (ج.م)</label>
              <input
                type="number"
                min="0"
                value={settings.tierThresholds.silver}
                onChange={(e) => setSettings({
                  ...settings,
                  tierThresholds: { ...settings.tierThresholds, silver: parseInt(e.target.value) || 5000 }
                })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">🥇 الحد الأدنى للذهبي (ج.م)</label>
              <input
                type="number"
                min="0"
                value={settings.tierThresholds.gold}
                onChange={(e) => setSettings({
                  ...settings,
                  tierThresholds: { ...settings.tierThresholds, gold: parseInt(e.target.value) || 15000 }
                })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">💎 الحد الأدنى للبلاتيني (ج.م)</label>
              <input
                type="number"
                min="0"
                value={settings.tierThresholds.platinum}
                onChange={(e) => setSettings({
                  ...settings,
                  tierThresholds: { ...settings.tierThresholds, platinum: parseInt(e.target.value) || 30000 }
                })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">توزيع الزبائن بالمستويات</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.byTier.map((tier) => (
              <div key={tier.key} className={`rounded-xl border p-4 text-center ${tier.color}`}>
                <div className="text-3xl mb-2">{tier.icon}</div>
                <p className="text-sm font-bold">{tier.label}</p>
                <p className="text-2xl font-bold mt-1">{tier.count}</p>
                <p className="text-xs opacity-70">زبون</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">كيف يعمل النظام؟</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p><strong className="text-foreground">الكاش باك:</strong> عند كل فاتورة يحصل الزبون على نسبة ({settings.cashbackRate}%) تُضاف لرصده ويمكنه استخدامها في فواتير قادمة.</p>
            <p><strong className="text-foreground">النقاط:</strong> كل {settings.pointsRate} ج.م شراء = 1 نقطة. قيمة النقطة {settings.pointsValue} ج.م.</p>
          </div>
          <div className="space-y-2">
            <p><strong className="text-foreground">المستويات:</strong> كلما زادت مشتريات الزبون ارتفع مستواه وحصل على مزايا إضافية.</p>
            <p><strong className="text-foreground">الخصم:</strong> يمكن للزبون استخدام نقاطه أو رصيد الكاش باك كخصم على الفواتير.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
