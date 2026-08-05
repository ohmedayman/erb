"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Trash2, Printer, ChevronDown, Download } from "lucide-react";
import { getDocsFromCollection, addDocToCollection } from "@/lib/localdb";
import { exportToExcel } from "@/lib/excel";
import { toast } from "@/components/Toast";

interface InvoiceItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  notes: string;
  paymentMethod: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  paid: { label: "اتدفعت", class: "bg-green-100 text-green-700 border border-green-200" },
  unpaid: { label: "م مدفوعة", class: "bg-red-100 text-red-700 border border-red-200" },
  partial: { label: "جزئي", class: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
};

const paymentLabels: Record<string, string> = {
  cash: "كاش",
  card: "كارت",
  transfer: "تحويل",
};

const animationCSS = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes modalEnter {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes tableRowEnter {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.4s ease-out both; }
.modal-enter { animation: modalEnter 0.25s ease-out both; }
.table-row-enter { animation: tableRowEnter 0.3s ease-out both; }
.hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
.hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
`;

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    notes: "",
    paymentMethod: "cash",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", sku: "", quantity: 1, price: 0, total: 0 },
  ]);

  const fetchInvoices = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const data = await getDocsFromCollection(
        "invoices",
        user.storeId
          ? [{ field: "storeId", op: "==", value: user.storeId }]
          : []
      );
      setInvoices(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  const summary = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    unpaid: invoices.filter((i) => i.status === "unpaid").length,
    partial: invoices.filter((i) => i.status === "partial").length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.total || 0), 0),
  };

  const addItem = () => {
    setItems([...items, { name: "", sku: "", quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === "quantity" || field === "price") {
      updated[index].total = updated[index].quantity * updated[index].price;
    }
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (!form.customerName || items.every((i) => !i.name)) return;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const store = JSON.parse(localStorage.getItem("store") || "{}");
      const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
      const validItems = items.filter((i) => i.name);
      const sub = validItems.reduce((s, i) => s + i.quantity * i.price, 0);
      const tx = sub * 0.15;

      await addDocToCollection("invoices", {
        invoiceNumber: invoiceNum,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        notes: form.notes,
        paymentMethod: form.paymentMethod,
        items: validItems.map((i) => ({ ...i, total: i.quantity * i.price })),
        subtotal: sub,
        tax: tx,
        total: sub + tx,
        status: "unpaid",
        storeId: user.storeId || "",
        storeName: store.name || "المتجر",
      });
      setShowModal(false);
      setForm({ customerName: "", customerPhone: "", notes: "", paymentMethod: "cash" });
      setItems([{ name: "", sku: "", quantity: 1, price: 0, total: 0 }]);
      fetchInvoices();
      toast.success("تم إضافة الفاتورة بنجاح");
    } catch {
      toast.error("فيه مشكلة حصلت");
    }
  };

  const handlePrint = (invoice: Invoice) => {
    const store = JSON.parse(localStorage.getItem("store") || "{}");
    const storeName = store.name || "المتجر";

    const itemsRows = invoice.items
      .map(
        (item, i) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${i + 1}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:500;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:left;">${item.price.toFixed(2)} ر.س</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:left;font-weight:600;">${(item.quantity * item.price).toFixed(2)} ر.س</td>
        </tr>`
      )
      .join("");

    const statusLabel =
      invoice.status === "paid"
        ? "اتدفعت"
        : invoice.status === "partial"
        ? "جزئي"
        : "م مدفوعة";
    const statusColor =
      invoice.status === "paid"
        ? "#16a34a"
        : invoice.status === "partial"
        ? "#ca8a04"
        : "#dc2626";

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>فاتورة ${invoice.invoiceNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Kufi Arabic', 'Segoe UI', Tahoma, sans-serif; background: #fff; color: #1a1a1a; padding: 24px; }
  .receipt { max-width: 420px; margin: 0 auto; border: 2px solid #111; padding: 24px; }
  .header { text-align: center; border-bottom: 2px dashed #111; padding-bottom: 16px; margin-bottom: 16px; }
  .store-name { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .invoice-title { font-size: 14px; color: #555; margin-top: 6px; }
  .info-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
  .info-label { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
  thead th { border-bottom: 2px solid #111; padding: 8px 12px; font-weight: 700; text-align: right; }
  .totals { border-top: 2px solid #111; padding-top: 12px; margin-top: 12px; }
  .total-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; }
  .total-final { font-size: 18px; font-weight: 700; border-top: 2px solid #111; padding-top: 8px; margin-top: 8px; }
  .status-badge { display: inline-block; padding: 3px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40; }
  .footer { text-align: center; margin-top: 20px; padding-top: 16px; border-top: 2px dashed #111; font-size: 13px; color: #555; }
  .footer-thanks { font-size: 16px; font-weight: 700; color: #111; margin-top: 6px; }
  @media print {
    body { padding: 0; background: #fff; }
    .receipt { border: 1px solid #000; box-shadow: none; max-width: 100%; }
    @page { margin: 10mm; }
  }
</style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <div class="store-name">${storeName}</div>
    <div class="invoice-title">فاتورة مبيعات</div>
    <div style="font-size:12px;color:#777;margin-top:4px;">رقم الفاتورة: ${invoice.invoiceNumber}</div>
    <div style="font-size:12px;color:#777;">التاريخ: ${new Date(invoice.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}</div>
  </div>

  <div class="info-row">
    <span><span class="info-label">العميل:</span> ${invoice.customerName}</span>
    ${invoice.customerPhone ? `<span>${invoice.customerPhone}</span>` : ""}
  </div>
  <div class="info-row">
    <span><span class="info-label">حالة الدفع:</span> <span class="status-badge">${statusLabel}</span></span>
    <span><span class="info-label">طريقة الدفع:</span> ${paymentLabels[invoice.paymentMethod] || invoice.paymentMethod}</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th style="text-align:right;">المنتج</th>
        <th style="text-align:center;">الكمية</th>
        <th style="text-align:left;">السعر</th>
        <th style="text-align:left;">الإجمالي</th>
      </tr>
    </thead>
    <tbody>${itemsRows}</tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>المجموع الفرعي</span>
      <span>${invoice.subtotal.toFixed(2)} ر.س</span>
    </div>
    <div class="total-row">
      <span>الضريبة (15%)</span>
      <span>${invoice.tax.toFixed(2)} ر.س</span>
    </div>
    <div class="total-row total-final">
      <span>الإجمالي</span>
      <span>${invoice.total.toFixed(2)} ر.س</span>
    </div>
  </div>

  ${invoice.notes ? `<div style="margin-top:16px;padding-top:12px;border-top:1px dashed #ccc;font-size:12px;color:#555;"><strong>ملاحظات:</strong> ${invoice.notes}</div>` : ""}

  <div class="footer">
    <div>شكراً لاختياركم</div>
    <div class="footer-thanks">نتمنى لكم تجربة ممتعة</div>
  </div>
</div>
<script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: animationCSS }} />

      <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h1 className="text-2xl font-bold text-foreground">الفواتير</h1>
        <p className="text-muted-foreground text-sm mt-1">إدارة فواتير المبيعات</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "كل الفواتير", value: summary.total, color: "text-foreground", icon: "📄" },
          { label: "اتدفعت", value: summary.paid, color: "text-green-600", icon: "✅" },
          { label: "م مدفوعة", value: summary.unpaid, color: "text-red-600", icon: "❌" },
          { label: "جزئي", value: summary.partial, color: "text-yellow-600", icon: "⏳" },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border p-4 animate-fade-in-up hover-lift"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{s.icon}</span>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4 animate-fade-in-up" style={{ animationDelay: "320ms" }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث برقم الفاتورة أو اسم العميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors hover-lift"
          >
            <Plus className="w-4 h-4" />
            اضف فاتورة
          </button>
          <button onClick={() => exportToExcel(invoices.map(i => ({ invoiceNumber: i.invoiceNumber, customerName: i.customerName, total: i.total, status: i.status, paymentMethod: i.paymentMethod, createdAt: i.createdAt })), "invoices", "الفواتير")} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
            <Download className="w-4 h-4" /> تصدير Excel
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">رقم الفاتورة</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">العميل</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المبلغ</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">طريقة الدفع</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">التاريخ</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>بيتحمّل...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Printer className="w-7 h-7 opacity-40" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">مفيش فواتير</p>
                        <p className="text-xs mt-1">اضف فاتورة جديدة عشان تبدأ</p>
                      </div>
                      <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-medium mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        اضف فاتورة
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((invoice, idx) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors table-row-enter cursor-default"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {invoice.customerName}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-foreground">
                      {(invoice.total || 0).toFixed(2)} ر.س
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          statusConfig[invoice.status]?.class || ""
                        }`}
                      >
                        {statusConfig[invoice.status]?.label || invoice.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {paymentLabels[invoice.paymentMethod] || invoice.paymentMethod}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {new Date(invoice.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handlePrint(invoice)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors hover-lift"
                        title="اطبع الفاتورة"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        اطبع الفاتورة
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto modal-enter">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">اضف فاتورة جديدة</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    اسم العميل *
                  </label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="اسم العميل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    هاتف العميل
                  </label>
                  <input
                    type="text"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="رقم الهاتف"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">المنتجات</label>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover hover-lift"
                  >
                    <Plus className="w-3 h-3" />
                    اضف منتج
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        type="text"
                        placeholder="اسم المنتج"
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <input
                        type="text"
                        placeholder="SKU"
                        value={item.sku}
                        onChange={(e) => updateItem(index, "sku", e.target.value)}
                        className="w-24 px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <input
                        type="number"
                        placeholder="الكمية"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                        className="w-20 px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                        min="1"
                      />
                      <input
                        type="number"
                        placeholder="السعر"
                        value={item.price}
                        onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                        min="0"
                      />
                      <span className="flex items-center text-sm text-muted-foreground w-20 justify-center font-medium">
                        {(item.quantity * item.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors hover-lift"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي:</span>
                  <span className="font-medium">{subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الضريبة (15%):</span>
                  <span className="font-medium">{tax.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                  <span>الإجمالي:</span>
                  <span className="text-primary">{total.toFixed(2)} ر.س</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    طريقة الدفع
                  </label>
                  <div className="relative">
                    <select
                      value={form.paymentMethod}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-full appearance-none px-4 py-2 pl-8 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="cash">كاش</option>
                      <option value="card">كارت</option>
                      <option value="transfer">تحويل</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    ملاحظات
                  </label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="ملاحظات إضافية"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors hover-lift"
                >
                  عمل الفاتورة
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  الغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
