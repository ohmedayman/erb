"use client";

import { useState, useEffect } from "react";
import { Truck, Package, MapPin, Clock } from "lucide-react";

const statusColors: Record<string, string> = {
  "In Transit": "bg-blue-50 text-blue-600",
  Delivered: "bg-green-50 text-green-600",
  Processing: "bg-yellow-50 text-yellow-600",
  Returned: "bg-red-50 text-red-600",
};

export default function ShippingPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shipments").then((r) => r.json()).then(setShipments).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Shipping</h1>
        <p className="text-muted-foreground text-sm mt-1">Track shipments and manage deliveries</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "In Transit", value: shipments.filter((s) => s.status === "In Transit").length, icon: Truck, color: "bg-blue-50 text-blue-600" },
          { label: "Processing", value: shipments.filter((s) => s.status === "Processing").length, icon: Package, color: "bg-yellow-50 text-yellow-600" },
          { label: "Delivered", value: shipments.filter((s) => s.status === "Delivered").length, icon: MapPin, color: "bg-green-50 text-green-600" },
          { label: "Total", value: shipments.length, icon: Clock, color: "bg-purple-50 text-purple-600" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-foreground">{loading ? "..." : s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h2 className="font-semibold text-foreground">Recent Shipments</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Shipment</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Order</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Carrier</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Route</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">ETA</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">Loading...</td></tr>
              ) : shipments.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">No shipments yet</td></tr>
              ) : (
                shipments.map((s, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{s.shipmentNumber}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{s.order}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{s.carrier}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{s.origin} → {s.destination}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{s.eta}</td>
                    <td className="px-5 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] || ""}`}>{s.status}</span></td>
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
