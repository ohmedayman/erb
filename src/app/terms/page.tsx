import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "الشروط والأحكام - StockFlow",
  description: "شروط وأحكام استخدام منصة StockFlow لإدارة المخازن والمخزون.",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الشروط والأحكام</h1>
        <p className="text-sm text-gray-400 mb-8">آخر تحديث: يناير 2026</p>
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. قبول الشروط</h2>
            <p className="text-gray-600">باستخدامك لمنصة StockFlow (&ldquo;الخدمة&rdquo;)، أنت بتقبل الشروط والأحكام دي. لو مش موافق على أي شرط، ياريت متستخدمش الخدمة.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. وصف الخدمة</h2>
            <p className="text-gray-600">StockFlow هو نظام SaaS لإدارة المخازن والمخزون. الخدمة بتشمل: إدارة المنتجات، الأوردرات، الفواتير، الزبائن، المصروفات، التقارير، ونقاط البيع.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. الحساب والتسجيل</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
              <li>لازم يكون عندك 18 سنة على الأقل</li>
              <li>معلومات التسجيل لازم تكون صحيحة ومحدثة</li>
              <li>أنت مسؤول عن حماية كلمة المرور بتاعتك</li>
              <li>أنت مسؤول عن كل الأنشطة اللي بتحصل في حسابك</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. الاشتراك والدفع</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
              <li>الاشتراك السنوي: 3,000 جنيه مصري (1,500 دفعة أولى + 500 جنيه × 3 أقساط شهرية)</li>
              <li>الاشتراك الشهري: 500 جنيه مصري</li>
              <li>الأسعار ممكن تتغير — هنبلغك قبل أي تغيير</li>
              <li>الدفع مش رجوعي إلا في حالة الخدمة</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. استخدام الخدمة</h2>
            <p className="text-gray-600">أنت بت承诺 إنك هتستخدم الخدمة بشكل قانوني وبطريقة لا تضر بالآخرين. ممنوع:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
              <li>استخدام الخدمة لأي غرض غير قانوني</li>
              <li>محاولة اختراق أو تعطيل النظام</li>
              <li>مشاركة الحساب مع أشخاص تانيين</li>
              <li>نسخ أو توزيع محتوى المنصة</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. المحتوى والبيانات</h2>
            <p className="text-gray-600">أنت بت keeping الملكية الكاملة لبياناتك. إحنا مش بنملك بياناتك أو بنستخدمها لأغراض تانية. بنخزنها بأمان وبنحميها.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. الإلغاء والاسترداد</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
              <li>تقدر تلغي اشتراكك في أي وقت</li>
              <li>بعد الإلغاء، حسابك هيفضل شغال لحد نهاية الفترة المدفوعة</li>
              <li>مفيش استرداد لأي جزء من المبلغ المدفوع</li>
              <li>بنحافظ على بياناتك لمدة 30 يوم بعد الإلغاء</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. إخلاء المسؤولية</h2>
            <p className="text-gray-600">الخدمة بتتقدم &ldquo;كما هي&rdquo; من غير أي ضمانات. إحنا مش مسؤولين عن أي أضرار غير مباشرة أو فقدان بيانات بسبب استخدام الخدمة.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. تعديل الشروط</h2>
            <p className="text-gray-600">بنحق نعدّل الشروط دي في أي وقت. هنبلغك بأي تغييرات جوهرية قبل ما تدخل حيز التنفيذ.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. التواصل</h2>
            <p className="text-gray-600">لأي استفسارات عن الشروط والأحكام، تواصل معانا على: <a href="mailto:legal@stockflow.vexonet.online" className="text-orange-500 hover:underline">legal@stockflow.vexonet.online</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
