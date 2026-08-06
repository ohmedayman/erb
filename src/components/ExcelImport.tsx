"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ColumnMapping {
  excelColumn: string;
  dbField: string;
  label: string;
  required?: boolean;
  transform?: (value: any) => any;
}

interface ExcelImportProps {
  title: string;
  columnMappings: ColumnMapping[];
  onImport: (data: any[]) => Promise<void>;
  sampleFileName?: string;
  sampleHeaders?: string[];
}

export default function ExcelImport({
  title,
  columnMappings,
  onImport,
  sampleFileName,
  sampleHeaders,
}: ExcelImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (jsonData.length === 0) {
          setResult({ success: false, message: "الملف فاضي أو فيه مشكلة" });
          return;
        }

        const firstRow = jsonData[0] as any;
        setHeaders(Object.keys(firstRow));
        setPreview(jsonData.slice(0, 5) as any[]);
      } catch {
        setResult({ success: false, message: "مشكلة في قراءة الملف" });
      }
    };
    reader.readAsArrayBuffer(selected);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

          const mappedData = jsonData.map((row: any) => {
            const mapped: any = {};
            columnMappings.forEach((mapping) => {
              let value = row[mapping.excelColumn] ?? row[mapping.label] ?? "";
              if (mapping.transform) {
                value = mapping.transform(value);
              }
              mapped[mapping.dbField] = value;
            });
            return mapped;
          });

          await onImport(mappedData);
          setResult({
            success: true,
            message: `تم استيراد ${mappedData.length} سجل بنجاح`,
            count: mappedData.length,
          });
          setFile(null);
          setPreview([]);
          setHeaders([]);
        } catch (err: any) {
          setResult({ success: false, message: err.message || "خطأ في الاستيراد" });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch {
      setResult({ success: false, message: "خطأ في معالجة الملف" });
      setLoading(false);
    }
  };

  const downloadSample = () => {
    if (!sampleHeaders || sampleHeaders.length === 0) return;
    const ws = XLSX.utils.aoa_to_sheet([sampleHeaders]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, sampleFileName || "sample.xlsx");
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setHeaders([]);
    setResult(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
      >
        <Upload className="w-4 h-4" />
        استيراد {title}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">استيراد {title}</h3>
                  <p className="text-sm text-gray-500">ارفع ملف Excel وتملي البيانات تلقائياً</p>
                </div>
              </div>
              <button
                onClick={() => { setIsOpen(false); reset(); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {!file ? (
                <div className="space-y-4">
                  {/* Upload area */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">اضغط هنا لاختيار ملف Excel</p>
                    <p className="text-sm text-gray-500 mt-1">يدعم ملفات .xlsx و .xls و .csv</p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFile}
                    className="hidden"
                  />

                  {/* Column mapping info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">الأعمدة المطلوبة:</h4>
                    <div className="flex flex-wrap gap-2">
                      {columnMappings.map((m) => (
                        <span
                          key={m.dbField}
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            m.required ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {m.label} {m.required && "*"}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sample download */}
                  {sampleHeaders && sampleHeaders.length > 0 && (
                    <button
                      onClick={downloadSample}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Download className="w-4 h-4" />
                      تحميل ملف نموذجي
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File info */}
                  <div className="flex items-center justify-between bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">{file.name}</span>
                      <span className="text-xs text-blue-600">({preview.length} صف)</span>
                    </div>
                    <button onClick={reset} className="text-blue-600 hover:text-blue-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preview table */}
                  {preview.length > 0 && (
                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            {headers.map((h) => (
                              <th key={h} className="px-3 py-2 text-right font-medium text-gray-600 whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {preview.map((row, i) => (
                            <tr key={i} className="border-t border-gray-100">
                              {headers.map((h) => (
                                <td key={h} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[150px] truncate">
                                  {String(row[h] ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Result */}
              {result && (
                <div
                  className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
                    result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  {result.success ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">{result.message}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => { setIsOpen(false); reset(); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
              >
                إلغاء
              </button>
              {file && !result?.success && (
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? "جاري الاستيراد..." : "استيراد البيانات"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
