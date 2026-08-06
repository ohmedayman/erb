"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Warehouse, Package, ClipboardList, Receipt, Users, BarChart3,
  ShoppingCart, ArrowRight, CheckCircle, Star, Zap, Menu, X,
  Play, TrendingUp, Clock, HeadphonesIcon, Store, CreditCard,
  UserPlus, Settings, Rocket, ArrowLeft, Shield, Smartphone,
  Globe, FileText, Truck, Barcode, MessageSquare, HelpCircle,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import SEOHead from "@/components/SEOHead";

function AnimateOnScroll({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    let raf: number;
    const animate = (now: number) => {
      if (!startTime) startTime = now;
      const p = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(p * end));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [started, end, duration]);

  return <div ref={ref}>{count}</div>;
}

const features = [
  { icon: Package, title: "إدارة المنتجات", desc: "تتبع كل منتج في مخزنك — الكميات، الألوان، المقاسات، كل حاجة من مكان واحد", color: "from-blue-500 to-blue-600" },
  { icon: ClipboardList, title: "إدارة الأوردرات", desc: "ابدأ من الأوردر لحد الشحن، كل خطوة تحت سيطرتك وأنت مطمن", color: "from-orange-500 to-orange-600" },
  { icon: Receipt, title: "الفواتير التلقائية", desc: "اعمل فواتير اوتوماتيك لكل أوردر، من غير أي غلطة أو نسيان", color: "from-emerald-500 to-emerald-600" },
  { icon: Users, title: "قاعدة بيانات الزبائن", desc: "اعرف كل زبونك، تاريخه، طلباته، وتواصل معاه بشكل ذكي", color: "from-purple-500 to-purple-600" },
  { icon: BarChart3, title: "التقارير والإحصائيات", desc: "شوف أرقامك لحظة بلحظة — إيه اللي بيتباع أكتر، وإيه اللي محتاج تركز عليه", color: "from-pink-500 to-pink-600" },
  { icon: ShoppingCart, title: "نقطة البيع", desc: "بيع في محلك أو أونلاين بـ POS متكامل وسريع زي المحلات الكبيرة", color: "from-cyan-500 to-cyan-600" },
];

const steps = [
  { icon: UserPlus, title: "اعمل حسابك", desc: "سجّل في 30 ثانية من غير أي تعقيد" },
  { icon: Settings, title: "اختار اللي محتاجه", desc: "اختار الخطة اللي تناسبك وابدأ إعداد مخزنك" },
  { icon: Rocket, title: "ابدأ تشتغل", desc: "ابدأ تنظيم مخزنك وتابع أرقامك لحظة بلحظة" },
];

const testimonials = [
  { name: "أحمد فتحي", role: "صاحب متجر", company: "محل أحمد للملابس", rating: 5, text: "StockFlow غير طريقة شغلي بالكامل. دلوقتي بعرف كل منتج في المخزن بالظبط، ومن بخسر أي أوردر تاني. فعلاً نظام احترافي." },
  { name: "سارة محمد", role: "مديرة العمليات", company: "شركة نور للإلكترونيات", rating: 5, text: "كنا بنضيع كتير في الإوردرات والمستودع. StockFlow جمع كل حاجة في مكان واحد وبقينا شغالين بكفاءة أعلى 10 مرات." },
  { name: "محمد حسن", role: "صاحب سوبر ماركت", company: "سوبر ماركت هاني", rating: 5, text: "أكتر حاجة عجبتني إن التقارير بتاعته واضحة وبتبينلي إيه اللي بيتباع وإيه اللي واقف. بقى عندي رؤية كاملة على الشغل." },
];

