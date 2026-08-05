"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Warehouse, Store, Package, Users, Truck, CreditCard, Building2,
  ChevronLeft, ChevronRight, Check, Smartphone, Globe, Zap, Shield,
  User, PackageCheck, FileSignature, Receipt, Wrench, HandCoins,
  ClipboardList, CircleDollarSign, RefreshCcw, TrendingUp, CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import SEOHead from "@/components/SEOHead";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const BUSINESS_TYPES = [
  { id: "retail", label: "بيع تجزئة", desc: "محل تجاري ببيع للزباين بالقطعة", icon: Store },
  { id: "wholesale", label: "بيع جملة", desc: "بيع كميات كبيرة للمحلات والشركات", icon: Warehouse },
  { id: "ecommerce", label: "بيع أونلاين", desc: "بيع عن طريق المواقع أو السوشيال ميديا", icon: Globe },
  { id: "services", label: "خدمات", desc: "خدمات صيانة، تصميم، استشارات، وغيره", icon: Wrench },
  { id: "manufacturing", label: "تصنيع", desc: "تصنيع منتجات وبيعها بالجملة أو التجزئة", icon: Building2 },
];

const FEATURES = [
  { id: "products", label: "المنتجات", desc: "إضافة وتعديل المنتجات", icon: Package, defaultOn: true },
  { id: "orders", label: "الأوردرات", desc: "متابعة أوردرات الزباين", icon: ClipboardList, defaultOn: true },
  { id: "invoices", label: "الفواتير", desc: "إنشاء فواتير بيع وشراء", icon: FileSignature, defaultOn: true },
  { id: "customers", label: "الزبائن", desc: "بيانات الزباين وتاريخهم", icon: Users, defaultOn: true },
  { id: "inventory", label: "المخزون", desc: "تتبع المخزون والكميات", icon: PackageCheck, defaultOn: true },
  { id: "expenses", label: "المصروفات", desc: "تسجيل ومتابعة المصروفات", icon: CircleDollarSign, defaultOn: false },
  { id: "employees", label: "الموظفين", desc: "إدارة الموظفين والرواتب", icon: User, defaultOn: false },
  { id: "shipping", label: "الشحن", desc: "إدارة شحن الأوردرات", icon: Truck, defaultOn: false },
  { id: "installments", label: "الأقساط", desc: "متابعة الأقساط والديون", icon: HandCoins, defaultOn: false },
  { id: "accounts", label: "الحسابات العامة", desc: "قوائم مالية وحسابات", icon: Receipt, defaultOn: false },
  { id: "purchaseOrders", label: "أوردرات الشراء", desc: "طلبات شراء من الموردين", icon: ClipboardList, defaultOn: false },
  { id: "warehouses", label: "المستودعات", desc: "إدارة مستودعات متعددة", icon: Warehouse, defaultOn: false },
  { id: "suppliers", label: "الموردين", desc: "بيانات ومتابعة الموردين", icon: Building2, defaultOn: false },
  { id: "returns", label: "المرتجعات", desc: "إدارة مرتجعات الزباين", icon: RefreshCcw, defaultOn: false },
  { id: "analytics", label: "التحليلات", desc: "تقارير وإحصائيات المبيعات", icon: TrendingUp, defaultOn: false },
];

