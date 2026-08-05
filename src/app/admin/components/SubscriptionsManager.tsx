"use client";

import { CreditCard, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import DataTable from "./DataTable";

interface SubscriptionsManagerProps {
  orders: any[];
  onApprove: (order: any) => void;
  onReject: (order: any) => void;
  onView: (order: any) => void;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "معلق", color: "bg-amber-500/20 text-amber-400", icon: Clock },
  approved: { label: "مقبول", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "bg-red-500/20 text-red-400", icon: XCircle },
};

const PAYMENT_METHODS: Record<string, string> = {
  fawry: "فوري",
  vodafone_cash: "فودافون كاش",
  instapay: "InstaPay",
  bank_transfer: "حوالة بنكية",
};

export default function SubscriptionsManager({ orders, onApprove, onReject, onView }: SubscriptionsManagerProps) {
  const columns = [
    {
      key: "user_name",
      label: "المستخدم",
      render: (item: any) => (
        <div>
          <p className="text-white font-medium">{item.user_name}</p>
          <p className="text-slate-400 text-xs">{item.user_email}</p>
        </div>
      ),
    },
    { key: "plan_name", label: "الخطة" },
    {
      key: "plan_price",
      label: "السعر",
      render: (item: any) => <span className="text-orange-400 font-bold">{item.plan_price?.toLocaleString()} ج.م</span>,
    },
    {
      key: "payment_method",
      label: "طريقة الدفع",
      render: (item: any) => PAYMENT_METHODS[item.payment_method] || item.payment_method,
    },
    { key: "transaction_id", label: "رقم المعاملة", hideOnMobile: true },
    {
      key: "status",
      label: "الحالة",
      render: (item: any) => {
        const s = STATUS_MAP[item.status] || STATUS_MAP.pending;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
            <s.icon className="w-3 h-3" />
            {s.label}
          </span>
        );
      },
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
        <h2 className="text-2xl font-bold text-white mb-1">طلبات الاشتراك</h2>
        <p className="text-slate-400 text-sm">{orders.length} طلب إجمالي - {orders.filter(o => o.status === "pending").length} معلق</p>
      </div>
      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
        <DataTable
          columns={columns}
          data={orders}
          searchKeys={["user_name", "user_email", "transaction_id"]}
          searchPlaceholder="بحث بالاسم أو البريد..."
          onView={onView}
          pageSize={10}
        />
      </div>
    </div>
  );
}