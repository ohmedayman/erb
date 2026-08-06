"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Users, Truck, CreditCard, Building2, Check, Zap,
  User, PackageCheck, FileSignature, Receipt, Wrench, HandCoins,
  ClipboardList, CircleDollarSign, RefreshCcw, TrendingUp, CheckCircle,
  ArrowLeft, ArrowRight, Sparkles, Store, Warehouse, Globe,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import SEOHead from "@/components/SEOHead";

const ALL_FEATURES = [
  { id: "products", label: "المنتجات", desc: "إضافة وتعديل المنتجات والأسعار", icon: Package, color: "from-blue-500 to-blue-600" },
  { id: "orders", label: "الأوردرات", desc: "متابعة أوردرات الزباين", icon: ClipboardList, color: "from-orange-500 to-orange-600" },
  { id: "invoices", label: "الفواتير", desc: "إنشاء فواتير بيع وشراء", icon: FileSignature, color: "from-emerald-500 to-emerald-600" },
  { id: "customers", label: "الزبائن", desc: "بيانات الزباين وتاريخهم", icon: Users, color: "from-purple-500 to-purple-600" },
  { id: "inventory", label: "المخزون", desc: "تتبع المخزون والكميات", icon: PackageCheck, color: "from-cyan-500 to-cyan-600" },
  { id: "expenses", label: "المصروفات", desc: "تسجيل ومتابعة المصروفات", icon: CircleDollarSign, color: "from-red-500 to-red-600" },
  { id: "employees", label: "الموظفين", desc: "إدارة الموظفين والرواتب", icon: User, color: "from-indigo-500 to-indigo-600" },
  { id: "shipping", label: "الشحن", desc: "إدارة شحن الأوردرات", icon: Truck, color: "from-amber-500 to-amber-600" },
  { id: "installments", label: "الأقساط", desc: "متابعة الأقساط والديون", icon: HandCoins, color: "from-pink-500 to-pink-600" },
  { id: "accounts", label: "الحسابات", desc: "قوائم مالية وحسابات عامة", icon: Receipt, color: "from-teal-500 to-teal-600" },
  { id: "purchaseOrders", label: "أوردرات الشراء", desc: "طلبات شراء من الموردين", icon: ClipboardList, color: "from-violet-500 to-violet-600" },
  { id: "warehouses", label: "المستودعات", desc: "إدارة مستودعات متعددة", icon: Warehouse, color: "from-slate-500 to-slate-600" },
  { id: "suppliers", label: "الموردين", desc: "بيانات ومتابعة الموردين", icon: Building2, color: "from-lime-500 to-lime-600" },
  { id: "returns", label: "المرتجعات", desc: "إدارة مرتجعات الزباين", icon: RefreshCcw, color: "from-rose-500 to-rose-600" },
  { id: "analytics", label: "التحليلات", desc: "تقارير وإحصائيات المبيعات", icon: TrendingUp, color: "from-fuchsia-500 to-fuchsia-600" },
];

const MAX_FEATURES = 7;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "features" | "done">("welcome");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [storeName, setStoreName] = useState("");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    if (!stored) { router.push("/login"); return; }
    setUser(stored);
    setStoreName(stored.storeName || stored.fullName || "");

    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "null");
    if (prefs?.onboardingDone) router.replace("/dashboard");
  }, [router]);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  const toggleFeature = (id: string) => {
    setSelected((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      if (selectedCount >= MAX_FEATURES) return prev;
      return { ...prev, [id]: true };
    });
  };

  const handleComplete = async () => {
    setSaving(true);
    const features = Object.keys(selected).filter((k) => selected[k]);
    if (features.length === 0) features.push("products", "orders", "invoices", "customers", "inventory");

    const prefs = {
      features,
      storeName: storeName || "محلّي",
      onboardingDone: true,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("user_prefs", JSON.stringify(prefs));

    try {
      await supabase.from("stores").upsert({
        id: user.id,
        name: prefs.storeName,
        owner_name: user.fullName || user.name || "المستخدم",
        owner_email: user.email,
        features: prefs.features,
        onboarding_done: true,
      }, { onConflict: "id" });
    } catch (err) {
      console.error("Error saving store:", err);
    }

    setSaving(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50" dir="rtl">
      <SEOHead title="إعداد المتجر - StockFlow" description="اختار المميزات اللي محتاجها لمتجرك" canonical="https://stockflow.vexonet.online/onboarding" />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/favicon.svg" alt="StockFlow" width={32} height={32} />
            <span className="text-lg font-bold text-gray-900">Stock<span className="text-orange-500">Flow</span></span>
          </div>
          {step === "features" && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className={`font-bold text-orange-500`}>{selectedCount}</span>
              <span>/ {MAX_FEATURES} مميزة</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === "welcome" && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center max-w-lg mx-auto">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-500/30">
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">أهلاً بيك في StockFlow!</h1>
              <p className="text-lg text-gray-500 mb-3">هنخصص المتجر بتاعك حسب احتياجك</p>
              <p className="text-sm text-gray-400 mb-8">اختار <span className="font-bold text-orange-500">7 مميزات</span> بس من اللي محتاجها — تقدر تغيرهم أي وقت</p>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">اسم المتجر</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="مثال: محل أحمد للملابس"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 text-center text-lg font-medium focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                />
              </div>

              <button onClick={() => setStep("features")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl shadow-orange-500/25">
                ابدأ الاختيار <ArrowLeft className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Features Step */}
          {step === "features" && (
            <motion.div key="features" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">اختار مميزاتك</h2>
                <p className="text-gray-500">اضغط على المميزات اللي محتاجها — اختار {MAX_FEATURES} بالكتير</p>
                {selectedCount >= MAX_FEATURES && (
                  <p className="text-orange-500 text-sm font-medium mt-2">وصلت الحد الأقصى! اضغط على مميزة عشان تلغي اختيارها</p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                {ALL_FEATURES.map((feature, i) => {
                  const isSelected = !!selected[feature.id];
                  const isDisabled = !isSelected && selectedCount >= MAX_FEATURES;
                  return (
                    <motion.button
                      key={feature.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => toggleFeature(feature.id)}
                      disabled={isDisabled}
                      className={`relative p-4 sm:p-5 rounded-2xl border-2 text-right transition-all duration-200 ${
                        isSelected
                          ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-500/10 scale-[1.02]"
                          : isDisabled
                          ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md active:scale-[0.98]"
                      }`}
                    >
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute top-3 left-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">{feature.label}</h3>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{feature.desc}</p>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setStep("welcome")}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-medium">
                  رجوع
                </button>
                <button onClick={handleComplete} disabled={saving || selectedCount === 0}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      بيتحفظ...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      تم — ادخل المتجر
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
