"use client";

import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Insights and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: "$48,290", change: "+15.2%", trend: "up" },
          { label: "Orders", value: "847", change: "+8.5%", trend: "up" },
          { label: "Avg. Order Value", value: "$57.02", change: "+3.1%", trend: "up" },
          { label: "Return Rate", value: "2.4%", change: "-0.8%", trend: "down" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <span className={`flex items-center gap-0.5 text-xs font-medium mb-1 ${s.trend === "up" ? "text-green-600" : "text-red-500"}`}>
                {s.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Revenue Over Time</h2>
          <div className="h-64 bg-muted/30 rounded-xl flex items-center justify-center border border-border">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Chart visualization</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Order Status Distribution</h2>
          <div className="h-64 bg-muted/30 rounded-xl flex items-center justify-center border border-border">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Chart visualization</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Top Performing Products</h2>
        <div className="space-y-4">
          {[
            { name: "Electronics Bundle", revenue: "$12,400", units: 420, growth: "+18%" },
            { name: "Office Supplies Pack", revenue: "$8,900", units: 890, growth: "+12%" },
            { name: "Home Appliances Set", revenue: "$6,200", units: 180, growth: "+8%" },
            { name: "Industrial Tools Kit", revenue: "$4,100", units: 95, growth: "+5%" },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <span className="text-sm font-medium text-foreground">{p.revenue}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${100 - i * 20}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{p.units} units sold</span>
                  <span className="text-xs text-green-600">{p.growth}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
