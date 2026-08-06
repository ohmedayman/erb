"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  MinusCircle,
  PlusCircle,
  X,
  Check,
} from "lucide-react";
import { getDocsFromCollection, addDocToCollection } from "@/lib/localdb";

interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: string;
  credit: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    lines: [
      { accountCode: "", accountName: "", debit: "", credit: "" },
      { accountCode: "", accountName: "", debit: "", credit: "" },
    ] as JournalLine[],
  });

  const fetchEntries = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const filters = user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : [];
      const entriesData = await getDocsFromCollection("journalEntries", filters);
      const accountsData = await getDocsFromCollection("accounts", filters);
      setEntries(entriesData);
      setAccounts(accountsData);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const filtered = entries.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.date.includes(search)
  );

  const totalDebit = newEntry.lines.reduce(
    (sum, l) => sum + (parseFloat(l.debit) || 0),
    0
  );
  const totalCredit = newEntry.lines.reduce(
    (sum, l) => sum + (parseFloat(l.credit) || 0),
    0
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  const addLine = () => {
    setNewEntry({
      ...newEntry,
      lines: [
        ...newEntry.lines,
        { accountCode: "", accountName: "", debit: "", credit: "" },
      ],
    });
  };

  const removeLine = (index: number) => {
    if (newEntry.lines.length <= 2) return;
    setNewEntry({
      ...newEntry,
      lines: newEntry.lines.filter((_, i) => i !== index),
    });
  };

  const updateLine = (
    index: number,
    field: keyof JournalLine,
    value: string
  ) => {
    const updated = [...newEntry.lines];
    if (field === "accountCode") {
      const account = accounts.find((a) => a.code === value);
      updated[index] = {
        ...updated[index],
        accountCode: value,
        accountName: account?.name || "",
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setNewEntry({ ...newEntry, lines: updated });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const formattedLines = newEntry.lines.map((l) => ({
      accountCode: l.accountCode,
      accountName: l.accountName,
      debit: parseFloat(l.debit) || 0,
      credit: parseFloat(l.credit) || 0,
    }));

    await addDocToCollection("journalEntries", {
      date: newEntry.date,
      description: newEntry.description,
      entries: formattedLines,
      totalDebit,
      totalCredit,
      status: "draft",
      storeId: user.storeId,
    });
    setShowModal(false);
    setNewEntry({
      date: new Date().toISOString().split("T")[0],
      description: "",
      lines: [
        { accountCode: "", accountName: "", debit: "", credit: "" },
        { accountCode: "", accountName: "", debit: "", credit: "" },
      ],
    });
    fetchEntries();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    if (status === "posted") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <Check className="w-3 h-3" />
          مرحل
        </span>
      );
    }
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        مسودة
      </span>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">القيود اليومية</h1>
          <p className="text-muted-foreground text-sm mt-1">
            تسجيل القيود المحاسبية
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> قيد جديد
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث في القيود..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  التاريخ
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الوصف
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  المدين
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الدائن
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    بيتحمّل...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    مفيش قيود
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-foreground">
                      {entry.date}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {entry.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-red-600">
                        {formatCurrency(entry.totalDebit)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(entry.totalCredit)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {getStatusBadge(entry.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                قيد جديد
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
                    التاريخ *
                  </label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    الوصف *
                  </label>
                  <input
                    type="text"
                    value={newEntry.description}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    القيود الفرعية
                  </label>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1 text-primary text-xs font-medium hover:underline"
                  >
                    <PlusCircle className="w-4 h-4" /> اضف سطر
                  </button>
                </div>

                {newEntry.lines.map((line, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="col-span-4">
                      {index === 0 && (
                        <label className="block text-xs text-muted-foreground mb-1">
                          الحساب
                        </label>
                      )}
                      <select
                        value={line.accountCode}
                        onChange={(e) =>
                          updateLine(index, "accountCode", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      >
                        <option value="">اختر حساب</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.code}>
                            {a.code} - {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      {index === 0 && (
                        <label className="block text-xs text-muted-foreground mb-1">
                          مدين
                        </label>
                      )}
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        value={line.debit}
                        onChange={(e) =>
                          updateLine(index, "debit", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="col-span-3">
                      {index === 0 && (
                        <label className="block text-xs text-muted-foreground mb-1">
                          دائن
                        </label>
                      )}
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        value={line.credit}
                        onChange={(e) =>
                          updateLine(index, "credit", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      {index === 0 && (
                        <label className="block text-xs text-transparent mb-1">
                          حذف
                        </label>
                      )}
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        disabled={newEntry.lines.length <= 2}
                        className="p-2 text-muted-foreground hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      اجمالي المدين
                    </span>
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(totalDebit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      اجمالي الدائن
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(totalCredit)}
                    </span>
                  </div>
                </div>
                <div>
                  {isBalanced ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <Check className="w-3 h-3" /> متوازن
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      غير متوازن
                    </span>
                  )}
                </div>
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
                  disabled={!isBalanced}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  حفظ القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
