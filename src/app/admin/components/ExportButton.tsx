"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportButtonProps {
  data: any[];
  filename: string;
  label?: string;
}

const ARABIC_HEADERS: Record<string, string> = {
  id: "المعرف",
  name: "الاسم",
  full_name: "الاسم الكامل",
  email: "البريد الإلكتروني",
  phone: "الهاتف",
  status: "الحالة",
  role: "الدور",
  created_at: "تاريخ الإنشاء",
  updated_at: "تاريخ التحديث",
  price: "السعر",
  stock: "المخزون",
  quantity: "الكمية",
  total: "الإجمالي",
  amount: "المبلغ",
  category: "الفئة",
  description: "الوصف",
  store_id: "معرف المتجر",
  store_name: "اسم المتجر",
  owner_name: "اسم المالك",
  owner_email: "بريد المالك",
  customer_name: "اسم الزبون",
  order_number: "رقم الأوردر",
  subscription_status: "حالة الاشتراك",
  plan_name: "اسم الخطة",
  plan_price: "سعر الخطة",
  payment_method: "طريقة الدفع",
  transaction_id: "رقم المعاملة",
  user_name: "اسم المستخدم",
  user_email: "بريد المستخدم",
  user_phone: "هاتف المستخدم",
  last_ip: "آخر IP",
  last_country: "آخر دولة",
  last_city: "آخر مدينة",
  last_device: "آخر جهاز",
  last_browser: "آخر متصفح",
  last_os: "آخر نظام",
  signup_at: "تاريخ التسجيل",
  last_login_at: "آخر دخول",
  enabled_features: "الميزات المفعلة",
  onboarding_done: "تم الإعداد",
  expires_at: "تاريخ الانتهاء",
  approved_at: "تاريخ الموافقة",
  admin_note: "ملاحظة المدير",
  screenshot_url: "صورة الإيصال",
  country: "الدولة",
  city: "المدينة",
  ip_address: "عنوان IP",
  device: "الجهاز",
  browser: "المتصفح",
  os: "نظام التشغيل",
  event_type: "نوع الحدث",
  net_profit: "صافي الربح",
  balance: "الرصيد",
  warehouse_id: "مستودع",
  supplier_id: "المورد",
  discount: "الخصم",
  tax: "الضريبة",
  shipping_cost: "تكلفة الشحن",
  payment_status: "حالة الدفع",
  delivery_address: "عنوان التوصيل",
  notes: "ملاحظات",
  sku: "رمز المنتج",
  unit: "الوحدة",
  cost_price: "سعر التكلفة",
  selling_price: "سعر البيع",
  min_stock: "الحد الأدنى للمخزون",
  barcode: "الباركود",
  image_url: "صورة المنتج",
};

export default function ExportButton({ data, filename, label }: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Map data to Arabic headers
    const mapped = data.map((row) => {
      const newRow: Record<string, any> = {};
      for (const [key, value] of Object.entries(row)) {
        const header = ARABIC_HEADERS[key] || key;
        if (Array.isArray(value)) {
          newRow[header] = value.join(", ");
        } else if (value instanceof Date) {
          newRow[header] = value.toLocaleDateString("ar-EG");
        } else {
          newRow[header] = value;
        }
      }
      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(mapped);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    // Auto-size columns
    const colWidths = Object.keys(mapped[0] || {}).map((key) => ({
      wch: Math.max(key.length * 1.5, ...mapped.map((row) => String(row[key] || "").length * 0.8)),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data || data.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download className="w-4 h-4" />
      {label || "تصدير Excel"}
    </button>
  );
}
