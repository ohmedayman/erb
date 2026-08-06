"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Warehouse, Eye, EyeOff, Globe, CheckCircle, Mail, Lock, User, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { trackUserActivity } from "@/lib/user-activity";
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
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/dashboard" : undefined,
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("already")) {
          setServerError("البريد الإلكتروني متسجل قبل كده");
        } else if (msg.includes("rate") || msg.includes("too many") || msg.includes("limit")) {
          setServerError("تم تجاوز حد الإرسال. حاول تاني بعد شوية أو تواصل مع الدعم على 01028707543");
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

        if (insertError) {
          console.error("Error saving user to registered_users:", insertError.message, insertError);
          const { error: upsertError } = await supabase
            .from("registered_users")
            .upsert({
              id: data.user.id,
              full_name: formData.name.trim(),
              email: data.user.email,
              role: "user",
              subscription_status: "pending",
            }, { onConflict: "id" });
          if (upsertError) {
            console.error("Upsert also failed:", upsertError.message);
          }
        }

        const storeId = data.user.id;
        const storeName = formData.name.trim() + " - مخزن";

        const { error: storeError } = await supabase
          .from("stores")
          .upsert({
            id: storeId,
            name: storeName,
            owner_name: formData.name.trim(),
            owner_email: data.user.email,
          }, { onConflict: "id" });

        if (storeError) {
          console.error("Error creating store:", storeError.message);
        }

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
          features: ["products", "orders", "invoices", "customers", "inventory", "expenses", "employees", "shipping", "installments", "accounts", "purchaseOrders", "warehouses", "suppliers", "returns", "analytics"],
          onboardingDone: true,
        }));

        // Track signup activity
        trackUserActivity({
          userId: data.user.id,
          email: data.user.email || formData.email,
          name: formData.name.trim(),
          eventType: "signup",
        }).catch(() => {});

        router.push("/dashboard");
      }
    } catch (err: any) {
      setServerError("حصل مشكلة: " + err.message);
      setLoading(false);
    }
  };

  const fieldVariants = [
    { name: "name", icon: User, label: "الاسم", type: "text", placeholder: "اكتب اسمك الكامل", delay: 0.15 },
    { name: "email", icon: Mail, label: "البريد الإلكتروني", type: "email", placeholder: "example@company.com", delay: 0.2 },
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
        description="سجّل حساب جديد في StockFlow وابدأ إدارة مخزونك ومنتجاتك وعملاءك مجاناً. نظام إدارة مخازن SaaS متكامل للشركات المصرية."
        keywords="حساب جديد, تسجيل, register, StockFlow, إدارة مخازن, نظام مجاني"
        canonical="https://stockflow.vexonet.online/signup"
      />
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-50 via-orange-50/50 to-blue-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl" />
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
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
          <div className="w-64 h-40 bg-white/60 rounded-2xl border border-white/80 shadow-xl backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Image src="/favicon.svg" alt="StockFlow" width={48} height={48} />
              </div>
              <p className="text-sm font-medium text-foreground/60">ابدأ رحلتك</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/favicon.svg" alt="StockFlow" width={36} height={36} />
            <span className="text-xl font-bold text-foreground">Stock<span className="text-primary">Flow</span></span>
          </Link>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors">
            <Globe className="w-4 h-4" /> العربية
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-6">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-2xl shadow-xl border border-border p-8"
            >
              <h1 className="text-2xl font-bold text-foreground">اعمل حساب</h1>
              <p className="mt-2 text-sm text-muted-foreground">جهّز نظام إدارة المخازن بتاعك</p>

              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
                  >
                    {serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSignup} className="mt-8 space-y-4">
                {fieldVariants.map(({ name, icon: Icon, label, type, placeholder, delay }) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay }}
                  >
                    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={type}
                        value={(formData as any)[name]}
                        onChange={(e) => {
                          setFormData({ ...formData, [name]: e.target.value });
                          setFieldErrors(prev => ({ ...prev, [name]: undefined }));
                        }}
                        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                        placeholder={placeholder}
                      />
                    </div>
                    <AnimatePresence>
                      {(fieldErrors as any)[name] && (
                        <motion.p
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 15 }}
                          className="mt-1 text-red-500 text-xs"
                        >
                          {(fieldErrors as any)[name]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

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
                      <motion.p
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        className="mt-1 text-red-500 text-xs"
                      >
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
                      <motion.p
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        className="mt-1 text-red-500 text-xs"
                      >
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
                  <p className="text-xs text-muted-foreground">بالتسجيل أنت موافق على شروط الخدمة وسياسة الخصوصية</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        بيسجّل...
                      </>
                    ) : (
                      "اعمل حساب"
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
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
