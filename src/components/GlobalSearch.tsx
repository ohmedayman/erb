"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Package, ShoppingCart, Users, Receipt, Clock, ArrowRight } from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";

interface SearchResult {
  type: "product" | "order" | "customer" | "invoice";
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  href: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("recent-searches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const f = user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : [];
        const q = query.toLowerCase();

        const [products, orders, customers, invoices] = await Promise.all([
          getDocsFromCollection("products", f),
          getDocsFromCollection("orders", f),
          getDocsFromCollection("customers", f),
          getDocsFromCollection("invoices", f),
        ]);

        const found: SearchResult[] = [];

        products.forEach((p: any) => {
          if (p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)) {
            found.push({
              type: "product", id: p.id, title: p.name,
              subtitle: `${p.sku || "—"} | ${(p.price || 0).toLocaleString("ar-EG")} ج.م`,
              icon: Package, href: "/dashboard/products",
            });
          }
        });

        orders.forEach((o: any) => {
          const label = o.orderNumber || o.id?.slice(0, 8) || "";
          if (label.toLowerCase().includes(q) || o.customerName?.toLowerCase().includes(q)) {
            found.push({
              type: "order", id: o.id, title: `أوردر #${label}`,
              subtitle: `${o.customerName || "عميل"} | ${o.total || 0} ج.م`,
              icon: ShoppingCart, href: "/dashboard/orders",
            });
          }
        });

        customers.forEach((c: any) => {
          if (c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q)) {
            found.push({
              type: "customer", id: c.id, title: c.name,
              subtitle: `${c.phone || "—"} | ${c.email || "—"}`,
              icon: Users, href: "/dashboard/customers",
            });
          }
        });

        invoices.forEach((i: any) => {
          if (i.invoiceNumber?.toLowerCase().includes(q) || i.customerName?.toLowerCase().includes(q)) {
            found.push({
              type: "invoice", id: i.id, title: `فاتورة #${i.invoiceNumber || i.id?.slice(0, 8)}`,
              subtitle: `${i.customerName || "عميل"} | ${i.total || 0} ج.م`,
              icon: Receipt, href: "/dashboard/invoices",
            });
          }
        });

        setResults(found.slice(0, 10));
      } catch {} finally { setLoading(false); }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    const searches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    localStorage.setItem("recent-searches", JSON.stringify(searches));
    setRecentSearches(searches);
    setIsOpen(false);
    setQuery("");
    router.push(result.href);
  };

  const typeLabels = { product: "منتج", order: "أوردر", customer: "عميل", invoice: "فاتورة" };
  const typeColors = { product: "bg-blue-100 text-blue-600", order: "bg-orange-100 text-orange-600", customer: "bg-purple-100 text-purple-600", invoice: "bg-emerald-100 text-emerald-600" };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-muted/60 rounded-xl text-sm text-muted-foreground px-3 py-2 hover:bg-muted transition-colors w-full max-w-md"
      >
        <Search className="w-4 h-4" />
        <span>دور على منتجات، أوردرات، زبائن...</span>
        <kbd className="mr-auto text-[10px] bg-white border border-border rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div className="max-w-xl mx-auto mt-20" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="دور على أي حاجة..."
              className="flex-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="py-8 text-center text-gray-400 text-sm">بيدور...</div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-sm">مفيش نتائج لـ "{query}"</div>
            )}

            {!loading && !query && recentSearches.length > 0 && (
              <div className="p-3">
                <p className="text-xs font-medium text-gray-400 px-2 mb-2">آخر عمليات البحث</p>
                {recentSearches.map((s, i) => (
                  <button key={i} onClick={() => setQuery(s)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="p-2">
                {results.map((result) => (
                  <button key={result.id} onClick={() => handleSelect(result)}
                    className="flex items-center gap-3 w-full px-3 py-3 text-right hover:bg-gray-50 rounded-xl transition-colors group">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${typeColors[result.type]}`}>
                      <result.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${typeColors[result.type]}`}>
                          {typeLabels[result.type]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {!loading && !query && recentSearches.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-sm">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                اكتب للبحث
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="bg-gray-100 border border-gray-200 rounded px-1 py-0.5 font-mono">↑↓</kbd>
              للتنقل
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-gray-100 border border-gray-200 rounded px-1 py-0.5 font-mono">↵</kbd>
              للاختيار
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-gray-100 border border-gray-200 rounded px-1 py-0.5 font-mono">Esc</kbd>
              للإغلاق
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
