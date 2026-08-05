"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Plus, X } from "lucide-react";
import { getDocsFromCollection, addDocToCollection } from "@/lib/localdb";

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Pending: { bg: "bg-yellow-50", text: "text-yellow-600", label: "معلق" },
  Completed: { bg: "bg-green-50", text: "text-green-600", label: "مكتمل" },
  Rejected: { bg: "bg-red-50", text: "text-red-600", label: "مرتجع" },
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      addDocToCollection("returns", { ...form, storeId: user.storeId });
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
    } catch {
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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> اضف مرتجع
        </button>
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
                <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground text-sm">بيتحمّل...</td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground text-sm">مفيش مرتجعات</td></tr>
              ) : (
                returns.map((r, i) => {
                  const cfg = statusConfig[r.status] || statusConfig.Pending;
                  return (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{r.returnNumber}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{r.orderNumber}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{r.customerName}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{r.reason}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{r.quantity}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">${r.refundAmount}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("ar-SA")}</td>
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
