"use client";

import { useState, useEffect } from "react";
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Plus, X } from "lucide-react";
import { getDocsFromCollection, addDocToCollection } from "@/lib/localdb";

const typeConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  "إدخال": { bg: "bg-green-50", text: "text-green-600", label: "إدخال", icon: ArrowDownCircle },
  "إخراج": { bg: "bg-red-50", text: "text-red-600", label: "إخراج", icon: ArrowUpCircle },
  "نقل": { bg: "bg-blue-50", text: "text-blue-600", label: "نقل", icon: ArrowLeftRight },
};

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    productName: "",
    sku: "",
    type: "إدخال",
    quantity: "",
    fromLocation: "",
    toLocation: "",
    reference: "",
    notes: "",
  });

  const fetchMovements = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const data = getDocsFromCollection("stockMovements", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setMovements(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      addDocToCollection("stockMovements", { ...form, storeId: user.storeId });
      setShowModal(false);
      setForm({
        productName: "",
        sku: "",
        type: "إدخال",
        quantity: "",
        fromLocation: "",
        toLocation: "",
        reference: "",
        notes: "",
      });
      fetchMovements();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">حركات المخزون</h1>
          <p className="text-muted-foreground text-sm mt-1">تتبع حركات الإدخال و الإخراج و النقل</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> اضف حركة
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "إجمالي الحركات", value: movements.length, color: "text-foreground" },
          { label: "حركات الإدخال", value: movements.filter((m) => m.type === "إدخال").length, color: "text-green-600" },
          { label: "حركات الإخراج", value: movements.filter((m) => m.type === "إخراج").length, color: "text-red-600" },
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
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المنتج</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الرمز</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">النوع</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الكمية</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">من</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">إلى</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المرجع</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground text-sm">بيتحمّل...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground text-sm">مفيش حركات مخزون</td></tr>
              ) : (
                movements.map((m, i) => {
                  const cfg = typeConfig[m.type] || typeConfig["إدخال"];
                  const Icon = cfg.icon;
                  return (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{m.productName}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{m.sku}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{m.quantity}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{m.fromLocation || "-"}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{m.toLocation || "-"}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{m.reference || "-"}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString("ar-SA")}</td>
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
              <h2 className="text-lg font-bold text-foreground">اضف حركة مخزون</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">اسم المنتج</label>
                <input
                  type="text"
                  required
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">الرمز</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">النوع</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="إدخال">إدخال</option>
                    <option value="إخراج">إخراج</option>
                    <option value="نقل">نقل</option>
                  </select>
                </div>
              </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">من</label>
                  <input
                    type="text"
                    value={form.fromLocation}
                    onChange={(e) => setForm({ ...form, fromLocation: e.target.value })}
                    className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">إلى</label>
                  <input
                    type="text"
                    value={form.toLocation}
                    onChange={(e) => setForm({ ...form, toLocation: e.target.value })}
                    className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">المرجع</label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
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