const TEAM_SIZES = [
  { id: "solo", label: "لوحدك", desc: "أنا الشغل كله لوحدي", icon: User },
  { id: "small", label: "فريق صغير", desc: "2-5 أشخاص", icon: Users },
  { id: "medium", label: "فريق متوسط", desc: "6-20 شخص", icon: Users },
  { id: "large", label: "فريق كبير", desc: "أكثر من 20 شخص", icon: Building2 },
];

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [businessType, setBusinessType] = useState<string>("");
  const [features, setFeatures] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    FEATURES.forEach((f) => { initial[f.id] = f.defaultOn; });
    return initial;
  });
  const [teamSize, setTeamSize] = useState<string>("");
  const [shipping, setShipping] = useState(false);
  const [installments, setInstallments] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(stored);

    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "null");
    if (prefs?.onboardingDone) {
      router.replace("/dashboard");
    }
  }, [router]);

  const goNext = () => {
    if (step === 5) {
      handleComplete();
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      setStep((prev) => (prev + 1) as Step);
      setTransitioning(false);
    }, 150);
  };

  const goBack = () => {
    if (step === 0) return;
    setTransitioning(true);
    setTimeout(() => {
      setStep((prev) => (prev - 1) as Step);
      setTransitioning(false);
    }, 150);
  };

  const toggleFeature = (id: string) => {
    setFeatures((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleComplete = async () => {
    setSaving(true);
    const selectedFeatures = Object.entries(features).filter(([, v]) => v).map(([k]) => k);

    const prefs = {
      businessType: businessType || "retail",
      features: selectedFeatures,
      teamSize: teamSize || "solo",
      shipping,
      installments,
      storeName: storeName || "محلّي",
      onboardingDone: true,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("user_prefs", JSON.stringify(prefs));

    const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
    existingUser.storeName = prefs.storeName;
    localStorage.setItem("user", JSON.stringify(existingUser));

    try {
      await supabase.from("stores").upsert({
        id: user.id,
        name: prefs.storeName,
        owner_name: existingUser.fullName || existingUser.name || "المستخدم",
        owner_email: user.email,
        business_type: prefs.businessType,
        team_size: prefs.teamSize,
        features: prefs.features,
        shipping_enabled: prefs.shipping,
        installments_enabled: prefs.installments,
        onboarding_done: true,
      }, { onConflict: "id" });
    } catch (err) {
      console.error("Error saving store:", err);
    }

    setSaving(false);
    router.push("/dashboard");
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return true;
      case 1: return businessType !== "";
      case 2: return Object.values(features).some(Boolean);
      case 3: return teamSize !== "";
      case 4: return true;
      case 5: return storeName.trim().length > 0;
      default: return true;
    }
  };

  const renderProgress = () => (
    <div className="mb-8">
      <div className="flex justify-center mb-3">
        <span className="text-sm text-gray-500">الخطوة {step + 1} من {TOTAL_STEPS}</span>
      </div>
      <div className="flex justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
            i < step ? "bg-primary w-8" : i === step ? "bg-primary w-10" : "bg-gray-200 w-8"
          }`} />
        ))}
      </div>
    </div>
  );

  const renderStep0 = () => (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <Image src="/favicon.svg" alt="StockFlow" width={80} height={80} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">أهلاً بيك في StockFlow!</h1>
      <p className="text-gray-500 text-lg mb-10">هنجّزلك النظام في دقايق</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Zap, title: "سهل الاستخدام", desc: "واجهة بسيطة ومفهومة من غير تعقيد" },
          { icon: Shield, title: "آمن 100%", desc: "بياناتك محمية ومش هتطلع لأي حد" },
          { icon: Smartphone, title: "سريع وخفيف", desc: "يشتغل على الموبايل والكمبيوتر بسرعة" },
        ].map((item) => (
          <div key={item.title} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">بتشتغل في ايه؟</h2>
      <p className="text-gray-500 text-center mb-8">اختار نوع نشاطك عشان نظبطلك النظام</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BUSINESS_TYPES.map((bt) => {
          const selected = businessType === bt.id;
          return (
            <button key={bt.id} onClick={() => setBusinessType(bt.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-right ${
                selected ? "border-primary bg-primary/5" : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selected ? "bg-primary/10" : "bg-gray-200/50"
              }`}>
                <bt.icon className={`w-6 h-6 ${selected ? "text-primary" : "text-gray-400"}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{bt.label}</h3>
                <p className="text-sm text-gray-500">{bt.desc}</p>
              </div>
              {selected && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">ايه اللي محتاجه؟</h2>
      <p className="text-gray-500 text-center mb-6">اختار المميزات اللي تناسبك (تقدر تغيّرها بعدين)</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
        {FEATURES.map((feat) => {
          const on = features[feat.id];
          return (
            <button key={feat.id} onClick={() => toggleFeature(feat.id)}
              className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all duration-200 ${
                on ? "border-primary bg-primary/5" : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}>
              <div className="relative">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                  on ? "bg-primary/10" : "bg-gray-200/50"
                }`}>
                  <feat.icon className={`w-5 h-5 ${on ? "text-primary" : "text-gray-400"}`} />
                </div>
                {on && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-0.5">{feat.label}</h3>
              <p className="text-[11px] text-gray-400 leading-tight">{feat.desc}</p>
            </button>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-400">
          {Object.values(features).filter(Boolean).length} من {FEATURES.length} مميزة مفعّلة
        </span>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">فريقك قد ايه؟</h2>
      <p className="text-gray-500 text-center mb-8">عشان نظبطلك الصلاحيات والأدوار</p>
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {TEAM_SIZES.map((ts) => {
          const selected = teamSize === ts.id;
          return (
            <button key={ts.id} onClick={() => setTeamSize(ts.id)}
              className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 ${
                selected ? "border-primary bg-primary/5" : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
                selected ? "bg-primary/10" : "bg-gray-200/50"
              }`}>
                <ts.icon className={`w-7 h-7 ${selected ? "text-primary" : "text-gray-400"}`} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{ts.label}</h3>
              <p className="text-sm text-gray-500">{ts.desc}</p>
              {selected && (
                <div className="mt-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">عايز إضافات؟</h2>
      <p className="text-gray-500 text-center mb-10">اختار الإضافات اللي تحتاجها في شغلك</p>
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">بتشحن المنتجات؟</h3>
              <p className="text-sm text-gray-500">لو بتبعت أوردرات بالشحن</p>
            </div>
          </div>
          <button onClick={() => setShipping(!shipping)}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${shipping ? "bg-primary" : "bg-gray-300"}`}>
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
              shipping ? "translate-x-5.5" : "translate-x-0.5"
            }`} />
          </button>
        </div>
        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">عندك تقسيط؟</h3>
              <p className="text-sm text-gray-500">لو بتقبل أقساط من الزباين</p>
            </div>
          </div>
          <button onClick={() => setInstallments(!installments)}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${installments ? "bg-primary" : "bg-gray-300"}`}>
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
              installments ? "translate-x-5.5" : "translate-x-0.5"
            }`} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">ايه اسم محلّك؟</h2>
      <p className="text-gray-500 text-center mb-10">ده اسم اللي هيظهر على الفواتير والتقارير</p>
      <div className="max-w-md mx-auto">
        <div className="relative mb-8">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Store className="w-5 h-5" />
          </div>
          <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
            placeholder="اسم المحل"
            className="w-full pr-12 pl-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors text-right bg-gray-50"
            autoFocus />
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold">جاهز تبدأ!</span>
          </div>
          <p className="text-sm text-gray-400">تقدر تغيّر أي حاجة من الإعدادات بعدين</p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <SEOHead
        title="إعداد النظام - StockFlow"
        description="جهّز نظام إدارة المخازن بتاعك في دقايق. اختار نوع نشاطك والمميزات اللي محتاجها."
        canonical="https://stockflow.vexonet.online/onboarding"
      />
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
          {renderProgress()}
          <div className={`transition-opacity duration-150 ${transitioning ? "opacity-0" : "opacity-100"}`}>
            {renderCurrentStep()}
          </div>
          <div className="flex justify-between items-center mt-10">
            <button onClick={goBack} disabled={step === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-200 ${
                step === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
              }`}>
              <ChevronLeft className="w-4 h-4" />
              رجوع
            </button>
            <button onClick={goNext} disabled={!canProceed() || saving}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-200 ${
                canProceed() && !saving
                  ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}>
              {step === 5 ? (
                saving ? "بيتحفظ..." : <>جاهز وابدأ<Check className="w-4 h-4" /></>
              ) : (
                <>التالي<ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-gray-300 mt-6">StockFlow - إدارة مخازن ومبيعات</p>
      </div>
    </div>
  );
}
