import * as XLSX from "xlsx";

export function exportToExcel(data: any[], filename: string, sheetName: string = "Sheet1") {
  if (!data || data.length === 0) {
    alert("مفيش بيانات للتصدير");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  const colWidths = Object.keys(data[0]).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] || "").length)
    );
    return { wch: Math.min(maxLen + 2, 30) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportMultipleSheets(
  sheets: { name: string; data: any[] }[],
  filename: string
) {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    if (sheet.data.length === 0) continue;
    const worksheet = XLSX.utils.json_to_sheet(sheet.data);
    const colWidths = Object.keys(sheet.data[0]).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...sheet.data.map((row) => String(row[key] || "").length)
      );
      return { wch: Math.min(maxLen + 2, 30) };
    });
    worksheet["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