const pricingPlans = [
  {
    id: "starter",
    name: "StockFlow Starter",
    price: "3,000",
    desc: "ابدأ بإدارة متجرك بالمميزات الأساسية",
    badge: "الأساسية",
    color: "from-blue-500 to-blue-600",
    borderColor: "border-blue-200",
    limits: "100 منتج — 50 زبون — 100 أوردر",
    features: [
      "100 منتج",
      "50 زبون / عميل",
      "100 أوردر شهرياً",
      "فواتير وإيصالات احترافية",
      "نقطة بيع (POS)",
      "باركود وطباعة إيصالات",
      "تقارير مبيعات أساسية",
      "إدارة المنتجات (اسم، سعر، كمية، صورة)",
      "حساب المخزون تلقائياً",
      "طباعة فواتير PDF",
      "دعم فني عبر واتساب",
    ],
  },
  {
    id: "growth",
    name: "StockFlow Growth",
    price: "6,000",
    desc: "مميزات متقدمة لإدارة أعمالك بكفاءة",
    badge: "الأكثر طلباً",
    color: "from-orange-500 to-orange-600",
    borderColor: "border-orange-500",
    limits: "500 منتج — 500 زبون — 1,000 أوردر",
    features: [
      "500 منتج",
      "500 زبون / عميل",
      "1,000 أوردر شهرياً",
      "كل مميزات Starter +",
      "إدارة المصروفات اليومية",
      "إدارة الموظفين والرواتب",
      "المستودعات المتعددة",
      "حركات المخزون (تحويل، احتفاظ، مرتجع)",
      "إدارة الموردين وأرصدتهم",
      "إشعارات فورية (مخزون منخفض، أوردر جديد)",
      "تقارير أرباح وخسائر",
      "تقارير المخزون والمنتجات",
      "تصدير البيانات Excel",
      "إدارة العملاء والموردين بالتفصيل",
      "دعم فني أولوي",
    ],
  },
  {
    id: "enterprise",
    name: "StockFlow Enterprise",
    price: "9,000",
    desc: "كل المميزات بدون حدود",
    badge: "المتقدمة",
    color: "from-purple-500 to-purple-600",
    borderColor: "border-purple-200",
    limits: "غير محدود — كل المميزات",
    features: [
      "منتجات غير محدودة",
      "زبائن غير محدودين",
      "أوردرات غير محدودة",
      "كل مميزات Growth +",
      "حسابات تكاليف الشحن والتوصيل",
      "نظام الأقساط والتقسيط",
      "تقييمات وآراء العملاء",
      "إدارة الفريق والأدوار",
      "تحليلات مبيعات متقدمة",
      "تقارير PDF احترافية",
      "نقاط بيع متعددة",
      "سجل النشاطات والaudit trail",
      "إدارة الإعدادات المتقدمة",
      "دعم فني 24/7 مع مدير حساب مخصص",
      "تكامل مع أنظمة الدفع الإلكترونية",
    ],
  },
];

