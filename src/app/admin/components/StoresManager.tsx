"use client";

import { Store, CheckCircle, XCircle } from "lucide-react";
import DataTable from "./DataTable";

interface StoresManagerProps {
  stores: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export default function StoresManager({ stores, onEdit, onDelete }: StoresManagerProps) {
  const columns = [
    {
      key: "name",
      label: "اسم المتجر",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Store className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-white font-medium">{item.name}</span>
        </div>
      ),
    },
    { key: "owner_name", label: "صاحب المتجر" },
    { key: "owner_email", label: "البريد" },
    { key: "phone", label: "الهاتف" },
    { key: "city", label: "المدينة" },
    { key: "currency", label: "العملة" },
    {
      key: "onboarding_done",
      label: "الحالة",
      render: (item: any) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${item.onboarding_done ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
          {item.onboarding_done ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {item.onboarding_done ? "نشط" : "جديد"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "تاريخ الإنشاء",
      render: (item: any) => new Date(item.created_at).toLocaleDateString("ar-EG"),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">إدارة المتاجر</h2>
        <p className="text-slate-400 text-sm">{stores.length} متجر مسجل</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        <DataTable
          columns={columns}
          data={stores}
          searchKeys={["name", "owner_name", "owner_email", "city"]}
          searchPlaceholder="بحث بالاسم أو البريد أو المدينة..."
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
