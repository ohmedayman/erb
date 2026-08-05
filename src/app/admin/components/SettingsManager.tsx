"use client";

import { useState } from "react";
import { Settings, Save, Shield, Bell, CreditCard, Globe } from "lucide-react";

export default function SettingsManager() {
  const [settings, setSettings] = useState({
    platformName: "StockFlow",
    supportEmail: "support@stockflow.vexonet.online",
    supportPhone: "01028707543",
    defaultCurrency: "EGP",
    taxRate: 15,
    allowSignup: true,
    requireApproval: true,
    maxStoresPerUser: 3,
    trialDays: 14,
    enableNotifications: true,
    enableOfflineMode: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("admin-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">إعدادات النظام</h2>
          <p className="text-slate-400 text-sm">إعدادات المنصة العامة</p>
        </div>
        <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
          <Save className="w-4 h-4" />
          {saved ? "تم الحفظ!" : "حفظ الإعدادات"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-orange-400" />
            <h3 className="text-white font-bold">معلومات المنصة</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">اسم المنصة</label>
              <input value={settings.platformName} onChange={(e) => updateSetting("platformName", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">بريد الدعم</label>
              <input type="email" value={settings.supportEmail} onChange={(e) => updateSetting("supportEmail", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">هاتف الدعم</label>
              <input type="tel" value={settings.supportPhone} onChange={(e) => updateSetting("supportPhone", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">العملة الافتراضية</label>
              <select value={settings.defaultCurrency} onChange={(e) => updateSetting("defaultCurrency", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                <option value="EGP">ج.م - جنيه مصري</option>
                <option value="SAR">ر.س - ريال سعودي</option>
                <option value="AED">د.إ - درهم إماراتي</option>
                <option value="USD">$ - دولار أمريكي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">نسبة الضريبة (%)</label>
              <input type="number" value={settings.taxRate} onChange={(e) => updateSetting("taxRate", Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-orange-400" />
            <h3 className="text-white font-bold">الأمان والاشتراكات</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">السماح بالتسجيل</span>
              <button onClick={() => updateSetting("allowSignup", !settings.allowSignup)} className={`w-12 h-6 rounded-full transition-colors relative ${settings.allowSignup ? "bg-orange-500" : "bg-slate-600"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${settings.allowSignup ? "right-0.5" : "right-6"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">الموافقة على الاشتراكات يدوياً</span>
              <button onClick={() => updateSetting("requireApproval", !settings.requireApproval)} className={`w-12 h-6 rounded-full transition-colors relative ${settings.requireApproval ? "bg-orange-500" : "bg-slate-600"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${settings.requireApproval ? "right-0.5" : "right-6"}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">الحد الأقصى للمتاجر لكل مستخدم</label>
              <input type="number" value={settings.maxStoresPerUser} onChange={(e) => updateSetting("maxStoresPerUser", Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">أيام التجربة المجانية</label>
              <input type="number" value={settings.trialDays} onChange={(e) => updateSetting("trialDays", Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-orange-400" />
            <h3 className="text-white font-bold">المميزات</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">تفعيل الإشعارات</span>
              <button onClick={() => updateSetting("enableNotifications", !settings.enableNotifications)} className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableNotifications ? "bg-orange-500" : "bg-slate-600"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${settings.enableNotifications ? "right-0.5" : "right-6"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">الوضع الأوفلاين</span>
              <button onClick={() => updateSetting("enableOfflineMode", !settings.enableOfflineMode)} className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableOfflineMode ? "bg-orange-500" : "bg-slate-600"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${settings.enableOfflineMode ? "right-0.5" : "right-6"}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-orange-400" />
            <h3 className="text-white font-bold">طرق الدفع المدعومة</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: "فوري", key: "fawry", enabled: true },
              { name: "فودافون كاش", key: "vodafone_cash", enabled: true },
              { name: "InstaPay", key: "instapay", enabled: true },
              { name: "حوالة بنكية", key: "bank_transfer", enabled: true },
            ].map((method) => (
              <div key={method.key} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-slate-800">
                <span className="text-white text-sm">{method.name}</span>
                <span className="text-green-400 text-xs font-medium">مفعل</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
