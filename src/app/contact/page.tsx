"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
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

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">تواصل معانا</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">عندك سؤال أو محتاج مساعدة؟ ابعتلنا وهنرد عليك في أقرب وقت</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: Mail, label: "البريد الإلكتروني", value: "support@stockflow.vexonet.online", href: "mailto:support@stockflow.vexonet.online", color: "bg-blue-50 text-blue-600" },
              { icon: Phone, label: "الموبايل", value: "01028707543", href: "tel:01028707543", color: "bg-green-50 text-green-600" },
              { icon: MapPin, label: "الموقع", value: "مصر", href: null, color: "bg-purple-50 text-purple-600" },
              { icon: Clock, label: "مواعيد الدعم", value: "24/7 — على مدار الساعة", href: null, color: "bg-orange-50 text-orange-600" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-gray-900 font-semibold hover:text-orange-500 transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-gray-900 font-semibold">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <MessageCircle className="w-8 h-8 mb-3 opacity-80" />
              <h3 className="font-bold text-lg mb-2">عندك استفسار سريع؟</h3>
              <p className="text-orange-100 text-sm leading-relaxed">ابعتلنا واتساب وهنرد عليك فوراً</p>
              <a href="https://wa.me/201028707543" target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-2 bg-white text-orange-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                واتساب
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">تم الإرسال بنجاح!</h2>
                <p className="text-gray-500 mb-6">شكراً لتواصلك معانا — هنرد عليك في أقرب وقت على الإيميل بتاعك.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                  إرسال رسالة تانية
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
                <h2 className="text-xl font-bold text-gray-900 mb-1">ابعتلنا رسالة</h2>
                <p className="text-sm text-gray-400 mb-6">الحقول اللي فيها * مطلوبة</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم *</label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" placeholder="اسمك الكامل" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني *</label>
                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" placeholder="example@company.com" dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الموضوع *</label>
                  <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all appearance-none bg-white">
                    <option value="">اختار الموضوع</option>
                    <option value="support">دعم فني</option>
                    <option value="billing"> billing / الفواتير</option>
                    <option value="feature">اقتراح ميزة جديدة</option>
                    <option value="bug">الإبلاغ عن مشكلة</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الرسالة *</label>
                  <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none" placeholder="اكتب رسالتك هنا..." />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50">
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
