"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Upload,
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
  Download,
  ArrowRight,
  ArrowLeft,
  Package,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Eye,
  Columns,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { addDocToCollection } from "@/lib/localdb";
import { supabase } from "@/lib/supabase";

interface ProductField {
  key: string;
  label: string;
  arabicLabel: string;
  required: boolean;
  type: "text" | "number" | "url";
  sampleValues: string[];
}

const PRODUCT_FIELDS: ProductField[] = [
  { key: "name", label: "Name", arabicLabel: "اسم المنتج", required: true, type: "text", sampleValues: ["لابتوب ديل", "سماعة آبل", "كيبورد ميكانيكي"] },
  { key: "sku", label: "SKU", arabicLabel: "الرمز", required: false, type: "text", sampleValues: ["SKU-001", "PROD-123", "LP-DELL-01"] },
  { key: "category", label: "Category", arabicLabel: "الفئة", required: false, type: "text", sampleValues: ["إلكترونيات", "ملابس", "أثاث"] },
  { key: "price", label: "Price", arabicLabel: "السعر", required: true, type: "number", sampleValues: ["15000", "2500", "750.50"] },
  { key: "cost", label: "Cost", arabicLabel: "التكلفة", required: false, type: "number", sampleValues: ["10000", "1800", "500"] },
  { key: "stock", label: "Stock", arabicLabel: "المخزون", required: false, type: "number", sampleValues: ["50", "100", "25"] },
  { key: "minStock", label: "Min Stock", arabicLabel: "الحد الأدنى", required: false, type: "number", sampleValues: ["10", "20", "5"] },
  { key: "description", label: "Description", arabicLabel: "الوصف", required: false, type: "text", sampleValues: ["لابتوب ديل انسبيرون 15", "سماعة بلوتوث لاسلكية"] },
  { key: "imageUrl", label: "Image URL", arabicLabel: "رابط الصورة", required: false, type: "url", sampleValues: ["https://example.com/img.jpg", "https://imgur.com/abc.png"] },
];

type Step = "upload" | "mapping" | "preview" | "importing" | "done";

interface MappedRow {
  data: Record<string, any>;
  rowIndex: number;
  isValid: boolean;
  errors: string[];
}

