"use client";

import {
  Package,
  ShoppingCart,
  Truck,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    label: "Total Products",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Package,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Pending Orders",
    value: "342",
    change: "-8.2%",
    trend: "down",
    icon: ShoppingCart,
    color: "bg-orange-50 text-orange-600",
  },
  {
    label: "In Transit",
    value: "1,205",
    change: "+5.1%",
    trend: "up",
    icon: Truck,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Active Users",
    value: "89",
    change: "+23.0%",
    trend: "up",
    icon: Users,
    color: "bg-purple-50 text-purple-600",
  },
];

const recentOrders = [
  { id: "#ORD-7891", customer: "Ahmed Hassan", status: "Shipped", total: "$1,250", date: "2 min ago" },
  { id: "#ORD-7890", customer: "Sara Mohamed", status: "Processing", total: "$890", date: "15 min ago" },
  { id: "#ORD-7889", customer: "Omar Ali", status: "Delivered", total: "$2,100", date: "1 hour ago" },
  { id: "#ORD-7888", customer: "Fatima Youssef", status: "Pending", total: "$560", date: "2 hours ago" },
  { id: "#ORD-7887", customer: "Khaled Ibrahim", status: "Shipped", total: "$3,400", date: "3 hours ago" },
];

const topProducts = [
  { name: "Electronics Bundle", sku: "ELC-001", stock: 450, sold: 120 },
  { name: "Office Supplies Pack", sku: "OFS-023", stock: 890, sold: 95 },
  { name: "Home Appliances Set", sku: "HAP-045", stock: 120, sold: 88 },
  { name: "Industrial Tools Kit", sku: "ITK-067", stock: 340, sold: 76 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here&apos;s an overview of your warehouse.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Orders</h2>
            <button className="text-sm text-primary hover:text-primary-hover transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Order ID
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Total
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
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
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "Delivered"
                            ? "bg-green-50 text-green-600"
                            : order.status === "Shipped"
                            ? "bg-blue-50 text-blue-600"
                            : order.status === "Processing"
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {order.total}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Top Products</h2>
            <button className="text-sm text-primary hover:text-primary-hover transition-colors">
              View All
            </button>
          </div>
          <div className="p-5 space-y-4">
            {topProducts.map((product, i) => (
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
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {product.stock}
                  </p>
                  <p className="text-xs text-muted-foreground">in stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">
          Orders Overview
        </h2>
        <div className="h-64 bg-muted/30 rounded-xl flex items-center justify-center border border-border">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Analytics chart coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
