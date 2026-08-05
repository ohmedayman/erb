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
  Delivered: "تم التوصيل",
  Shipped: "تم الشحن",
  Processing: "قيد المعالجة",
  Pending: "معلق",
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const products = getDocsFromCollection("products", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
        const orders = getDocsFromCollection("orders", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
        const customers = getDocsFromCollection("customers", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
        const invoices = getDocsFromCollection("invoices", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
        const expenses = getDocsFromCollection("expenses", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
        
        const totalProducts = products.length;
        const pendingOrders = orders.filter((o: any) => o.status === "Pending").length;
        const totalCustomers = customers.length;
        const totalInvoices = invoices.length;
        const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        const netProfit = totalInvoices - totalExpenses;
        
        const recentOrders = orders.slice(0, 5);
        const recentInvoices = invoices.slice(0, 5);
        const topProducts = products.slice(0, 5);
        
        const monthlyExpenses = expenses.slice(0, 6).map((e: any) => ({
          month: new Date(e.date).toLocaleDateString("ar-SA", { month: "short" }),
          amount: e.amount || 0,
        }));

        setData({
          stats: {
            totalProducts,
            pendingOrders,
          },
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

  const stats = [
    {
      label: "إجمالي المنتجات",
      value: data?.stats?.totalProducts ?? 0,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      change: "+12.5%",
      trend: "up" as const,
    },
    {
      label: "الطلبات المعلقة",
      value: data?.stats?.pendingOrders ?? 0,
      icon: ShoppingCart,
      color: "bg-orange-50 text-orange-600",
      change: "-8.2%",
      trend: "down" as const,
    },
    {
      label: "الفواتير",
      value: data?.totalInvoices ?? 0,
      icon: FileText,
      color: "bg-indigo-50 text-indigo-600",
      change: "+5.0%",
      trend: "up" as const,
    },
    {
      label: "المصروفات",
      value: data?.totalExpenses ?? 0,
      icon: CreditCard,
      color: "bg-red-50 text-red-600",
      isCurrency: true,
      change: "-3.1%",
      trend: "down" as const,
    },
    {
      label: "صافي الربح",
      value: data?.netProfit ?? 0,
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      isCurrency: true,
      change: "+18.7%",
      trend: "up" as const,
    },
    {
      label: "العملاء",
      value: data?.totalCustomers ?? 0,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      change: "+23.0%",
      trend: "up" as const,
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-50 text-green-600";
      case "Shipped":
        return "bg-blue-50 text-blue-600";
      case "Processing":
        return "bg-yellow-50 text-yellow-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("ar-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-muted-foreground text-sm mt-1">
          مرحباً بعودتك! إليك نظرة عامة على مخزنك.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-500"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">
                {loading
                  ? "..."
                  : stat.isCurrency
                    ? formatCurrency(stat.value)
                    : stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">الطلبات الأخيرة</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    رقم الطلب
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    العميل
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    الحالة
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    المجموع
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-muted-foreground text-sm"
                    >
                      جاري التحميل...
                    </td>
                  </tr>
                ) : data?.recentOrders?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-muted-foreground text-sm"
                    >
                      لا توجد طلبات بعد
                    </td>
                  </tr>
                ) : (
                  data?.recentOrders?.map((order: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        {order.id}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {order.customer}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}
                        >
                          {statusMap[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        {order.total}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">أفضل المنتجات</h2>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center">
                جاري التحميل...
              </p>
            ) : data?.topProducts?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                لا توجد منتجات بعد
              </p>
            ) : (
              data?.topProducts?.map((product: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {product.stock}
                    </p>
                    <p className="text-xs text-muted-foreground">في المخزون</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">الفواتير الأخيرة</h2>
            <span className="text-xs text-muted-foreground">
              إجمالي الفواتير: {data?.totalInvoices ?? 0}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    رقم الفاتورة
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    العميل
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    الحالة
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    المجموع
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-muted-foreground text-sm"
                    >
                      جاري التحميل...
                    </td>
                  </tr>
                ) : data?.recentInvoices?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-muted-foreground text-sm"
                    >
                      لا توجد فواتير بعد
                    </td>
                  </tr>
                ) : (
                  data?.recentInvoices?.map((invoice: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {invoice.customerName}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === "paid"
                              ? "bg-green-50 text-green-600"
                              : invoice.status === "partial"
                                ? "bg-yellow-50 text-yellow-600"
                                : "bg-red-50 text-red-600"
                          }`}
                        >
                          {invoice.status === "paid"
                            ? "مدفوعة"
                            : invoice.status === "partial"
                              ? "جزئي"
                              : "غير مدفوعة"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        {invoice.total?.toLocaleString("ar-SA")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Expenses Summary */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              ملخص المصروفات الشهرية
            </h2>
            <span className="text-xs text-muted-foreground">
              إجمالي: {formatCurrency(data?.totalExpenses ?? 0)}
            </span>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                جاري التحميل...
              </p>
            ) : !data?.monthlyExpenses?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد مصروفات بعد
              </p>
            ) : (
              <div className="space-y-3">
                {data.monthlyExpenses.map((item: any, i: number) => {
                  const maxAmount = Math.max(
                    ...data.monthlyExpenses.map((e: any) => e.amount),
                    1
                  );
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20 text-left shrink-0">
                        {item.month}
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                        <div
                          className="bg-red-400 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(
                              (item.amount / maxAmount) * 100,
                              item.amount > 0 ? 4 : 0
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-24 text-left shrink-0">
                        {item.amount.toLocaleString("ar-SA")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