export default function ProductImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [mappedRows, setMappedRows] = useState<MappedRow[]>([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (jsonData.length === 0) {
          alert("الملف فاضي");
          return;
        }

        const firstRow = jsonData[0] as any;
        setRawHeaders(Object.keys(firstRow));
        setRawData(jsonData as any[]);

        // Auto-detect column mapping
        const autoMapping: Record<string, string> = {};
        for (const field of PRODUCT_FIELDS) {
          const matchedHeader = rawHeaders.find(
            (h) =>
              h.toLowerCase() === field.label.toLowerCase() ||
              h.toLowerCase() === field.arabicLabel ||
              h.toLowerCase().includes(field.label.toLowerCase()) ||
              field.label.toLowerCase().includes(h.toLowerCase()) ||
              h.toLowerCase() === field.key.toLowerCase()
          );
          if (matchedHeader) {
            autoMapping[field.key] = matchedHeader;
          }
        }
        setColumnMapping(autoMapping);
        setStep("mapping");
      } catch {
        alert("مشكلة في قراءة الملف");
      }
    };
    reader.readAsArrayBuffer(selected);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    const fakeEvent = { target: { files: [droppedFile] } } as any;
    handleFileSelect(fakeEvent);
  }, [handleFileSelect]);

  const generateMappedRows = useCallback(() => {
    const rows: MappedRow[] = rawData.map((rawRow, idx) => {
      const data: Record<string, any> = {};
      const errors: string[] = [];

      for (const field of PRODUCT_FIELDS) {
        const excelCol = columnMapping[field.key];
        let value = excelCol ? rawRow[excelCol] : "";

        if (value === undefined || value === null) value = "";

        if (field.type === "number") {
          value = parseFloat(value) || 0;
        }

        data[field.key] = value;
      }

      if (!data.name || String(data.name).trim() === "") {
        errors.push("اسم المنتج مفقود");
      }
      if (data.price !== undefined && data.price !== "" && (isNaN(Number(data.price)) || Number(data.price) < 0)) {
        errors.push("السعر غير صحيح");
      }
      if (data.imageUrl && typeof data.imageUrl === "string" && data.imageUrl.trim() !== "") {
        try {
          new URL(data.imageUrl);
        } catch {
          errors.push("رابط الصورة غير صحيح");
        }
      }

      return { data, rowIndex: idx + 1, isValid: errors.length === 0, errors };
    });

    setMappedRows(rows);
    setStep("preview");
  }, [rawData, columnMapping]);

  const handleImport = async () => {
    setStep("importing");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const validRows = mappedRows.filter((r) => r.isValid);
    setImportProgress({ current: 0, total: validRows.length });

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < validRows.length; i++) {
      try {
        const product = { ...validRows[i].data };

        // Convert string numbers
        if (product.price) product.price = parseFloat(product.price) || 0;
        if (product.cost) product.cost = parseFloat(product.cost) || 0;
        if (product.stock) product.stock = parseInt(product.stock) || 0;
        if (product.minStock) product.minStock = parseInt(product.minStock) || 10;

        // Handle image URL - if it's a direct URL, use it; otherwise try to upload
        let imageUrl = null;
        if (product.imageUrl && typeof product.imageUrl === "string" && product.imageUrl.trim() !== "") {
          imageUrl = product.imageUrl.trim();
        }
        delete product.imageUrl;

        await addDocToCollection("products", {
          ...product,
          storeId: user.storeId,
          imageUrl,
        });
        success++;
      } catch (err: any) {
        failed++;
        errors.push(`صف ${validRows[i].rowIndex}: ${err.message || "خطأ غير معروف"}`);
      }
      setImportProgress({ current: i + 1, total: validRows.length });
    }

    setImportResult({ success, failed, errors });
    setStep("done");
  };

  const reset = () => {
    setStep("upload");
    setFile(null);
    setRawHeaders([]);
    setRawData([]);
    setColumnMapping({});
    setMappedRows([]);
    setImportProgress({ current: 0, total: 0 });
    setImportResult(null);
  };

  const downloadSample = () => {
    const headers = PRODUCT_FIELDS.map((f) => f.arabicLabel);
    const sampleRow = PRODUCT_FIELDS.map((f) => f.sampleValues[0] || "");
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "منتجات نموذجية");
    XLSX.writeFile(wb, "sample-products.xlsx");
  };

  const validCount = mappedRows.filter((r) => r.isValid).length;
  const invalidCount = mappedRows.filter((r) => !r.isValid).length;

  const steps = [
    { key: "upload", label: "رفع الملف", icon: Upload },
    { key: "mapping", label: "ربط الأعمدة", icon: Columns },
    { key: "preview", label: "معاينة", icon: Eye },
    { key: "done", label: "النتيجة", icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/dashboard/products" className="hover:text-primary transition-colors">المنتجات</Link>
            <span>/</span>
            <span className="text-foreground">استيراد من Excel</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">استيراد المنتجات من Excel</h1>
          <p className="text-muted-foreground text-sm mt-1">ارفع ملف Excel وتملي البيانات تلقائياً مع دعم الصور</p>
        </div>
        <button onClick={downloadSample} className="flex items-center gap-2 bg-muted px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
          <Download className="w-4 h-4" /> تحميل ملف نموذجي
        </button>
      </div>

      {/* Step Indicator */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isActive = s.key === step;
            const isCompleted = idx < currentStepIndex;
            return (
              <div key={s.key} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isActive ? "bg-primary text-white" : isCompleted ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="bg-card rounded-2xl border-2 border-dashed border-border p-12 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">ارفع ملف المنتجات</h3>
            <p className="text-muted-foreground text-sm">اسحب وأفلت الملف هنا أو اضغط للاختيار</p>
            <p className="text-xs text-muted-foreground/60 mt-2">يدعم .xlsx و .xls و .csv — حد أقصى 10 ميجا</p>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />

          {/* Instructions */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-bold text-foreground mb-3">كيفية الاستيراد:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "جهز ملف Excel", desc: "اعمل ملف فيه أعمدة المنتجات (الاسم، السعر، المخزون...)" },
                { step: "2", title: "ارفع الملف", desc: "اسحب الملف هنا أو اضغط للاختيار" },
                { step: "3", title: "اربط الأعمدة", desc: "اختار العمود المناسب لكل حقل" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Fields */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-bold text-foreground mb-3">الأعمدة المدعومة:</h3>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_FIELDS.map((f) => (
                <span key={f.key} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${f.required ? "bg-red-100 text-red-700 border border-red-200" : "bg-muted text-muted-foreground"}`}>
                  {f.arabicLabel} {f.required && <span className="text-red-500">*</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step: Column Mapping */}
      {step === "mapping" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground">ربط الأعمدة</h3>
                <p className="text-sm text-muted-foreground mt-0.5">اختار كل عمود في Excel يقابل أي حقل في المنتج</p>
              </div>
              <span className="text-sm text-muted-foreground">{rawData.length} صف</span>
            </div>

            <div className="space-y-3">
              {PRODUCT_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-36 shrink-0">
                    <span className={`text-sm font-medium ${field.required ? "text-foreground" : "text-muted-foreground"}`}>
                      {field.arabicLabel}
                    </span>
                    {field.required && <span className="text-red-500 mr-1">*</span>}
                  </div>
                  <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                  <select
                    value={columnMapping[field.key] || ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, [field.key]: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">— لا يقابل أي عمود —</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  {columnMapping[field.key] && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">متصل</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mapping Preview */}
          {rawData.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <h4 className="font-bold text-foreground text-sm">معاينة أولية (أول 5 صفوف)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      {PRODUCT_FIELDS.filter((f) => columnMapping[f.key]).map((f) => (
                        <th key={f.key} className="px-3 py-2 text-right font-medium text-muted-foreground whitespace-nowrap">
                          {f.arabicLabel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-t border-border">
                        {PRODUCT_FIELDS.filter((f) => columnMapping[f.key]).map((f) => (
                          <td key={f.key} className="px-3 py-2 text-foreground whitespace-nowrap max-w-[150px] truncate">
                            {String(row[columnMapping[f.key]] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setStep("upload")} className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> رجوع
            </button>
            <button onClick={generateMappedRows} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2">
              معاينة البيانات <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">إجمالي الصفوف</p>
              <p className="text-2xl font-bold text-foreground">{mappedRows.length}</p>
            </div>
            <div className="bg-card rounded-xl border border-green-200 p-4 bg-green-50">
              <p className="text-xs text-green-600">صفوف صالحة</p>
              <p className="text-2xl font-bold text-green-600">{validCount}</p>
            </div>
            <div className="bg-card rounded-xl border border-red-200 p-4 bg-red-50">
              <p className="text-xs text-red-600">صفوف بها أخطاء</p>
              <p className="text-2xl font-bold text-red-600">{invalidCount}</p>
            </div>
          </div>

          {/* Errors */}
          {invalidCount > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="font-bold text-red-700 text-sm">أخطاء في البيانات</h4>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {mappedRows.filter((r) => !r.isValid).slice(0, 20).map((r, idx) => (
                  <div key={idx} className="text-xs text-red-600">
                    صف {r.rowIndex}: {r.errors.join(", ")}
                  </div>
                ))}
                {invalidCount > 20 && <div className="text-xs text-red-500">...و {invalidCount - 20} أخطاء أخرى</div>}
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h4 className="font-bold text-foreground text-sm">معاينة البيانات</h4>
              <div className="flex gap-2">
                <button onClick={() => setMappedRows(mappedRows.map((r) => ({ ...r, isValid: true, errors: [] })))} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors">
                  تجاهل الكل
                </button>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2 text-center w-12">#</th>
                    <th className="px-3 py-2 text-center w-12">حالة</th>
                    {PRODUCT_FIELDS.filter((f) => columnMapping[f.key]).map((f) => (
                      <th key={f.key} className="px-3 py-2 text-right font-medium text-muted-foreground whitespace-nowrap">
                        {f.arabicLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mappedRows.map((row, idx) => (
                    <tr key={idx} className={`border-b border-border last:border-0 ${!row.isValid ? "bg-red-50/50" : "hover:bg-muted/30"}`}>
                      <td className="px-3 py-2 text-center text-muted-foreground text-xs">{row.rowIndex}</td>
                      <td className="px-3 py-2 text-center">
                        {row.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500 mx-auto" />
                        )}
                      </td>
                      {PRODUCT_FIELDS.filter((f) => columnMapping[f.key]).map((f) => (
                        <td key={f.key} className="px-3 py-2 text-foreground whitespace-nowrap max-w-[200px] truncate">
                          {f.key === "imageUrl" && row.data[f.key] ? (
                            <div className="flex items-center gap-2">
                              <img src={row.data[f.key]} alt="" className="w-6 h-6 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              <span className="text-xs text-muted-foreground truncate max-w-[150px]">{String(row.data[f.key])}</span>
                            </div>
                          ) : f.key === "price" || f.key === "cost" ? (
                            <span className="font-medium">{Number(row.data[f.key] || 0).toLocaleString("ar-EG")} ج.م</span>
                          ) : (
                            String(row.data[f.key] ?? "")
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setStep("mapping")} className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> رجوع
            </button>
            <button
              onClick={handleImport}
              disabled={validCount === 0}
              className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" /> استيراد {validCount} منتج
            </button>
          </div>
        </div>
      )}

      {/* Step: Importing */}
      {step === "importing" && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-bold text-foreground mb-2">جاري الاستيراد...</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {importProgress.current} / {importProgress.total}
          </p>
          <div className="w-64 h-2 bg-muted rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && importResult && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">تم الاستيراد!</h3>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div>
                <p className="text-3xl font-bold text-green-600">{importResult.success}</p>
                <p className="text-sm text-muted-foreground">منتج تم استيراده</p>
              </div>
              {importResult.failed > 0 && (
                <div>
                  <p className="text-3xl font-bold text-red-600">{importResult.failed}</p>
                  <p className="text-sm text-muted-foreground">فشل</p>
                </div>
              )}
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <h4 className="font-bold text-red-700 text-sm mb-2">تفاصيل الأخطاء:</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {importResult.errors.map((err, idx) => (
                  <div key={idx} className="text-xs text-red-600">{err}</div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/dashboard/products" className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2">
              عرض المنتجات
            </Link>
            <button onClick={reset} className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
              استيراد ملف آخر
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
