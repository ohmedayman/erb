"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Warehouse, CreditCard, Building2, Smartphone, CheckCircle, Copy,
  Loader2, Shield, Clock, ArrowLeft, Phone, Wallet, Banknote,
  FileText, Star, Zap, Users, Package, BarChart3, Settings,
  Receipt, Truck, Bell, AlertCircle, Upload, Image as ImageIcon,
  ChevronLeft, Check, Lock, Store, ShoppingCart
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createAdminNotification } from "@/lib/admin-notifications";
import Image from "next/image";
import SEOHead from "@/components/SEOHead";

const ALL_FEATURES = [
  { id: "products", label: "إدارة المنتجات", icon: Package, group: "basic" },
  { id: "orders", label: "فواتير وأوردرات", icon: FileText, group: "basic" },
  { id: "customers", label: "الزبائن والعملاء", icon: Users, group: "basic" },
  { id: "pos", label: "نقطة بيع (POS)", icon: ShoppingCart, group: "basic" },
  { id: "reports", label: "تقارير المبيعات", icon: BarChart3, group: "basic" },
  { id: "expenses", label: "المصروفات اليومية", icon: Receipt, group: "mid" },
  { id: "employees", label: "إدارة الموظفين والرواتب", icon: Users, group: "mid" },
  { id: "warehouses", label: "المستودعات المتعددة", icon: Warehouse, group: "mid" },
  { id: "stockMovements", label: "حركات المخزون", icon: Package, group: "mid" },
  { id: "suppliers", label: "إدارة الموردين", icon: Truck, group: "mid" },
  { id: "notifications", label: "إشعارات فورية", icon: Bell, group: "mid" },
  { id: "profitLoss", label: "تقارير أرباح وخسائر", icon: BarChart3, group: "mid" },
  { id: "analytics", label: "تحليلات مبيعات متقدمة", icon: BarChart3, group: "premium" },
  { id: "installments", label: "نظام الأقساط والتقسيط", icon: CreditCard, group: "premium" },
  { id: "ratings", label: "تقييمات وآراء العملاء", icon: Star, group: "premium" },
  { id: "team", label: "إدارة الفريق والأدوار", icon: Users, group: "premium" },
  { id: "multiStore", label: "نقاط بيع متعددة", icon: Store, group: "premium" },
  { id: "audit", label: "سجل النشاطات (Audit)", icon: FileText, group: "premium" },
];

const PLANS = [
  {
    id: "starter",
    name: "StockFlow Starter",
    price: 3000,
    duration: "سنوي",
    maxProducts: 100,
    maxCustomers: 50,
    maxOrders: 100,
    maxFeatures: 4,
    color: "from-blue-500 to-blue-600",
    badge: "الأساسية",
    description: "100 منتج — 50 زبون — 100 أوردر شهرياً",
    allowedGroups: ["basic"],
  },
  {
    id: "growth",
    name: "StockFlow Growth",
    price: 6000,
    duration: "سنوي",
    maxProducts: 500,
    maxCustomers: 500,
    maxOrders: 1000,
    maxFeatures: 10,
    color: "from-orange-500 to-orange-600",
    badge: "الأكثر طلباً",
    description: "500 منتج — 500 زبون — 1,000 أوردر شهرياً",
    allowedGroups: ["basic", "mid"],
  },
  {
    id: "enterprise",
    name: "StockFlow Enterprise",
    price: 9000,
    duration: "سنوي",
    maxProducts: -1,
    maxCustomers: -1,
    maxOrders: -1,
    maxFeatures: 14,
    color: "from-purple-500 to-purple-600",
    badge: "المتقدمة",
    description: "غير محدود — كل المميزات",
    allowedGroups: ["basic", "mid", "premium"],
  },
];

