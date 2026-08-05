"use client";

import { useState } from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import DataTable from "./DataTable";

interface PlansManagerProps {
  plans: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onCreate: (plan: any) => void;
}

export default function PlansManager({ plans, onEdit, onDelete, onCreate }: PlansManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", price: 0, duration: 365, features: "", is_active: true });

  const handleCreate = () => {
    if (!newPlan.name || !newPlan.price) return;
    onCreate({
      ...newPlan,
      features: newPlan.features.split(",").map(f => f.trim()).filter(Boolean),
    });
    setNewPlan({ name: "", price: 0, duration: 365, features: "", is_active: true });
    setShowCreate(false);
  };

  const columns = [
    {
      key: "name",
      label: "اسم الخطة",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-white font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "السعر",
      render: (item: any) => <span className="text-orange-400 font-bold">{item.price?.toLocaleString()} ج.م</span>,
    },
    {
      key: "duration",
      label: "المدة",
      render: (item: any) => `${item.duration} يوم`,
    },
    {
      key: "features",
      label: "المميزات",
      render: (item: any) => (
        <div className="flex flex-wrap gap-1">
          {(item.features || []).slice(0, 3).map((f: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">{f}</span>
          ))}
          {(item.features || []).length > 3 && (
            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">+{item.features.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "الحالة",
      render: (item: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.is_active ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}`}>
          {item.is_active ? "نشط" : "معطل"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">خطط الاشتراك</h2>
          <p className="text-slate-400 text-sm">{plans.length} خطة</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          إضافة خطة
        </button>
      </div>

      {showCreate && (
        <div className="bg-[#1e293b] rounded-xl border border-orange-500/30 p-5 mb-6">
          <h3 className="text-white font-bold mb-4">خطة جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">اسم الخطة</label>
              <input value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" placeholder="مثلاً: StockFlow Pro" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">السعر (ج.م)</label>
              <input type="number" value={newPlan.price} onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">المدة (بالأيام)</label>
              <input type="number" value={newPlan.duration} onChange={(e) => setNewPlan({ ...newPlan, duration: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">المميزات (مفصولة بفاصلة)</label>
              <input value={newPlan.features} onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" placeholder="إدارة المنتجات,الفواتير,نقاط البيع" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">حفظ</button>
            <button onClick={() => setShowCreate(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">إلغاء</button>
          </div>
        </div>
      )}

      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        <DataTable
          columns={columns}
          data={plans}
          searchKeys={["name"]}
          searchPlaceholder="بحث باسم الخطة..."
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
