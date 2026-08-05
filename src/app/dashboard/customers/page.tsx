"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Edit2 } from "lucide-react";
import { getDocsFromCollection, addDocToCollection, updateDocInCollection } from "@/lib/localdb";
import { toast } from "@/components/Toast";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: string;
  balance: number;
  createdAt: string;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

const typeConfig: Record<string, { label: string; class: string }> = {
  individual: { label: "فرد", class: "bg-blue-100 text-blue-700" },
  company: { label: "شركة", class: "bg-purple-100 text-purple-700" },
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "individual",
    balance: 0,
  });

  const fetchCustomers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const customers = getDocsFromCollection("customers", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setCustomers(customers);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setForm({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        type: customer.type,
        balance: customer.balance,
      });
    } else {
      setEditingCustomer(null);
      setForm({
        name: "",
        phone: "",
        email: "",
        address: "",
        type: "individual",
        balance: 0,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name) return;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (editingCustomer) {
        updateDocInCollection("customers", editingCustomer.id, { ...form, storeId: user.storeId });
        toast.success("تم إضافة الزبون بنجاح");
      } else {
        addDocToCollection("customers", { ...form, storeId: user.storeId });
        toast.success("تم إضافة الزبون بنجاح");
      }
      setShowModal(false);
      fetchCustomers();
    } catch {
      toast.error("فيه مشكلة حصلت");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الزبائن</h1>
        <p className="text-muted-foreground text-sm mt-1">إدارة بيانات الزبائن وأرصدتهم</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "إجمالي الزبائن", value: customers.length, color: "text-foreground" },
          { label: "أفراد", value: customers.filter((c) => c.type === "individual").length, color: "text-blue-600" },
          { label: "شركات", value: customers.filter((c) => c.type === "company").length, color: "text-purple-600" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث بالاسم أو رقم التليفون..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            اضف زبون
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الاسم</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">التليفون</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الإيميل</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">النوع</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الرصيد</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">التاريخ</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-4">
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-5 w-14 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-7 w-7 rounded" />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-sm">
                    مفيش زبائن
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {customer.name}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground" dir="ltr">
                      {customer.phone || "-"}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground" dir="ltr">
                      {customer.email || "-"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          typeConfig[customer.type]?.class || ""
                        }`}
                      >
                        {typeConfig[customer.type]?.label || customer.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {(customer.balance || 0).toFixed(2)} ر.س
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => openModal(customer)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="عدّل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">
                {editingCustomer ? "عدّل بيانات الزبون" : "اضف زبون جديد"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  اسم الزبون *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="اسم الزبون"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    رقم التليفون
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="رقم التليفون"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    الإيميل
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="الإيميل"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  العنوان
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="العنوان"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    النوع
                  </label>
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full appearance-none px-4 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="individual">فرد</option>
                      <option value="company">شركة</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  الرصيد
                </label>
                <input
                  type="number"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0.00"
                  dir="ltr"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  {editingCustomer ? "تحديث البيانات" : "اضف الزبون"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