const moreFeatures = [
  { icon: Shield, title: "حماية وأمان", desc: "بياناتك في أمان تام مع تشفير كامل" },
  { icon: Smartphone, title: "PWA", desc: "اشتغل أوفلاين واتزامن أونلاين" },
  { icon: Globe, title: "سحابي", desc: "وصول من أي جهاز في أي مكان" },
  { icon: FileText, title: "تقارير PDF", desc: "صدر تقارير احترافية لأرباحك" },
  { icon: Truck, title: "شحن وتوصيل", desc: "تتبع شحناتك ومصاريفها" },
  { icon: Barcode, title: "باركود", desc: "اطبع باركود لكل منتج" },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">
      <SEOHead
        title="StockFlow - أفضل نظام إدارة مخازن ومخزون في مصر"
        description="StockFlow هو نظام إدارة مخازن ومخزون متكامل مصمم للشركات المصرية. أدر منتجاتك وعملاءك وفواتيرك وأوردراتك ومصروفاتك وموظفينك في مكان واحد. تقارير لحظية، باركود، شحن، نقاط بيع. ابدأ مجاناً!"
        keywords="نظام إدارة مخازن, إدارة مخزون, مخازن مصري, إدارة منتجات, إدارة عملاء, فواتير, نقاط بيع, باركود, شحن, تقارير مبيعات"
        canonical="https://stockflow.vexonet.online"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "StockFlow - نظام إدارة المخازن والمخزون",
          description: "نظام إدارة مخازن ومخزون متكامل للشركات المصرية",
          url: "https://stockflow.vexonet.online",
        }}
      />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/20" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/favicon.svg" alt="StockFlow" width={36} height={36} />
              <span className="text-xl font-bold text-gray-900">Stock<span className="text-orange-500">Flow</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">المميزات</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">الأسعار</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">عملاؤنا</a>
              <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">تواصل معانا</Link>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-xl hover:bg-gray-100">تسجيل الدخول</Link>
              <Link href="/signup" className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25">
                ابدأ مجاناً
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200">
              <div className="px-4 py-4 space-y-3">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-orange-500 py-2">المميزات</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-orange-500 py-2">الأسعار</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-orange-500 py-2">عملاؤنا</a>
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <Link href="/login" className="block text-center text-sm font-medium text-gray-600 py-2.5 rounded-xl hover:bg-gray-100">تسجيل الدخول</Link>
                  <Link href="/signup" className="block text-center text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-xl">ابدأ الآن</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-white to-blue-50/50" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 left-[10%] w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-40 right-[15%] w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, 15, 0], y: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-20 left-[30%] w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-orange-100">
                <Zap className="w-4 h-4" /> نظام إدارة مخازن احترافي
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.2]">
                أدر مخزنك
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">بذكاء</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="mt-6 text-lg text-gray-600 max-w-lg mx-auto lg:mr-0 leading-relaxed">
                نظام إدارة مخازن متكامل — كل حاجة من مكان واحد. تابع مخزونك، أدر أوردراتك، وشوف تقاريرك لحظة بلحظة
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl shadow-orange-500/25 text-base">
                  ابدأ مجاناً <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-2xl font-bold border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-base">
                  <Play className="w-5 h-5 text-orange-500" /> شوف Demo
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> مجاني 14 يوم</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> بدون بطاقة</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> إلغاء في أي وقت</span>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, x: 50, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="relative hidden lg:block">
              <div className="relative">
                {/* Floating Stats */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl shadow-orange-500/10 p-3 flex items-center gap-3 z-10 border border-orange-100">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
                  <div><p className="text-xs text-gray-500">المبيعات</p><p className="text-sm font-bold text-gray-900">+23.5%</p></div>
                </motion.div>
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl shadow-blue-500/10 p-3 flex items-center gap-3 z-10 border border-blue-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-blue-600" /></div>
                  <div><p className="text-xs text-gray-500">المنتجات</p><p className="text-sm font-bold text-gray-900">12,847</p></div>
                </motion.div>

                {/* Dashboard Mockup */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 text-center text-xs text-gray-400 font-medium">لوحة تحكم StockFlow</div>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "المنتجات", value: "12,847", color: "from-blue-500 to-blue-600", icon: Package },
                        { label: "الأوردرات", value: "342", color: "from-orange-500 to-orange-600", icon: ClipboardList },
                        { label: "المبيعات", value: "1.2M", color: "from-green-500 to-green-600", icon: TrendingUp },
                      ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.1 }} className="bg-gray-50 rounded-xl p-3">
                          <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                            <stat.icon className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                          <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Chart Area */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-gray-600">المبيعات الشهرية</p>
                        <span className="text-xs text-green-500 font-medium">+18%</span>
                      </div>
                      <div className="flex items-end gap-2 h-24">
                        {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                            className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm"
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-[9px] text-gray-400">
                        <span>يناير</span>
                        <span>مارس</span>
                        <span>مايو</span>
                        <span>يوليو</span>
                        <span>سبتمبر</span>
                        <span>نوفمبر</span>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">آخر الأوردرات</p>
                      {[
                        { name: "أحمد محمد", amount: "2,450 ج.م", status: "تم التوصيل", color: "bg-green-100 text-green-600" },
                        { name: "سارة علي", amount: "1,200 ج.م", status: "قيد الشحن", color: "bg-blue-100 text-blue-600" },
                        { name: "محمد حسن", amount: "3,800 ج.م", status: "معلّق", color: "bg-yellow-100 text-yellow-600" },
                      ].map((order, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 + i * 0.1 }} className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{order.name.charAt(0)}</div>
                            <div>
                              <p className="text-xs font-medium text-gray-900">{order.name}</p>
                              <p className="text-[10px] text-gray-500">{order.amount}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${order.color}`}>{order.status}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="mt-16 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 lg:p-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Store className="w-5 h-5 text-orange-500" />
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">+<CountUp end={500} /></span>
                </div>
                <p className="text-sm text-gray-500">محل شغال</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">4.<CountUp end={9} duration={1500} /></span>
                </div>
                <p className="text-sm text-gray-500">تقييم</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <HeadphonesIcon className="w-5 h-5 text-orange-500" />
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900"><CountUp end={24} duration={1000} />/7</span>
                </div>
                <p className="text-sm text-gray-500">دعم فني</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-orange-100">
              <Zap className="w-4 h-4" /> مميزات قوية
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">كل حاجة تحتاجها في مكان واحد</h2>
            <p className="mt-4 text-lg text-gray-500">أدوات متقدمة لتبسيط عمليات المخازن من الاستلام للشحن</p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <AnimateOnScroll key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-200/80 transition-all duration-300 group cursor-default h-full">
                  <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <f.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll className="mt-16">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {moreFeatures.map((f, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 text-center hover:border-orange-200 transition-colors">
                  <f.icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-900">{f.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <p className="text-center text-sm text-gray-400 mb-8 font-medium">شركات ومحلات بتثق في StockFlow</p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-40">
              {["محل أحمد للملابس", "شركة نور للإلكترونيات", "سوبر ماركت هاني", "دار الموبايلات", "متجر الزهراء"].map((name, i) => (
                <span key={i} className="text-base sm:text-lg font-bold text-gray-900 whitespace-nowrap">{name}</span>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-orange-100">
              <Rocket className="w-4 h-4" /> إعداد سريع
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">3 خطوات بس وابدأ تشتغل</h2>
            <p className="mt-4 text-lg text-gray-500">من التسجيل لحد ما تبقى شغال — في 5 دقايق بالكتير</p>
          </AnimateOnScroll>

          <div className="relative">
            <div className="hidden lg:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200" />
            <div className="grid lg:grid-cols-3 gap-8 relative">
              {steps.map((step, i) => (
                <AnimateOnScroll key={i} delay={i * 0.15}>
                  <div className="text-center relative">
                    <div className="relative z-10 inline-block">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/25 group-hover:scale-105 transition-transform">
                        <step.icon className="w-9 h-9 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-orange-500 flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-600">{i + 1}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4">{step.title}</h3>
                    <p className="text-gray-500">{step.desc}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <AnimateOnScroll className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">لوحة تحكم قوية وبسيطة</h2>
            <p className="mt-4 text-lg text-gray-400">شوف إزاي بتتحكم في كل حاجة في مخزنك من مكان واحد</p>
          </AnimateOnScroll>

          <AnimateOnScroll>
            <div className="relative">
              <motion.div animate={{ y: [0, -15, 0], x: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 z-20 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-400" /></div>
                  <div><p className="text-xs text-gray-400">نمو المبيعات</p><p className="text-lg font-bold text-white">+45.2%</p></div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, 10, 0], x: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 z-20 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-orange-400" /></div>
                  <div><p className="text-xs text-gray-400">آخر أوردر</p><p className="text-lg font-bold text-white">منذ 2 دقيقة</p></div>
                </div>
              </motion.div>

              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="bg-white/5 px-5 py-3 border-b border-white/10 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-xs text-gray-400 font-medium">StockFlow Dashboard</div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "إجمالي المبيعات", value: "1.2M", change: "+23%", icon: TrendingUp, color: "from-green-500 to-emerald-600" },
                      { label: "المنتجات", value: "12,847", change: "+8%", icon: Package, color: "from-blue-500 to-blue-600" },
                      { label: "الأوردرات", value: "1,205", change: "+15%", icon: ClipboardList, color: "from-orange-500 to-orange-600" },
                      { label: "الزبائن", value: "3,420", change: "+12%", icon: Users, color: "from-purple-500 to-purple-600" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                        <div className="flex items-end justify-between">
                          <p className="text-xl font-bold text-white">{stat.value}</p>
                          <span className="text-xs text-green-400 font-medium">{stat.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-sm font-medium text-white mb-4">المبيعات الشهرية</p>
                      <div className="flex items-end gap-2 h-32">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all duration-700" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-sm font-medium text-white mb-4">آخر الأوردرات</p>
                      <div className="space-y-3">
                        {[
                          { name: "أحمد علي", status: "تم الشحن", amount: "450 ج.م", color: "text-green-400 bg-green-400/10" },
                          { name: "سارة حسن", status: "قيد التجهيز", amount: "230 ج.م", color: "text-yellow-400 bg-yellow-400/10" },
                          { name: "محمد خالد", status: "جديد", amount: "890 ج.م", color: "text-blue-400 bg-blue-400/10" },
                        ].map((order, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"><Users className="w-4 h-4 text-gray-400" /></div>
                              <div>
                                <p className="text-sm font-medium text-white">{order.name}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${order.color}`}>{order.status}</span>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-white">{order.amount}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-10 text-center">
                <Link href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl shadow-orange-500/25">
                  شوف البورد <ArrowLeft className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-orange-100">
              <Star className="w-4 h-4" /> آراء عملائنا
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">شركات زيك بتثق في StockFlow</h2>
            <p className="mt-4 text-lg text-gray-500">اعرف ليه آلاف المحلات اختارتنا</p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <AnimateOnScroll key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{t.name[0]}</div>
                    <div>
                      <p className="font-bold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.role} — {t.company}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-orange-100">
              <CreditCard className="w-4 h-4" /> باقات مرنة لكل احتياج
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">اختار الباقة المناسبة ليك</h2>
            <p className="mt-4 text-lg text-gray-500">3 باقات بأسعار مصرية — ادفع وابدأ فوراً</p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <AnimateOnScroll key={plan.id} delay={i * 0.15}>
                <div className={`rounded-3xl border-2 ${plan.borderColor} bg-white shadow-xl relative overflow-hidden h-full flex flex-col ${plan.id === "growth" ? "ring-2 ring-orange-500/20 shadow-orange-500/10 scale-[1.02]" : ""}`}>
                  {plan.badge && (
                    <div className={`absolute top-0 left-0 right-0 bg-gradient-to-r ${plan.color} py-2.5 text-center`}>
                      <span className="text-white text-sm font-bold">{plan.badge}</span>
                    </div>
                  )}
                  <div className={`pt-14 px-6 pb-6 flex flex-col flex-1`}>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">{plan.desc}</p>

                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-sm text-gray-500 font-medium">ج.م / سنة</span>
                      </div>
                    </div>

                    <div className={`rounded-xl p-3 border mb-4 text-center ${plan.id === "enterprise" ? "bg-purple-50 border-purple-200" : plan.id === "growth" ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200"}`}>
                      <p className={`text-sm font-bold ${plan.id === "enterprise" ? "text-purple-700" : plan.id === "growth" ? "text-orange-700" : "text-blue-700"}`}>{plan.limits}</p>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">الباقة تشمل:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link href="/signup" className={`mt-6 block text-center py-3.5 rounded-2xl font-bold bg-gradient-to-r ${plan.color} text-white hover:opacity-90 shadow-lg transition-all`}>
                      ابدأ الآن
                    </Link>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll className="mt-16 max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "دفع آمن", desc: "دفع مؤمن عبر فودافون كاش أو فوري" },
                { icon: Clock, title: "تأكيد سريع", desc: "هنتواصل معاك خلال 24 ساعة" },
                { icon: Zap, title: "دخول فوري", desc: "ابدأ شغل بعد التأكيد مباشرة" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 text-center hover-lift">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-orange-100">
              <HelpCircle className="w-4 h-4" /> أسئلة شائعة
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">عندك سؤال؟</h2>
          </AnimateOnScroll>

          {[
            { q: "إزاي أبدأ استخدام StockFlow؟", a: "سجّل حسابك في 30 ثانية، اختار الباقة المناسبة، وابدأ إضافة منتجاتك ومعلومات محلك. خلاص، كده تقدر تشتغل!" },
            { q: "هل فيه فترة تجربة مجانية؟", a: "أيوه! كل باقة فيها 14 يوم تجربة مجانية. جرّب النظام كله من غير أي التزام أو بطاقة ائتمان." },
            { q: "البيانات بتاعتي في أمان؟", a: "أكيد! بياناتك محمية بتشفير AES-256 ونظام أمان متعدد الطبقات. السيرفرات على Supabase (AWS) مع نسخ احتياطي تلقائي." },
            { q: "أقدر أشتغل أوفلاين؟", a: "أيوه! StockFlow PWA — يعني تقدر تضيف بيانات وأنت أوفلاين وهي بتتسجل تلقائي أونلاين." },
            { q: "بشتغل على الموبايل؟", a: "طبعاً! الواجهة متجاوبة 100% وتشتغل على أي جهاز — موبايل، تابلت، أو كمبيوتر." },
            { q: "إزاي أدفع؟", a: "الدفع عبر فودافون كاش أو فوري. بعد التأكيد، حسابك بيتشفع فوراً من غير انتظار." },
          ].map((faq, i) => (
            <AnimateOnScroll key={i} delay={i * 0.05}>
              <div className="border border-gray-200 rounded-xl mb-3 overflow-hidden hover:border-orange-200 transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-right"
                >
                  <span className="font-bold text-gray-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed text-sm">
                    {faq.a}
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative text-center">
          <AnimateOnScroll>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">جاهز تبدأ؟</h2>
            <p className="text-lg sm:text-xl text-orange-100 mb-10 max-w-2xl mx-auto">ابدأ تجربتك المجانية النهاردة — من غير بطاقة ائتمان ولا أي التزام</p>
            <Link href="/signup" className="inline-flex items-center gap-3 bg-white text-orange-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all shadow-2xl shadow-black/10">
              ابدأ مجاناً الآن <ArrowLeft className="w-6 h-6" />
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/favicon.svg" alt="StockFlow" width={36} height={36} />
                <span className="text-xl font-bold text-white">Stock<span className="text-orange-500">Flow</span></span>
              </div>
              <p className="text-gray-500 max-w-sm leading-relaxed">نظام إدارة مخازن متكامل مصمم للشركات المصرية. أدر مخزنك بذكاء وتابع أرقامك لحظة بلحظة.</p>
              <div className="flex items-center gap-4 mt-6">
                <a href="https://wa.me/201028707543" target="_blank" rel="noopener" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-orange-500/20 hover:text-orange-400 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href="mailto:support@stockflow.vexonet.online" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-orange-500/20 hover:text-orange-400 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-orange-400 transition-colors">المميزات</a></li>
                <li><a href="#pricing" className="hover:text-orange-400 transition-colors">الأسعار</a></li>
                <li><a href="#testimonials" className="hover:text-orange-400 transition-colors">عملاؤنا</a></li>
                <li><Link href="/login" className="hover:text-orange-400 transition-colors">تسجيل الدخول</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">الدعم والقانونية</h4>
              <ul className="space-y-3">
                <li><Link href="/contact" className="hover:text-orange-400 transition-colors">تواصل معانا</Link></li>
                <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">سياسة الخصوصية</Link></li>
                <li><Link href="/terms" className="hover:text-orange-400 transition-colors">الشروط والأحكام</Link></li>
                <li><a href="mailto:support@stockflow.vexonet.online" className="hover:text-orange-400 transition-colors">الدعم الفني</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">&copy; 2026 Vexonet. كل الحقوق محفوظة.</p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="hover:text-orange-400 transition-colors">سياسة الخصوصية</Link>
              <Link href="/terms" className="hover:text-orange-400 transition-colors">الشروط والأحكام</Link>
              <Link href="/contact" className="hover:text-orange-400 transition-colors">تواصل معانا</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
