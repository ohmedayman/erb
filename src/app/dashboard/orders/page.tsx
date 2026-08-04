"use client";

import { useState, useEffect } from "react";
import { Search, Eye, ChevronDown } from "lucide-react";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then(setOrders).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(
    (o) => (o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.customerName?.toLowerCase().includes(search.toLowerCase())) && (statusFilter === "All" || o.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">Track and manage all customer orders</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: orders.length, color: "text-foreground" },
          { label: "Pending", value: orders.filter((o) => o.status === "Pending").length, color: "text-yellow-600" },
          { label: "Shipped", value: orders.filter((o) => o.status === "Shipped").length, color: "text-purple-600" },
          { label: "Delivered", value: orders.filter((o) => o.status === "Delivered").length, color: "text-green-600" },
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none px-4 py-2 pr-8 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option>All</option><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option>
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
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Order ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Items</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Total</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Payment</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-sm">No orders found</td></tr>
              ) : (
                filtered.map((order, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{order.orderNumber}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{order.customerName}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{order.items} items</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">${order.total}</td>
                    <td className="px-5 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || ""}`}>{order.status}</span></td>
                    <td className="px-5 py-3"><span className={`text-sm font-medium ${paymentColors[order.payment] || ""}`}>{order.payment}</span></td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</td>
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
