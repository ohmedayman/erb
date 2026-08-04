"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory").then((r) => r.json()).then(setInventory).finally(() => setLoading(false));
  }, []);

  const totalStock = inventory.reduce((a, b) => a + b.stock, 0);
  const lowItems = inventory.filter((i) => i.status === "Low" || i.status === "Critical").length;

  const statusConfig: Record<string, { bg: string; text: string }> = {
    Healthy: { bg: "bg-green-50", text: "text-green-600" },
    Low: { bg: "bg-yellow-50", text: "text-yellow-600" },
    Critical: { bg: "bg-red-50", text: "text-red-600" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time stock levels across all warehouses</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Total Stock Units</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? "..." : totalStock.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{loading ? "..." : lowItems}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? "..." : inventory.length}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Stock Levels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Product</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">SKU</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Warehouse</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Stock</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Min. Level</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">Loading...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">No inventory data</td></tr>
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
                          {item.status === "Critical" && <AlertTriangle className="w-3 h-3" />} {item.status}
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
