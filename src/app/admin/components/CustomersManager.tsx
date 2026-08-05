"use client";

import { UserCircle, Store } from "lucide-react";
import DataTable from "./DataTable";

interface CustomersManagerProps {
  customers: any[];
  stores: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export default function CustomersManager({ customers, stores, onEdit, onDelete }: CustomersManagerProps) {
  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store?.name || "غير محدد";
  };

  const columns = [
    {
      key: "name",
      label: "العميل",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <UserCircle className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-white font-medium">{item.name}</span>
        </div>
      ),
    },
    { key: "phone", label: "الهاتف" },
    { key: "email", label: "البريد", hideOnMobile: true },
    {
      key: "balance",
      label: "الرصيد",
      render: (item: any) => <span className="text-orange-400">{(item.balance || 0).toLocaleString()} ج.م</span>,
    },
    { key: "type", label: "النوع", render: (item: any) => item.type === "individual" ? "فرد" : item.type || "فرد" },
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
        <h2 className="text-2xl font-bold text-white mb-1">الزبائن</h2>
        <p className="text-slate-400 text-sm">{customers.length} عميل من كل المتاجر</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        <DataTable
          columns={columns}
          data={customers}
          searchKeys={["name", "phone", "email"]}
          searchPlaceholder="بحث بالاسم أو البريد أو الهاتف..."
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
