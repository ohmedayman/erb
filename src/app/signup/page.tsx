"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Warehouse, Eye, EyeOff, CheckCircle, Mail, Lock, User, Loader2, ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { trackUserActivity } from "@/lib/user-activity";
import { createAdminNotification } from "@/lib/admin-notifications";
import Image from "next/image";
import SEOHead from "@/components/SEOHead";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const validate = () => {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = "الاسم مطلوب";
    if (!formData.email.trim()) errs.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "البريد الإلكتروني مش صحيح";
    if (!formData.password) errs.password = "الباسوورد مطلوب";
    else if (formData.password.length < 6) errs.password = "الباسوورد لازم 6 حروف على الأقل";
    if (!formData.confirmPassword) errs.confirmPassword = "تأكيد الباسوورد مطلوب";
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = "الباسووردات مش متطابقة";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.name.trim(),
          },
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/checkout" : undefined,
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("already")) {
          setServerError("البريد الإلكتروني متسجل قبل كده");
        } else if (msg.includes("rate") || msg.includes("too many") || msg.includes("limit")) {
          setServerError("تم تجاوز حد الإرسال. حاول تاني بعد شوية");
        } else if (msg.includes("email") && msg.includes("valid")) {
          setServerError("البريد الإلكتروني غير صحيح");
        } else if (msg.includes("password")) {
          setServerError("الباسوورد ضعيف — لازم 6 أحرف على الأقل");
        } else {
          setServerError("حصل مشكلة: " + error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: insertError } = await supabase
          .from("registered_users")
          .insert({
            id: data.user.id,
            full_name: formData.name.trim(),
            email: data.user.email,
            role: "user",
            subscription_status: "pending",
          });

        if (insertError && insertError.code !== "23505") {
          console.error("Error saving user:", insertError.message);
        }

        const storeId = data.user.id;
        const storeName = formData.name.trim() + " - مخزن";

        await supabase
          .from("stores")
          .upsert({
            id: storeId,
            name: storeName,
            owner_name: formData.name.trim(),
            owner_email: data.user.email,
          }, { onConflict: "id" });

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify({
          id: data.user.id,
          name: formData.name.trim(),
          email: data.user.email,
          fullName: formData.name.trim(),
          role: "user",
          storeId: storeId,
        }));
        localStorage.setItem("store", JSON.stringify({
          id: storeId,
          name: storeName,
        }));
        localStorage.setItem("user_prefs", JSON.stringify({
          storeName: storeName,
          features: [],
          onboardingDone: false,
        }));

        trackUserActivity({
          userId: data.user.id,
          email: data.user.email || formData.email,
          name: formData.name.trim(),
          eventType: "signup",
        }).catch(() => {});

        createAdminNotification({
          type: "signup",
          title: "عميل جديد سجل في الموقع",
          message: `${formData.name.trim()} سجل بـ ${data.user.email}`,
          user_name: formData.name.trim(),
          user_email: data.user.email || "",
        }).catch(() => {});

        router.push("/checkout");
      }
    } catch (err: any) {
      setServerError("حصل مشكلة: " + err.message);
      setLoading(false);
    }
  };

  const benefits = [
    "نظام إدارة مخازن متكامل",
    "تقارير مبيعات وأرباح",
    "نقطة بيع احترافية",
    "دعم فني على مدار الساعة",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex bg-white"
    >
      <SEOHead
        title="اعمل حساب جديد - StockFlow"
        description="سجّل حساب جديد في StockFlow وابدأ إدارة مخزونك ومنتجاتك وعملاءك. نظام إدارة مخازن متكامل للشركات المصرية."
        keywords="حساب جديد, تسجيل, register, StockFlow, إدارة مخازن, نظام مجاني"
        canonical="https://stockflow.vexonet.online/signup"
      />

      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-primary/5 via-orange-50/50 to-blue-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-80 opacity-10" viewBox="0 0 800 300" fill="none">
          <rect x="50" y="150" width="60" height="150" rx="4" fill="#f97316" />
          <rect x="130" y="100" width="40" height="200" rx="4" fill="#f97316" />
          <rect x="190" y="180" width="50" height="120" rx="4" fill="#f97316" />
          <rect x="260" y="80" width="70" height="220" rx="4" fill="#f97316" />
          <rect x="350" y="140" width="45" height="160" rx="4" fill="#f97316" />
          <rect x="420" y="60" width="55" height="240" rx="4" fill="#f97316" />
          <rect x="500" y="120" width="65" height="180" rx="4" fill="#f97316" />
          <rect x="590" y="90" width="50" height="210" rx="4" fill="#f97316" />
          <rect x="660" y="160" width="40" height="140" rx="4" fill="#f97316" />
          <rect x="720" y="110" width="60" height="190" rx="4" fill="#f97316" />
        </svg>

        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
              <Warehouse className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">ابدأ إدارة متجرك مع StockFlow</h2>
            <p className="text-gray-500 text-lg">سجّل دلوقتي وخلّي شغلك أسهل</p>
          </div>

          <div className="space-y-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                <Image src="/favicon.svg" alt="StockFlow" width={36} height={36} />
              </div>
              <div>
                <p className="font-bold text-gray-900">+500 عميل</p>
                <p className="text-sm text-gray-500">بيستخدموا StockFlow كل يوم</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/favicon.svg" alt="StockFlow" width={36} height={36} />
            <span className="text-xl font-bold text-foreground">Stock<span className="text-primary">Flow</span></span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-6">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                  <Warehouse className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">ابدأ رحلتك مع StockFlow</h2>
              </div>

              <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
                <h1 className="text-2xl font-bold text-foreground">اعمل حساب جديد</h1>
                <p className="mt-2 text-sm text-muted-foreground">خلّينا نساعدك تدير متجرك بذكاء</p>

                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
                    >
                      {serverError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSignup} className="mt-6 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                  >
                    <label className="block text-sm font-medium text-foreground mb-1.5">الاسم</label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          setFieldErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                        placeholder="اكتب اسمك الكامل"
                      />
                    </div>
                    <AnimatePresence>
                      {fieldErrors.name && (
                        <motion.p initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="mt-1 text-red-500 text-xs">
                          {fieldErrors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setFieldErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                        placeholder="example@company.com"
                      />
                    </div>
                    <AnimatePresence>
                      {fieldErrors.email && (
                        <motion.p initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="mt-1 text-red-500 text-xs">
                          {fieldErrors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                  >
                    <label className="block text-sm font-medium text-foreground mb-1.5">الباسوورد</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          setFieldErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        className="w-full px-4 py-2.5 pr-10 pl-10 rounded-lg border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                        placeholder="6 حروف على الأقل"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {fieldErrors.password && (
                        <motion.p initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="mt-1 text-red-500 text-xs">
                          {fieldErrors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-foreground mb-1.5">تأكيد الباسوورد</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value });
                          setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                        }}
                        className="w-full px-4 py-2.5 pr-10 pl-10 rounded-lg border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                        placeholder="اكتب الباسوورد تاني"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {fieldErrors.confirmPassword && (
                        <motion.p initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="mt-1 text-red-500 text-xs">
                          {fieldErrors.confirmPassword}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                    className="flex items-start gap-2 pt-1"
                  >
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">بالتسجيل أنت موافق على <Link href="/terms" className="text-primary hover:underline">شروط الخدمة</Link> و <Link href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link></p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          بيسجّل...
                        </>
                      ) : (
                        <>
                          اعمل حساب
                          <ArrowLeft className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.div>
                </form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="mt-6 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    عندك حساب خالص؟{" "}
                    <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">ادخل</Link>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
