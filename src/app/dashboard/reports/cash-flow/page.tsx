"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Download,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";
import { generateReportPDF } from "@/lib/pdf-export";

interface CashFlowData {
  operating: { label: string; amount: number; type: "in" | "out" }[];
  investing: { label: string; amount: number; type: "in" | "out" }[];
  financing: { label: string; amount: number; type: "in" | "out" }[];
  totalOperating: number;
  totalInvesting: number;
  totalFinancing: number;
  netCashFlow: number;
  openingBalance: number;
  closingBalance: number;
}

const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export default function CashFlowPage() {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("year");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [period, selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const filters = user.storeId
        ? [{ field: "storeId", op: "==", value: user.storeId }]
        : [];

      const [ordersData, invoicesData, expensesData, productsData, paymentsData] = await Promise.all([
        getDocsFromCollection("orders", filters),
        getDocsFromCollection("invoices", filters),
        getDocsFromCollection("expenses", filters),
        getDocsFromCollection("products", filters),
        getDocsFromCollection("installments", filters),
      ]);

      const dateFilter = (item: any) => {
        const d = new Date(item.createdAt || item.date || "");
        if (period === "month") {
          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        }
        if (period === "quarter") {
          const q = Math.floor(d.getMonth() / 3);
          const sq = Math.floor(selectedMonth / 3);
          return q === sq && d.getFullYear() === selectedYear;
        }
        return d.getFullYear() === selectedYear;
      };

      const filteredInvoices = invoicesData.filter(dateFilter);
      const filteredExpenses = expensesData.filter(dateFilter);
      const filteredOrders = ordersData.filter(dateFilter);

      const totalRevenue = filteredInvoices.reduce((s: number, i: any) => s + (i.total || 0), 0);
      const totalPayments = paymentsData
        .filter((p: any) => p.status === "paid" && dateFilter(p))
        .reduce((s: number, p: any) => s + (p.amount || 0), 0);

      const supplierExpenses = filteredExpenses.filter((e: any) => e.category === "suppliers").reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const salaryExpenses = filteredExpenses.filter((e: any) => e.category === "salaries").reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const rentExpenses = filteredExpenses.filter((e: any) => e.category === "rent").reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const utilityExpenses = filteredExpenses.filter((e: any) => e.category === "utilities").reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const transportExpenses = filteredExpenses.filter((e: any) => e.category === "transport").reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const marketingExpenses = filteredExpenses.filter((e: any) => e.category === "marketing").reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const otherExpenses = filteredExpenses.filter((e: any) => !["suppliers", "salaries", "rent", "utilities", "transport", "marketing"].includes(e.category)).reduce((s: number, e: any) => s + (e.amount || 0), 0);

      const operatingItems: Array<{ label: string; amount: number; type: "in" | "out" }> = [
        { label: "إيرادات المبيعات", amount: totalRevenue, type: "in" },
        { label: "مدفوعات الزبائن", amount: totalPayments, type: "in" },
        { label: "مدفوعات الموردين", amount: supplierExpenses, type: "out" },
        { label: "رواتب وأجور", amount: salaryExpenses, type: "out" },
        { label: "إيجار", amount: rentExpenses, type: "out" },
        { label: "مرافق (كهرباء، مياه، غاز)", amount: utilityExpenses, type: "out" },
        { label: "شحن وتوصيل", amount: transportExpenses, type: "out" },
        { label: "تسويق وإعلان", amount: marketingExpenses, type: "out" },
        { label: "مصروفات أخرى", amount: otherExpenses, type: "out" },
      ];
      const operating = operatingItems.filter((i) => i.amount > 0);

      const totalOperating = operating.reduce((s, i) => s + (i.type === "in" ? i.amount : -i.amount), 0);

      const costOfGoods = filteredOrders.reduce((s: number, o: any) => {
        const product = productsData.find((p: any) => p.id === o.productId);
        return s + ((product?.cost || 0) * (o.quantity || 1));
      }, 0);

      const investingItems: Array<{ label: string; amount: number; type: "in" | "out" }> = [
        { label: "شراء معدات", amount: 0, type: "out" },
        { label: "شراء مخزون", amount: costOfGoods, type: "out" },
      ];
      const investing = investingItems.filter((i) => i.amount > 0);

      const totalInvesting = investing.reduce((s, i) => s + (i.type === "in" ? i.amount : -i.amount), 0);

      const paidInstallments = paymentsData.filter((p: any) => p.status === "paid" && dateFilter(p)).reduce((s: number, p: any) => s + (p.amount || 0), 0);
      const pendingInstallments = paymentsData.filter((p: any) => p.status === "pending" && dateFilter(p)).reduce((s: number, p: any) => s + (p.amount || 0), 0);

      const financingItems: Array<{ label: string; amount: number; type: "in" | "out" }> = [
        { label: "أقساط مدفوعة", amount: paidInstallments, type: "in" },
        { label: "أقساط مستحقة", amount: pendingInstallments, type: "out" },
      ];
      const financing = financingItems.filter((i) => i.amount > 0);

      const totalFinancing = financing.reduce((s, i) => s + (i.type === "in" ? i.amount : -i.amount), 0);

      const netCashFlow = totalOperating + totalInvesting + totalFinancing;

      setData({
        operating,
        investing,
        financing,
        totalOperating,
        totalInvesting,
        totalFinancing,
        netCashFlow,
        openingBalance: 0,
        closingBalance: netCashFlow,
      });
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getPeriodLabel = () => {
    if (period === "month") return `${monthNames[selectedMonth]} ${selectedYear}`;
    if (period === "quarter") return `Q${Math.floor(selectedMonth / 3) + 1} ${selectedYear}`;
    return `${selectedYear}`;
  };

  const renderSection = (title: string, items: { label: string; amount: number; type: "in" | "out" }[], total: number, color: string) => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className={`px-5 py-4 border-b border-border ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">{title}</h3>
          <span className={`text-sm font-bold ${total >= 0 ? "text-green-600" : "text-red-600"}`}>
            {total >= 0 ? "+" : ""}{formatCurrency(total)}
          </span>
        </div>
      </div>
      <div className="divide-y divide-border">
        {items.length === 0 ? (
          <div className="px-5 py-4 text-center text-muted-foreground text-sm">لا توجد بيانات</div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === "in" ? "bg-green-100" : "bg-red-100"}`}>
                  {item.type === "in" ? (
                    <ArrowDownCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowUpCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
              <span className={`text-sm font-semibold ${item.type === "in" ? "text-green-600" : "text-red-600"}`}>
                {item.type === "in" ? "+" : "-"}{formatCurrency(item.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">قائمة التدفقات النقدية</h1>
          <p className="text-muted-foreground text-sm mt-1">
            تحليل حركة النقديات - العمليات التشغيلية والاستثمارية والتمويلية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (data) {
                const allItems = [...data.operating, ...data.investing, ...data.financing];
                generateReportPDF("قائمة التدفقات النقدية", allItems.map(i => ({ name: i.label, amount: i.amount, type: i.type === "in" ? "وارد" : "صادر" })), ["name", "amount", "type"]);
              }
            }}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            <Download className="w-4 h-4" /> تصدير PDF
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["month", "quarter", "year"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === p ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "month" ? "شهري" : p === "quarter" ? "ربع سنوي" : "سنوي"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {monthNames.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">بيتحمّل...</div>
      ) : !data ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">مفيش بيانات</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">التدفقات التشغيلية</p>
                  <p className={`text-lg font-bold ${data.totalOperating >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(data.totalOperating)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">التدفقات الاستثمارية</p>
                  <p className={`text-lg font-bold ${data.totalInvesting >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(data.totalInvesting)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">التدفقات التمويلية</p>
                  <p className={`text-lg font-bold ${data.totalFinancing >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(data.totalFinancing)}
                  </p>
                </div>
              </div>
            </div>
            <div className={`bg-card rounded-xl border p-5 ${data.netCashFlow >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${data.netCashFlow >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                  <DollarSignIcon className={`w-5 h-5 ${data.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">صافي التدفق النقدي</p>
                  <p className={`text-lg font-bold ${data.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(data.netCashFlow)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          {renderSection("التدفقات النقدية من الأنشطة التشغيلية", data.operating, data.totalOperating, "bg-green-50")}
          {renderSection("التدفقات النقدية من الأنشطة الاستثمارية", data.investing, data.totalInvesting, "bg-blue-50")}
          {renderSection("التدفقات النقدية من الأنشطة التمويلية", data.financing, data.totalFinancing, "bg-purple-50")}

          {/* Net Cash Flow */}
          <div className={`rounded-xl border p-6 ${data.netCashFlow >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.netCashFlow >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                  <DollarSignIcon className={`w-6 h-6 ${data.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">صافي التدفق النقدي - {getPeriodLabel()}</p>
                  <p className={`text-2xl font-bold ${data.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {data.netCashFlow >= 0 ? "+" : ""}{formatCurrency(data.netCashFlow)}
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-bold ${data.netCashFlow >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {data.netCashFlow >= 0 ? "تدفق نقدي إيجابي" : "تدفق نقدي سلبي"}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DollarSignIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
