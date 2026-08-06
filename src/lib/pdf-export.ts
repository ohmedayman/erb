function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateInvoicePDF(invoice: {
  id: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number; total: number }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  date: string;
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
}) {
  const win = window.open("", "_blank");
  if (!win) return;

  const itemsHTML = invoice.items
    .map(
      (item, i) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;color:#64748b;">${i + 1}</td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;font-weight:600;">${escapeHtml(item.name)}</td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:left;">${item.price.toLocaleString()} ج.م</td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:left;font-weight:600;">${item.total.toLocaleString()} ج.م</td>
      </tr>`
    )
    .join("");

  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>فاتورة ${invoice.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #fff; color: #0f172a; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #f97316; padding-bottom: 20px; }
        .store-name { font-size: 28px; font-weight: bold; color: #f97316; }
        .store-info { text-align: left; color: #64748b; font-size: 14px; line-height: 1.8; }
        .invoice-title { text-align: center; margin: 30px 0; }
        .invoice-title h1 { font-size: 32px; color: #0f172a; margin-bottom: 8px; }
        .invoice-title .invoice-number { color: #f97316; font-size: 18px; font-weight: 600; }
        .details { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; }
        .details div { flex: 1; }
        .details .label { color: #94a3b8; font-size: 12px; margin-bottom: 4px; }
        .details .value { font-weight: 600; font-size: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f97316; color: white; padding: 14px 12px; text-align: right; font-size: 14px; }
        th:first-child { border-radius: 0 8px 0 0; }
        th:last-child { border-radius: 8px 0 0 0; }
        .totals { display: flex; justify-content: flex-start; }
        .totals-box { background: #f8fafc; border-radius: 12px; padding: 20px; min-width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; }
        .totals-row.total { border-top: 2px solid #f97316; margin-top: 8px; padding-top: 12px; font-size: 20px; font-weight: bold; color: #f97316; }
        .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="store-name">${escapeHtml(invoice.storeName)}</div>
          ${invoice.storeAddress ? `<div style="color:#64748b;font-size:14px;margin-top:4px;">${escapeHtml(invoice.storeAddress)}</div>` : ""}
          ${invoice.storePhone ? `<div style="color:#64748b;font-size:14px;">${escapeHtml(invoice.storePhone)}</div>` : ""}
        </div>
        <div class="store-info">
          <div>تاريخ الفاتورة: ${invoice.date}</div>
          <div>رقم الفاتورة: ${invoice.id}</div>
        </div>
      </div>

      <div class="invoice-title">
        <h1>فاتورة مبيعات</h1>
        <div class="invoice-number">#${invoice.id}</div>
      </div>

      <div class="details">
        <div>
          <div class="label">العميل</div>
          <div class="value">${escapeHtml(invoice.customerName)}</div>
        </div>
        <div>
          <div class="label">طريقة الدفع</div>
          <div class="value">${escapeHtml(invoice.paymentMethod)}</div>
        </div>
        <div>
          <div class="label">التاريخ</div>
          <div class="value">${invoice.date}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>المنتج</th>
            <th style="text-align:center;">الكمية</th>
            <th style="text-align:left;">السعر</th>
            <th style="text-align:left;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>

      <div class="totals">
        <div class="totals-box">
          <div class="totals-row">
            <span>المجموع الفرعي</span>
            <span>${invoice.subtotal.toLocaleString()} ج.م</span>
          </div>
          <div class="totals-row">
            <span>الضريبة (14%)</span>
            <span>${invoice.tax.toLocaleString()} ج.م</span>
          </div>
          <div class="totals-row total">
            <span>الإجمالي</span>
            <span>${invoice.total.toLocaleString()} ج.م</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>شكراً لتعاملكم مع ${invoice.storeName}</p>
        <p style="margin-top:4px;">تم الإنشاء بواسطة StockFlow — نظام إدارة المخازن</p>
      </div>
    </body>
    </html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

export function generateReportPDF(title: string, data: Array<Record<string, any>>, columns: string[]) {
  const win = window.open("", "_blank");
  if (!win) return;

  const headerMap: Record<string, string> = {
    name: "الاسم",
    category: "التصنيف",
    quantity: "الكمية",
    price: "السعر",
    total: "المجموع",
    revenue: "الإيرادات",
    expenses: "المصروفات",
    profit: "صافي الربح",
    date: "التاريخ",
    status: "الحالة",
    count: "العدد",
    amount: "المبلغ",
  };

  const headers = columns.map((col) => headerMap[col] || col);
  const rows = data
    .map(
      (row) =>
        `<tr>${columns.map((col) => `<td style="padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(String(row[col] ?? ""))}</td>`).join("")}</tr>`
    )
    .join("");

  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)} — StockFlow</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #0f172a; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #64748b; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f97316; color: white; padding: 12px; text-align: right; }
        th:first-child { border-radius: 0 8px 0 0; }
        th:last-child { border-radius: 8px 0 0 0; }
        .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 13px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <p class="subtitle">تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")} — بواسطة StockFlow</p>
      <table>
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">تم الإنشاء بواسطة StockFlow — نظام إدارة المخازن</div>
    </body>
    </html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 500);
}
