"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Trash2, Printer, ChevronDown } from "lucide-react";
import { getDocsFromCollection, addDocToCollection, deleteDocFromCollection } from "@/lib/localdb";

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
  paid: { label: "مدفوعة", class: "bg-green-100 text-green-700" },
  unpaid: { label: "غير مدفوعة", class: "bg-red-100 text-red-700" },
  partial: { label: "جزئي", class: "bg-yellow-100 text-yellow-700" },
};

const paymentLabels: Record<string, string> = {
  cash: "نقدي",
  card: "بطاقة",
  transfer: "تحويل",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

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
      const invoices = getDocsFromCollection("invoices", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setInvoices(invoices);
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
    if (!form.customerName || items.length === 0) return;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      addDocToCollection("invoices", {
        ...form,
        items,
        subtotal,
        tax,
        total,
        status: "unpaid",
        storeId: user.storeId,
      });
      setShowModal(false);
      setForm({ customerName: "", customerPhone: "", notes: "", paymentMethod: "cash" });
      setItems([{ name: "", sku: "", quantity: 1, price: 0, total: 0 }]);
      fetchInvoices();
    } catch {}
  };

  const handlePrint = (invoice: Invoice) => {
    setPrintInvoice(invoice);
    setTimeout(() => {
      window.print();
      setPrintInvoice(null);
    }, 100);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {printInvoice && (
        <div className="fixed inset-0 z-50 bg-white p-8 print:relative print:inset-auto print:z-auto print:p-0">
          <div className="max-w-lg mx-auto print:max-w-none">
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
              <h1 className="text-2xl font-bold">فاتورة مبيعات</h1>
              <p className="text-sm text-gray-500 mt-1">{printInvoice.invoiceNumber}</p>
              <p className="text-sm text-gray-500">{new Date(printInvoice.createdAt).toLocaleDateString("ar-SA")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="font-bold">العميل:</p>
                <p>{printInvoice.customerName}</p>
                {printInvoice.customerPhone && <p>{printInvoice.customerPhone}</p>}
              </div>
              <div className="text-left">
                <p className="font-bold">طريقة الدفع:</p>
                <p>{paymentLabels[printInvoice.paymentMethod] || printInvoice.paymentMethod}</p>
              </div>
            </div>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-right py-2">المنتج</th>
                  <th className="text-right py-2">الكمية</th>
                  <th className="text-right py-2">السعر</th>
                  <th className="text-left py-2">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {printInvoice.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">{item.price.toFixed(2)} ر.س</td>
                    <td className="py-2 text-left">{item.total.toFixed(2)} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-left space-y-1 text-sm border-t-2 border-gray-800 pt-4">
              <p>المجموع الفرعي: {printInvoice.subtotal.toFixed(2)} ر.س</p>
              <p>الضريبة (15%): {printInvoice.tax.toFixed(2)} ر.س</p>
              <p className="text-lg font-bold">الإجمالي: {printInvoice.total.toFixed(2)} ر.س</p>
            </div>
            {printInvoice.notes && (
              <div className="mt-4 text-sm text-gray-600 border-t pt-4">
                <p className="font-bold">ملاحظات:</p>
                <p>{printInvoice.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-foreground">الفواتير</h1>
        <p className="text-muted-foreground text-sm mt-1">إدارة فواتير المبيعات</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الفواتير", value: summary.total, color: "text-foreground" },
          { label: "مدفوعة", value: summary.paid, color: "text-green-600" },
          { label: "معلقة", value: summary.unpaid, color: "text-red-600" },
          { label: "إجمالي المبالغ", value: `${summary.totalAmount.toFixed(2)} ر.س`, color: "text-primary" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث برقم الفاتورة أو اسم العميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة فاتورة
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
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
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-sm">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-sm">
                    لم يتم العثور على فواتير
                  </td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {invoice.customerName}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {(invoice.total || 0).toFixed(2)} ر.س
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="طباعة"
                      >
                        <Printer className="w-4 h-4" />
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
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">إضافة فاتورة جديدة</h2>
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
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover"
                  >
                    <Plus className="w-3 h-3" />
                    إضافة منتج
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
                      <span className="flex items-center text-sm text-muted-foreground w-20 justify-center">
                        {item.total.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                      <option value="cash">نقدي</option>
                      <option value="card">بطاقة</option>
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
                  className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  إنشاء الفاتورة
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
