"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Package, Plus, Search, Edit, Trash2, Printer, Minus, PlusIcon, Download, Image as ImageIcon, X, LayoutGrid, List, Upload } from "lucide-react";
import { getDocsFromCollection, addDocToCollection, updateDocInCollection, deleteDocFromCollection } from "@/lib/localdb";
import { exportToExcel } from "@/lib/excel";
import ExcelImport from "@/components/ExcelImport";
import { toast } from "@/components/Toast";
import JsBarcode from "jsbarcode";
import { supabase } from "@/lib/supabase";

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("الصورة كبيرة — الحد الأقصى 5 ميجا");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const ext = file.name.split(".").pop();
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) {
        console.error("Upload error:", error);
        return null;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      return data?.publicUrl || null;
    } catch {
      return null;
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      let imageUrl = null;
      if (imagePreview) {
        const res = await fetch(imagePreview);
        const blob = await res.blob();
        const file = new File([blob], "product.jpg", { type: blob.type });
        imageUrl = await uploadImage(file);
      }

      await addDocToCollection("products", {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        minStock: parseInt(newProduct.minStock || "10"),
        storeId: user.storeId,
        imageUrl,
      });
      setShowModal(false);
      setNewProduct({ name: "", sku: "", category: "", price: "", stock: "", minStock: "" });
      setImagePreview(null);
      fetchProducts();
      toast.success("تم إضافة المنتج بنجاح");
    } catch {
      toast.error("فيه مشكلة حصلت");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);

      let imageUrl = editingProduct.imageUrl;
      if (imagePreview && imagePreview !== editingProduct.imageUrl) {
        const res = await fetch(imagePreview);
        const blob = await res.blob();
        const file = new File([blob], "product.jpg", { type: blob.type });
        imageUrl = await uploadImage(file);
      }

      await updateDocInCollection("products", editingProduct.id, {
        ...editingProduct,
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock),
        minStock: parseInt(editingProduct.minStock),
        imageUrl,
      });
      setEditingProduct(null);
      setImagePreview(null);
      fetchProducts();
      toast.success("تم حفظ التغييرات");
    } catch {
      toast.error("فيه مشكلة حصلت");
    } finally {
      setUploading(false);
    }
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
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard/products/import" className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
              <Upload className="w-4 h-4" /> استيراد Excel
            </Link>
            <button onClick={() => exportToExcel(products.map(p => ({ name: p.name, sku: p.sku, category: p.category, price: p.price, stock: p.stock, minStock: p.minStock })), "products", "المنتجات")} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
              <Download className="w-4 h-4" /> تصدير
            </button>
            <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
              <Plus className="w-4 h-4" /> اضف منتج
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="البحث عن منتجات..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-4 pr-10 py-2 bg-muted rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <button onClick={() => setViewMode("grid")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "grid" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("table")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "table" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Grid View */}
          {viewMode === "grid" ? (
            <div className="p-4">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-xl aspect-square mb-3" />
                      <div className="bg-muted rounded h-4 w-3/4 mb-2" />
                      <div className="bg-muted rounded h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">مفيش منتجات</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filtered.map((product) => (
                    <div key={product.id} className="group bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all overflow-hidden">
                      {/* Image */}
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm ${
                            product.stock > (product.minStock || 10) ? "bg-green-500/90 text-white" :
                            product.stock > 0 ? "bg-yellow-500/90 text-white" :
                            "bg-red-500/90 text-white"
                          }`}>
                            {product.stock > (product.minStock || 10) ? "متوفر" : product.stock > 0 ? "قليل" : "خلص"}
                          </span>
                        </div>
                        {/* Quick Actions */}
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button onClick={() => { setBarcodeProduct(product); setBarcodeQty(1); }} className="w-8 h-8 bg-card/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-card transition-colors shadow-sm" title="باركود">
                            <Printer className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                          <button onClick={() => { setEditingProduct(product); setImagePreview(product.imageUrl || null); setShowModal(true); }} className="w-8 h-8 bg-card/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-card transition-colors shadow-sm" title="تعديل">
                            <Edit className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="w-8 h-8 bg-card/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm" title="حذف">
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{product.sku || "بدون رمز"}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-primary">{(product.price || 0).toLocaleString("ar-EG")} ج.م</span>
                          <span className="text-xs text-muted-foreground">م: {product.stock}</span>
                        </div>
                        {product.category && (
                          <span className="inline-flex mt-2 px-2 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">{product.category}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
          /* Table View */
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المنتج</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الرمز</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الفئة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">السعر</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المخزون</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-4">
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
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-sm">مفيش منتجات</td></tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-9 h-9 rounded-lg object-cover border border-border" />
                          ) : (
                            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground" /></div>
                          )}
                          <span className="text-sm font-medium text-foreground">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground font-mono">{product.sku}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{product.category}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{(product.price || 0).toLocaleString("ar-EG")} ج.م</td>
                      <td className="px-5 py-3 text-sm text-foreground">{product.stock}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > (product.minStock || 10) ? "bg-green-50 text-green-600" : product.stock > 0 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"}`}>
                          {product.stock > (product.minStock || 10) ? "شغّال" : product.stock > 0 ? "مخزون قليل" : "خلص"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-start gap-1">
                          <button onClick={() => { setBarcodeProduct(product); setBarcodeQty(1); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="طباعة باركود"><Printer className="w-4 h-4" /></button>
                          <button onClick={() => { setEditingProduct(product); setImagePreview(product.imageUrl || null); setShowModal(true); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards - only show in table mode */}
          <div className="md:hidden divide-y divide-border">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">مفيش منتجات</div>
            ) : (
              filtered.map((product) => (
                <div key={product.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-border shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-muted-foreground" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${product.stock > (product.minStock || 10) ? "bg-green-50 text-green-600" : product.stock > 0 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"}`}>
                          {product.stock > (product.minStock || 10) ? "شغّال" : product.stock > 0 ? "قليل" : "خلص"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="font-mono">{product.sku}</span>
                        <span>•</span>
                        <span>{product.category || "بدون فئة"}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{(product.price || 0).toLocaleString("ar-EG")} ج.م</span>
                          <span className="text-xs text-muted-foreground">|</span>
                          <span className="text-xs text-muted-foreground">مخزون: {product.stock}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setBarcodeProduct(product); setBarcodeQty(1); }} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"><Printer className="w-4 h-4" /></button>
                          <button onClick={() => { setEditingProduct(product); setImagePreview(product.imageUrl || null); setShowModal(true); }} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="text-lg font-semibold text-foreground">{editingProduct ? "عدّل المنتج" : "اضف منتج"}</h2>
              <button onClick={() => { setShowModal(false); setEditingProduct(null); setImagePreview(null); }} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">✕</button>
            </div>
            <form onSubmit={editingProduct ? handleEdit : handleAdd} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">صورة المنتج</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="معاينة" className="w-24 h-24 rounded-xl object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">اضغط لاختيار صورة</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">JPEG, PNG, WebP — حد أقصى 5 ميجا</p>
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">اسم المنتج</label>
                <input type="text" value={editingProduct?.name || newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">الرمز (SKU)</label>
                  <input type="text" value={editingProduct?.sku || newProduct.sku} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, sku: e.target.value }) : setNewProduct({ ...newProduct, sku: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">الفئة</label>
                  <input type="text" value={editingProduct?.category || newProduct.category} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, category: e.target.value }) : setNewProduct({ ...newProduct, category: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">السعر</label>
                  <input type="number" step="0.01" value={editingProduct?.price || newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, price: e.target.value }) : setNewProduct({ ...newProduct, price: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">المخزون</label>
                  <input type="number" value={editingProduct?.stock ?? newProduct.stock} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, stock: e.target.value }) : setNewProduct({ ...newProduct, stock: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">الأدنى</label>
                  <input type="number" value={editingProduct?.minStock ?? newProduct.minStock} onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, minStock: e.target.value }) : setNewProduct({ ...newProduct, minStock: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingProduct(null); setImagePreview(null); }} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">إلغاء</button>
                <button type="submit" disabled={uploading} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {uploading ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> جاري الرفع...</>
                  ) : editingProduct ? "حفظ التغييرات" : "اضف منتج"}
                </button>
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

              <div className="bg-card rounded-xl border border-border p-4 flex justify-center">
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
                    className="w-24 text-center px-3 py-2.5 rounded-lg border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
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
