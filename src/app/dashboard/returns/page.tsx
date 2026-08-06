"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Plus, X, Search, Download, Package } from "lucide-react";
import { getDocsFromCollection, addDocToCollection } from "@/lib/localdb";
import { exportToExcel } from "@/lib/excel";
import { toast } from "@/components/Toast";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Pending: { bg: "bg-yellow-50", text: "text-yellow-600", label: "معلق" },
  Completed: { bg: "bg-green-50", text: "text-green-600", label: "مكتمل" },
  Rejected: { bg: "bg-red-50", text: "text-red-600", label: "مرتجع" },
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    orderNumber: "",
    customerName: "",
    reason: "",
    quantity: "",
    status: "Pending",
    refundAmount: "",
    notes: "",
  });

  const fetchReturns = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const data = await getDocsFromCollection("returns", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setReturns(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const filtered = returns.filter((r) =>
    r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await addDocToCollection("returns", {
        ...form,
        storeId: user.storeId,
        returnNumber: `RET-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      });
      setShowModal(false);
      setForm({
        orderNumber: "",
        customerName: "",
        reason: "",
        quantity: "",
        status: "Pending",
        refundAmount: "",
        notes: "",
      });
      fetchReturns();
      toast.success("تم إضافة المرتجع بنجاح");
    } catch {
      toast.error("فيه مشكلة حصلت");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المرتجعات</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة مرتجعات الأوردرات</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToExcel(returns.map(r => ({ returnNumber: r.returnNumber, orderNumber: r.orderNumber, customerName: r.customerName, reason: r.reason, quantity: r.quantity, refundAmount: r.refundAmount, status: r.status, createdAt: r.createdAt })), "returns", "المرتجعات")} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
            <Download className="w-4 h-4" /> تصدير
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> اضف مرتجع
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "إجمالي المرتجعات", value: returns.length, color: "text-foreground" },
          { label: "معلق", value: returns.filter((r) => r.status === "Pending").length, color: "text-yellow-600" },
          { label: "مكتمل", value: returns.filter((r) => r.status === "Completed").length, color: "text-green-600" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="البحث بالعميل، رقم الطلب، أو السبب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">رقم المرتجع</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">رقم الطلب</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">العميل</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">السبب</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الكمية</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المبلغ</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-4">
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">{search ? "مفيش نتايج للبحث ده" : "مفيش مرتجعات"}</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map((r, i) => {
                  const cfg = statusConfig[r.status] || statusConfig.Pending;
                  return (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{r.returnNumber}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{r.orderNumber}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{r.customerName}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{r.reason}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{r.quantity}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{r.refundAmount} ج.م</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("ar-EG")}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">اضف مرتجع</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">رقم الطلب</label>
                  <input
                    type="text"
                    required
                    value={form.orderNumber}
                    onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">اسم العميل</label>
                  <input
                    type="text"
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">سبب الاسترداد</label>
                <input
                  type="text"
                  required
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">الكمية</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">مبلغ الاسترداد</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.refundAmount}
                    onChange={(e) => setForm({ ...form, refundAmount: e.target.value })}
                    className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">الحالة</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="Pending">معلق</option>
                  <option value="Completed">مكتمل</option>
                  <option value="Rejected">مرتجع</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">ملاحظات</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                   {submitting ? "بيتحمّل..." : "حفظ"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
