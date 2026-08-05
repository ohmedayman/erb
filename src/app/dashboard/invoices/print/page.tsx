"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: "paid" | "unpaid" | "partial";
  notes: string;
}

export default function InvoicePrintPage() {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("printInvoice");
    if (stored) {
      setInvoice(JSON.parse(stored));
    }
  }, []);

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-gray-500">لا توجد بيانات فاتورة للطباعة</p>
      </div>
    );
  }

  const paymentStatusLabel =
    invoice.paymentStatus === "paid"
      ? "مدفوعة"
      : invoice.paymentStatus === "partial"
      ? "مدفوعة جزئياً"
      : "غير مدفوعة";

  const paymentStatusColor =
    invoice.paymentStatus === "paid"
      ? "text-green-600 bg-green-50"
      : invoice.paymentStatus === "partial"
      ? "text-yellow-600 bg-yellow-50"
      : "text-red-600 bg-red-50";

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-content, #invoice-content * {
            visibility: visible !important;
          }
          #invoice-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 15mm;
            size: A4;
          }
        }
      `}</style>

      <div className="no-print fixed top-4 left-4 z-50">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Printer className="w-4 h-4" /> طباعة الفاتورة
        </button>
      </div>

      <div id="invoice-content" className="min-h-screen bg-white p-8" dir="rtl">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-gray-200 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">SF</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">متجر ستوك فلو</h1>
                  <p className="text-sm text-gray-500">Stock Flow Store</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{invoice.companyAddress || "مصر"}</p>
              <p className="text-sm text-gray-600">{invoice.companyPhone || "010-XXXXXXXX"}</p>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-900">فاتورة</h2>
              <p className="text-sm text-gray-600 mt-1">رقم: {invoice.invoiceNumber}</p>
              <p className="text-sm text-gray-600">التاريخ: {invoice.date}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">بيانات العميل</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">الاسم: </span>
                <span className="text-gray-900 font-medium">{invoice.customerName}</span>
              </div>
              <div>
                <span className="text-gray-500">الهاتف: </span>
                <span className="text-gray-900 font-medium">{invoice.customerPhone}</span>
              </div>
              {invoice.customerAddress && (
                <div className="col-span-2">
                  <span className="text-gray-500">العنوان: </span>
                  <span className="text-gray-900 font-medium">{invoice.customerAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">#</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">المنتج</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700">الكمية</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700">السعر</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-center">{item.qty}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-center">{item.price.toFixed(2)} ج.م</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 text-center">{item.total.toFixed(2)} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">المجموع الفرعي</span>
                <span className="text-gray-900">{invoice.subtotal.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الضريبة (15%)</span>
                <span className="text-gray-900">{invoice.tax.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                <span className="text-gray-900">الإجمالي</span>
                <span className="text-gray-900">{invoice.total.toFixed(2)} ج.م</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">حالة الدفع</span>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${paymentStatusColor}`}>
                {paymentStatusLabel}
              </span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">ملاحظات</h3>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 mt-12 pt-4 border-t border-gray-100">
            <p>شكراً لتعاملكم معنا</p>
            <p className="mt-1">متجر ستوك فلو - Stock Flow Store</p>
          </div>
        </div>
      </div>
    </>
  );
}
