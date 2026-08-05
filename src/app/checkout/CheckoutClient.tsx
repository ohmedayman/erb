"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Warehouse, CreditCard, Building2, Smartphone, CheckCircle, Copy,
  Loader2, Shield, Clock, ArrowLeft, Phone, Wallet, Banknote,
  FileText, Star, Zap, Users, Package, BarChart3, Settings,
  Receipt, Truck, Bell, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const PAYMENT_METHODS = [
  {
    id: "fawry",
    name: "فوري",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-600",
    description: "ادفع عن طريق فوري من أي فرع قريب منك",
    instructions: [
      "روح لأي فرع فوري قريب منك",
      "قولهم عايز تدفع لـ StockFlow",
      "ادفع المبلغ: 3,000 ج.م",
      "احتفظ بالرقم المرجعي",
      "ادخل الرقم المرجعي هنا"
    ],
    accountName: "StockFlow SaaS",
    accountNumber: "0123456789",
    notes: "الدفع الفوري — التأكيد خلال 5 دقائق"
  },
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
      "ابعت على الرقم: 01012345678",
      "المبلغ: 3,000 ج.م",
      "احتفظ برقم العملية"
    ],
    accountName: "StockFlow SaaS",
    accountNumber: "01012345678",
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
      "ابعت على البريد: payment@stockflow.vexonet.online",
      "المبلغ: 3,000 ج.م",
      "احتفظ برقم العملية"
    ],
    accountName: "StockFlow SaaS",
    accountNumber: "payment@stockflow.vexonet.online",
    notes: "التحويل الفوري — التأكيد خلال 15 دقيقة"
  },
  {
    id: "bank_transfer",
    name: "حوالة بنكية",
    icon: Building2,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-600",
    description: "حوالة بنكية مباشرة على الحساب",
    instructions: [
      "روح لأي فرع بنكي",
      "اعمل حوالة بنكية على الحساب",
      "المبلغ: 3,000 ج.م",
      "اسم الحساب: StockFlow SaaS",
      "احتفظ بسند الحوالة"
    ],
    accountName: "StockFlow SaaS",
    accountNumber: "1234567890123",
    bankName: "البنك الأهلي المصري",
    notes: "الحوالة البنكية — التأكيد خلال 24 ساعة"
  }
];

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(stored);
    setUserName(stored.name || stored.fullName || "");
  }, [router]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitOrder = async () => {
    if (!selectedMethod || !transactionId || !userPhone) return;

    setLoading(true);
    try {
      const orderData = {
        user_id: user.id,
        user_name: userName,
        user_email: user.email,
        user_phone: userPhone,
        plan_name: "StockFlow Pro",
        plan_price: 3000,
        plan_duration: "سنوياً",
        payment_method: selectedMethod,
        payment_details: PAYMENT_METHODS.find(m => m.id === selectedMethod)?.notes || "",
        transaction_id: transactionId,
        status: "pending",
      };

      const { data, error } = await supabase
        .from("subscription_orders")
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      setOrderId(data.id);
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl border border-border p-8 max-w-lg w-full text-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">تم استلام طلبك!</h1>
          <p className="text-muted-foreground mb-2">طلب الدفع بتاعك تحت المراجعة</p>
          <div className="bg-muted rounded-xl p-4 my-6 text-right">
            <p className="text-sm text-muted-foreground">رقم الطلب</p>
            <p className="text-lg font-bold text-foreground font-mono">{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-right">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-800">إيه اللي هيحصل بعدين؟</p>
            </div>
            <ul className="text-sm text-blue-700 space-y-1.5">
              <li>• الادمن هيتأكد من الدفع</li>
              <li>• هنبعتلك إشعار على البريد</li>
              <li>• بعد التأكيد هتقدر تدخل النظام</li>
            </ul>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-hover transition-all"
          >
            رجوع لتسجيل الدخول
          </Link>
        </motion.div>
      </div>
    );
  }

  const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Stock<span className="text-primary">Flow</span></span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            <span>دفع آمن ومؤمن</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= s
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 rounded-full transition-all ${step > s ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Order Summary */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">ملخص الطلب</h2>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">StockFlow Pro</h3>
                        <p className="text-orange-100 text-sm">نظام إدارة المخازن الكامل</p>
                      </div>
                      <Star className="w-8 h-8 text-orange-200" />
                    </div>
                    <div className="border-t border-orange-400/30 pt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">3,000</span>
                        <span className="text-orange-200">ج.م / سنوياً</span>
                      </div>
                      <p className="text-orange-200 text-sm mt-1">250 ج.م فقط شهرياً</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">متجيناش في الاشتراك:</h4>
                    {[
                      { icon: Package, text: "منتجات غير محدودة" },
                      { icon: Users, text: "زبائن وموردين" },
                      { icon: BarChart3, text: "تقارير وتحليلات" },
                      { icon: Receipt, text: "فواتير وأوردرات" },
                      { icon: Truck, text: "شحن وتوصيل" },
                      { icon: Settings, text: "إعدادات كاملة" },
                      { icon: Bell, text: "إشعارات فورية" },
                      { icon: FileText, text: "باركود وطباعة" },
                    ].map(({ icon: Icon, text }, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        <Icon className="w-4 h-4 text-primary shrink-0" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  >
                   اختار طريقة الدفع
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
                  <h2 className="text-xl font-bold text-foreground mb-2">اختار طريقة الدفع</h2>
                  <p className="text-sm text-muted-foreground mb-6">اختار الطريقة اللي تناسبك</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 rounded-xl border-2 text-right transition-all ${
                          selectedMethod === method.id
                            ? `${method.borderColor} ${method.bgColor} ring-2 ring-offset-2 ring-primary/20`
                            : "border-border hover:border-border/80 hover:bg-muted/50"
                        }`}
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

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all"
                    >
                      رجوع
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!selectedMethod}
                      className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      إتمام الدفع
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment Details */}
            {step === 3 && selectedMethodData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Payment Instructions */}
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

                  {/* Amount */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white text-center mb-6">
                    <p className="text-orange-200 text-sm">المبلغ المطلوب</p>
                    <p className="text-3xl font-bold">3,000 ج.م</p>
                  </div>

                  {/* Account Details */}
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
                          <button
                            onClick={() => handleCopy(selectedMethodData.accountNumber)}
                            className="p-1 rounded hover:bg-background transition-colors"
                          >
                            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                          </button>
                        </div>
                      </div>
                      {selectedMethodData.bankName && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">البنك:</span>
                          <span className="text-sm font-medium text-foreground">{selectedMethodData.bankName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Steps */}
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

                {/* Payment Form */}
                <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">بيانات الدفع</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">الاسم الكامل</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="الاسم كما هو في الحساب البنكي"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">رقم الموبايل</label>
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="01XXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">رقم العملية / الرقم المرجعي</label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="الرقم اللي استلمته بعد الدفع"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">مهم جداً — ده اللي هنتحقق بيه من الدفع</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all"
                    >
                      رجوع
                    </button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={!transactionId || !userPhone || !userName || loading}
                      className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          بيتم الإرسال...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          تأكيد الطلب
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg border border-border p-6 sticky top-24">
              <h3 className="font-bold text-foreground mb-4">ملخص الطلب</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الخطة</span>
                  <span className="font-medium text-foreground">StockFlow Pro</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المدة</span>
                  <span className="font-medium text-foreground">سنوياً</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المبلغ</span>
                  <span className="font-medium text-foreground">3,000 ج.م</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">الإجمالي</span>
                    <span className="text-lg font-bold text-primary">3,000 ج.م</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-green-500" />
                  <span>دفع آمن ومؤمن</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>تأكيد سريع خلال 24 ساعة</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-orange-500" />
                  <span>دخول فوري بعد التأكيد</span>
                </div>
              </div>

              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600">
                   IMPORTANT: احتفظ برقم العملية! ده محتاج للتأكيد
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
