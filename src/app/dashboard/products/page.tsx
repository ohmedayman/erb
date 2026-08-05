"use client";

import { useState, useEffect, useRef } from "react";
import { Package, Plus, Search, Edit, Trash2, Printer, Minus, PlusIcon, Download } from "lucide-react";
import { getDocsFromCollection, addDocToCollection, updateDocInCollection, deleteDocFromCollection } from "@/lib/localdb";
import { exportToExcel } from "@/lib/excel";
import { toast } from "@/components/Toast";
import JsBarcode from "jsbarcode";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

function BarcodeSVG({ value, width = 2, height = 60 }: { value: string; width?: number; height?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        width,
        height,
        displayValue: true,
        font: "monospace",
        fontSize: 14,
        textMargin: 6,
        margin: 10,
        background: "#ffffff",
        lineColor: "#000000",
      });
    } catch {
      if (svgRef.current) {
        const ctx = svgRef.current;
        ctx.innerHTML = `<text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#999" font-size="14">${value || "N/A"}</text>`;
      }
    }
  }, [value, width, height]);

  return <svg ref={svgRef} className="max-w-full" />;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", category: "", price: "", stock: "", minStock: "" });
  const [barcodeProduct, setBarcodeProduct] = useState<any>(null);
  const [barcodeQty, setBarcodeQty] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const products = await getDocsFromCollection("products", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
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
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await addDocToCollection("products", { ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock), minStock: parseInt(newProduct.minStock || "10"), storeId: user.storeId });
      setShowModal(false);
      setNewProduct({ name: "", sku: "", category: "", price: "", stock: "", minStock: "" });
      fetchProducts();
      toast.success("تم إضافة المنتج بنجاح");
    } catch {
      toast.error("فيه مشكلة حصلت");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDocInCollection("products", editingProduct.id, { ...editingProduct, price: parseFloat(editingProduct.price), stock: parseInt(editingProduct.stock), minStock: parseInt(editingProduct.minStock) });
    setEditingProduct(null);
    fetchProducts();
    toast.success("تم حفظ التغييرات");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("انت متأكد من حذف هذا المنتج؟")) return;
    try {
      await deleteDocFromCollection("products", id);
      fetchProducts();
      toast.success("تم حذف المنتج");
    } catch {
      toast.error("فيه مشكلة حصلت");
    }
  };

  const handlePrintBarcodes = () => {
    if (!barcodeProduct) return;
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      toast.error("مفيش صلاحية فتح النافذة — اณา على السماح بالبوب اب");
      return;
    }

    const labelsHTML = Array.from({ length: barcodeQty }, () => `
      <div style="display:inline-block;text-align:center;padding:10px;border:1px dashed #ccc;margin:4px;page-break-inside:avoid;">
        <div style="font-size:13px;font-weight:bold;margin-bottom:6px;font-family:Arial,sans-serif;">${barcodeProduct.name}</div>
        <svg class="barcode-svg"></svg>
        <div style="font-size:11px;margin-top:4px;font-family:monospace;color:#555;">${barcodeProduct.sku}</div>
      </div>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طباعة باركود - ${barcodeProduct.name}</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          @media print {
            body { padding: 0; }
            @page { margin: 5mm; }
          }
        </style>
      </head>
      <body>
        <div style="text-align:center;margin-bottom:20px;">
          <h2 style="font-size:18px;">طباعة باركود — ${barcodeProduct.name}</h2>
          <p style="color:#666;">الكمية: ${barcodeQty} لاصقة</p>
        </div>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
          ${labelsHTML}
        </div>
        <script>
          document.querySelectorAll('.barcode-svg').forEach(function(svg) {
            JsBarcode(svg, "${barcodeProduct.sku || 'N/A'}", {
              format: "CODE128",
              width: 2,
              height: 50,
              displayValue: true,
              font: "monospace",
              fontSize: 12,
              textMargin: 4,
              margin: 8,
              background: "#ffffff",
              lineColor: "#000000"
            });
          });
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          };
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">المنتجات</h1>
            <p className="text-muted-foreground text-sm mt-1">إدارة كتالوج المنتجات</p>
          </div>
          <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
            <Plus className="w-4 h-4" /> اضف منتج
          </button>
          <button onClick={() => exportToExcel(products.map(p => ({ name: p.name, sku: p.sku, category: p.category, price: p.price, stock: p.stock, minStock: p.minStock })), "products", "المنتجات")} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
            <Download className="w-4 h-4" /> تصدير Excel
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
                  <tr><td colSpan={8} className="px-5 py-4">
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-28 shrink-0" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-7 w-16 rounded" />
                        </div>
                      ))}
                    </div>
                  </td></tr>
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
                      <td className="px-5 py-3 text-sm text-muted-foreground font-mono">{product.sku}</td>
                      <td className="px-5 py-3">
                        <BarcodeSVG value={product.sku || "N/A"} />
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{product.category}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">${product.price}</td>
                      <td className="px-5 py-3 text-sm text-foreground">{product.stock}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > (product.minStock || 10) ? "bg-green-50 text-green-600" : product.stock > 0 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"}`}>
                          {product.stock > (product.stock || 10) ? "شغّال" : product.stock > 0 ? "مخزون قليل" : "خلص"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-start gap-1">
                          <button onClick={() => { setBarcodeProduct(product); setBarcodeQty(1); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="طباعة باركود"><Printer className="w-4 h-4" /></button>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
                  <label className="block text-sm font-medium text-foreground mb-1.5">الرمز (SKU)</label>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">طباعة باركود</h2>
              <button onClick={() => setBarcodeProduct(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">{barcodeProduct.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{barcodeProduct.sku}</p>
              </div>

              <div className="bg-white rounded-xl border border-border p-4 flex justify-center">
                <BarcodeSVG value={barcodeProduct.sku || "N/A"} width={2} height={70} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">عدد اللصق المطلوب</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBarcodeQty(Math.max(1, barcodeQty - 1))}
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={barcodeQty}
                    onChange={(e) => setBarcodeQty(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                    className="w-24 text-center px-3 py-2.5 rounded-lg border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    onClick={() => setBarcodeQty(Math.min(500, barcodeQty + 1))}
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  {[10, 20, 50, 100].map((n) => (
                    <button
                      key={n}
                      onClick={() => setBarcodeQty(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${barcodeQty === n ? "bg-primary text-white border-primary" : "border-border hover:bg-muted"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePrintBarcodes}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors"
              >
                <Printer className="w-4 h-4" /> طباعة {barcodeQty} لاصقة
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={printRef} style={{ display: "none" }} />
    </>
  );
}
