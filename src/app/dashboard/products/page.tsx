"use client";

import { useState, useEffect, useRef } from "react";
import { Package, Plus, Search, Filter, Edit, Trash2, Eye, Printer } from "lucide-react";
import { getDocsFromCollection, addDocToCollection, updateDocInCollection, deleteDocFromCollection } from "@/lib/localdb";

function BarcodeCanvas({ value, width = 200, height = 80 }: { value: string; width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    const barWidth = 2;
    let x = 10;

    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      const pattern = charCode.toString(2).padStart(7, "0");
      for (let j = 0; j < pattern.length; j++) {
        if (pattern[j] === "1") {
          ctx.fillRect(x, 10, barWidth, height - 30);
        }
        x += barWidth;
      }
      x += 1;
    }

    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(value, canvas.width / 2, height - 8);
  }, [value, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="border rounded" />;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", category: "", price: "", stock: "", minStock: "" });
  const [barcodeProduct, setBarcodeProduct] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const products = getDocsFromCollection("products", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setProducts(products);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    addDocToCollection("products", { ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock), minStock: parseInt(newProduct.minStock || "10"), storeId: user.storeId });
    setShowModal(false);
    setNewProduct({ name: "", sku: "", category: "", price: "", stock: "", minStock: "" });
    fetchProducts();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateDocInCollection("products", editingProduct.id, { ...editingProduct, price: parseFloat(editingProduct.price), stock: parseInt(editingProduct.stock), minStock: parseInt(editingProduct.minStock) });
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("انت متأكد من حذف هذا المنتج؟")) return;
    deleteDocFromCollection("products", id);
    fetchProducts();
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #barcode-print-area, #barcode-print-area * {
            visibility: visible !important;
          }
          #barcode-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            z-index: 99999;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 10mm;
            size: auto;
          }
        }
      `}</style>

      <div className="space-y-6 no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">المنتجات</h1>
            <p className="text-muted-foreground text-sm mt-1">إدارة كتالوج المنتجات</p>
          </div>
          <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
            <Plus className="w-4 h-4" /> اضف منتج
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="البحث عن منتجات..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المنتج</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الرمز</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الباركود</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الفئة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">السعر</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المخزون</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground text-sm">بيتحمّل...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground text-sm">مفيش منتجات</td></tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground" /></div>
                          <span className="text-sm font-medium text-foreground">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{product.sku}</td>
                      <td className="px-5 py-3">
                        <BarcodeCanvas value={product.sku || "N/A"} width={120} height={50} />
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{product.category}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">${product.price}</td>
                      <td className="px-5 py-3 text-sm text-foreground">{product.stock}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === "Active" ? "bg-green-50 text-green-600" : product.status === "Low Stock" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"}`}>
                          {product.status === "Active" ? "شغّال" : product.status === "Low Stock" ? "مخزون قليل" : "خلص"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-start gap-1">
                          <button onClick={() => setBarcodeProduct(product)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="طباعة باركود"><Printer className="w-4 h-4" /></button>
                          <button onClick={() => { setEditingProduct(product); setShowModal(true); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{editingProduct ? "عدّل المنتج" : "اضف منتج"}</h2>
              <button onClick={() => { setShowModal(false); setEditingProduct(null); }} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={editingProduct ? handleEdit : handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">اسم المنتج</label>
                <input type="text" value={editingProduct?.name || newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">الرمز</label>
                  <input type="text" value={editingProduct?.sku || newProduct.sku} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, sku: e.target.value }) : setNewProduct({ ...newProduct, sku: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">الفئة</label>
                  <input type="text" value={editingProduct?.category || newProduct.category} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, category: e.target.value }) : setNewProduct({ ...newProduct, category: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">السعر</label>
                  <input type="number" step="0.01" value={editingProduct?.price || newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, price: e.target.value }) : setNewProduct({ ...newProduct, price: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">المخزون</label>
                  <input type="number" value={editingProduct?.stock ?? newProduct.stock} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, stock: e.target.value }) : setNewProduct({ ...newProduct, stock: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">الأدنى</label>
                  <input type="number" value={editingProduct?.minStock ?? newProduct.minStock} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, minStock: e.target.value }) : setNewProduct({ ...newProduct, minStock: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingProduct(null); }} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">إلغاء</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors">{editingProduct ? "حفظ التغييرات" : "اضف منتج"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {barcodeProduct && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm border border-border">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">طباعة باركود</h2>
                <button onClick={() => setBarcodeProduct(null)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
              <div className="p-6 flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-foreground">{barcodeProduct.name}</p>
                <BarcodeCanvas value={barcodeProduct.sku || "N/A"} width={300} height={120} />
                <p className="text-xs text-muted-foreground font-mono">{barcodeProduct.sku}</p>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  <Printer className="w-4 h-4" /> طباعة
                </button>
              </div>
            </div>
          </div>

          <div id="barcode-print-area" style={{ display: "none" }}>
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px", fontFamily: "Arial, sans-serif" }}>{barcodeProduct.name}</p>
              <BarcodeCanvas value={barcodeProduct.sku || "N/A"} width={300} height={120} />
              <p style={{ fontSize: "12px", marginTop: "8px", fontFamily: "monospace" }}>{barcodeProduct.sku}</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
