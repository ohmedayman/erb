"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  DollarSign,
  X,
} from "lucide-react";
import { getDocsFromCollection, addDocToCollection } from "@/lib/localdb";

const typeLabels: Record<string, string> = {
  asset: "أصول",
  liability: "التزامات",
  equity: "حقوق ملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
};

const typeColors: Record<string, string> = {
  asset: "bg-green-100 text-green-700",
  liability: "bg-red-100 text-red-700",
  equity: "bg-blue-100 text-blue-700",
  revenue: "bg-purple-100 text-purple-700",
  expense: "bg-orange-100 text-orange-700",
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({
    asset: true,
    liability: true,
    equity: true,
    revenue: true,
    expense: true,
  });
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "asset",
    parentCode: "",
    balance: "",
    notes: "",
  });

  const fetchAccounts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const accounts = getDocsFromCollection("accounts", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setAccounts(accounts);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filtered = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = Object.keys(typeLabels).reduce(
    (acc, type) => {
      acc[type] = filtered.filter((a) => a.type === type);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    addDocToCollection("accounts", { ...newAccount, storeId: user.storeId });
    setShowModal(false);
    setNewAccount({
      name: "",
      type: "asset",
      parentCode: "",
      balance: "",
      notes: "",
    });
    fetchAccounts();
  };

  const toggleType = (type: string) => {
    setExpandedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">دليل الحسابات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة الحسابات المالية وشجرة الحسابات
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> إضافة حساب
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث في الحسابات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="px-5 py-8 text-center text-muted-foreground text-sm">
            جاري التحميل...
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="px-5 py-8 text-center text-muted-foreground text-sm">
            لم يتم العثور على حسابات
          </div>
        ) : (
          Object.keys(typeLabels).map((type) => {
            const typeAccounts = grouped[type] || [];
            if (typeAccounts.length === 0 && search) return null;
            return (
              <div key={type} className="border-b border-border last:border-0">
                <button
                  onClick={() => toggleType(type)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedTypes[type] ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        typeColors[type] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {typeLabels[type]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({typeAccounts.length} حساب)
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(
                      typeAccounts.reduce(
                        (sum, a) => sum + (a.balance || 0),
                        0
                      )
                    )}
                  </span>
                </button>
                {expandedTypes[type] && typeAccounts.length > 0 && (
                  <div className="border-t border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">
                            الكود
                          </th>
                          <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">
                            اسم الحساب
                          </th>
                          <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">
                            الرصيد
                          </th>
                          <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">
                            ملاحظات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {typeAccounts.map((account) => (
                          <tr
                            key={account.id}
                            className="border-t border-border last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-medium">
                                {account.code}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                  {account.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`text-sm font-semibold ${
                                  account.balance >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {formatCurrency(account.balance)}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-sm text-muted-foreground">
                              {account.notes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي الأرصدة</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                إضافة حساب
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
                  اسم الحساب *
                </label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    نوع الحساب *
                  </label>
                  <select
                    value={newAccount.type}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, type: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="asset">أصول</option>
                    <option value="liability">التزامات</option>
                    <option value="equity">حقوق ملكية</option>
                    <option value="revenue">إيرادات</option>
                    <option value="expense">مصروفات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    حساب أب
                  </label>
                  <select
                    value={newAccount.parentCode}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        parentCode: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">بدون حساب أب</option>
                    {accounts
                      .filter((a) => a.type === newAccount.type)
                      .map((a) => (
                        <option key={a.id} value={a.code}>
                          {a.code} - {a.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  الرصيد الأولي
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newAccount.balance}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, balance: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ملاحظات
                </label>
                <textarea
                  value={newAccount.notes}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, notes: e.target.value })
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
                  إضافة حساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
