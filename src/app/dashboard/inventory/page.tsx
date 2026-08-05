"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle } from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const products = getDocsFromCollection("products", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
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

  const totalStock = inventory.reduce((a, b) => a + b.stock, 0);
  const lowItems = inventory.filter((i) => i.status === "Low" || i.status === "Critical").length;

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">اجمالي وحدات المخزون</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? "..." : totalStock.toLocaleString("ar-SA")}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">تنبيهات المخزون القليل</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{loading ? "..." : lowItems}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">اجمالي المنتجات</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? "..." : inventory.length}</p>
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
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">بيتحمّل...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">مفيش بيانات مخزون</td></tr>
              ) : (
                inventory.map((item, i) => {
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
