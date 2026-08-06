"use client";

import { useState, useEffect } from "react";
import { Truck, Package, MapPin, Clock, Search, Download, RotateCcw } from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";
import { exportToExcel } from "@/lib/excel";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

const statusColors: Record<string, string> = {
  "In Transit": "bg-blue-50 text-blue-600",
  Delivered: "bg-green-50 text-green-600",
  Processing: "bg-yellow-50 text-yellow-600",
  Returned: "bg-red-50 text-red-600",
};

const statusLabels: Record<string, string> = {
  "In Transit": "قيد الشحن",
  Delivered: "تم التوصيل",
  Processing: "قيد المعالجة",
  Returned: "مرتجع",
};

export default function ShippingPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const data = await getDocsFromCollection("shipments", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
        setShipments(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  const filtered = shipments.filter((s) => {
    const matchesSearch = s.shipmentNumber?.toLowerCase().includes(search.toLowerCase()) || s.order?.toLowerCase().includes(search.toLowerCase()) || s.carrier?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الشحن</h1>
          <p className="text-muted-foreground text-sm mt-1">تتبع الشحنات و إدارة التوصيلات</p>
        </div>
        <button onClick={() => exportToExcel(shipments.map(s => ({ shipmentNumber: s.shipmentNumber, order: s.order, carrier: s.carrier, origin: s.origin, destination: s.destination, eta: s.eta, status: s.status })), "shipping", "الشحنات")} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
          <Download className="w-4 h-4" /> تصدير
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "قيد الشحن", value: shipments.filter((s) => s.status === "In Transit").length, icon: Truck, color: "bg-blue-50 text-blue-600" },
          { label: "قيد المعالجة", value: shipments.filter((s) => s.status === "Processing").length, icon: Package, color: "bg-yellow-50 text-yellow-600" },
          { label: "تم التوصيل", value: shipments.filter((s) => s.status === "Delivered").length, icon: MapPin, color: "bg-green-50 text-green-600" },
          { label: "الإجمالي", value: shipments.length, icon: Clock, color: "bg-purple-50 text-purple-600" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-foreground">{loading ? "..." : s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث برقم الشحنة أو الطلب أو شركة الشحن..."
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
              <option value="all">الكل</option>
              <option value="In Transit">قيد الشحن</option>
              <option value="Processing">قيد المعالجة</option>
              <option value="Delivered">تم التوصيل</option>
              <option value="Returned">مرتجع</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h2 className="font-semibold text-foreground">ملخص الشحن</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الشحنة</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الطلب</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">شركة الشحن</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المسار</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">موعد الوصول</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-4">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">
                  {search ? "مفيش نتايج للبحث ده" : "مفيش شحنات"}
                </td></tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{s.shipmentNumber}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{s.order}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{s.carrier}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{s.origin} → {s.destination}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{s.eta}</td>
                    <td className="px-5 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] || ""}`}>{statusLabels[s.status] || s.status}</span></td>
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
