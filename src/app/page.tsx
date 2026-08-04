import Link from "next/link";
import {
  Warehouse,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Users,
  ArrowRight,
  CheckCircle,
  Package,
  Truck,
  ClipboardList,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Stock<span className="text-primary">Flow</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-hover transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Professional Warehouse Management
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Manage Your Warehouse
              <span className="text-primary"> Effortlessly</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete SaaS solution for inventory tracking, order management,
              and real-time analytics. Built for modern businesses that demand
              speed and accuracy.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-lg font-medium hover:bg-primary-hover transition-all shadow-lg shadow-primary/25"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-foreground px-8 py-3.5 rounded-lg font-medium border border-border hover:bg-muted transition-colors"
              >
                Live Demo
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
            <div className="bg-white rounded-2xl border border-border shadow-2xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center text-xs text-muted-foreground">
                  StockFlow Dashboard
                </div>
              </div>
              <div className="p-6 grid grid-cols-4 gap-4">
                {[
                  { label: "Total Products", value: "12,847", change: "+12%", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Pending Orders", value: "342", change: "-8%", icon: ClipboardList, color: "text-orange-500", bg: "bg-orange-50" },
                  { label: "In Transit", value: "1,205", change: "+5%", icon: Truck, color: "text-green-500", bg: "bg-green-50" },
                  { label: "Active Users", value: "89", change: "+23%", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
                ].map((stat, i) => (
                  <div key={i} className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6">
                <div className="bg-muted/30 rounded-xl h-48 border border-border flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground">
              Everything You Need
            </h2>
            <p className="mt-4 text-muted-foreground">
              Powerful features to streamline your warehouse operations from
              receiving to shipping.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: "Inventory Management",
                desc: "Track stock levels in real-time across multiple warehouses with barcode scanning support.",
              },
              {
                icon: ClipboardList,
                title: "Order Processing",
                desc: "Automate order fulfillment workflows from picking to packing with intelligent routing.",
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                desc: "Gain insights with dashboards, custom reports, and predictive analytics.",
              },
              {
                icon: Truck,
                title: "Shipping Integration",
                desc: "Connect with major carriers for real-time tracking and automated label generation.",
              },
              {
                icon: Shield,
                title: "Role-Based Access",
                desc: "Control who sees what with granular permissions for teams of any size.",
              },
              {
                icon: Globe,
                title: "Multi-Store Support",
                desc: "Manage multiple stores and warehouses from a single unified dashboard.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:border-primary/20 transition-all group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$29",
                period: "/month",
                desc: "Perfect for small businesses",
                features: [
                  "1 Warehouse",
                  "Up to 1,000 Products",
                  "Basic Reports",
                  "Email Support",
                  "1 User",
                ],
                cta: "Start Free",
                primary: false,
              },
              {
                name: "Professional",
                price: "$79",
                period: "/month",
                desc: "For growing operations",
                features: [
                  "5 Warehouses",
                  "Up to 10,000 Products",
                  "Advanced Analytics",
                  "Priority Support",
                  "10 Users",
                  "API Access",
                ],
                cta: "Start Free Trial",
                primary: true,
              },
              {
                name: "Enterprise",
                price: "$199",
                period: "/month",
                desc: "For large-scale operations",
                features: [
                  "Unlimited Warehouses",
                  "Unlimited Products",
                  "Custom Reports",
                  "24/7 Support",
                  "Unlimited Users",
                  "Custom Integrations",
                  "Dedicated Manager",
                ],
                cta: "Contact Sales",
                primary: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 border-2 transition-all ${
                  plan.primary
                    ? "border-primary bg-card shadow-xl shadow-primary/10 scale-105"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {plan.primary && (
                  <div className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 block text-center py-3 rounded-lg font-medium transition-colors ${
                    plan.primary
                      ? "bg-primary text-white hover:bg-primary-hover"
                      : "bg-muted text-foreground hover:bg-border"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Warehouse className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                Stock<span className="text-primary">Flow</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              © 2026 StockFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
