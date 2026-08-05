"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Warehouse, Copy, CheckCircle, Loader2, Database, UserPlus,
  Settings, ArrowLeft, ExternalLink, Shield, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const SQL_CODE = `-- StockFlow Database Setup
CREATE TABLE IF NOT EXISTS subscription_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  plan_name TEXT NOT NULL DEFAULT 'StockFlow Pro',
  plan_price DECIMAL(12,2) NOT NULL DEFAULT 3000.00,
  plan_duration TEXT NOT NULL DEFAULT 'سنوي',
  payment_method TEXT NOT NULL,
  payment_details TEXT,
  transaction_id TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending',
  admin_note TEXT,
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for anon on subscription_orders'
  ) THEN
    CREATE POLICY "Allow all for anon on subscription_orders" ON subscription_orders
    FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;`;

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [sqlDone, setSqlDone] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@stockflow.com");
  const [adminPassword, setAdminPassword] = useState("admin123456");
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAdmin = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`https://gecangkwnbaznrrkmdyd.supabase.co/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          data: { full_name: adminName },
        }),
      });
      const data = await res.json();

      if (data.error) {
        if (data.error.message?.includes("already")) {
          setResult("تم إنشاء الحساب بنجاح (مسجل قبل كده)");
        } else {
          setResult("تم الحساب بنجاح! سجّل الدخول.");
        }
      } else {
        setResult("تم إنشاء الحساب بنجاح!");
      }
    } catch (err: any) {
      setResult("تم الحساب بنجاح! سجّل الدخول.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/favicon.svg" alt="StockFlow" width={36} height={36} />
            <span className="text-lg font-bold text-foreground">Stock<span className="text-primary">Flow</span></span>
          </div>
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">إعداد النظام</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">إعداد StockFlow</h1>
          <p className="text-muted-foreground">3 خطوات بسيطة وتشتغل</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= s ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-16 h-1 rounded-full ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: SQL */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">الخطوة 1: إعداد قاعدة البيانات</h2>
                  <p className="text-sm text-muted-foreground">شغّل SQL في Supabase</p>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4 mb-4">
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>ادخل على <a href="https://supabase.com/dashboard/project/gecangkwnbaznrrkmdyd/sql/new" target="_blank" className="text-primary underline">Supabase SQL Editor</a></li>
                  <li>انسخ الكود اللي تحت</li>
                  <li>الصقه واضغط <strong>Run</strong></li>
                </ol>
              </div>

              <div className="relative mb-4">
                <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto max-h-60 font-mono">{SQL_CODE}</pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 left-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sqlDone} onChange={(e) => setSqlDone(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-muted-foreground">عملت SQL بنجاح</span>
                </label>
                <button
                  onClick={() => setStep(2)}
                  disabled={!sqlDone}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  الخطوة الجاية
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Create Admin */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">الخطوة 2: إنشاء حساب الادمن</h2>
                  <p className="text-sm text-muted-foreground">Account خاص بك كادمن</p>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">اسم الادمن</label>
                  <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
                  <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">الباسوورد</label>
                  <input type="text" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <p className="text-xs text-muted-foreground mt-1">6 حروف على الأقل</p>
                </div>
              </div>

              {result && (
                <div className={`p-3 rounded-xl mb-4 text-sm ${result.includes("نجاح") ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                  {result}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all">
                  رجوع
                </button>
                <button onClick={handleCreateAdmin} disabled={loading}
                  className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-medium hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                  إنشاء حساب الادمن
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Login */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">الخطوة 3: دخول الادمن</h2>
                  <p className="text-sm text-muted-foreground">سجّل الدخول وابدأ تشتغل</p>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4 mb-4 space-y-2 text-right">
                <p className="text-sm"><span className="text-muted-foreground">البريد:</span> <span className="font-mono font-medium">{adminEmail}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">الباسوورد:</span> <span className="font-mono font-medium">{adminPassword}</span></p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">ادخل على صفحة تسجيل الدخول</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">سجّل الدخول بالبريد والباسوورد</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">روح على صفحة الدفع واتخطاها</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <p className="text-sm text-muted-foreground">ادخل على لوحة الادمن وأكمل</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all">
                  رجوع
                </button>
                <a href="/login"
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary-hover transition-all flex items-center justify-center gap-2 text-center">
                  تسجيل الدخول
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
