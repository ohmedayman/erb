import Link from "next/link";
import { Home, Search, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center p-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <span className="text-[120px] font-bold bg-gradient-to-br from-orange-500 to-orange-600 bg-clip-text text-transparent leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center animate-bounce">
              <Search className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">الصفحة مش موجودة!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">يبدو إنك ضعت — الصفحة دي مش موجودة أو اتنقلت. جرّب ترجع للرئيسية.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25">
            <Home className="w-5 h-5" /> الرجوع للرئيسية
          </Link>
          <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-3.5 rounded-xl font-semibold border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all">
            تسجيل الدخول <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
