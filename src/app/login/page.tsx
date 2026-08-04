"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Warehouse, Eye, EyeOff, Globe } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("اسم المستخدم غير موجود");
        setLoading(false);
        return;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      const email = userData.email;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("firebaseToken", token);

      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("كلمة المرور غير صحيحة");
      } else if (err.code === "auth/user-not-found") {
        setError("المستخدم غير موجود");
      } else {
        setError("حدث خطأ ما");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
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
                <Warehouse className="w-10 h-10 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground/60">إدارة المخازن</p>
            </div>
          </div>
        </div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center animate-bounce">
          <span className="text-2xl">📦</span>
        </div>
        <div className="absolute top-60 left-16 w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center">
          <span className="text-xl">🚚</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Stock<span className="text-primary">Flow</span></span>
          </Link>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors">
            <Globe className="w-4 h-4" /> العربية
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
              <h1 className="text-2xl font-bold text-foreground">مرحباً بعودتك!</h1>
              <p className="mt-2 text-sm text-muted-foreground">يرجى تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور</p>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">اسم المستخدم</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="أدخل اسم المستخدم"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pl-12"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="mt-2 text-right">
                    <button type="button" className="text-sm text-primary hover:text-primary-hover transition-colors">
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      جاري تسجيل الدخول...
                    </span>
                  ) : "تسجيل الدخول"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  ليس لديك حساب؟{" "}
                  <Link href="/signup" className="text-primary hover:text-primary-hover font-medium transition-colors">
                    إنشاء حساب
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
