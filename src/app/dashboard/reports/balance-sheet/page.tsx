"use client";

import { useState, useEffect } from "react";
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Download,
} from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";
import { generateReportPDF } from "@/lib/pdf-export";

interface BalanceSheetData {
  currentAssets: { name: string; amount: number }[];
  nonCurrentAssets: { name: string; amount: number }[];
  currentLiabilities: { name: string; amount: number }[];
  nonCurrentLiabilities: { name: string; amount: number }[];
  equity: { name: string; amount: number }[];
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;
  totalEquity: number;
}

export default function BalanceSheetPage() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

      const [accountsData, invoicesData, expensesData, productsData, ordersData] = await Promise.all([
        getDocsFromCollection("accounts", filters),
        getDocsFromCollection("invoices", filters),
        getDocsFromCollection("expenses", filters),
        getDocsFromCollection("products", filters),
        getDocsFromCollection("orders", filters),
      ]);

      const yearFilter = (item: any) => {
        const d = new Date(item.createdAt || item.date || "");
        return d.getFullYear() === selectedYear;
      };

      const filteredInvoices = invoicesData.filter(yearFilter);
      const filteredExpenses = expensesData.filter(yearFilter);
      const filteredOrders = ordersData.filter(yearFilter);

      const totalRevenue = filteredInvoices.reduce((s: number, i: any) => s + (i.total || 0), 0);
      const totalExpenses = filteredExpenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const netProfit = totalRevenue - totalExpenses;

      const inventoryValue = productsData.reduce((s: number, p: any) => s + ((p.cost || 0) * (p.stock || 0)), 0);
      const totalReceivables = filteredInvoices.filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + (i.total || 0), 0);
      const cashInHand = totalRevenue - totalExpenses;
      const totalPayables = filteredExpenses.filter((e: any) => e.status !== "paid").reduce((s: number, e: any) => s + (e.amount || 0), 0);

      const accountBalances = accountsData.reduce((acc: Record<string, number>, a: any) => {
        acc[a.type] = (acc[a.type] || 0) + (a.balance || 0);
        return acc;
      }, {});

      const currentAssets = [
        { name: "النقدية والبنوك", amount: Math.max(0, cashInHand) },
        { name: "المخزون", amount: inventoryValue },
        { name: "المدينون (الزبائن)", amount: totalReceivables },
        { name: "أصول متداولة أخرى", amount: accountBalances.asset || 0 },
      ].filter((a) => a.amount > 0);

      const nonCurrentAssets = [
        { name: "أصول ثابتة", amount: 0 },
      ].filter((a) => a.amount > 0);

      const currentLiabilities = [
        { name: "الدائنون (الموردين)", amount: totalPayables },
        { name: "ضرائب مستحقة", amount: 0 },
        { name: "أقساط مستحقة", amount: filteredOrders.filter((o: any) => o.status !== "paid").reduce((s: number, o: any) => s + (o.total || 0), 0) },
      ].filter((l) => l.amount > 0);

      const nonCurrentLiabilities = [
        { name: "قروض طويلة الأجل", amount: 0 },
      ].filter((l) => l.amount > 0);

      const equityItems = [
        { name: "رأس المال", amount: 0 },
        { name: "أرباح محتجزة", amount: Math.max(0, netProfit) },
      ].filter((e) => e.amount > 0);

      const totalCurrentAssets = currentAssets.reduce((s, a) => s + a.amount, 0);
      const totalNonCurrentAssets = nonCurrentAssets.reduce((s, a) => s + a.amount, 0);
      const totalCurrentLiabilities = currentLiabilities.reduce((s, l) => s + l.amount, 0);
      const totalNonCurrentLiabilities = nonCurrentLiabilities.reduce((s, l) => s + l.amount, 0);
      const totalEquity = equityItems.reduce((s, e) => s + e.amount, 0);

      setData({
        currentAssets,
        nonCurrentAssets,
        currentLiabilities,
        nonCurrentLiabilities,
        equity: equityItems,
        totalCurrentAssets,
        totalNonCurrentAssets,
        totalAssets: totalCurrentAssets + totalNonCurrentAssets,
        totalCurrentLiabilities,
        totalNonCurrentLiabilities,
        totalLiabilities: totalCurrentLiabilities + totalNonCurrentLiabilities,
        totalEquity,
      });
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const renderSection = (title: string, items: { name: string; amount: number }[], total: number, color: string) => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className={`px-5 py-4 border-b border-border ${color}`}>
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {items.length === 0 ? (
          <div className="px-5 py-4 text-center text-muted-foreground text-sm">لا توجد بيانات</div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
              <span className="text-sm text-foreground">{item.name}</span>
              <span className="text-sm font-semibold text-foreground">{formatCurrency(item.amount)}</span>
            </div>
          ))
        )}
        <div className={`flex items-center justify-between px-5 py-3 ${color} border-t-2 border-foreground/10`}>
          <span className="text-sm font-bold text-foreground">المجموع</span>
          <span className="text-sm font-bold text-foreground">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الميزانية العمومية</h1>
          <p className="text-muted-foreground text-sm mt-1">
            الأصول = الالتزامات + حقوق الملكية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => {
              if (data) {
                const allItems = [
                  ...data.currentAssets.map(i => ({ name: i.name, amount: i.amount, type: "أصول متداولة" })),
                  ...data.nonCurrentAssets.map(i => ({ name: i.name, amount: i.amount, type: "أصول غير متداولة" })),
                  ...data.currentLiabilities.map(i => ({ name: i.name, amount: i.amount, type: "التزامات متداولة" })),
                  ...data.equity.map(i => ({ name: i.name, amount: i.amount, type: "حقوق الملكية" })),
                ];
                generateReportPDF("الميزانية العمومية", allItems, ["name", "amount", "type"]);
              }
            }}
            className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">بيتحمّل...</div>
      ) : !data ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">مفيش بيانات</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">اجمالي الأصول</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(data.totalAssets)}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">اجمالي الالتزامات</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(data.totalLiabilities)}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">حقوق الملكية</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(data.totalEquity)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assets */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" /> الأصول
              </h2>
              {renderSection("الأصول المتداولة", data.currentAssets, data.totalCurrentAssets, "bg-green-50")}
              {renderSection("الأصول غير المتداولة", data.nonCurrentAssets, data.totalNonCurrentAssets, "bg-green-50")}
              <div className="bg-green-50 rounded-xl border-2 border-green-200 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">اجمالي الأصول</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(data.totalAssets)}</span>
                </div>
              </div>
            </div>

            {/* Liabilities + Equity */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" /> الالتزامات وحقوق الملكية
              </h2>
              {renderSection("الالتزامات المتداولة", data.currentLiabilities, data.totalCurrentLiabilities, "bg-red-50")}
              {renderSection("الالتزامات غير المتداولة", data.nonCurrentLiabilities, data.totalNonCurrentLiabilities, "bg-red-50")}
              {renderSection("حقوق الملكية", data.equity, data.totalEquity, "bg-blue-50")}
              <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">اجمالي الالتزامات + حقوق الملكية</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(data.totalLiabilities + data.totalEquity)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Check */}
          <div className={`rounded-xl border-2 p-5 ${
            Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)) < 0.01
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)) < 0.01
                    ? "bg-green-100" : "bg-red-100"
                }`}>
                  <DollarSign className={`w-5 h-5 ${
                    Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)) < 0.01
                      ? "text-green-600" : "text-red-600"
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">فحص التوازن</p>
                  <p className={`text-sm font-bold ${
                    Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)) < 0.01
                      ? "text-green-700" : "text-red-700"
                  }`}>
                    {Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)) < 0.01
                      ? "الميزانية متوازنة"
                      : `فرق: ${formatCurrency(Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)))}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
