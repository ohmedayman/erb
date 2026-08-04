"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Warehouse, LayoutDashboard, Package, ShoppingCart, BarChart3, Settings,
  Users, Bell, Search, Menu, X, LogOut, ChevronDown, Truck, ClipboardList,
  FileText, BellRing, ArrowLeftRight, RotateCcw, Activity, Building2, TruckIcon,
  Receipt, CreditCard, UserCircle, Wallet, BookOpen, NotebookPen, UserCog, PieChart,
  CalendarCheck, TrendingUp,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const sidebarLinks = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/dashboard/pos", label: "نقطة البيع", icon: CreditCard },
  { href: "/dashboard/invoices", label: "الفواتير", icon: Receipt },
  { href: "/dashboard/installments", label: "الأقساط", icon: CalendarCheck },
  { href: "/dashboard/customers", label: "العملاء", icon: UserCircle },
  { href: "/dashboard/products", label: "المنتجات", icon: Package },
  { href: "/dashboard/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/dashboard/inventory", label: "المخزون", icon: ClipboardList },
  { href: "/dashboard/expenses", label: "المصروفات", icon: Wallet },
  { href: "/dashboard/accounts", label: "الحسابات العامة", icon: BookOpen },
  { href: "/dashboard/journal", label: "القيود اليومية", icon: NotebookPen },
  { href: "/dashboard/employees", label: "الموظفون", icon: UserCog },
  { href: "/dashboard/shipping", label: "الشحن", icon: Truck },
  { href: "/dashboard/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/dashboard/reports", label: "التقارير", icon: PieChart },
  { href: "/dashboard/reports/profit-loss", label: "الأرباح والخسائر", icon: TrendingUp },
  { href: "/dashboard/purchase-orders", label: "طلبات الشراء", icon: FileText },
  { href: "/dashboard/warehouses", label: "المستودعات", icon: Building2 },
  { href: "/dashboard/suppliers", label: "الموردون", icon: TruckIcon },
  { href: "/dashboard/stock-movements", label: "حركات المخزون", icon: ArrowLeftRight },
  { href: "/dashboard/returns", label: "المرتجعات", icon: RotateCcw },
  { href: "/dashboard/activity-log", label: "سجل النشاطات", icon: Activity },
  { href: "/dashboard/notifications", label: "الإشعارات", icon: BellRing },
  { href: "/dashboard/team", label: "الفريق", icon: Users },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [username, setUsername] = useState("مستخدم");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUsername(user.displayName || user.email || "مستخدم");
      const token = await user.getIdToken();
      localStorage.setItem("firebaseToken", token);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("firebaseToken");
      router.push("/login");
    } catch {
      localStorage.removeItem("firebaseToken");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 right-0 left-auto z-50 w-64 bg-sidebar-bg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Stock<span className="text-primary">Flow</span></span>
            <button onClick={() => setSidebarOpen(false)} className="mr-auto lg:hidden text-sidebar-text hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-primary/20 text-primary" : "text-sidebar-text hover:text-white hover:bg-white/5"}`}>
                  <link.icon className="w-5 h-5" /> {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{username}</p>
                <p className="text-xs text-sidebar-text truncate">مدير</p>
              </div>
              <button onClick={handleLogout} className="text-sidebar-text hover:text-red-400 transition-colors" title="تسجيل الخروج">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center gap-4 px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="البحث عن منتجات، طلبات..." className="w-full pr-10 pl-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <div className="flex items-center gap-3 mr-auto">
            <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>

            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium">{username}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute left-0 mt-2 w-48 bg-card rounded-xl shadow-xl border border-border py-1 z-50">
                    <Link href="/dashboard/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                      <Settings className="w-4 h-4" /> الإعدادات
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-muted transition-colors w-full">
                      <LogOut className="w-4 h-4" /> تسجيل الخروج
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
