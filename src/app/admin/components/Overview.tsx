"use client";

import { Store, Users, Package, ShoppingCart, Receipt, Wallet, UserCog, TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle } from "lucide-react";
import StatCard from "./StatCard";

interface OverviewProps {
  stats: {
    totalStores: number;
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalExpenses: number;
    pendingOrders: number;
    approvedOrders: number;
    activeUsers: number;
    totalCustomers: number;
    totalInvoices: number;
    totalEmployees: number;
  };
  recentOrders: any[];
  stores: any[];
}

export default function Overview({ stats, recentOrders, stores }: OverviewProps) {
  const netProfit = stats.totalRevenue - stats.totalExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">لوحة التحكم الرئيسية</h2>
        <p className="text-slate-400 text-sm">نظرة عامة على كل المنصة</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="المتاجر" value={stats.totalStores} icon={Store} color="bg-orange-500/20 text-orange-400" />
        <StatCard label="المستخدمين" value={stats.totalUsers} icon={Users} color="bg-blue-500/20 text-blue-400" />
        <StatCard label="المنتجات" value={stats.totalProducts} icon={Package} color="bg-green-500/20 text-green-400" />
        <StatCard label="الزبائن" value={stats.totalCustomers} icon={UserCog} color="bg-purple-500/20 text-purple-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الإيرادات" value={`${stats.totalRevenue.toLocaleString()} ج.م`} icon={TrendingUp} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard label="المصروفات" value={`${stats.totalExpenses.toLocaleString()} ج.م`} icon={Wallet} color="bg-red-500/20 text-red-400" />
        <StatCard label="صافي الربح" value={`${netProfit.toLocaleString()} ج.م`} icon={netProfit >= 0 ? TrendingUp : TrendingDown} color={netProfit >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"} />
        <StatCard label="الأوردرات" value={stats.totalOrders} icon={ShoppingCart} color="bg-cyan-500/20 text-cyan-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="طلبات معلقة" value={stats.pendingOrders} icon={AlertCircle} color="bg-amber-500/20 text-amber-400" />
        <StatCard label="طلبات مقبولة" value={stats.approvedOrders} icon={CheckCircle} color="bg-green-500/20 text-green-400" />
        <StatCard label="الفواتير" value={stats.totalInvoices} icon={Receipt} color="bg-indigo-500/20 text-indigo-400" />
        <StatCard label="الموظفين" value={stats.totalEmployees} icon={UserCog} color="bg-pink-500/20 text-pink-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-white font-bold mb-4">أحدث الأوردرات</h3>
          {recentOrders.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">لا توجد أوردرات بعد</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-slate-800">
                  <div>
                    <p className="text-white text-sm font-medium">{order.order_number || order.customer_name}</p>
                    <p className="text-slate-400 text-xs">{order.customer_name} - {new Date(order.created_at).toLocaleDateString("ar-EG")}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-orange-400 font-bold text-sm">{order.total?.toLocaleString()} ج.م</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "Completed" ? "bg-green-500/20 text-green-400" : order.status === "Pending" ? "bg-amber-500/20 text-amber-400" : "bg-slate-500/20 text-slate-400"}`}>
                      {order.status === "Completed" ? "مكتمل" : order.status === "Pending" ? "معلق" : order.status === "Cancelled" ? "ملغي" : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-white font-bold mb-4">المتاجر النشطة</h3>
          {stores.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">لا توجد متاجر بعد</p>
          ) : (
            <div className="space-y-3">
              {stores.slice(0, 5).map((store) => (
                <div key={store.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Store className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{store.name}</p>
                      <p className="text-slate-400 text-xs">{store.owner_email}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${store.onboarding_done ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {store.onboarding_done ? "نشط" : "جديد"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
