"use client";

import { useState } from "react";
import { Search, Filter, Eye, ChevronDown } from "lucide-react";

const orders = [
  { id: "#ORD-7891", customer: "Ahmed Hassan", items: 5, total: "$1,250", status: "Shipped", date: "2026-08-04", payment: "Paid" },
  { id: "#ORD-7890", customer: "Sara Mohamed", items: 3, total: "$890", status: "Processing", date: "2026-08-04", payment: "Paid" },
  { id: "#ORD-7889", customer: "Omar Ali", items: 8, total: "$2,100", status: "Delivered", date: "2026-08-03", payment: "Paid" },
  { id: "#ORD-7888", customer: "Fatima Youssef", items: 2, total: "$560", status: "Pending", date: "2026-08-03", payment: "Pending" },
  { id: "#ORD-7887", customer: "Khaled Ibrahim", items: 12, total: "$3,400", status: "Shipped", date: "2026-08-02", payment: "Paid" },
  { id: "#ORD-7886", customer: "Nour Abdullah", items: 6, total: "$780", status: "Delivered", date: "2026-08-02", payment: "Paid" },
  { id: "#ORD-7885", customer: "Youssef Kamal", items: 4, total: "$1,650", status: "Cancelled", date: "2026-08-01", payment: "Refunded" },
  { id: "#ORD-7884", customer: "Mona Saleh", items: 7, total: "$2,340", status: "Delivered", date: "2026-08-01", payment: "Paid" },
];

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = orders.filter(
    (o) =>
      (o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "All" || o.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage all customer orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: "847", color: "text-foreground" },
          { label: "Pending", value: "23", color: "text-yellow-600" },
          { label: "Shipped", value: "45", color: "text-purple-600" },
          { label: "Delivered", value: "762", color: "text-green-600" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Order ID
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Items
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Total
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Payment
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Date
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
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
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {order.items} items
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">
                    {order.total}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[order.status] || "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-sm font-medium ${
                        paymentColors[order.payment] || ""
                      }`}
                    >
                      {order.payment}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {order.date}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