const PAYMENT_METHODS = [
  {
    id: "vodafone_cash",
    name: "فودافون كاش",
    icon: Smartphone,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-600",
    description: "ادفع من محفظة فودافون كاش",
    instructions: [
      "افتح تطبيق فودافون كاش",
      "اختر 'تحويل للمحفضة'",
      "ابعت على الرقم: 01028707543",
      "احتفظ برقم العملية"
    ],
    accountName: "محمد ا*** ي***",
    accountNumber: "01028707543",
    notes: "التحويل الفوري — التأكيد خلال 10 دقائق"
  },
  {
    id: "instapay",
    name: "InstaPay",
    icon: Wallet,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-600",
    description: "ادفع من خلال تطبيق البنك بتاعك",
    instructions: [
      "افتح تطبيق البنك بتاعك",
      "اختر InstaPay",
      "ابعت على الرقم: 01028707543",
      "احتفظ برقم العملية"
    ],
    accountName: "محمد ا*** ي***",
    accountNumber: "01028707543",
    notes: "التحويل الفوري — التأكيد خلال 15 دقيقة"
  },
  {
    id: "fawry",
    name: "فوري",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-600",
    description: "ادفع من أي فرع فوري",
    instructions: [
      "روح لأقرب فرع فوري",
      "قولهم عايز تدفع لـ StockFlow",
      "ادفع المبلغ المطلوب",
      "احتفظ بالإيصال"
    ],
    accountName: "محمد ا*** ي***",
    accountNumber: "01028707543",
    notes: "الدفع من أي فرع فوري في مصر"
  },
  {
    id: "bank_transfer",
    name: "تحويل بنكي",
    icon: Building2,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-600",
    description: "تحويل مباشر لحساب بنكي",
    instructions: [
      "افتح تطبيق البنك أو روح الفرع",
      "حوّل على الحساب:",
      "احتفظ بصورة التحويل"
    ],
    accountName: "محمد احمد ياسر",
    accountNumber: "الحساب يتواصل عليه بعد التسجيل",
    notes: "التحويل قد ياخد 24 ساعة"
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const currentPlan = PLANS.find(p => p.id === selectedPlan);
  const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod);
  const availableFeatures = currentPlan
    ? ALL_FEATURES.filter(f => currentPlan.allowedGroups.includes(f.group))
    : [];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(stored);
    setUserName(stored.name || stored.fullName || "");
  }, [router]);

  const toggleFeature = (id: string) => {
    if (!currentPlan) return;
    setSelectedFeatures(prev => {
      if (prev.includes(id)) return prev.filter(f => f !== id);
      if (prev.length >= currentPlan.maxFeatures) return prev;
      return [...prev, id];
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("الصورة كبيرة جداً. الحد الأقصى 5 ميجا");
      return;
    }
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("الصورة كبيرة جداً. الحد الأقصى 5 ميجا");
      return;
    }
    setIdCard(file);
    const reader = new FileReader();
    reader.onload = (ev) => setIdCardPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) {
        console.error("Upload error:", error);
        return null;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
    } catch {
      return null;
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedMethod || !transactionId || !userPhone || !currentPlan) return;
    if (!idCard) {
      alert("صورة بطاقة الهوية مطلوبة");
      return;
    }

    setLoading(true);
    try {
      const { data: existingOrders } = await supabase
        .from("subscription_orders")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .limit(1);

      if (existingOrders && existingOrders.length > 0) {
        alert("عندك طلب اشتراك قيد المراجعة بالفعل. هتتقبل في أقرب وقت!");
        setLoading(false);
        return;
      }

      let screenshotUrl = null;
      if (screenshot) {
        screenshotUrl = await uploadFile(screenshot, "payment-screenshots");
      }

      let idCardUrl = null;
      if (idCard) {
        idCardUrl = await uploadFile(idCard, "payment-screenshots");
      }

      const orderData = {
        user_id: user.id,
        user_name: userName,
        user_email: user.email,
        user_phone: userPhone,
        plan_name: currentPlan.name,
        plan_price: currentPlan.price,
        plan_duration: currentPlan.duration,
        payment_method: selectedMethod,
        payment_details: selectedMethodData?.notes || "",
        transaction_id: transactionId,
        screenshot_url: screenshotUrl,
        id_card_url: idCardUrl,
        selected_features: selectedFeatures,
        status: "approved",
      };

      const { error } = await supabase
        .from("subscription_orders")
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("registered_users")
        .update({ subscription_status: "active" })
        .eq("id", user.id);

      createAdminNotification({
        type: "subscription",
        title: "طلب اشتراك جديد",
        message: `${userName} اشترك في ${currentPlan.name} — ${currentPlan.price.toLocaleString()} ج.م`,
        user_name: userName,
        user_email: user.email || "",
        metadata: { plan: currentPlan.id, amount: currentPlan.price },
      }).catch(() => {});

      setOrderId(orderData as any);
      setOrderSuccess(true);
    } catch (err: any) {
      console.error("Error creating order:", err);
      alert("حصلت مشكلة — حاول تاني");
    }
    setLoading(false);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">تم تأكيد اشتراكك بنجاح!</h1>
          <p className="text-muted-foreground mb-6">تقدر تدخل على الحساب دلوقتي وابدأ تشتغل</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-all">
            الدخول للوحة التحكم
          </Link>
        </motion.div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "اختيار الباقة" },
    { num: 2, label: "اختيار المميزات" },
    { num: 3, label: "الدفع" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <SEOHead title="اختيار الاشتراك | StockFlow" description="اختار باقة الاشتراك المناسبة لمتجرك" />

      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-foreground text-lg">StockFlow</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step >= s.num ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-12 h-1 rounded-full transition-all ${step > s.num ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Plan Selection */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
                  <h2 className="text-xl font-bold text-foreground mb-2">اختار الباقة المناسبة</h2>
                  <p className="text-sm text-muted-foreground mb-6">كل باقة ليها عدد مميزات معينة تقدر تختارها</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => { setSelectedPlan(plan.id); setSelectedFeatures([]); }}
                        className={`relative p-5 rounded-2xl border-2 text-right transition-all hover:shadow-lg ${selectedPlan === plan.id ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`}
                      >
                        {plan.badge && (
                          <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${plan.color}`}>
                            {plan.badge}
                          </span>
                        )}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-foreground mb-1">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-2xl font-bold text-foreground">{plan.price.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">ج.م</span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="font-medium text-primary">مميزات: {plan.maxFeatures}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedPlan && (
                    <button
                      onClick={() => setStep(2)}
                      className="mt-6 w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      اختار المميزات
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Feature Selection */}
            {step === 2 && currentPlan && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-foreground">اختار المميزات</h2>
                    <span className="text-sm font-medium text-primary">{selectedFeatures.length}/{currentPlan.maxFeatures}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">تقدر تختار {currentPlan.maxFeatures} ميزة من المميزات المتاحة في باقتك</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableFeatures.map((feature) => {
                      const Icon = feature.icon;
                      const isSelected = selectedFeatures.includes(feature.id);
                      const isDisabled = !isSelected && selectedFeatures.length >= currentPlan.maxFeatures;
                      return (
                        <button
                          key={feature.id}
                          onClick={() => toggleFeature(feature.id)}
                          disabled={isDisabled}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-right transition-all ${isSelected ? "border-primary bg-primary/5" : isDisabled ? "border-border opacity-50 cursor-not-allowed" : "border-border hover:border-primary/30"}`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-primary text-white" : "bg-muted"}`}>
                            {isSelected ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>{feature.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all">
                      رجوع
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={selectedFeatures.length === 0}
                      className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-all disabled:opacity-50 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      متابعة للدفع
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && currentPlan && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {!selectedMethod ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
                    <h2 className="text-xl font-bold text-foreground mb-2">اختار طريقة الدفع</h2>
                    <p className="text-sm text-muted-foreground mb-6">ادفع {currentPlan.price.toLocaleString()} ج.م</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className="p-4 rounded-xl border-2 text-right transition-all hover:border-primary/50 hover:bg-primary/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                              <method.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-foreground">{method.name}</p>
                              <p className="text-xs text-muted-foreground">{method.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button onClick={() => setStep(2)} className="mt-4 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all">
                      رجوع
                    </button>
                  </div>
                ) : selectedMethodData && (
                  <>
                    <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedMethodData.color} flex items-center justify-center`}>
                          <selectedMethodData.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-foreground">{selectedMethodData.name}</h2>
                          <p className="text-sm text-muted-foreground">{selectedMethodData.notes}</p>
                        </div>
                      </div>

                      <div className={`bg-gradient-to-br ${currentPlan.color} rounded-xl p-4 text-white text-center mb-6`}>
                        <p className="text-white/70 text-sm">المبلغ المطلوب</p>
                        <p className="text-3xl font-bold">{currentPlan.price.toLocaleString()} ج.م</p>
                      </div>

                      <div className="bg-muted rounded-xl p-4 mb-6 text-right">
                        <p className="text-sm font-medium text-foreground mb-2">بيانات الحساب:</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">اسم الحساب:</span>
                            <span className="text-sm font-medium text-foreground">{selectedMethodData.accountName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">رقم الحساب:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-medium text-foreground">{selectedMethodData.accountNumber}</span>
                              <button onClick={() => handleCopy(selectedMethodData.accountNumber)} className="p-1 rounded hover:bg-background transition-colors">
                                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <p className="font-medium text-foreground">خطوات الدفع:</p>
                        {selectedMethodData.instructions.map((instruction, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary">{i + 1}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{instruction}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
                      <h3 className="text-lg font-bold text-foreground mb-4">بيانات الدفع</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">الاسم الكامل</label>
                          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder="الاسم كما هو في الحساب البنكي" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">رقم الموبايل</label>
                          <input type="tel" value={userPhone} onChange={(e) => setUserPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder="01XXXXXXXXX" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">رقم العملية / الرقم المرجعي</label>
                          <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder="الرقم اللي استلمته بعد الدفع" />
                          <p className="mt-1 text-xs text-muted-foreground">مهم جداً — ده اللي هنتحقق بيه من الدفع</p>
                        </div>

                        {/* ID Card Upload */}
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            صورة بطاقة الهوية <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input type="file" accept="image/*" onChange={handleIdCardChange} className="hidden" id="idcard-upload" />
                            <label htmlFor="idcard-upload" className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-all">
                              {idCardPreview ? (
                                <div className="relative w-full">
                                  <img src={idCardPreview} alt="بطاقة الهوية" className="w-full max-h-40 object-contain rounded-lg" />
                                  <button type="button" onClick={(e) => { e.preventDefault(); setIdCard(null); setIdCardPreview(null); }}
                                    className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">✕</button>
                                </div>
                              ) : (
                                <>
                                  <Lock className="w-5 h-5 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">اضغط لرفع صورة بطاقة الهوية (الوجه الأمامي)</span>
                                </>
                              )}
                            </label>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">مطلوب — للتحقق من هويتك (حد أقصى 5 ميجا)</p>
                        </div>

                        {/* Screenshot Upload */}
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">صورة الإيصال (اختياري)</label>
                          <div className="relative">
                            <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" id="screenshot-upload" />
                            <label htmlFor="screenshot-upload" className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-all">
                              {screenshotPreview ? (
                                <div className="relative w-full">
                                  <img src={screenshotPreview} alt="الإيصال" className="w-full max-h-40 object-contain rounded-lg" />
                                  <button type="button" onClick={(e) => { e.preventDefault(); setScreenshot(null); setScreenshotPreview(null); }}
                                    className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">✕</button>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">اضغط لرفع صورة الإيصال</span>
                                </>
                              )}
                            </label>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">صورة التحويل البنكي أو الإيصال (حد أقصى 5 ميجا)</p>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button onClick={() => setSelectedMethod(null)} className="px-6 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all">
                          رجوع
                        </button>
                        <button
                          onClick={handleSubmitOrder}
                          disabled={!transactionId || !userPhone || !userName || !idCard || loading}
                          className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> بيتم الإرسال...</>
                          ) : (
                            <><CheckCircle className="w-5 h-5" /> تأكيد الدفع — {currentPlan.price.toLocaleString()} ج.م</>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg border border-border p-6 sticky top-24">
              <h3 className="font-bold text-foreground mb-4">ملخص الطلب</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الباقة</span>
                  <span className="font-medium text-foreground">{currentPlan?.name || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المدة</span>
                  <span className="font-medium text-foreground">سنوي</span>
                </div>
                {selectedFeatures.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المميزات</span>
                    <span className="font-medium text-primary">{selectedFeatures.length} ميزة</span>
                  </div>
                )}
                {currentPlan && (
                  <div className="border-t border-border pt-3">
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">الإجمالي</span>
                        <span className="text-lg font-bold text-primary">{currentPlan?.price.toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-green-500" />
                  <span>دفع آمن ومؤمن</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>تأكيد خلال دقائق</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-orange-500" />
                  <span>دخول فوري بعد الدفع</span>
                </div>
              </div>

              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600">
                    احتفظ برقم العملية! ده محتاج للتأكيد
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
