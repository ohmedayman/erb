"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle, Search, Filter } from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const products = await getDocsFromCollection("products", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
        const inventory = products.map((p: any) => ({
          name: p.name,
          sku: p.sku,
          warehouse: p.warehouse || "المستودع الرئيسي",
          stock: p.stock || 0,
          min: p.minStock || 10,
          status: (p.stock || 0) <= (p.minStock || 10) ? ((p.stock || 0) <= 5 ? "Critical" : "Low") : "Healthy",
        }));
        setInventory(inventory);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filtered = inventory.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase()) || item.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStock = inventory.reduce((a, b) => a + b.stock, 0);
  const lowItems = inventory.filter((i) => i.status === "Low" || i.status === "Critical").length;
  const criticalItems = inventory.filter((i) => i.status === "Critical").length;

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    Healthy: { bg: "bg-green-50", text: "text-green-600", label: "سليم" },
    Low: { bg: "bg-yellow-50", text: "text-yellow-600", label: "قليل" },
    Critical: { bg: "bg-red-50", text: "text-red-600", label: "خطر" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">المخزون</h1>
        <p className="text-muted-foreground text-sm mt-1">مستويات المخزون على طول في كل المخازن</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">اجمالي وحدات المخزون</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? "..." : totalStock.toLocaleString("ar-EG")}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">تنبيهات المخزون القليل</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{loading ? "..." : lowItems}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">خطورة حرجة</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{loading ? "..." : criticalItems}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">اجمالي المنتجات</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? "..." : inventory.length}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث بالاسم أو الكود..."
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
              <option value="Healthy">سليم</option>
              <option value="Low">قليل</option>
              <option value="Critical">خطر</option>
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">مستويات المخزون</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المنتج</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الكود</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المخزن</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المخزون</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحد الأدنى</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-4">
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">
                  {search ? "مفيش نتايج للبحث ده" : "مفيش بيانات مخزون"}
                </td></tr>
              ) : (
                filtered.map((item, i) => {
                  const cfg = statusConfig[item.status] || statusConfig.Healthy;
                  return (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground" /></div>
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{item.sku}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{item.warehouse}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{item.stock}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{item.min}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          {item.status === "Critical" && <AlertTriangle className="w-3 h-3" />} {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
