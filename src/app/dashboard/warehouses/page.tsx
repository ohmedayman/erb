"use client";

import { useState, useEffect } from "react";
import {
  Warehouse,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  User,
} from "lucide-react";
import { getDocsFromCollection, addDocToCollection, updateDocInCollection, deleteDocFromCollection } from "@/lib/localdb";
import { toast } from "@/components/Toast";
import { exportToExcel } from "@/lib/excel";
import { Download } from "lucide-react";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    capacity: "",
    manager: "",
    phone: "",
  });

  const fetchWarehouses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const data = await getDocsFromCollection("warehouses", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setWarehouses(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const filtered = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await addDocToCollection("warehouses", { ...newWarehouse, capacity: parseInt(newWarehouse.capacity) || 0, storeId: user.storeId });
      setShowModal(false);
      setNewWarehouse({
        name: "",
        code: "",
        address: "",
        city: "",
        capacity: "",
        manager: "",
        phone: "",
      });
      fetchWarehouses();
      toast.success("تم إضافة المستودع بنجاح");
    } catch {
      toast.error("فيه مشكلة حصلت");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDocInCollection("warehouses", editingWarehouse.id, { ...editingWarehouse, capacity: parseInt(editingWarehouse.capacity) || 0 });
      setEditingWarehouse(null);
      fetchWarehouses();
      toast.success("تم تحديث المستودع بنجاح");
    } catch {
      toast.error("فيه مشكلة حصلت");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("متأكد من حذف المستودع ده؟")) return;
    try {
      await deleteDocFromCollection("warehouses", id);
      fetchWarehouses();
      toast.success("تم حذف المستودع");
    } catch {
      toast.error("فيه مشكلة حصلت");
    }
  };

  const openModal = (warehouse?: any) => {
    if (warehouse) {
      setEditingWarehouse({ ...warehouse });
    } else {
      setNewWarehouse({
        name: "",
        code: "",
        address: "",
        city: "",
        capacity: "",
        manager: "",
        phone: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingWarehouse(null);
  };

  const getCapacityPercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المستودعات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة المستودعات ومواقع التخزين
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> اضف مستودع
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن مستودعات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الكود
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  اسم المستودع
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  المدينة
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  السعة
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  المستخدم
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الحالة
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    بيتحمّل...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    مفيش مستودعات
                  </td>
                </tr>
              ) : (
                filtered.map((warehouse) => (
                  <tr
                    key={warehouse.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-medium">
                        {warehouse.code}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                          <Warehouse className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground block">
                            {warehouse.name}
                          </span>
                          {warehouse.address && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {warehouse.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {warehouse.city || "-"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {warehouse.usedCapacity || 0}/
                            {warehouse.capacity || 0}
                          </span>
                          <span className="text-muted-foreground">
                            {Math.round(
                              getCapacityPercentage(
                                warehouse.usedCapacity || 0,
                                warehouse.capacity || 0
                              )
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              getCapacityPercentage(
                                warehouse.usedCapacity || 0,
                                warehouse.capacity || 0
                              ) > 90
                                ? "bg-red-500"
                                : getCapacityPercentage(
                                    warehouse.usedCapacity || 0,
                                    warehouse.capacity || 0
                                  ) > 70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${getCapacityPercentage(
                                warehouse.usedCapacity || 0,
                                warehouse.capacity || 0
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {warehouse.manager ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="text-sm text-foreground block">
                              {warehouse.manager}
                            </span>
                            {warehouse.phone && (
                              <span className="text-xs text-muted-foreground block">
                                {warehouse.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          warehouse.status === "Active"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {warehouse.status === "Active" ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-start gap-1">
                        <button
                          onClick={() => openModal(warehouse)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(warehouse.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {editingWarehouse ? "تعديل المستودع" : "اضف مستودع"}
              </h2>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={editingWarehouse ? handleEdit : handleAdd}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    اسم المستودع *
                  </label>
                  <input
                    type="text"
                    value={
                      editingWarehouse?.name || newWarehouse.name
                    }
                    onChange={(e) =>
                      editingWarehouse
                        ? setEditingWarehouse({
                            ...editingWarehouse,
                            name: e.target.value,
                          })
                        : setNewWarehouse({
                            ...newWarehouse,
                            name: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    الكود
                  </label>
                  <input
                    type="text"
                    placeholder="يُولّد تلقائياً"
                    value={
                      editingWarehouse?.code || newWarehouse.code
                    }
                    onChange={(e) =>
                      editingWarehouse
                        ? setEditingWarehouse({
                            ...editingWarehouse,
                            code: e.target.value,
                          })
                        : setNewWarehouse({
                            ...newWarehouse,
                            code: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={
                      editingWarehouse?.address || newWarehouse.address
                    }
                    onChange={(e) =>
                      editingWarehouse
                        ? setEditingWarehouse({
                            ...editingWarehouse,
                            address: e.target.value,
                          })
                        : setNewWarehouse({
                            ...newWarehouse,
                            address: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={
                      editingWarehouse?.city || newWarehouse.city
                    }
                    onChange={(e) =>
                      editingWarehouse
                        ? setEditingWarehouse({
                            ...editingWarehouse,
                            city: e.target.value,
                          })
                        : setNewWarehouse({
                            ...newWarehouse,
                            city: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    السعة (وحدة)
                  </label>
                  <input
                    type="number"
                    value={
                      editingWarehouse?.capacity ||
                      newWarehouse.capacity
                    }
                    onChange={(e) =>
                      editingWarehouse
                        ? setEditingWarehouse({
                            ...editingWarehouse,
                            capacity: e.target.value,
                          })
                        : setNewWarehouse({
                            ...newWarehouse,
                            capacity: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    اسم المسؤول
                  </label>
                  <input
                    type="text"
                    value={
                      editingWarehouse?.manager || newWarehouse.manager
                    }
                    onChange={(e) =>
                      editingWarehouse
                        ? setEditingWarehouse({
                            ...editingWarehouse,
                            manager: e.target.value,
                          })
                        : setNewWarehouse({
                            ...newWarehouse,
                            manager: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={
                    editingWarehouse?.phone || newWarehouse.phone
                  }
                  onChange={(e) =>
                    editingWarehouse
                      ? setEditingWarehouse({
                          ...editingWarehouse,
                          phone: e.target.value,
                        })
                      : setNewWarehouse({
                          ...newWarehouse,
                          phone: e.target.value,
                        })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                   {editingWarehouse ? "حفظ التغييرات" : "اضف مستودع"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
