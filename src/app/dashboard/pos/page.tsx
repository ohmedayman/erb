"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  X,
  Package,
  Barcode,
  Zap,
  Keyboard,
  User,
  Receipt,
} from "lucide-react";
import { getDocsFromCollection, addDocToCollection, updateDocInCollection } from "@/lib/localdb";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  balance: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const barcodeRef = useRef<HTMLInputElement>(null);
  const customerSelectRef = useRef<HTMLSelectElement>(null);

  const fetchProducts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const filters = user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : [];
      const data = await getDocsFromCollection("products", filters);
      const activeProducts = data.filter((p: Product) => p.stock > 0);
      setProducts(activeProducts);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const filters = user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : [];
      const data = await getDocsFromCollection("customers", filters);
      setCustomers(data);
    } catch {
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const playBeep = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch {
    }
  }, []);

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const trimmed = barcode.trim();
      if (!trimmed) return;
      const product = products.find(
        (p) => p.sku.toLowerCase() === trimmed.toLowerCase()
      );
      if (product) {
        addToCart(product);
        playBeep();
      }
    },
    [products, playBeep]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        barcodeRef.current?.focus();
      }
      if (e.key === "F5") {
        e.preventDefault();
        if (cart.length > 0) {
          setShowPayment(true);
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setCart([]);
        setShowPayment(false);
        setSelectedCustomer(null);
        setNewCustomerName("");
        setNewCustomerPhone("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement === barcodeRef.current) {
        const barcode = barcodeRef.current?.value;
        if (barcode) {
          handleBarcodeScan(barcode);
          if (barcodeRef.current) barcodeRef.current.value = "";
        }
      }
    };
    const el = barcodeRef.current;
    if (el) {
      el.addEventListener("keydown", handleKeyDown);
      el.focus();
    }
    return () => el?.removeEventListener("keydown", handleKeyDown);
  }, [handleBarcodeScan]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "الكل" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const quickSale = () => {
    if (products.length > 0) {
      const product = products[0];
      addToCart(product);
      playBeep();
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const completeSale = async (paymentMethod: string) => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      for (const item of cart) {
        await updateDocInCollection("products", item.product.id, {
          stock: item.product.stock - item.quantity,
        });
      }

      const customerDisplayName =
        selectedCustomer?.name || newCustomerName || "عميل كاش";
      const customerPhone =
        selectedCustomer?.phone || newCustomerPhone || "";

      await addDocToCollection("invoices", {
        customerName: customerDisplayName,
        customerPhone,
        items: cart.map((item) => ({
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity,
        })),
        subtotal,
        tax,
        total,
        status: "paid",
        paymentMethod,
        notes: "اتباع من الكاشير",
        storeId: user.storeId,
      });

      setCart([]);
      setSelectedCustomer(null);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setShowNewCustomer(false);
      setShowPayment(false);
      fetchProducts();
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4" dir="rtl">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">نقطة البيع</h1>
          <p className="text-muted-foreground text-sm mt-1">بيع المنتجات للعملاء</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary">
              <Barcode className="w-5 h-5" />
              <span className="text-sm font-medium">مسح الباركود</span>
            </div>
            <input
              ref={barcodeRef}
              type="text"
              placeholder="مرر الباركود هنا أو اكتب رقم المنتج..."
              className="flex-1 px-4 py-2.5 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value;
                  handleBarcodeScan(value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              <Keyboard className="w-3 h-3" />
              <span>F2</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            "الكل",
            ...new Set(products.map((p) => p.category).filter(Boolean)),
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الباركود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              بيتحمّل...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Package className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">مفيش منتجات</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-card rounded-xl border border-border p-3 hover:border-primary hover:shadow-md transition-all text-right"
                >
                  <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center mb-2">
                    <Package className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.sku}
                  </p>
                  <p className="text-sm font-bold text-primary mt-1">
                    {product.price.toFixed(2)} ر.س
                  </p>
                  <p className="text-xs text-muted-foreground">
                    المخزون: {product.stock}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-80 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">السلّة</h2>
            <span className="mr-auto bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <select
                ref={customerSelectRef}
                value={selectedCustomer?.id || ""}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setShowNewCustomer(true);
                    setSelectedCustomer(null);
                  } else {
                    const customer = customers.find(
                      (c) => c.id === e.target.value
                    );
                    setSelectedCustomer(customer || null);
                    setShowNewCustomer(false);
                    setNewCustomerName("");
                    setNewCustomerPhone("");
                  }
                }}
                className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">عميل كاش</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="__new__">+ عميل جديد</option>
              </select>
            </div>

            {showNewCustomer && (
              <div className="space-y-2 p-2 bg-muted/50 rounded-lg">
                <input
                  type="text"
                  placeholder="اسم العميل"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="tel"
                  placeholder="رقم الهاتف"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-2 border-b border-border">
          <div className="flex gap-2">
            <button
              onClick={quickSale}
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 text-white py-2 rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              بيع سريع
            </button>
            <button
              onClick={() => {
                setCart([]);
                setSelectedCustomer(null);
                setNewCustomerName("");
                setNewCustomerPhone("");
                setShowNewCustomer(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 text-red-500 py-2 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              مسح السلّة
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">السلّة فاضية</p>
              <p className="text-xs mt-1 opacity-70">امسح المنتج أو اضغط بيع سريع</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-muted/50 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.product.sku}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product.id, -1)
                      }
                      className="w-7 h-7 bg-card border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product.id, 1)
                      }
                      className="w-7 h-7 bg-card border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {(item.product.price * item.quantity).toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>المجموع الفرعي:</span>
              <span>{subtotal.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>الضريبة (15%):</span>
              <span>{tax.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
              <span>التوتال:</span>
              <span className="text-primary">{total.toFixed(2)} ر.س</span>
            </div>
          </div>

          {selectedCustomer && (
            <div className="bg-muted/50 rounded-lg p-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {selectedCustomer.name}
              </span>
              {selectedCustomer.balance !== 0 && (
                <span
                  className={`mr-2 ${
                    selectedCustomer.balance > 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  (الرصيد: {selectedCustomer.balance.toFixed(2)})
                </span>
              )}
            </div>
          )}

          {cart.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => completeSale("cash")}
                disabled={processing}
                className="bg-green-600 text-white py-2.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                كاش
              </button>
              <button
                onClick={() => completeSale("card")}
                disabled={processing}
                className="bg-blue-600 text-white py-2.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                بالكارت
              </button>
              <button
                onClick={() => completeSale("transfer")}
                disabled={processing}
                className="bg-purple-600 text-white py-2.5 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                تحويل
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              F2 باركود
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              F5 بيع
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              Esc مسح
            </span>
          </div>
        </div>
      </div>

      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                خلّص البيع
              </h2>
              <button
                onClick={() => setShowPayment(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedCustomer && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">
                  العميل: {selectedCustomer.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedCustomer.phone}
                </p>
              </div>
            )}

            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الفرعي:</span>
                  <span>{subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>الضريبة (15%):</span>
                  <span>{tax.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t border-border pt-2">
                  <span>التوتال:</span>
                  <span className="text-primary">{total.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => completeSale("cash")}
                disabled={processing}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                الدفع كاش
              </button>
              <button
                onClick={() => completeSale("card")}
                disabled={processing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                الدفع بالكارت
              </button>
              <button
                onClick={() => completeSale("transfer")}
                disabled={processing}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                الدفع بالتحويل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
