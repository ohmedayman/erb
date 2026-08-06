"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle, Loader2, Headphones, Globe, Shield } from "lucide-react";
import Image from "next/image";
import SEOHead from "@/components/SEOHead";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending (in production, this would call an API)
    await new Promise((r) => setTimeout(r, 1500));
    setSent(true);
    setSending(false);
  };

  const contactMethods = [
    { icon: Phone, label: "الموبايل", value: "01028707543", href: "tel:01028707543", color: "bg-green-50 text-green-600", desc: "متاح 24/7" },
    { icon: Mail, label: "البريد الإلكتروني", value: "support@stockflow.vexonet.online", href: "mailto:support@stockflow.vexonet.online", color: "bg-blue-50 text-blue-600", desc: "رد سريع" },
    { icon: MessageCircle, label: "واتساب", value: "01028707543", href: "https://wa.me/201028707543", color: "bg-emerald-50 text-emerald-600", desc: "محادثة فورية" },
    { icon: Clock, label: "مواعيد الدعم", value: "24 ساعة — 7 أيام", href: null, color: "bg-orange-50 text-orange-600", desc: "دعم مستمر" },
  ];

  const features = [
    { icon: Headphones, title: "دعم فني متميز", desc: "فريق دعم متخصص جاهز يساعدك في أي وقت" },
    { icon: Globe, title: "وصول من أي مكان", desc: "النظام سحابي — اشتغل من أي جهاز في أي مكان" },
    { icon: Shield, title: "بياناتك في أمان", desc: "تشفير كامل وحماية متقدمة لبياناتك" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-blue-50/50" dir="rtl">
      <SEOHead
        title="تواصل معانا - StockFlow"
        description="تواصل مع فريق StockFlow للدعم الفني والاستفسارات. نحن متاحين 24/7 لمساعدتك."
        canonical="https://stockflow.vexonet.online/contact"
      />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
            <ArrowRight className="w-4 h-4" /> الرجوع للرئيسية
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/favicon.svg" alt="StockFlow" width={28} height={28} />
            <span className="text-lg font-bold text-gray-900">Stock<span className="text-orange-500">Flow</span></span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-orange-100">
            <Headphones className="w-4 h-4" /> دعم على مدار الساعة
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">تواصل معانا</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">عندك سؤال أو محتاج مساعدة؟ ابعتلنا وهنرد عليك في أقرب وقت</p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 sm:mb-16">
          {contactMethods.map((method, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all hover-lift text-center">
              <div className={`w-14 h-14 ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <method.icon className="w-7 h-7" />
              </div>
              <p className="text-sm text-gray-400 mb-1">{method.label}</p>
              {method.href ? (
                <a href={method.href} target={method.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="text-gray-900 font-bold hover:text-orange-500 transition-colors text-sm">
                  {method.value}
                </a>
              ) : (
                <p className="text-gray-900 font-bold text-sm">{method.value}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{method.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ابعتلنا رسالة</h2>
              <p className="text-gray-500 text-sm mb-6">عندك استفسار أو ملاحظة؟ ابعتها وهنرد عليك في أقرب وقت</p>

              {sent ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">تم إرسال رسالتك!</h3>
                  <p className="text-gray-500">هنرد عليك في أقرب وقت — شكراً لتواصلك معانا</p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    className="mt-6 text-orange-500 hover:text-orange-600 font-medium text-sm"
                  >
                    ابعت رسالة تانية
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                        placeholder="اسمك الكامل"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الموبايل (اختياري)</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">الموضوع</label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                      >
                        <option value="">اختر الموضوع</option>
                        <option value="support">دعم فني</option>
                        <option value="sales">استفسار عن الباقات</option>
                        <option value="billing">مشكلة في الفاتورة</option>
                        <option value="feature">اقتراح ميزة جديدة</option>
                        <option value="bug">الإبلاغ عن مشكلة</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">الرسالة</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all resize-none"
                      placeholder="اكتب رسالتك هنا..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        بيتم الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        إرسال الرسالة
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* WhatsApp Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white">
              <MessageCircle className="w-10 h-10 mb-4 opacity-90" />
              <h3 className="font-bold text-xl mb-2">عندك استفسار سريع؟</h3>
              <p className="text-emerald-100 text-sm leading-relaxed mb-4">ابعتلنا واتساب وهنرد عليك فوراً — أسرع طريقة للتواصل</p>
              <a
                href="https://wa.me/201028707543?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A8%D9%83%D9%85%20StockFlow"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                ابعت واتساب
              </a>
            </div>

            {/* Features */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">ليه تختار StockFlow؟</h3>
              <div className="space-y-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{feature.title}</p>
                      <p className="text-gray-500 text-xs">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Quick */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">أسئلة شائعة</h3>
              <div className="space-y-3">
                {[
                  { q: "هل فيه فترة تجريبية؟", a: "أيوه — 14 يوم مجاناً" },
                  { q: "البيانات بتاعتى في أمان؟", a: "أكيد — تشفير كامل وحماية متقدمة" },
                  { q: "بيشتغل على الموبايل؟", a: "أيوه — تطبيق PWA يعمل على أي جهاز" },
                ].map((faq, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-900 text-sm">{faq.q}</p>
                    <p className="text-gray-500 text-xs mt-1">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
