"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Mail,
  Phone,
} from "lucide-react";
import { getDocsFromCollection, addDocToCollection, updateDocInCollection, deleteDocFromCollection } from "@/lib/localdb";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    code: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    rating: 5,
  });

  const fetchSuppliers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const suppliers = getDocsFromCollection("suppliers", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setSuppliers(suppliers);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    addDocToCollection("suppliers", { ...newSupplier, rating: newSupplier.rating || 5, storeId: user.storeId });
    setShowModal(false);
    setNewSupplier({
      name: "",
      code: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      rating: 5,
    });
    fetchSuppliers();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateDocInCollection("suppliers", editingSupplier.id, { ...editingSupplier, rating: parseInt(editingSupplier.rating) || 0 });
    setEditingSupplier(null);
    fetchSuppliers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المورد؟")) return;
    deleteDocFromCollection("suppliers", id);
    fetchSuppliers();
  };

  const openModal = (supplier?: any) => {
    if (supplier) {
      setEditingSupplier({ ...supplier });
    } else {
      setNewSupplier({
        name: "",
        code: "",
        contactName: "",
        email: "",
        phone: "",
        address: "",
        category: "",
        rating: 5,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الموردون</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة الموردين والتواصل معهم
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> إضافة مورد
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث عن موردين..."
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
                  اسم المورد
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  جهة الاتصال
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  البريد
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الهاتف
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  الفئة
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  التقييم
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
                    colSpan={9}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    جاري التحميل...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    لم يتم العثور على موردين
                  </td>
                </tr>
              ) : (
                filtered.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-medium">
                        {supplier.code}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground block">
                            {supplier.name}
                          </span>
                          {supplier.address && (
                            <span className="text-xs text-muted-foreground block mt-0.5">
                              {supplier.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground">
                      {supplier.contactName || "-"}
                    </td>
                    <td className="px-5 py-3">
                      {supplier.email ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          {supplier.email}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {supplier.phone ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          {supplier.phone}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {supplier.category ? (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {supplier.category}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-0.5">
                        {renderStars(supplier.rating || 0)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          supplier.status === "Active"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {supplier.status === "Active" ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-start gap-1">
                        <button
                          onClick={() => openModal(supplier)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
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
                {editingSupplier ? "تعديل المورد" : "إضافة مورد"}
              </h2>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={editingSupplier ? handleEdit : handleAdd}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    اسم المورد *
                  </label>
                  <input
                    type="text"
                    value={
                      editingSupplier?.name || newSupplier.name
                    }
                    onChange={(e) =>
                      editingSupplier
                        ? setEditingSupplier({
                            ...editingSupplier,
                            name: e.target.value,
                          })
                        : setNewSupplier({
                            ...newSupplier,
                            name: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                      editingSupplier?.code || newSupplier.code
                    }
                    onChange={(e) =>
                      editingSupplier
                        ? setEditingSupplier({
                            ...editingSupplier,
                            code: e.target.value,
                          })
                        : setNewSupplier({
                            ...newSupplier,
                            code: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    جهة الاتصال
                  </label>
                  <input
                    type="text"
                    value={
                      editingSupplier?.contactName ||
                      newSupplier.contactName
                    }
                    onChange={(e) =>
                      editingSupplier
                        ? setEditingSupplier({
                            ...editingSupplier,
                            contactName: e.target.value,
                          })
                        : setNewSupplier({
                            ...newSupplier,
                            contactName: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={
                      editingSupplier?.email || newSupplier.email
                    }
                    onChange={(e) =>
                      editingSupplier
                        ? setEditingSupplier({
                            ...editingSupplier,
                            email: e.target.value,
                          })
                        : setNewSupplier({
                            ...newSupplier,
                            email: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={
                      editingSupplier?.phone || newSupplier.phone
                    }
                    onChange={(e) =>
                      editingSupplier
                        ? setEditingSupplier({
                            ...editingSupplier,
                            phone: e.target.value,
                          })
                        : setNewSupplier({
                            ...newSupplier,
                            phone: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    الفئة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: مواد خام، معدات"
                    value={
                      editingSupplier?.category ||
                      newSupplier.category
                    }
                    onChange={(e) =>
                      editingSupplier
                        ? setEditingSupplier({
                            ...editingSupplier,
                            category: e.target.value,
                          })
                        : setNewSupplier({
                            ...newSupplier,
                            category: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  العنوان
                </label>
                <input
                  type="text"
                  value={
                    editingSupplier?.address || newSupplier.address
                  }
                  onChange={(e) =>
                    editingSupplier
                      ? setEditingSupplier({
                          ...editingSupplier,
                          address: e.target.value,
                        })
                      : setNewSupplier({
                          ...newSupplier,
                          address: e.target.value,
                        })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  التقييم (1-5)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          editingSupplier
                            ? setEditingSupplier({
                                ...editingSupplier,
                                rating: star,
                              })
                            : setNewSupplier({
                                ...newSupplier,
                                rating: star,
                              })
                        }
                        className="p-0.5"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <=
                            (editingSupplier?.rating ||
                              newSupplier.rating ||
                              0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {editingSupplier?.rating || newSupplier.rating || 0} / 5
                  </span>
                </div>
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
                  {editingSupplier ? "حفظ التغييرات" : "إضافة مورد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
