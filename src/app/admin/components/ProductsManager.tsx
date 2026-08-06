"use client";

import { Package, Store } from "lucide-react";
import DataTable from "./DataTable";
import ExportButton from "./ExportButton";

interface ProductsManagerProps {
  products: any[];
  stores: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export default function ProductsManager({ products, stores, onEdit, onDelete }: ProductsManagerProps) {
  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store?.name || "غير محدد";
  };

  const columns = [
    {
      key: "name",
      label: "المنتج",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-medium">{item.name}</p>
            <p className="text-slate-400 text-xs">{item.sku}</p>
          </div>
        </div>
      ),
    },
    { key: "category", label: "الفئة" },
    {
      key: "price",
      label: "السعر",
      render: (item: any) => <span className="text-orange-400 font-bold">{item.price?.toLocaleString()} ج.م</span>,
    },
    {
      key: "cost_price",
      label: "التكلفة",
      render: (item: any) => <span className="text-slate-300">{item.cost_price?.toLocaleString() || "-"} ج.م</span>,
    },
    {
      key: "stock",
      label: "المخزون",
      render: (item: any) => (
        <span className={`font-bold ${(item.stock || 0) === 0 ? "text-red-400" : (item.stock || 0) <= (item.min_stock || 10) ? "text-amber-400" : "text-green-400"}`}>
          {item.stock || 0}
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
      key: "status",
      label: "الحالة",
      render: (item: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === "active" || !item.status ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}`}>
          {item.status === "active" || !item.status ? "نشط" : item.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">المنتجات</h2>
        <p className="text-slate-400 text-sm">{products.length} منتج من كل المتاجر</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        <DataTable
          columns={columns}
          data={products}
          searchKeys={["name", "sku", "category"]}
          searchPlaceholder="بحث بالاسم أو الكود أو الفئة..."
          onEdit={onEdit}
          onDelete={onDelete}
          headerAction={<ExportButton data={products} filename="products" />}
        />
      </div>
    </div>
  );
}
