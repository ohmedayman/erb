"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Warehouse,
  Package,
  ClipboardList,
  Receipt,
  Users,
  BarChart3,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Globe,
  Menu,
  X,
  Play,
  TrendingUp,
  Clock,
  HeadphonesIcon,
  Store,
  CreditCard,
  UserPlus,
  Settings,
  Rocket,
  ArrowLeft,
} from "lucide-react";

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let animationFrame: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <div ref={ref}>{count}</div>;
}

import type { Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const features = [
  { icon: Package, title: "إدارة المنتجات", desc: "تتبع كل منتج في مخزنك — الكميات، الألوان، المقاسات، كل حاجة من مكان واحد" },
  { icon: ClipboardList, title: "إدارة الأوردرات", desc: "ابدأ من الأوردر لحد الشحن، كل خطوة تحت سيطرتك وأنت مطمن" },
  { icon: Receipt, title: "الفواتير التلقائية", desc: "اعمل فواتير اوتوماتيك لكل أوردر، من غير أي غلطة أو نسيان" },
  { icon: Users, title: "قاعدة بيانات الزبائن", desc: "اعرف كل زبونك، تاريخه، طلباته، وتواصل معاه بشكل ذكي" },
  { icon: BarChart3, title: "التقارير والإحصائيات", desc: "شوف أرقامك لحظة بلحظة — إيه اللي بيتباع أكتر، وإيه اللي محتاج ت_focus عليه" },
  { icon: ShoppingCart, title: "نقطة البيع", desc: "بيع في محلك أو أونلاين بـ POS متكامل وسريع زي المحلات الكبيرة" },
];

const steps = [
  { icon: UserPlus, title: "اعمل حسابك", desc: "سجّل في 30 ثانية من غير أي تعقيد" },
  { icon: Settings, title: "اختار اللي محتاجه", desc: "اختار الخطة اللي تناسبك وابدأ إعداد مخزنك" },
  { icon: Rocket, title: "ابدأ تشتغل", desc: "ابدأ تنظيم مخزنك وتابع أرقامك لحظة بلحظة" },
];

const testimonials = [
  { name: "أحمد فتحي", role: "صاحب متجر", company: "محل أحمد للملابس", rating: 5, text: "StockFlow غير طريقة شغلي بالكامل. دلوقتي بعرف كل منتج في المخزن بالظبط، ومن بخسر أي أوردر تاني. فعلاً نظام احترافي." },
  { name: "سارة محمد", role: "مديرة العمليات", company: "شركة نور للإلكترونيات", rating: 5, text: "كنا بنضيع كتير في الإوردرات والمستودع. StockFlow جمع كل حاجة في مكان واحد وبقينا شغالين ب效率 أعلى 10 مرات." },
  { name: "محمد حسن", role: "صاحب سوبر ماركت", company: "سوبر ماركت هاني", rating: 5, text: "أكتر حاجة عجبتني إن التقارير بتاعته واضحة وبتبينلي إيه اللي بيتباع وإيه اللي واقف. بقى عندي رؤية كاملة على الشغل." },
];

const pricingPlans = [
  {
    name: "الأساسي",
    price: "299",
    desc: "مثالي للمحلات الصغيرة اللي بتبدأ",
    features: ["مخزن واحد", "حتى 1,000 منتج", "5 أوردرات يومياً", "تقارير أساسية", "دعم عبر الشات", "تحديثات مجانية"],
    cta: "ابدأ مجاناً",
    primary: false,
  },
  {
    name: "المحترف",
    price: "799",
    desc: "لل businesses اللي عايزة تكبر",
    features: ["5 مخازن", "حتى 10,000 منتج", "أوردرات غير محدودة", "تحليلات متقدمة", "دعم أولوي 24/7", "10 مستخدمين", "وصول API", "تكامل مع شركات الشحن"],
    cta: "ابدأ تجربة مجانية",
    primary: true,
  },
  {
    name: "المؤسسات",
    price: "1,999",
    desc: "للعمليات الكبيرة والمعقدة",
    features: ["مخازن غير محدودة", "منتجات غير محدودة", "أوردرات غير محدودة", "تقارير مخصصة", "دعم على مدار الساعة", "مستخدمون غير محدودون", "تكاملات مخصصة", "مدير حساب مخصص", "SLA مخصص"],
    cta: "تواصل مع المبيعات",
    primary: false,
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setScrolled]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">
      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Warehouse className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Stock<span className="text-orange-500">Flow</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
                المميزات
              </a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
                الأسعار
              </a>
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
                حول
              </a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
              >
                ابدأ الآن
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block text-sm font-medium text-gray-600 hover:text-orange-500 py-2">
                  المميزات
                </a>
                <a href="#pricing" className="block text-sm font-medium text-gray-600 hover:text-orange-500 py-2">
                  الأسعار
                </a>
                <a href="#about" className="block text-sm font-medium text-gray-600 hover:text-orange-500 py-2">
                  حول
                </a>
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <Link href="/login" className="block text-center text-sm font-medium text-gray-600 py-2.5 rounded-lg hover:bg-gray-100">
                    تسجيل الدخول
                  </Link>
                  <Link href="/signup" className="block text-center text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-xl">
                    ابدأ الآن
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50" />

        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] w-72 h-72 bg-orange-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-[15%] w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-[30%] w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"
          />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-right">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-orange-100"
              >
                <Zap className="w-4 h-4" />
                نظام إدارة مخازن احترافي
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              >
                أدر مخزنك
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  بذكاء
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="mt-6 text-lg text-gray-600 max-w-lg mx-auto lg:mr-0"
              >
                نظام إدارة مخازن متكامل — كل حاجة من مكان واحد. تابع مخزونك، أدر أوردراتك، وشوف تقاريرك لحظة بلحظة
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 text-base"
                >
                  ابدأ مجاناً
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-base">
                  <Play className="w-5 h-5 text-orange-500" />
                  شوف Demo
                </button>
              </motion.div>
            </div>

            {/* Right Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl shadow-orange-500/10 p-3 flex items-center gap-3 z-10 border border-orange-100"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">المبيعات</p>
                    <p className="text-sm font-bold text-gray-900">+23.5%</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl shadow-blue-500/10 p-3 flex items-center gap-3 z-10 border border-blue-100"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">المنتجات</p>
                    <p className="text-sm font-bold text-gray-900">12,847</p>
                  </div>
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
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "المنتجات", value: "12,847", color: "from-blue-500 to-blue-600", icon: Package },
                        { label: "الأوردرات", value: "342", color: "from-orange-500 to-orange-600", icon: ClipboardList },
                        { label: "المبيعات", value: "1.2M", color: "from-green-500 to-green-600", icon: TrendingUp },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          className="bg-gray-50 rounded-xl p-3"
                        >
                          <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                            <stat.icon className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                          <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        </motion.div>
                      ))}
                    </div>
                    <div className="bg-gray-50 rounded-xl h-32 flex items-center justify-center border border-gray-100">
                      <BarChart3 className="w-8 h-8 text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6"
          >
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

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-orange-100">
              <Zap className="w-4 h-4" />
              مميزات قوية
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900">
              كل حاجة تحتاجها في مكان واحد
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-gray-600">
              أدوات متقدمة لتبسيط عمليات المخازن من الاستلام للشحن
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-200 transition-all group cursor-default"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-orange-100">
              <Rocket className="w-4 h-4" />
              إعداد سريع
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900">
              3 خطوات بس وابدأ تشتغل
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-gray-600">
              من التسجيل لحد ما تبقى شغال — في 5 دقايق بالكتير
            </motion.p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200" />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid lg:grid-cols-3 gap-8 relative"
            >
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="text-center relative"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.2, type: "spring", stiffness: 200 }}
                    className="relative z-10"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/25">
                      <step.icon className="w-9 h-9 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-orange-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600">{i + 1}</span>
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white">
              لوحة تحكم قوية وبسيطة
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-gray-400">
              شوف إزاي بتتحكم في كل حاجة في مخزنك من مكان واحد
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Floating Badges */}
            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 z-20 hidden sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">نمو المبيعات</p>
                  <p className="text-lg font-bold text-white">+45.2%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 z-20 hidden sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">آخر أوردر</p>
                  <p className="text-lg font-bold text-white">منذ 2 دقيقة</p>
                </div>
              </div>
            </motion.div>

            {/* Main Dashboard */}
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
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/5"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                      <div className="flex items-end justify-between">
                        <p className="text-xl font-bold text-white">{stat.value}</p>
                        <span className="text-xs text-green-400 font-medium">{stat.change}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-sm font-medium text-white mb-4">المبيعات الشهرية</p>
                    <div className="flex items-end gap-2 h-32">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t"
                        />
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
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-400" />
                            </div>
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
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl shadow-orange-500/25 text-base"
              >
                شوف البورد
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-orange-100">
              <Star className="w-4 h-4" />
              آراء عملائنا
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900">
              شركات زيك بتثق في StockFlow
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-gray-600">
              اعرف ليه آلاف المحلات اختارتنا
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">{'\u201C'}{testimonial.text}{'\u201D'}</p>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role} — {testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-orange-100">
              <CreditCard className="w-4 h-4" />
              أسعار واضحة
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900">
              اختار الخطة اللي تناسبك
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-gray-600">
              ابدأ مجاناً وتوسع مع نموك — من غير أي رسوم خفية
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ y: -5 }}
                className={`rounded-3xl p-8 border-2 transition-all relative ${
                  plan.primary
                    ? "border-orange-500 bg-white shadow-2xl shadow-orange-500/10 scale-105"
                    : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-lg"
                }`}
              >
                {plan.primary && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-orange-500/25">
                    الأكثر شعبية
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-lg text-gray-500 font-medium">ج.م/شهر</span>
                </div>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle className="w-5 h-5 text-orange-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 block text-center py-3.5 rounded-xl font-semibold transition-all ${
                    plan.primary
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              جاهز تبدأ؟
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
              ابدأ تجربتك المجانية النهاردة — من غير بطاقة ائتمان ولا أي التزام
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 bg-white text-orange-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-2xl shadow-black/10 hover:shadow-3xl"
              >
                ابدأ مجاناً الآن
                <ArrowLeft className="w-6 h-6" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Warehouse className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  Stock<span className="text-orange-500">Flow</span>
                </span>
              </div>
              <p className="text-gray-500 max-w-sm leading-relaxed">
                نظام إدارة مخازن متكامل مصمم للشركات المصرية. أدر مخزنك بذكاء وتابع أرقامك لحظة بلحظة.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-orange-400 transition-colors">المميزات</a></li>
                <li><a href="#pricing" className="hover:text-orange-400 transition-colors">الأسعار</a></li>
                <li><a href="#about" className="hover:text-orange-400 transition-colors">حول</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">تواصل معانا</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-orange-400 transition-colors">الدعم الفني</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">تواصل معانا</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">المدونة</a></li>
              </ul>
              <div className="flex items-center gap-4 mt-6">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-orange-500 transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-orange-500 transition-colors">
                  <Shield className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 StockFlow. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-orange-400 transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-orange-400 transition-colors">الشروط والأحكام</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
