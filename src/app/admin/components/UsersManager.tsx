"use client";

import { Users, Shield, User } from "lucide-react";
import DataTable from "./DataTable";

interface UsersManagerProps {
  users: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export default function UsersManager({ users, onEdit, onDelete }: UsersManagerProps) {
  const columns = [
    {
      key: "full_name",
      label: "الاسم",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.role === "admin" ? "bg-orange-500/20" : "bg-slate-600/50"}`}>
            {item.role === "admin" ? <Shield className="w-4 h-4 text-orange-400" /> : <User className="w-4 h-4 text-slate-400" />}
          </div>
          <span className="text-white font-medium">{item.full_name}</span>
        </div>
      ),
    },
    { key: "email", label: "البريد" },
    { key: "phone", label: "الهاتف" },
    {
      key: "role",
      label: "الدور",
      render: (item: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.role === "admin" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"}`}>
          {item.role === "admin" ? "مدير" : "مستخدم"}
        </span>
      ),
    },
    {
      key: "subscription_status",
      label: "الاشتراك",
      render: (item: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.subscription_status === "active" ? "bg-green-500/20 text-green-400" : item.subscription_status === "approved" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
          {item.subscription_status === "active" ? "نشط" : item.subscription_status === "approved" ? "مقبول" : item.subscription_status || "جديد"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "تاريخ التسجيل",
      render: (item: any) => new Date(item.created_at).toLocaleDateString("ar-EG"),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">إدارة المستخدمين</h2>
        <p className="text-slate-400 text-sm">{users.length} مستخدم مسجل</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        <DataTable
          columns={columns}
          data={users}
          searchKeys={["full_name", "email", "phone"]}
          searchPlaceholder="بحث بالاسم أو البريد..."
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}