"use client";

import { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  Wallet,
  Building2,
  Users,
  Truck,
  Tag,
  X,
} from "lucide-react";
import { getDocsFromCollection, addDocToCollection } from "@/lib/localdb";

const categoryLabels: Record<string, string> = {
  rent: "إيجار",
  utilities: "مرافق",
  salaries: "رواتب",
  marketing: "تسويق",
  transport: "نقل",
  other: "تانية",
};

const categoryColors: Record<string, string> = {
  rent: "bg-blue-100 text-blue-700",
  utilities: "bg-green-100 text-green-700",
  salaries: "bg-purple-100 text-purple-700",
  marketing: "bg-orange-100 text-orange-700",
  transport: "bg-yellow-100 text-yellow-700",
  other: "bg-gray-100 text-gray-700",
};

const paymentMethodLabels: Record<string, string> = {
  cash: "كاش",
  card: "كارت",
  transfer: "تحويل",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "rent",
    paymentMethod: "cash",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    receiptNumber: "",
  });

  const fetchExpenses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const expenses = getDocsFromCollection("expenses", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setExpenses(expenses);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filterByDate = (expense: any) => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    if (dateFilter === "thisMonth") {
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    }
    if (dateFilter === "lastMonth") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        expenseDate.getMonth() === lastMonth.getMonth() &&
        expenseDate.getFullYear() === lastMonth.getFullYear()
      );
    }
    if (dateFilter === "custom" && customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      return expenseDate >= start && expenseDate <= end;
    }
    return true;
  };

  const filtered = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) &&
      filterByDate(e)
  );

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const thisMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const dailyAverage =
    thisMonthExpenses / (new Date().getDate() || 1);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    addDocToCollection("expenses", { ...newExpense, storeId: user.storeId });
    setShowModal(false);
    setNewExpense({
      description: "",
      amount: "",
      category: "rent",
      paymentMethod: "cash",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      receiptNumber: "",
    });
    fetchExpenses();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      rent: Building2,
      utilities: Wallet,
      salaries: Users,
      marketing: TrendingUp,
      transport: Truck,
      other: Tag,
    };
    return icons[category] || Tag;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المصروفات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            تسجيل ومتابعة المصروفات
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> اضف مصروف
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">توتال المصروفات</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">هذا الشهر</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(thisMonthExpenses)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">متوسط يومي</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(dailyAverage)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث في المصروفات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">الكل</option>
              <option value="thisMonth">هذا الشهر</option>
              <option value="lastMonth">الشهر الماضي</option>
              <option value="custom">نطاق مخصص</option>
            </select>
            {dateFilter === "custom" && (
              <>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الوصف
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  المبلغ
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الفئة
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  طريقة الدفع
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  التاريخ
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الإيصال
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    بيتحمّل...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    مفيش مصروفات
                  </td>
                </tr>
              ) : (
                filtered.map((expense) => {
                  const CategoryIcon = getCategoryIcon(expense.category);
                  return (
                    <tr
                      key={expense.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                            <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground block">
                              {expense.description}
                            </span>
                            {expense.notes && (
                              <span className="text-xs text-muted-foreground block mt-0.5">
                                {expense.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-semibold text-red-600">
                          -{formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            categoryColors[expense.category] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {categoryLabels[expense.category] || expense.category}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {expense.paymentMethod === "cash" ? (
                            <Wallet className="w-4 h-4 text-green-600" />
                          ) : expense.paymentMethod === "card" ? (
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Building2 className="w-4 h-4 text-purple-600" />
                          )}
                          <span className="text-sm text-foreground">
                            {paymentMethodLabels[expense.paymentMethod] || expense.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-foreground">
                        {expense.date}
                      </td>
                      <td className="px-5 py-3">
                        {expense.receiptNumber ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-muted text-xs font-mono font-medium">
                            {expense.receiptNumber}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
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
                اضف مصروف
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  الوصف *
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    المبلغ *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    الفئة *
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="rent">إيجار</option>
                    <option value="utilities">مرافق</option>
                    <option value="salaries">رواتب</option>
                    <option value="marketing">تسويق</option>
                    <option value="transport">نقل</option>
                    <option value="other">تانية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    طريقة الدفع *
                  </label>
                  <select
                    value={newExpense.paymentMethod}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="cash">كاش</option>
                    <option value="card">كارت</option>
                    <option value="transfer">تحويل</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    التاريخ *
                  </label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  رقم الإيصال
                </label>
                <input
                  type="text"
                  value={newExpense.receiptNumber}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      receiptNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ملاحظات
                </label>
                <textarea
                  value={newExpense.notes}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, notes: e.target.value })
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
                  الغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  اضف مصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
