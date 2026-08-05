"use client";

import { ShoppingCart, Store } from "lucide-react";
import DataTable from "./DataTable";

interface OrdersManagerProps {
  orders: any[];
  stores: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Completed: "bg-green-500/20 text-green-400",
  Pending: "bg-amber-500/20 text-amber-400",
  Cancelled: "bg-red-500/20 text-red-400",
  Processing: "bg-blue-500/20 text-blue-400",
};

const STATUS_LABELS: Record<string, string> = {
  Completed: "مكتمل",
  Pending: "معلق",
  Cancelled: "ملغي",
  Processing: "قيد التنفيذ",
};

export default function OrdersManager({ orders, stores, onEdit, onDelete }: OrdersManagerProps) {
  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store?.name || "غير محدد";
  };

  const columns = [
    {
      key: "order_number",
      label: "رقم الأوردر",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-white font-medium">{item.order_number}</span>
        </div>
      ),
    },
    { key: "customer_name", label: "العميل" },
    {
      key: "total",
      label: "المبلغ",
      render: (item: any) => <span className="text-orange-400 font-bold">{item.total?.toLocaleString()} ج.م</span>,
    },
    {
      key: "status",
      label: "الحالة",
      render: (item: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || "bg-slate-500/20 text-slate-400"}`}>
          {STATUS_LABELS[item.status] || item.status}
        </span>
      ),
    },
    { key: "payment", label: "الدفع", hideOnMobile: true },
    {
      key: "store_id",
      label: "المتجر",
      render: (item: any) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
          <Store className="w-3 h-3" />
          {getStoreName(item.store_id)}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "created_at",
      label: "التاريخ",
      render: (item: any) => new Date(item.created_at || item.date).toLocaleDateString("ar-EG"),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">الأوردرات</h2>
        <p className="text-slate-400 text-sm">{orders.length} أوردر من كل المتاجر</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        <DataTable
          columns={columns}
          data={orders}
          searchKeys={["order_number", "customer_name"]}
          searchPlaceholder="بحث برقم الأوردر أو اسم العميل..."
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
