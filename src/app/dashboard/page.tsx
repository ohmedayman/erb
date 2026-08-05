"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Truck,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";
const statusMap: Record<string, string> = {
  Delivered: "اتسلّم",
  Shipped: "اتشحن",
  Processing: "بيتعالج",
  Pending: "معلّق",
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<any>(null);
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    const storedPrefs = JSON.parse(localStorage.getItem("user_prefs") || "null");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setPrefs(storedPrefs);
    setStoreName(storedPrefs?.storeName || user.storeName || "");

    const fetchData = async () => {
      try {
        const features: string[] = storedPrefs?.features || [];
        const sid = user.storeId;
        const f = (field: string) => sid ? [{ field: "storeId", op: "==", value: sid }] : [];

        const products = features.includes("products") ? getDocsFromCollection("products", f("storeId")) : [];
        const orders = features.includes("orders") ? getDocsFromCollection("orders", f("storeId")) : [];
        const customers = features.includes("customers") ? getDocsFromCollection("customers", f("storeId")) : [];
        const invoices = features.includes("invoices") ? getDocsFromCollection("invoices", f("storeId")) : [];
        const expenses = features.includes("expenses") ? getDocsFromCollection("expenses", f("storeId")) : [];
        
        const totalProducts = products.length;
        const pendingOrders = orders.filter((o: any) => o.status === "Pending").length;
        const totalCustomers = customers.length;
        const totalInvoices = invoices.length;
        const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        const totalRevenue = invoices.reduce((sum: number, i: any) => sum + (i.total || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        
        const recentOrders = orders.slice(0, 5);
        const recentInvoices = invoices.slice(0, 5);
        const topProducts = products.slice(0, 5);
        
        const monthlyExpenses = expenses.slice(0, 6).map((e: any) => ({
          month: new Date(e.date).toLocaleDateString("ar-SA", { month: "short" }),
          amount: e.amount || 0,
        }));

        setData({
          stats: { totalProducts, pendingOrders },
          totalInvoices,
          totalExpenses,
          netProfit,
          totalCustomers,
          recentOrders,
          recentInvoices,
          topProducts,
          monthlyExpenses,
        });
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features: string[] = prefs?.features || [];
  const has = (f: string) => features.includes(f);

  const allStats = [
    has("products") && { label: "عدد المنتجات الكلي", value: data?.stats?.totalProducts ?? 0, icon: Package, color: "bg-blue-50 text-blue-600" },
    has("orders") && { label: "الطلبات المعلّقة", value: data?.stats?.pendingOrders ?? 0, icon: ShoppingCart, color: "bg-orange-50 text-orange-600" },
    has("invoices") && { label: "الفواتير", value: data?.totalInvoices ?? 0, icon: FileText, color: "bg-indigo-50 text-indigo-600" },
    has("expenses") && { label: "المصروفات", value: data?.totalExpenses ?? 0, icon: CreditCard, color: "bg-red-50 text-red-600", isCurrency: true },
    has("expenses") && { label: "الربح الصافي", value: data?.netProfit ?? 0, icon: TrendingUp, color: "bg-green-50 text-green-600", isCurrency: true },
    has("customers") && { label: "الزبائن", value: data?.totalCustomers ?? 0, icon: Users, color: "bg-purple-50 text-purple-600" },
  ].filter(Boolean);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-50 text-green-600";
      case "Shipped": return "bg-blue-50 text-blue-600";
      case "Processing": return "bg-yellow-50 text-yellow-600";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground animate-fade-in-down">البورد{storeName ? ` — ${storeName}` : ""}</h1>
        <p className="text-muted-foreground text-sm mt-1 animate-fade-in stagger-1">أهلاً بيك تاني! شوف شغلك من هنا.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {allStats.map((stat: any, i: number) => (
          <div key={i} className={`bg-card rounded-xl p-5 border border-border hover:shadow-md transition-shadow animate-fade-in-up stagger-${i + 1} hover-lift`}>
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">
                {loading ? "..." : stat.isCurrency ? formatCurrency(stat.value) : stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {(has("orders") || has("products")) && (
        <div className="grid lg:grid-cols-3 gap-6">
          {has("orders") && (
            <div className="lg:col-span-2 bg-card rounded-xl border border-border animate-fade-in hover-lift">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">آخر الطلبات</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">رقم الطلب</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">العميل</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">بيتحمّل...</td></tr>
                    ) : data?.recentOrders?.length === 0 ? (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">مفيش طلبات لسه</td></tr>
                    ) : (
                      data?.recentOrders?.map((order: any, i: number) => (
                        <tr key={i} className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors table-row-enter stagger-${i + 1}`}>
                          <td className="px-5 py-3 text-sm font-medium text-foreground">{order.orderNumber || order.id}</td>
                          <td className="px-5 py-3 text-sm text-muted-foreground">{order.customerName}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                              {statusMap[order.status] || order.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm font-medium text-foreground">{order.total}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {has("products") && (
            <div className="bg-card rounded-xl border border-border animate-fade-in hover-lift">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">أحسن المنتجات</h2>
              </div>
              <div className="p-5 space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center">بيتحمّل...</p>
                ) : data?.topProducts?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">مفيش منتجات لسه</p>
                ) : (
                  data?.topProducts?.map((product: any, i: number) => (
                    <div key={i} className={`flex items-center gap-3 animate-fade-in-right stagger-${i + 1}`}>
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{product.stock}</p>
                        <p className="text-xs text-muted-foreground">في المخزون</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {(has("invoices") || has("expenses")) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {has("invoices") && (
            <div className="bg-card rounded-xl border border-border animate-fade-in hover-lift">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">آخر الفواتير</h2>
                <span className="text-xs text-muted-foreground">توتال: {data?.totalInvoices ?? 0}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">رقم الفاتورة</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">العميل</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">بيتحمّل...</td></tr>
                    ) : data?.recentInvoices?.length === 0 ? (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">مفيش فواتير لسه</td></tr>
                    ) : (
                      data?.recentInvoices?.map((invoice: any, i: number) => (
                        <tr key={i} className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors table-row-enter stagger-${i + 1}`}>
                          <td className="px-5 py-3 text-sm font-medium text-foreground">{invoice.invoiceNumber}</td>
                          <td className="px-5 py-3 text-sm text-muted-foreground">{invoice.customerName}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              invoice.status === "paid" ? "bg-green-50 text-green-600" : invoice.status === "partial" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                            }`}>
                              {invoice.status === "paid" ? "اتدفعت" : invoice.status === "partial" ? "جزئي" : "مش مدفوعة"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm font-medium text-foreground">{invoice.total?.toLocaleString("ar-SA")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {has("expenses") && (
            <div className="bg-card rounded-xl border border-border animate-fade-in hover-lift">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">ملخص المصروفات الشهري</h2>
                <span className="text-xs text-muted-foreground">الإجمالي: {formatCurrency(data?.totalExpenses ?? 0)}</span>
              </div>
              <div className="p-5">
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">بيتحمّل...</p>
                ) : !data?.monthlyExpenses?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-4">مفيش مصروفات لسه</p>
                ) : (
                  <div className="space-y-3">
                    {data.monthlyExpenses.map((item: any, i: number) => {
                      const maxAmount = Math.max(...data.monthlyExpenses.map((e: any) => e.amount), 1);
                      return (
                        <div key={i} className={`flex items-center gap-3 animate-fade-in-right stagger-${i + 1}`}>
                          <span className="text-xs text-muted-foreground w-20 text-left shrink-0">{item.month}</span>
                          <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                            <div className="bg-red-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max((item.amount / maxAmount) * 100, item.amount > 0 ? 4 : 0)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-foreground w-24 text-left shrink-0">{item.amount.toLocaleString("ar-SA")}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
