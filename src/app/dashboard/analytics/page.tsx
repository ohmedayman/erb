"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: `$${(data?.revenue || 0).toLocaleString()}` },
          { label: "Total Orders", value: data?.totalOrders || 0 },
          { label: "Delivered", value: data?.deliveredOrders || 0 },
          { label: "Products", value: data?.stats?.totalProducts || 0 },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Revenue Over Time</h2>
          <div className="h-64 bg-muted/30 rounded-xl flex items-center justify-center border border-border">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Chart coming soon</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Order Status Distribution</h2>
          <div className="h-64 bg-muted/30 rounded-xl flex items-center justify-center border border-border">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Chart coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Top Products</h2>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center">Loading...</p>
          ) : data?.topProducts?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">No products yet</p>
          ) : (
            data?.topProducts?.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                    <span className="text-sm text-muted-foreground">{p.sku}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${Math.min(100, (p.stock / 500) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.stock} units in stock</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
