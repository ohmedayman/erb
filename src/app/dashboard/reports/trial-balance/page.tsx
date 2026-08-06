"use client";

import { useState, useEffect } from "react";
import {
  Scale,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";

interface TrialBalanceRow {
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}

export default function TrialBalancePage() {
  const [rows, setRows] = useState<TrialBalanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const filters = user.storeId
        ? [{ field: "storeId", op: "==", value: user.storeId }]
        : [];

      const [accountsData, journalData, invoicesData, expensesData] = await Promise.all([
        getDocsFromCollection("accounts", filters),
        getDocsFromCollection("journalEntries", filters),
        getDocsFromCollection("invoices", filters),
        getDocsFromCollection("expenses", filters),
      ]);

      const yearFilter = (item: any) => {
        const d = new Date(item.createdAt || item.date || "");
        return d.getFullYear() === selectedYear;
      };

      const filteredJournal = journalData.filter(yearFilter);
      const filteredInvoices = invoicesData.filter(yearFilter);
      const filteredExpenses = expensesData.filter(yearFilter);

      const accountMap: Record<string, TrialBalanceRow> = {};

      accountsData.forEach((a: any) => {
        accountMap[a.code] = {
          code: a.code,
          name: a.name,
          type: a.type,
          debit: 0,
          credit: 0,
        };
      });

      filteredJournal.forEach((entry: any) => {
        if (entry.lines) {
          entry.lines.forEach((line: any) => {
            if (!accountMap[line.accountCode]) {
              accountMap[line.accountCode] = {
                code: line.accountCode,
                name: line.accountName || line.accountCode,
                type: "other",
                debit: 0,
                credit: 0,
              };
            }
            accountMap[line.accountCode].debit += parseFloat(line.debit) || 0;
            accountMap[line.accountCode].credit += parseFloat(line.credit) || 0;
          });
        }
      });

      filteredInvoices.forEach((inv: any) => {
        const revenueCode = "4001";
        if (!accountMap[revenueCode]) {
          accountMap[revenueCode] = { code: revenueCode, name: "إيرادات المبيعات", type: "revenue", debit: 0, credit: 0 };
        }
        accountMap[revenueCode].credit += inv.total || 0;

        if (inv.status === "paid") {
          const cashCode = "1001";
          if (!accountMap[cashCode]) {
            accountMap[cashCode] = { code: cashCode, name: "النقدية", type: "asset", debit: 0, credit: 0 };
          }
          accountMap[cashCode].debit += inv.total || 0;
        } else {
          const receivableCode = "1101";
          if (!accountMap[receivableCode]) {
            accountMap[receivableCode] = { code: receivableCode, name: "المدينون", type: "asset", debit: 0, credit: 0 };
          }
          accountMap[receivableCode].debit += inv.total || 0;
        }
      });

      filteredExpenses.forEach((exp: any) => {
        const expenseCode = exp.category === "rent" ? "5001" : exp.category === "salaries" ? "5002" : exp.category === "utilities" ? "5003" : "5099";
        const expenseName = exp.category === "rent" ? "إيجار" : exp.category === "salaries" ? "رواتب" : exp.category === "utilities" ? "مرافق" : "مصروفات أخرى";

        if (!accountMap[expenseCode]) {
          accountMap[expenseCode] = { code: expenseCode, name: expenseName, type: "expense", debit: 0, credit: 0 };
        }
        accountMap[expenseCode].debit += exp.amount || 0;

        const cashCode = "1001";
        if (!accountMap[cashCode]) {
          accountMap[cashCode] = { code: cashCode, name: "النقدية", type: "asset", debit: 0, credit: 0 };
        }
        accountMap[cashCode].credit += exp.amount || 0;
      });

      const rowsList = Object.values(accountMap).filter(
        (r) => r.debit > 0 || r.credit > 0 || accountsData.some((a: any) => a.code === r.code)
      );

      rowsList.sort((a, b) => a.code.localeCompare(b.code));

      setRows(rowsList);
      setTotalDebit(rowsList.reduce((s, r) => s + r.debit, 0));
      setTotalCredit(rowsList.reduce((s, r) => s + r.credit, 0));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const typeLabels: Record<string, string> = {
    asset: "أصول",
    liability: "التزامات",
    equity: "حقوق ملكية",
    revenue: "إيرادات",
    expense: "مصروفات",
    other: "أخرى",
  };

  const typeColors: Record<string, string> = {
    asset: "bg-green-100 text-green-700",
    liability: "bg-red-100 text-red-700",
    equity: "bg-blue-100 text-blue-700",
    revenue: "bg-purple-100 text-purple-700",
    expense: "bg-orange-100 text-orange-700",
    other: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ميزان المراجعة</h1>
          <p className="text-muted-foreground text-sm mt-1">
            التحقق من توازن القيود المحاسبية - مجموع المدين = مجموع الدائن
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>
      </div>

      {/* Balance Status */}
      <div className={`rounded-xl border-2 p-5 ${isBalanced ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        <div className="flex items-center gap-3">
          {isBalanced ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-600" />
          )}
          <div>
            <p className={`text-lg font-bold ${isBalanced ? "text-green-700" : "text-red-700"}`}>
              {isBalanced ? "الميزان متوازن" : "الميزان غير متوازن"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isBalanced
                ? "مجموع المدين يساوي مجموع الدائن"
                : `فرق: ${formatCurrency(Math.abs(totalDebit - totalCredit))}`}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">م</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">اجمالي المدين</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalDebit)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">د</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">اجمالي الدائن</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totalCredit)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">عدد الحسابات</p>
              <p className="text-lg font-bold text-blue-600">{rows.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Balance Table */}
      {loading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">بيتحمّل...</div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">كود الحساب</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">اسم الحساب</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">النوع</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">مدين</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">دائن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-sm">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-medium">
                        {row.code}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{row.name}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[row.type] || "bg-gray-100 text-gray-700"}`}>
                        {typeLabels[row.type] || row.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-green-600">
                      {row.debit > 0 ? formatCurrency(row.debit) : "-"}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-red-600">
                      {row.credit > 0 ? formatCurrency(row.credit) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 border-t-2 border-foreground/10">
                <td colSpan={3} className="px-5 py-3 text-sm font-bold text-foreground">المجموع</td>
                <td className="px-5 py-3 text-sm font-bold text-green-600">{formatCurrency(totalDebit)}</td>
                <td className="px-5 py-3 text-sm font-bold text-red-600">{formatCurrency(totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
