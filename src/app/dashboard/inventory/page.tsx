"use client";

import { Package, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

const inventory = [
  { name: "Wireless Mouse", sku: "WM-001", warehouse: "Main Warehouse", stock: 150, min: 50, status: "Healthy" },
  { name: "Office Chair", sku: "OC-023", warehouse: "Main Warehouse", stock: 45, min: 20, status: "Healthy" },
  { name: "USB Cable 2m", sku: "UC-045", warehouse: "Branch A", stock: 500, min: 100, status: "Healthy" },
  { name: "Standing Desk", sku: "SD-067", warehouse: "Main Warehouse", stock: 12, min: 15, status: "Low" },
  { name: "Monitor Stand", sku: "MS-089", warehouse: "Branch A", stock: 0, min: 10, status: "Critical" },
  { name: "Keyboard Pro", sku: "KP-101", warehouse: "Main Warehouse", stock: 200, min: 50, status: "Healthy" },
  { name: "Webcam HD", sku: "WC-123", warehouse: "Branch B", stock: 85, min: 30, status: "Healthy" },
  { name: "Desk Lamp", sku: "DL-145", warehouse: "Main Warehouse", stock: 320, min: 50, status: "Healthy" },
];

const statusConfig: Record<string, { bg: string; text: string }> = {
  Healthy: { bg: "bg-green-50", text: "text-green-600" },
  Low: { bg: "bg-yellow-50", text: "text-yellow-600" },
  Critical: { bg: "bg-red-50", text: "text-red-600" },
};

export default function InventoryPage() {
  const totalStock = inventory.reduce((a, b) => a + b.stock, 0);
  const lowItems = inventory.filter((i) => i.status === "Low" || i.status === "Critical").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time stock levels across all warehouses
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Total Stock Units</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalStock.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{lowItems}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Warehouses</p>
          <p className="text-2xl font-bold text-foreground mt-1">3</p>
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
              {inventory.map((item, i) => {
                const cfg = statusConfig[item.status];
                return (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{item.sku}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{item.warehouse}</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{item.stock}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{item.min}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                        {item.status === "Critical" && <AlertTriangle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
