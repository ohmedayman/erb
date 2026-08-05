"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Search } from "lucide-react";
import { getDocsFromCollection, addDocToCollection } from "@/lib/localdb";

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newOrder, setNewOrder] = useState({
    supplierName: "",
    items: "",
    total: "",
    expectedDate: "",
  });

  const fetchPurchaseOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const data = await getDocsFromCollection("purchaseOrders", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setPurchaseOrders(data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const filtered = purchaseOrders.filter(
    (po) =>
      po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      po.poNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    await addDocToCollection("purchaseOrders", {
      supplierName: newOrder.supplierName,
      items: parseInt(newOrder.items),
      total: parseFloat(newOrder.total),
      expectedDate: newOrder.expectedDate || undefined,
      status: "Pending",
      storeId: user.storeId,
    });
    setShowModal(false);
    setNewOrder({ supplierName: "", items: "", total: "", expectedDate: "" });
    fetchPurchaseOrders();
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "Pending":
        return "معلّق";
      case "Approved":
        return "اتوافق عليه";
      case "Delivered":
        return "اتوصّل";
      default:
        return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 text-yellow-600";
      case "Approved":
        return "bg-blue-50 text-blue-600";
      case "Delivered":
        return "bg-green-50 text-green-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">أوردرات الشراء</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة أوردرات الشراء من الموردين
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> اضف أوردر شراء
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث في أوردرات الشراء..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  رقم الطلب
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  المورد
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
                  التاريخ المتوقع
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    بيتحمّل...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    مفيش أوردرات شراء
                  </td>
                </tr>
              ) : (
                filtered.map((po) => (
                  <tr
                    key={po.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {po.poNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {po.supplierName}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {po.items}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      ${po.total}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(po.status)}`}
                      >
                        {statusLabel(po.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {po.expectedDate || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                اضف أوردر شراء
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  اسم المورد
                </label>
                <input
                  type="text"
                  value={newOrder.supplierName}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, supplierName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    عدد العناصر
                  </label>
                  <input
                    type="number"
                    value={newOrder.items}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, items: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    المبلغ الكلي
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOrder.total}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, total: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  التاريخ المتوقع
                </label>
                <input
                  type="date"
                  value={newOrder.expectedDate}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, expectedDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                   اضف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
