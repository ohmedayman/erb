import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "سياسة الخصوصية - StockFlow",
  description: "سياسة الخصوصية لنظام StockFlow لإدارة المخازن والمخزون.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
            <ArrowRight className="w-4 h-4" /> الرجوع للرئيسية
          </Link>
          <span className="text-sm font-bold text-gray-900">StockFlow</span>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">سياسة الخصوصية</h1>
        <p className="text-sm text-gray-400 mb-8">آخر تحديث: يناير 2026</p>
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. مقدمة</h2>
            <p className="text-gray-600 leading-relaxed">مرحباً بيك في StockFlow (&ldquo;الخدمة&rdquo;). سياسة الخصوصية دي بتشرح إزاي بنجمع وبنستخدم وبنحمي المعلومات الشخصية بتاعتك لما تستخدم منصتنا.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. المعلومات اللي بنجمعها</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
              <li><strong>معلومات التسجيل:</strong> الاسم، البريد الإلكتروني، كلمة المرور</li>
              <li><strong>معلومات الدفع:</strong> تفاصيل طرق الدفع (مباشرة من مزود الخدمة — مش بنخزنها)</li>
              <li><strong>بيانات المتجر:</strong> اسم المتجر، نوع النشاط، عدد الموظفين</li>
              <li><strong>بيانات الاستخدام:</strong> إزاي بتستخدم المنصة — الصفحات، المدة، الأفعال</li>
              <li><strong>الكوكيز:</strong> ملفات صغيرة بتساعدنا تحسين تجربتك</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. إزاي بنستخدم المعلومات</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
              <li>تشغيل وتحسين الخدمة</li>
              <li>التواصل معاك وتقديم الدعم الفني</li>
              <li>إرسال إشعارات مهمة عن حسابك</li>
              <li>تحسين أمان المنصة ومنع الاحتيال</li>
              <li>تحليل الاستخدام وتطوير مميزات جديدة</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. حماية البيانات</h2>
            <p className="text-gray-600 leading-relaxed">بنستخدم تشفير SSL/TLS لحماية بياناتك. بياناتك بتتخزن على خوادم Supabase الآمنة في بيئة مؤمنة. بنعمل نسخ احتياطي منتظم وبنحدد صلاحيات الوصول.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. مشاركة البيانات</h2>
            <p className="text-gray-600 leading-relaxed">مش بنبيع أو بنشارك بياناتك مع أي طرف تالت إلا في الحالات دي:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
              <li>لما تطلب منا ده صراحةً</li>
              <li>لما يكون مطلوب قانونياً</li>
              <li>مع مزودي الخدمات اللي بيساعدونا تشغيل المنصة (بشكل آمن ومقيد)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. حقوقك</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
              <li>تaccess بياناتك الشخصية</li>
              <li>تصحيح أي بيانات غلط</li>
              <li>حذف حسابك وبياناتك</li>
              <li>اعتراض على معالجة بياناتك</li>
              <li>نقل بياناتك لخدمة تانية</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. الاحتفاظ بالبيانات</h2>
            <p className="text-gray-600 leading-relaxed">بنحافظ على بياناتك طول ما حسابك شغال. لو قفلت حسابك، بنمسح بياناتك خلال 90 يوم باستثناء البيانات المطلوب قانونياً الاحتفاظ بيها.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. التغييرات على السياسة</h2>
            <p className="text-gray-600 leading-relaxed">ممكن نحدث السياسة دي من وقت للتاني. هنبلغك بأي تغييرات مهمة عبر البريد الإلكتروني أو من خلال المنصة.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. التواصل معانا</h2>
            <p className="text-gray-600 leading-relaxed">لو عندك أي أسئلة عن سياسة الخصوصية، تواصل معانا على: <a href="mailto:privacy@stockflow.vexonet.online" className="text-orange-500 hover:underline">privacy@stockflow.vexonet.online</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
