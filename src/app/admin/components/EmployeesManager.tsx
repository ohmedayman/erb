"use client";

import { UserCog, Store } from "lucide-react";
import DataTable from "./DataTable";

interface EmployeesManagerProps {
  employees: any[];
  stores: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export default function EmployeesManager({ employees, stores, onEdit, onDelete }: EmployeesManagerProps) {
  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store?.name || "غير محدد";
  };

  const columns = [
    {
      key: "name",
      label: "الموظف",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <UserCog className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <p className="text-white font-medium">{item.name}</p>
            <p className="text-slate-400 text-xs">{item.position}</p>
          </div>
        </div>
      ),
    },
    { key: "department", label: "القسم" },
    { key: "phone", label: "الهاتف" },
    { key: "email", label: "البريد", hideOnMobile: true },
    {
      key: "salary",
      label: "الراتب",
      render: (item: any) => <span className="text-orange-400 font-bold">{item.salary?.toLocaleString() || "-"} ج.م</span>,
    },
    {
      key: "status",
      label: "الحالة",
      render: (item: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === "active" || !item.status ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
          {item.status === "active" || !item.status ? "نشط" : "غير نشط"}
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
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">الموظفين</h2>
        <p className="text-slate-400 text-sm">{employees.length} موظف من كل المتاجر</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        <DataTable
          columns={columns}
          data={employees}
          searchKeys={["name", "phone", "email", "department"]}
          searchPlaceholder="بحث بالاسم أو القسم..."
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}