"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, Truck, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Products", value: data?.stats?.totalProducts ?? 0, icon: Package, color: "bg-blue-50 text-blue-600", change: "+12.5%", trend: "up" as const },
    { label: "Pending Orders", value: data?.stats?.pendingOrders ?? 0, icon: ShoppingCart, color: "bg-orange-50 text-orange-600", change: "-8.2%", trend: "down" as const },
    { label: "In Transit", value: data?.stats?.inTransit ?? 0, icon: Truck, color: "bg-green-50 text-green-600", change: "+5.1%", trend: "up" as const },
    { label: "Active Users", value: data?.stats?.activeUsers ?? 0, icon: Users, color: "bg-purple-50 text-purple-600", change: "+23.0%", trend: "up" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here&apos;s an overview of your warehouse.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-500"}`}>
                {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{loading ? "..." : stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Order ID</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">Loading...</td></tr>
                ) : data?.recentOrders?.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">No orders yet</td></tr>
                ) : (
                  data?.recentOrders?.map((order: any, i: number) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{order.id}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{order.customer}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === "Delivered" ? "bg-green-50 text-green-600" : order.status === "Shipped" ? "bg-blue-50 text-blue-600" : order.status === "Processing" ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-600"}`}>
                          {order.status}
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

        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Top Products</h2>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center">Loading...</p>
            ) : data?.topProducts?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No products yet</p>
            ) : (
              data?.topProducts?.map((product: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{product.stock}</p>
                    <p className="text-xs text-muted-foreground">in stock</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
