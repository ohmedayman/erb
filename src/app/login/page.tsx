"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle, ArrowLeft, MessageCircle, Headphones, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { trackUserActivity } from "@/lib/user-activity";
import Image from "next/image";
import SEOHead from "@/components/SEOHead";
import { isAdminEmail } from "@/lib/admin-config";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const handleResetPassword = async () => {
    setResetLoading(true);
    setResetMessage("");
    setResetError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setResetError("فيه مشكلة حصلت — تأكد من البريد الإلكتروني");
      } else {
        setResetMessage("تم إرسال رابط إعادة تعيين الباسوورد على البريد الإلكتروني بتاعك!");
      }
    } catch {
      setResetError("فيه مشكلة حصلت — حاول تاني");
    }
    setResetLoading(false);
  };

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "البريد الإلكتروني مش صحيح";
    if (!password) errs.password = "الباسوورد مطلوب";
    else if (password.length < 6) errs.password = "الباسوورد لازم 6 حروف على الأقل";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login")) {
          setServerError("البريد أو الباسوورد غلط");
        } else if (error.message.includes("rate") || error.message.includes("too many")) {
          setServerError("تم تجاوز حد المحاولات. حاول تاني بعد شوية");
        } else {
          setServerError("فيه مشكلة حصلت — حاول تاني");
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setServerError("فيه مشكلة حصلت — حاول تاني");
        setLoading(false);
        return;
      }

      const userEmail = (data.user.email || "").toLowerCase();
      const isAdmin = isAdminEmail(userEmail);

      localStorage.setItem("user", JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email,
        role: isAdmin ? "admin" : "user",
        storeId: data.user.id,
      }));
      localStorage.setItem("isLoggedIn", "true");

      if (isAdmin) {
        router.push("/admin");
        return;
      }

      trackUserActivity({
        userId: data.user.id,
        email: data.user.email || userEmail,
        name: data.user.user_metadata?.full_name || data.user.email,
        eventType: "login",
      }).catch(() => {});

      let orders: any[] | null = null;
      try {
        const res = await supabase
          .from("subscription_orders")
          .select("id, status")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        orders = res.data;
      } catch {}

      try {
        const res = await supabase
          .from("stores")
          .select("id, name")
          .eq("id", data.user.id)
          .single();
        if (res.data) {
          localStorage.setItem("store", JSON.stringify({ id: res.data.id, name: res.data.name }));
        }
      } catch {}

      if (!orders || orders.length === 0) {
        let subStatus = "none";
        try {
          const { data: regUser } = await supabase
            .from("registered_users")
            .select("subscription_status")
            .eq("id", data.user.id)
            .single();
          if (regUser?.subscription_status) {
            subStatus = regUser.subscription_status;
          }
        } catch {}

        if (subStatus === "approved" || subStatus === "active") {
          const prefs = JSON.parse(localStorage.getItem("user_prefs") || "null");
          if (!prefs?.onboardingDone) {
            router.push("/onboarding");
          } else {
            router.push("/dashboard");
          }
          return;
        }

        if (subStatus === "pending") {
          setServerError("طلبك قيد المراجعة من الإدارة. هتتقبل في أقرب وقت!");
          setLoading(false);
          return;
        }

        if (subStatus === "rejected") {
          setServerError("تم رفض طلب اشتراكك. تواصل مع الدعم على 01028707543");
          setLoading(false);
          return;
        }

        router.push("/checkout");
        return;
      }

      if (orders[0].status === "pending") {
        setServerError("طلبك قيد المراجعة من الإدارة. هتتقبل في أقرب وقت!");
        setLoading(false);
        return;
      }

      if (orders[0].status === "approved") {
        const existingPrefs = JSON.parse(localStorage.getItem("user_prefs") || "null");
        if (!existingPrefs) {
          localStorage.setItem("user_prefs", JSON.stringify({
            storeName: "",
            features: [],
            onboardingDone: false,
          }));
        }

        const prefs = JSON.parse(localStorage.getItem("user_prefs") || "null");
        if (!prefs?.onboardingDone) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
        return;
      }

      setServerError("تم رفض طلب اشتراكك. تواصل مع الدعم على 01028707543");
      setLoading(false);
    } catch {
      setServerError("فيه مشكلة حصلت — حاول تاني");
      setLoading(false);
    }
  };

  const benefits = [
    "لوحة تحكم شاملة",
    "تقارير لحظية ومفصلة",
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
        title="تسجيل الدخول - StockFlow"
        description="ادخل على حسابك في StockFlow نظام إدارة المخازن الاحترافي."
        keywords="تسجيل دخول, login,StockFlow, إدارة مخازن"
        canonical="https://stockflow.vexonet.online/login"
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
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">أهلاً بيك تاني!</h2>
            <p className="text-gray-500 text-lg">ادخل على حسابك وكمّل شغلك</p>
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
                  <CheckCircle className="w-4 h-4 text-green-600" />
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

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                  <Headphones className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">أهلاً بيك تاني!</h2>
              </div>

              <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
                <h1 className="text-2xl font-bold text-foreground">تسجيل الدخول</h1>
                <p className="mt-2 text-sm text-muted-foreground">ادخل بياناتك عشان تدخل</p>

                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className={`mt-4 px-4 py-3 rounded-lg text-sm ${
                        serverError.includes("قيد المراجعة") || serverError.includes("تم إرسال")
                          ? "bg-blue-50 border border-blue-200 text-blue-600"
                          : "bg-red-50 border border-red-200 text-red-600"
                      }`}
                    >
                      {serverError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleLogin} className="mt-8 space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-foreground mb-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })); }}
                        className="w-full px-4 py-3 pr-10 pl-12 rounded-xl border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="example@company.com"
                      />
                    </div>
                    <AnimatePresence>
                      {fieldErrors.email && (
                        <motion.p initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="mt-1.5 text-red-500 text-xs">
                          {fieldErrors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-foreground mb-2">الباسوورد</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })); }}
                        className="w-full px-4 py-3 pr-10 pl-12 rounded-xl border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="اكتب الباسوورد"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {fieldErrors.password && (
                        <motion.p initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="mt-1.5 text-red-500 text-xs">
                          {fieldErrors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <div className="mt-2 text-right">
                      <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-primary hover:text-primary-hover transition-colors">
                        نسيت الباسوورد؟
                      </button>
                    </div>
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
                          بيتم الدخول...
                        </>
                      ) : (
                        <>
                          ادخل
                          <ArrowLeft className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.div>
                </form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    م عندك حساب؟{" "}
                    <Link href="/signup" className="text-primary hover:text-primary-hover font-medium transition-colors">
                      اعمل حساب
                    </Link>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border"
          >
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">إعادة تعيين الباسوورد</h2>
              <button onClick={() => { setShowForgotPassword(false); setResetMessage(""); setResetError(""); }} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {!resetMessage ? (
                <>
                  <p className="text-sm text-muted-foreground">اكتب البريد الإلكتروني وهنبعتلك رابط عشان تغيّر الباسوورد</p>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="example@company.com"
                    />
                  </div>
                  {resetError && (
                    <p className="text-red-500 text-sm">{resetError}</p>
                  )}
                  <button
                    onClick={handleResetPassword}
                    disabled={resetLoading || !resetEmail}
                    className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        بيتم الإرسال...
                      </>
                    ) : (
                      "إرسال رابط إعادة التعيين"
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm text-foreground font-medium">{resetMessage}</p>
                  <button
                    onClick={() => { setShowForgotPassword(false); setResetMessage(""); }}
                    className="mt-4 text-sm text-primary hover:text-primary-hover transition-colors"
                  >
                    رجوع لتسجيل الدخول
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
