"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { getDocsFromCollection, addDocToCollection } from "@/lib/localdb";

interface Installment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  numberOfInstallments: number;
  installmentAmount: number;
  paidInstallments: number;
  startDate: string;
  status: string;
  notes: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: "قيد السداد", class: "bg-blue-100 text-blue-700" },
  completed: { label: "مكتمل", class: "bg-green-100 text-green-700" },
  cancelled: { label: "ملغي", class: "bg-red-100 text-red-700" },
};

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newInstallment, setNewInstallment] = useState({
    invoiceId: "",
    invoiceNumber: "",
    customerName: "",
    totalAmount: "",
    numberOfInstallments: "",
    installmentAmount: "",
    startDate: new Date().toISOString().split("T")[0],
    status: "active",
    notes: "",
  });

  const fetchInstallments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const data = await getDocsFromCollection("installments", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setInstallments(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstallments();
  }, []);

  const filtered = installments.filter(
    (inst) =>
      inst.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inst.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalInstallments = installments.length;
  const activeInstallments = installments.filter(
    (i) => i.status === "active"
  ).length;
  const completedInstallments = installments.filter(
    (i) => i.status === "completed"
  ).length;
  const totalAmount = installments.reduce(
    (sum, i) => sum + (i.totalAmount || 0),
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = parseFloat(newInstallment.totalAmount) || 0;
    const numberOfInstallments =
      parseInt(newInstallment.numberOfInstallments) || 0;
    const installmentAmount =
      numberOfInstallments > 0 ? totalAmount / numberOfInstallments : 0;

    const res = await fetch("/api/installments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newInstallment,
        installmentAmount: installmentAmount.toFixed(2),
      }),
    });

    if (res.ok) {
      setShowModal(false);
      setNewInstallment({
        invoiceId: "",
        invoiceNumber: "",
        customerName: "",
        totalAmount: "",
        numberOfInstallments: "",
        installmentAmount: "",
        startDate: new Date().toISOString().split("T")[0],
        status: "active",
        notes: "",
      });
      fetchInstallments();
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الأقساط</h1>
          <p className="text-muted-foreground text-sm mt-1">
            متابعة الأقساط و الفواتير
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> اضف قسط
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                إجمالي الأقساط
              </p>
              <p className="text-lg font-bold text-foreground">
                {loading ? "..." : totalInstallments}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">قيد السداد</p>
              <p className="text-lg font-bold text-foreground">
                {loading ? "..." : activeInstallments}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">مكتملة</p>
              <p className="text-lg font-bold text-foreground">
                {loading ? "..." : completedInstallments}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                إجمالي المبالغ
              </p>
              <p className="text-lg font-bold text-foreground">
                {loading ? "..." : formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="البحث برقم الفاتورة أو اسم العميل..."
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
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  رقم الفاتورة
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  العميل
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  المبلغ الكلي
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  القسط
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  المدفوع
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  المتبقي
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الحالة
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  تاريخ البداية
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    بيتحمّل...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    مفيش أقساط
                  </td>
                </tr>
              ) : (
                filtered.map((inst) => {
                  const paid = inst.paidInstallments * inst.installmentAmount;
                  const remaining = inst.totalAmount - paid;
                  return (
                    <tr
                      key={inst.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        {inst.invoiceNumber}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {inst.customerName}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        {formatCurrency(inst.totalAmount)} ج.م
                      </td>
                      <td className="px-5 py-3 text-sm text-foreground">
                        {formatCurrency(inst.installmentAmount)} ج.م
                      </td>
                      <td className="px-5 py-3 text-sm text-green-600 font-medium">
                        {formatCurrency(paid)} ج.م
                      </td>
                      <td className="px-5 py-3 text-sm text-red-600 font-medium">
                        {formatCurrency(remaining > 0 ? remaining : 0)} ج.م
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusConfig[inst.status]?.class || ""
                          }`}
                        >
                          {statusConfig[inst.status]?.label || inst.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {inst.startDate}
                      </td>
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
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                اضف قسط جديد
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    رقم الفاتورة *
                  </label>
                  <input
                    type="text"
                    value={newInstallment.invoiceNumber}
                    onChange={(e) =>
                      setNewInstallment({
                        ...newInstallment,
                        invoiceNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    معرف الفاتورة *
                  </label>
                  <input
                    type="text"
                    value={newInstallment.invoiceId}
                    onChange={(e) =>
                      setNewInstallment({
                        ...newInstallment,
                        invoiceId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  اسم العميل *
                </label>
                <input
                  type="text"
                  value={newInstallment.customerName}
                  onChange={(e) =>
                    setNewInstallment({
                      ...newInstallment,
                      customerName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    المبلغ الكلي *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newInstallment.totalAmount}
                    onChange={(e) =>
                      setNewInstallment({
                        ...newInstallment,
                        totalAmount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    عدد الأقساط *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newInstallment.numberOfInstallments}
                    onChange={(e) =>
                      setNewInstallment({
                        ...newInstallment,
                        numberOfInstallments: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    تاريخ البداية *
                  </label>
                  <input
                    type="date"
                    value={newInstallment.startDate}
                    onChange={(e) =>
                      setNewInstallment({
                        ...newInstallment,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    الحالة
                  </label>
                  <select
                    value={newInstallment.status}
                    onChange={(e) =>
                      setNewInstallment({
                        ...newInstallment,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="active">قيد السداد</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ملاحظات
                </label>
                <textarea
                  value={newInstallment.notes}
                  onChange={(e) =>
                    setNewInstallment({
                      ...newInstallment,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                   اضف قسط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
