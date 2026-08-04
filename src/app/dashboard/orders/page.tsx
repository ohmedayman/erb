"use client";

import { useState, useEffect } from "react";
import { Search, Eye, ChevronDown } from "lucide-react";
import { auth } from "@/lib/firebase";

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-600",
  Processing: "bg-blue-50 text-blue-600",
  Shipped: "bg-purple-50 text-purple-600",
  Delivered: "bg-green-50 text-green-600",
  Cancelled: "bg-red-50 text-red-600",
};

const paymentColors: Record<string, string> = {
  Paid: "text-green-600",
  Pending: "text-yellow-600",
  Refunded: "text-red-600",
};

const statusLabels: Record<string, string> = {
  Pending: "معلق",
  Processing: "قيد المعالجة",
  Shipped: "تم الشحن",
  Delivered: "تم التوصيل",
  Cancelled: "ملغي",
};

const paymentLabels: Record<string, string> = {
  Paid: "مدفوع",
  Pending: "معلق",
  Refunded: "مسترجع",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrders(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter(
    (o) => (o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.customerName?.toLowerCase().includes(search.toLowerCase())) && (statusFilter === "All" || o.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الطلبات</h1>
        <p className="text-muted-foreground text-sm mt-1">تتبع وإدارة جميع طلبات العملاء</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلبات", value: orders.length, color: "text-foreground" },
          { label: "معلق", value: orders.filter((o) => o.status === "Pending").length, color: "text-yellow-600" },
          { label: "تم الشحن", value: orders.filter((o) => o.status === "Shipped").length, color: "text-purple-600" },
          { label: "تم التوصيل", value: orders.filter((o) => o.status === "Delivered").length, color: "text-green-600" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="البحث في الطلبات..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none px-4 py-2 pl-8 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="All">الكل</option><option value="Pending">معلق</option><option value="Processing">قيد المعالجة</option><option value="Shipped">تم الشحن</option><option value="Delivered">تم التوصيل</option><option value="Cancelled">ملغي</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">رقم الطلب</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">العميل</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">العناصر</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المجموع</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الدفع</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-sm">جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-sm">لم يتم العثور على طلبات</td></tr>
              ) : (
                filtered.map((order, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{order.orderNumber}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{order.customerName}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{order.items} عناصر</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">${order.total}</td>
                    <td className="px-5 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || ""}`}>{statusLabels[order.status] || order.status}</span></td>
                    <td className="px-5 py-3"><span className={`text-sm font-medium ${paymentColors[order.payment] || ""}`}>{paymentLabels[order.payment] || order.payment}</span></td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString("ar-SA")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
