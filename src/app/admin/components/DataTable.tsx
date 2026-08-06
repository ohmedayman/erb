"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Edit3, Trash2, Eye, ChevronDown, ChevronUp } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchPlaceholder?: string;
  searchKeys?: string[];
  pageSize?: number;
  expandable?: boolean;
  renderExpanded?: (item: T) => React.ReactNode;
  headerAction?: React.ReactNode;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  searchPlaceholder = "بحث...",
  searchKeys = [],
  pageSize = 15,
  expandable = false,
  renderExpanded,
  headerAction,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = data.filter((item) => {
    if (!search) return true;
    const t = search.toLowerCase();
    return searchKeys.some((key) => {
      const val = (item as any)[key];
      return val && String(val).toLowerCase().includes(t);
    });
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        {headerAction}
        <span className="text-slate-400 text-sm">{filtered.length} سجل</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {columns.map((col) => (
                <th key={col.key} className={`text-right px-4 py-3 text-slate-400 font-medium ${col.hideOnMobile ? "hidden lg:table-cell" : ""}`}>
                  {col.label}
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th className="text-right px-4 py-3 text-slate-400 font-medium">إجراءات</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.map((item, i) => (
              <>
                <tr key={item.id} className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${i % 2 === 0 ? "bg-[#0f172a]" : "bg-[#131c2e]"}`}>
                  {expandable && (
                    <td className="px-2 py-3 w-8">
                      <button
                        onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        {expandedRow === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-slate-300 ${col.hideOnMobile ? "hidden lg:table-cell" : ""}`}>
                      {col.render ? col.render(item) : (item as any)[col.key] ?? "-"}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {onView && (
                          <button onClick={() => onView(item)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="عرض">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-colors" title="تعديل">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
                {expandable && expandedRow === item.id && renderExpanded && (
                  <tr key={`${item.id}-expanded`}>
                    <td colSpan={columns.length + 2} className="p-0">
                      {renderExpanded(item)}
                    </td>
                  </tr>
                )}
              </>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={columns.length + 2} className="text-center py-12 text-slate-500">لا توجد بيانات</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
          <span className="text-slate-500 text-sm">صفحة {page} من {totalPages}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
