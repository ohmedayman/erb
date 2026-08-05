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
import { supabase } from "@/lib/supabase";

const allSidebarLinks: Record<string, { href: string; label: string; icon: any }> = {
  dashboard: { href: "/dashboard", label: "البورد", icon: LayoutDashboard },
  pos: { href: "/dashboard/pos", label: "نقطة البيع", icon: CreditCard },
  products: { href: "/dashboard/products", label: "المنتجات", icon: Package },
  orders: { href: "/dashboard/orders", label: "الأوردرات", icon: ShoppingCart },
  invoices: { href: "/dashboard/invoices", label: "الفواتير", icon: Receipt },
  customers: { href: "/dashboard/customers", label: "الزبائن", icon: UserCircle },
  inventory: { href: "/dashboard/inventory", label: "المخزون", icon: ClipboardList },
  expenses: { href: "/dashboard/expenses", label: "المصروفات", icon: Wallet },
  employees: { href: "/dashboard/employees", label: "الموظفين", icon: UserCog },
  shipping: { href: "/dashboard/shipping", label: "الشحن", icon: Truck },
  installments: { href: "/dashboard/installments", label: "الأقساط", icon: CalendarCheck },
  accounts: { href: "/dashboard/accounts", label: "الحسابات العامة", icon: BookOpen },
  journal: { href: "/dashboard/journal", label: "القيود اليومية", icon: NotebookPen },
  purchaseOrders: { href: "/dashboard/purchase-orders", label: "أوردرات الشراء", icon: FileText },
  warehouses: { href: "/dashboard/warehouses", label: "المستودعات", icon: Building2 },
  suppliers: { href: "/dashboard/suppliers", label: "الموردين", icon: TruckIcon },
  stockMovements: { href: "/dashboard/stock-movements", label: "حركات المخزون", icon: ArrowLeftRight },
  returns: { href: "/dashboard/returns", label: "المرتجعات", icon: RotateCcw },
  analytics: { href: "/dashboard/analytics", label: "التحليلات", icon: BarChart3 },
  reports: { href: "/dashboard/reports", label: "التقارير", icon: PieChart },
  reportsPL: { href: "/dashboard/reports/profit-loss", label: "الأرباح والخسائر", icon: TrendingUp },
  activityLog: { href: "/dashboard/activity-log", label: "سجل النشاطات", icon: Activity },
  notifications: { href: "/dashboard/notifications", label: "الإشعارات", icon: BellRing },
  team: { href: "/dashboard/team", label: "الفريق", icon: Users },
  settings: { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
  adminOrders: { href: "/dashboard/admin/orders", label: "طلبات الدفع", icon: CreditCard },
};

const featureToLinks: Record<string, string[]> = {
  products: ["products"],
  orders: ["orders"],
  invoices: ["invoices", "installments"],
  customers: ["customers"],
  inventory: ["inventory", "stockMovements"],
  expenses: ["expenses", "accounts", "journal"],
  employees: ["employees", "team"],
  shipping: ["shipping"],
  installments: ["installments"],
  accounts: ["accounts", "journal"],
  purchaseOrders: ["purchaseOrders", "suppliers"],
  warehouses: ["warehouses"],
  suppliers: ["suppliers"],
  returns: ["returns"],
  analytics: ["analytics", "reports", "reportsPL"],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [username, setUsername] = useState("مستخدم");
  const [visibleLinks, setVisibleLinks] = useState<typeof allSidebarLinks>({});

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!isLoggedIn || !user) {
      router.push("/login");
      return;
    }

    const email = (user.email || "").toLowerCase();
    const isAdmin = email.includes("admin") || ["admin@stockflow.com", "m44408335@gmail.com", "admin@stockflow.vexonet.online"].includes(email);

    if (isAdmin) {
      router.push("/admin");
      return;
    }

    setUsername(user.fullName || user.username || user.name || "مستخدم");

    const links: typeof allSidebarLinks = { dashboard: allSidebarLinks.dashboard };

    const allFeatures = ["products", "orders", "invoices", "customers", "inventory", "expenses", "employees", "shipping", "installments", "accounts", "purchaseOrders", "warehouses", "suppliers", "returns", "analytics"];
    for (const feature of allFeatures) {
      const linkKeys = featureToLinks[feature] || [];
      for (const key of linkKeys) {
        if (allSidebarLinks[key]) {
          links[key] = allSidebarLinks[key];
        }
      }
    }

    links.settings = allSidebarLinks.settings;
    if (isAdmin) {
      links.adminOrders = allSidebarLinks.adminOrders;
    }

    setVisibleLinks(links);

    if (!isAdmin) {
      const checkSubscription = async () => {
        try {
          const { supabase } = await import("@/lib/supabase");
          const { data } = await supabase
            .from("subscription_orders")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "approved")
            .limit(1);

          if (!data || data.length === 0) {
            router.push("/checkout");
          }
        } catch {
          // Allow access on error
        }
      };
      checkSubscription();
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const linkList = Object.values(visibleLinks);

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 right-0 left-auto z-50 w-64 bg-sidebar-bg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Warehouse className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Stock<span className="text-orange-400">Flow</span></span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="mr-auto lg:hidden text-sidebar-text hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {linkList.map((link) => {
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

          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
          </Link>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="دور على منتجات، طلبات..." className="w-full pr-10 pl-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
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
