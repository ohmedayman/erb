"use client";

import { Receipt, Store } from "lucide-react";
import DataTable from "./DataTable";

interface InvoicesManagerProps {
  invoices: any[];
  stores: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-500/20 text-green-400",
  unpaid: "bg-amber-500/20 text-amber-400",
  partial: "bg-blue-500/20 text-blue-400",
  overdue: "bg-red-500/20 text-red-400",
};

export default function InvoicesManager({ invoices, stores, onEdit, onDelete }: InvoicesManagerProps) {
  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store?.name || "غير محدد";
  };

  const columns = [
    {
      key: "invoice_number",
      label: "رقم الفاتورة",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-white font-medium">{item.invoice_number}</span>
        </div>
      ),
    },
    { key: "customer_name", label: "العميل" },
    {
      key: "total",
      label: "الإجمالي",
      render: (item: any) => <span className="text-orange-400 font-bold">{item.total?.toLocaleString()} ج.م</span>,
    },
    {
      key: "paid_amount",
      label: "المدفوع",
      render: (item: any) => <span className="text-green-400">{item.paid_amount?.toLocaleString() || 0} ج.م</span>,
    },
    {
      key: "payment_status",
      label: "الحالة",
      render: (item: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.payment_status || item.status] || "bg-slate-500/20 text-slate-400"}`}>
          {item.payment_status === "paid" ? "مدفوعة" : item.payment_status === "partial" ? "جزئي" : item.payment_status === "overdue" ? "متأخرة" : "غير مدفوعة"}
        </span>
      ),
    },
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
      render: (item: any) => new Date(item.created_at).toLocaleDateString("ar-EG"),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">الفواتير</h2>
        <p className="text-slate-400 text-sm">{invoices.length} فاتورة من كل المتاجر</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        <DataTable
          columns={columns}
          data={invoices}
          searchKeys={["invoice_number", "customer_name"]}
          searchPlaceholder="بحث برقم الفاتورة أو اسم العميل..."
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
