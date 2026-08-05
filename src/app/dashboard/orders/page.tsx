"use client";

import { useState, useEffect } from "react";
import { Search, Eye, ChevronDown, Plus, X, Package } from "lucide-react";
import { getDocsFromCollection, addDocToCollection } from "@/lib/localdb";
import { toast } from "@/components/Toast";

const statusColors: Record<string, string> = {
  Pending: "bg-orange-100 text-orange-700 border border-orange-200",
  Processing: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Shipped: "bg-blue-100 text-blue-700 border border-blue-200",
  Delivered: "bg-green-100 text-green-700 border border-green-200",
  Cancelled: "bg-red-100 text-red-700 border border-red-200",
};

const paymentColors: Record<string, string> = {
  Paid: "text-green-600",
  Pending: "text-yellow-600",
  Refunded: "text-red-600",
};

const statusLabels: Record<string, string> = {
  Pending: "معلّق",
  Processing: "بيتعالج",
  Shipped: "اتشحن",
  Delivered: "اتسلّم",
  Cancelled: "ملغي",
};

const paymentLabels: Record<string, string> = {
  Paid: "مدفوع",
  Pending: "معلّق",
  Refunded: "مسترجع",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    items: 1,
    total: "",
    status: "Pending",
    payment: "Pending",
  });

  useEffect(() => {
    const fetchOrders = () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const fetchedOrders = getDocsFromCollection(
          "orders",
          user.storeId
            ? [{ field: "storeId", op: "==", value: user.storeId }]
            : []
        );
        setOrders(fetchedOrders);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter(
    (o) =>
      (o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "All" || o.status === statusFilter)
  );

  const handleAddOrder = () => {
    if (!newOrder.customerName || !newOrder.total) return;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      addDocToCollection("orders", {
        orderNumber,
        customerName: newOrder.customerName,
        items: Number(newOrder.items) || 1,
        total: Number(newOrder.total),
        status: newOrder.status,
        payment: newOrder.payment,
        date: new Date().toISOString(),
        storeId: user.storeId || "",
      });
      const updatedOrders = getDocsFromCollection(
        "orders",
        user.storeId
          ? [{ field: "storeId", op: "==", value: user.storeId }]
          : []
      );
      setOrders(updatedOrders);
      setShowModal(false);
      setNewOrder({
        customerName: "",
        items: 1,
        total: "",
        status: "Pending",
        payment: "Pending",
      });
      toast.success("تم إضافة الأوردر بنجاح");
    } catch {
      toast.error("فيه مشكلة حصلت");
    }
  };

  const statCards = [
    {
      label: "إجمالي الأوردرات",
      value: orders.length,
      color: "text-foreground",
    },
    {
      label: "معلّق",
      value: orders.filter((o) => o.status === "Pending").length,
      color: "text-orange-600",
    },
    {
      label: "اتشحن",
      value: orders.filter((o) => o.status === "Shipped").length,
      color: "text-blue-600",
    },
    {
      label: "اتسلّم",
      value: orders.filter((o) => o.status === "Delivered").length,
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الأوردرات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            تتبّع وإدارة جميع أوردرات الزبائن
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover-lift animate-fade-in-up stagger-2"
        >
          <Plus className="w-4 h-4" />
          أوردر جديد
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div
            key={i}
            className={`bg-card rounded-xl border border-border p-4 hover-lift animate-fade-in-up stagger-${i + 1}`}
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>
              {loading ? "..." : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4 animate-fade-in-up stagger-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث في الأوردرات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-4 py-2 pl-8 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="All">الكل</option>
              <option value="Pending">معلّق</option>
              <option value="Processing">بيتعالج</option>
              <option value="Shipped">اتشحن</option>
              <option value="Delivered">اتسلّم</option>
              <option value="Cancelled">ملغي</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in-up stagger-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  رقم الأوردر
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الزبون
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  العناصر
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  المجموع
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الحالة
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الدفع
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  التاريخ
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-muted-foreground text-sm"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>بيتحمّل...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12">
                    <div className="flex flex-col items-center gap-4 animate-fade-in">
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                        <Package className="w-10 h-10 text-muted-foreground/50" />
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground font-medium">
                          مفيش أوردرات
                        </p>
                        <p className="text-muted-foreground/60 text-sm mt-1">
                          {search
                            ? "مفيش نتايج للبحث ده"
                            : "ابدأ بإضافة أوردر جديد"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order, i) => (
                  <tr
                    key={order.id || i}
                    className={`table-row-enter border-b border-border last:border-0 hover:bg-muted/50 transition-all duration-200 cursor-pointer`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {order.customerName}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {order.items} عناصر
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      ${order.total}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300 ${statusColors[order.status] || ""}`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-sm font-medium ${paymentColors[order.payment] || ""}`}
                      >
                        {paymentLabels[order.payment] || order.payment}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("ar-EG")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="modal-enter relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">
                أوردر جديد
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  اسم الزبون
                </label>
                <input
                  type="text"
                  placeholder="اسم الزبون..."
                  value={newOrder.customerName}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, customerName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    عدد العناصر
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newOrder.items}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, items: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    المجموع ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0.00"
                    value={newOrder.total}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, total: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    الحالة
                  </label>
                  <select
                    value={newOrder.status}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, status: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Pending">معلّق</option>
                    <option value="Processing">بيتعالج</option>
                    <option value="Shipped">اتشحن</option>
                    <option value="Delivered">اتسلّم</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    الدفع
                  </label>
                  <select
                    value={newOrder.payment}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, payment: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Pending">معلّق</option>
                    <option value="Paid">مدفوع</option>
                    <option value="Refunded">مسترجع</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddOrder}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover-lift transition-colors"
              >
                إضافة الأوردر
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
