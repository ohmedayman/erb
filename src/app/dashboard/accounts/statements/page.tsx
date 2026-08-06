"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";

interface StatementEntry {
  id: string;
  date: string;
  description: string;
  type: "debit" | "credit";
  amount: number;
  balance: number;
  reference: string;
}

export default function AccountStatementsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [entries, setEntries] = useState<StatementEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [runningBalance, setRunningBalance] = useState(0);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchStatement();
    }
  }, [selectedAccount, dateFrom, dateTo]);

  const fetchAccounts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const filters = user.storeId
        ? [{ field: "storeId", op: "==", value: user.storeId }]
        : [];
      const accountsData = await getDocsFromCollection("accounts", filters);
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0].code);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const filters = user.storeId
        ? [{ field: "storeId", op: "==", value: user.storeId }]
        : [];

      const [journalData, invoicesData, expensesData] = await Promise.all([
        getDocsFromCollection("journalEntries", filters),
        getDocsFromCollection("invoices", filters),
        getDocsFromCollection("expenses", filters),
      ]);

      const account = accounts.find((a) => a.code === selectedAccount);
      if (!account) return;

      const accountEntries: StatementEntry[] = [];

      journalData.forEach((entry: any) => {
        if (entry.lines) {
          entry.lines.forEach((line: any) => {
            if (line.accountCode === selectedAccount) {
              const debit = parseFloat(line.debit) || 0;
              const credit = parseFloat(line.credit) || 0;
              accountEntries.push({
                id: entry.id,
                date: entry.date || entry.createdAt || "",
                description: entry.description || "قيد يومي",
                type: debit > 0 ? "debit" : "credit",
                amount: debit > 0 ? debit : credit,
                balance: 0,
                reference: entry.reference || entry.id?.slice(0, 8) || "",
              });
            }
          });
        }
      });

      if (selectedAccount.startsWith("4")) {
        invoicesData.forEach((inv: any) => {
          accountEntries.push({
            id: inv.id,
            date: inv.createdAt || inv.date || "",
            description: `فاتورة ${inv.invoiceNumber || ""} - ${inv.customerName || ""}`,
            type: "credit",
            amount: inv.total || 0,
            balance: 0,
            reference: inv.invoiceNumber || inv.id?.slice(0, 8) || "",
          });
        });
      }

      if (selectedAccount.startsWith("5")) {
        expensesData.forEach((exp: any) => {
          accountEntries.push({
            id: exp.id,
            date: exp.createdAt || exp.date || "",
            description: exp.description || exp.category || "مصروف",
            type: "debit",
            amount: exp.amount || 0,
            balance: 0,
            reference: exp.reference || exp.id?.slice(0, 8) || "",
          });
        });
      }

      if (selectedAccount === "1001") {
        invoicesData.filter((i: any) => i.status === "paid").forEach((inv: any) => {
          accountEntries.push({
            id: inv.id + "_cash",
            date: inv.createdAt || inv.date || "",
            description: `تحصيل فاتورة ${inv.invoiceNumber || ""}`,
            type: "debit",
            amount: inv.total || 0,
            balance: 0,
            reference: inv.invoiceNumber || "",
          });
        });
        expensesData.filter((e: any) => e.status === "paid").forEach((exp: any) => {
          accountEntries.push({
            id: exp.id + "_cash",
            date: exp.createdAt || exp.date || "",
            description: exp.description || exp.category || "صرف نقدي",
            type: "credit",
            amount: exp.amount || 0,
            balance: 0,
            reference: exp.reference || "",
          });
        });
      }

      accountEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let balance = account?.balance || 0;
      const processed = accountEntries.map((e) => {
        balance = e.type === "debit" ? balance + e.amount : balance - e.amount;
        return { ...e, balance };
      });

      let filtered = processed;
      if (dateFrom) {
        filtered = filtered.filter((e) => e.date >= dateFrom);
      }
      if (dateTo) {
        filtered = filtered.filter((e) => e.date <= dateTo);
      }

      setEntries(filtered);
      setRunningBalance(filtered.length > 0 ? filtered[filtered.length - 1].balance : balance);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.reference.toLowerCase().includes(search.toLowerCase())
  );

  const totalDebit = filteredEntries.filter((e) => e.type === "debit").reduce((s, e) => s + e.amount, 0);
  const totalCredit = filteredEntries.filter((e) => e.type === "credit").reduce((s, e) => s + e.amount, 0);

  const selectedAccountData = accounts.find((a) => a.code === selectedAccount);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">كشف حساب تفصيلي</h1>
          <p className="text-muted-foreground text-sm mt-1">
            تفاصيل حركات حساب محدد مع الأرصدة
          </p>
        </div>
      </div>

      {/* Account Selector */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">اختر الحساب</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">اختر حساب...</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.code}>{a.code} - {a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">من تاريخ</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {selectedAccountData && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">نوع الحساب</p>
            <p className="text-sm font-bold text-foreground mt-1">
              {selectedAccountData.type === "asset" ? "أصول" :
               selectedAccountData.type === "liability" ? "التزامات" :
               selectedAccountData.type === "equity" ? "حقوق ملكية" :
               selectedAccountData.type === "revenue" ? "إيرادات" :
               selectedAccountData.type === "expense" ? "مصروفات" : selectedAccountData.type}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">اجمالي المدين</p>
            <p className="text-sm font-bold text-green-600 mt-1">{formatCurrency(totalDebit)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">اجمالي الدائن</p>
            <p className="text-sm font-bold text-red-600 mt-1">{formatCurrency(totalCredit)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">الرصيد الحالي</p>
            <p className={`text-sm font-bold mt-1 ${runningBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(runningBalance)}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث في الحركات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Statement Table */}
      {loading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">بيتحمّل...</div>
      ) : !selectedAccount ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">اختر حساب لعرض كشف الحساب</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">التاريخ</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">البيان</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المرجع</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">مدين</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">دائن</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">
                    لا توجد حركات في هذا الحساب
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-muted-foreground">{formatDate(entry.date)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${entry.type === "debit" ? "bg-green-100" : "bg-red-100"}`}>
                          {entry.type === "debit" ? (
                            <ArrowDownCircle className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <ArrowUpCircle className="w-3.5 h-3.5 text-red-600" />
                          )}
                        </div>
                        <span className="text-sm text-foreground">{entry.description}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-mono text-muted-foreground">
                        {entry.reference}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-green-600">
                      {entry.type === "debit" ? formatCurrency(entry.amount) : "-"}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-red-600">
                      {entry.type === "credit" ? formatCurrency(entry.amount) : "-"}
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-foreground">
                      {formatCurrency(entry.balance)}
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
                <td className="px-5 py-3 text-sm font-bold text-foreground">{formatCurrency(runningBalance)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
