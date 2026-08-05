"use client";

import { Wallet, Store } from "lucide-react";
import DataTable from "./DataTable";

interface ExpensesManagerProps {
  expenses: any[];
  stores: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export default function ExpensesManager({ expenses, stores, onEdit, onDelete }: ExpensesManagerProps) {
  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store?.name || "غير محدد";
  };

  const columns = [
    {
      key: "description",
      label: "الوصف",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-white font-medium">{item.description}</span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "المبلغ",
      render: (item: any) => <span className="text-red-400 font-bold">{item.amount?.toLocaleString()} ج.م</span>,
    },
    { key: "category", label: "الفئة" },
    { key: "payment_method", label: "طريقة الدفع", hideOnMobile: true },
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
      key: "date",
      label: "التاريخ",
      render: (item: any) => new Date(item.date || item.created_at).toLocaleDateString("ar-EG"),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">المصروفات</h2>
        <p className="text-slate-400 text-sm">{expenses.length} مصروف من كل المتاجر</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        <DataTable
          columns={columns}
          data={expenses}
          searchKeys={["description", "category"]}
          searchPlaceholder="بحث بالوصف أو الفئة..."
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
