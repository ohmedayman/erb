const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
require("dotenv").config();

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || "stockflow-444d3",
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

let app;
if (getApps().length === 0) {
  if (serviceAccount.clientEmail && serviceAccount.privateKey) {
    app = initializeApp({ credential: cert(serviceAccount) });
  } else {
    app = initializeApp({ projectId: "stockflow-444d3" });
  }
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

async function seed() {
  console.log("جاري ملء قاعدة البيانات على Firestore...\n");

  // Create admin user in Firebase Auth
  let userRecord;
  try {
    userRecord = await auth.createUser({
      email: "ahmed@stockflow.com",
      password: "admin123",
      displayName: "أحمد أيمن",
    });
    console.log("✓ تم إنشاء مستخدم Firebase Auth:", userRecord.uid);
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      userRecord = await auth.getUserByEmail("ahmed@stockflow.com");
      console.log("✓ المستخدم موجود بالفعل:", userRecord.uid);
    } else {
      throw error;
    }
  }

  const storeId = db.collection("stores").doc().id;

  // Create store
  await db.collection("stores").doc(storeId).set({
    id: storeId,
    name: "متجر ستوك فلو",
    description: "نظام إدارة مخازن احترافي",
    category: "Electronics",
    currency: "USD",
    timezone: "Asia/Riyadh",
    country: "المملكة العربية السعودية",
    city: "الرياض",
    state: "الرياض",
    zipCode: "123456",
    address: "شارع الملك فهد",
    ownerName: "أحمد أيمن",
    ownerEmail: "ahmed@stockflow.com",
    ownerPhone: "+966501234567",
    taxId: "SA-12345678",
    emailNotifs: true,
    orderAlerts: true,
    lowStockAlerts: true,
    weeklyReports: false,
    createdAt: new Date().toISOString(),
  });
  console.log("✓ تم إنشاء المتجر");

  // Create user doc
  await db.collection("users").doc(userRecord.uid).set({
    id: userRecord.uid,
    username: "admin",
    email: "ahmed@stockflow.com",
    fullName: "أحمد أيمن",
    role: "admin",
    storeId: storeId,
    createdAt: new Date().toISOString(),
  });
  console.log("✓ تم إنشاء مستخدم الويب");

  // Create products
  const products = [
    { name: "ماوس لاسلكي", sku: "WM-001", category: "إلكترونيات", price: 29.99, stock: 150, minStock: 50, status: "Active" },
    { name: "كرسي مكتب", sku: "OC-023", category: "أثاث", price: 199.0, stock: 45, minStock: 20, status: "Active" },
    { name: "كابل USB 2م", sku: "UC-045", category: "ملحقات", price: 9.99, stock: 500, minStock: 100, status: "Active" },
    { name: "مكتب قابل للتعديل", sku: "SD-067", category: "أثاث", price: 449.0, stock: 12, minStock: 15, status: "Low Stock" },
    { name: "حامل شاشة", sku: "MS-089", category: "ملحقات", price: 39.99, stock: 0, minStock: 10, status: "Out of Stock" },
    { name: "لوحة مفاتيح برو", sku: "KP-101", category: "إلكترونيات", price: 79.99, stock: 200, minStock: 50, status: "Active" },
    { name: "كاميرا ويب HD", sku: "WC-123", category: "إلكترونيات", price: 59.99, stock: 85, minStock: 30, status: "Active" },
    { name: "مصباح مكتب", sku: "DL-145", category: "إضاءة", price: 24.99, stock: 320, minStock: 50, status: "Active" },
  ];

  for (const p of products) {
    await db.collection("products").add({ ...p, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", products.length, "منتج");

  // Create orders
  const orders = [
    { orderNumber: "ORD-7891", customerName: "أحمد حسن", items: 5, total: 1250, status: "Shipped", payment: "Paid" },
    { orderNumber: "ORD-7890", customerName: "سارة محمد", items: 3, total: 890, status: "Processing", payment: "Paid" },
    { orderNumber: "ORD-7889", customerName: "عمر علي", items: 8, total: 2100, status: "Delivered", payment: "Paid" },
    { orderNumber: "ORD-7888", customerName: "فاطمة يوسف", items: 2, total: 560, status: "Pending", payment: "Pending" },
    { orderNumber: "ORD-7887", customerName: "خالد إبراهيم", items: 12, total: 3400, status: "Shipped", payment: "Paid" },
    { orderNumber: "ORD-7886", customerName: "نور عبدالله", items: 6, total: 780, status: "Delivered", payment: "Paid" },
    { orderNumber: "ORD-7885", customerName: "يوسف كمال", items: 4, total: 1650, status: "Cancelled", payment: "Refunded" },
    { orderNumber: "ORD-7884", customerName: "منى صالح", items: 7, total: 2340, status: "Delivered", payment: "Paid" },
  ];

  for (const o of orders) {
    await db.collection("orders").add({ ...o, storeId, date: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", orders.length, "طلب");

  // Create shipments
  const shipments = [
    { shipmentNumber: "SHP-001", carrier: "FedEx", status: "In Transit", origin: "الرياض", destination: "جدة", eta: "6 أغسطس" },
    { shipmentNumber: "SHP-002", carrier: "UPS", status: "Delivered", origin: "الدمام", destination: "مكة", eta: "3 أغسطس" },
    { shipmentNumber: "SHP-003", carrier: "DHL", status: "Processing", origin: "المدينة", destination: "الخبر", eta: "8 أغسطس" },
  ];

  for (const s of shipments) {
    await db.collection("shipments").add({ ...s, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", shipments.length, "شحنة");

  // Create team members
  const team = [
    { name: "أحمد أيمن", email: "ahmed@stockflow.com", role: "Admin", status: "Active" },
    { name: "سارة ويلسون", email: "sarah@stockflow.com", role: "Manager", status: "Active" },
    { name: "مايك جونسون", email: "mike@stockflow.com", role: "Staff", status: "Active" },
  ];

  for (const t of team) {
    await db.collection("teamMembers").add({ ...t, storeId, joinedAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", team.length, "عضو فريق");

  // Create warehouses
  const warehouses = [
    { name: "المستودع الرئيسي", code: "WH-001", address: "شارع الملك فهد", city: "الرياض", capacity: 10000, used: 4500, manager: "أحمد أيمن", status: "Active" },
    { name: "مستودع جدة", code: "WH-002", address: "شارع التحلية", city: "جدة", capacity: 5000, used: 2100, manager: "سارة ويلسون", status: "Active" },
    { name: "مستودع الدمام", code: "WH-003", address: "شارع الملك سعود", city: "الدمام", capacity: 3000, used: 800, manager: "مايك جونسون", status: "Active" },
  ];

  for (const w of warehouses) {
    await db.collection("warehouses").add({ ...w, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", warehouses.length, "مستودع");

  // Create suppliers
  const suppliers = [
    { name: "شركة التقنية المتقدمة", code: "SUP-001", contactName: "محمد العلي", email: "info@techco.com", phone: "+966501112222", category: "إلكترونيات", rating: 5, status: "Active" },
    { name: "مورد الأثاث العالمي", code: "SUP-002", contactName: "خالد الشمري", email: "sales@furniture.com", phone: "+966503334444", category: "أثاث", rating: 4, status: "Active" },
    { name: "الإلكترونيات المتحدة", code: "SUP-003", contactName: "أحمد الفهد", email: "orders@ue.com", phone: "+966505556666", category: "إلكترونيات", rating: 5, status: "Active" },
  ];

  for (const s of suppliers) {
    await db.collection("suppliers").add({ ...s, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", suppliers.length, "مورد");

  // Create notifications
  const notifications = [
    { title: "طلب جديد", message: "تم استلام طلب جديد من أحمد حسن #ORD-7891", type: "order", read: false },
    { title: "تنبيه مخزون منخفض", message: "المنتج 'حامل شاشة' وصل للحد الأدنى", type: "warning", read: false },
    { title: "تم التوصيل", message: "تم توصيل الطلب #ORD-7889 بنجاح", type: "success", read: false },
    { title: "عضو جديد", message: "تمت إضافة مايك جونسون للفريق", type: "info", read: true },
  ];

  for (const n of notifications) {
    await db.collection("notifications").add({ ...n, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", notifications.length, "إشعار");

  // Create stock movements
  const movements = [
    { productName: "ماوس لاسلكي", sku: "WM-001", type: "إدخال", quantity: 50, fromLocation: "المورد", toLocation: "المستودع الرئيسي", reference: "PO-001", createdBy: "أحمد أيمن" },
    { productName: "كرسي مكتب", sku: "OC-023", type: "إخراج", quantity: 5, fromLocation: "المستودع الرئيسي", toLocation: "العميل", reference: "ORD-7891", createdBy: "سارة ويلسون" },
    { productName: "كابل USB 2م", sku: "UC-045", type: "نقل", quantity: 100, fromLocation: "المستودع الرئيسي", toLocation: "مستودع جدة", reference: "TR-001", createdBy: "أحمد أيمن" },
  ];

  for (const m of movements) {
    await db.collection("stockMovements").add({ ...m, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", movements.length, "حركة مخزون");

  // Create activity logs
  const logs = [
    { action: "إنشاء", entity: "منتج", details: "تم إضافة منتج 'ماوس لاسلكي'", user: "أحمد أيمن" },
    { action: "تعديل", entity: "طلب", details: "تم تحديث حالة الطلب #ORD-7891", user: "سارة ويلسون" },
    { action: "حذف", entity: "منتج", details: "تم حذف منتج 'قلم حبر'", user: "أحمد أيمن" },
  ];

  for (const l of logs) {
    await db.collection("activityLogs").add({ ...l, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", logs.length, "سجل نشاط");

  // Create returns
  const returns = [
    { returnNumber: "RET-001", orderNumber: "ORD-7885", customerName: "يوسف كمال", reason: "منتج تالف", quantity: 1, status: "Completed", refundAmount: 79.99 },
    { returnNumber: "RET-002", orderNumber: "ORD-7890", customerName: "سارة محمد", reason: "مقاس خاطئ", quantity: 2, status: "Pending", refundAmount: 59.98 },
  ];

  for (const r of returns) {
    await db.collection("returns").add({ ...r, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", returns.length, "مرتجع");

  // Create purchase orders
  const purchaseOrders = [
    { poNumber: "PO-001", supplierName: "شركة التقنية المتقدمة", items: 20, total: 5000, status: "Pending", expectedDate: "15 أغسطس" },
    { poNumber: "PO-002", supplierName: "مورد الأثاث العالمي", items: 10, total: 8000, status: "Approved", expectedDate: "20 أغسطس" },
    { poNumber: "PO-003", supplierName: "الإلكترونيات المتحدة", items: 50, total: 12000, status: "Delivered", expectedDate: "1 أغسطس" },
  ];

  for (const po of purchaseOrders) {
    await db.collection("purchaseOrders").add({ ...po, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", purchaseOrders.length, "طلب شراء");

  // Create customers
  const customers = [
    { name: "أحمد حسن", phone: "+966501234567", email: "ahmed@email.com", type: "individual", balance: 0 },
    { name: "شركة الرياض للتجارة", phone: "+966509876543", email: "info@riyadh-trading.com", type: "company", balance: 5000 },
    { name: "سارة محمد", phone: "+966505554444", email: "sara@email.com", type: "individual", balance: -200 },
    { name: "مكتب العمال للخدمات", phone: "+966503332222", email: "office@workers.com", type: "company", balance: 12000 },
  ];

  for (const c of customers) {
    await db.collection("customers").add({ ...c, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", customers.length, "عميل");

  // Create invoices
  const invoices = [
    { invoiceNumber: "INV-001", customerName: "أحمد حسن", customerPhone: "+966501234567", items: [{name:"ماوس لاسلكي",sku:"WM-001",quantity:2,price:29.99,total:59.98}], subtotal: 59.98, tax: 8.997, total: 68.977, status: "paid", paymentMethod: "cash" },
    { invoiceNumber: "INV-002", customerName: "شركة الرياض للتجارة", customerPhone: "+966509876543", items: [{name:"كرسي مكتب",sku:"OC-023",quantity:5,price:199,total:995}], subtotal: 995, tax: 149.25, total: 1144.25, status: "unpaid", paymentMethod: "transfer" },
    { invoiceNumber: "INV-003", customerName: "سارة محمد", customerPhone: "+966505554444", items: [{name:"لوحة مفاتيح برو",sku:"KP-101",quantity:3,price:79.99,total:239.97}], subtotal: 239.97, tax: 35.996, total: 275.966, status: "partial", paymentMethod: "card" },
  ];

  for (const inv of invoices) {
    await db.collection("invoices").add({ ...inv, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", invoices.length, "فاتورة");

  // Create expenses
  const expenses = [
    { description: "إيجار المستودع الرئيسي", amount: 5000, category: "rent", paymentMethod: "transfer", notes: "إيجار شهر أغسطس" },
    { description: "فواتير الكهرباء والماء", amount: 1200, category: "utilities", paymentMethod: "cash", notes: "شهر أغسطس" },
    { description: "رواتب الموظفين", amount: 25000, category: "salaries", paymentMethod: "transfer", notes: "رواتب أغسطس" },
    { description: "إعلانات فيسبوك", amount: 800, category: "marketing", paymentMethod: "card", notes: "حملة أغسطس" },
    { description: "شحن طلبات", amount: 450, category: "transport", paymentMethod: "cash", notes: "شحن FedEx" },
  ];

  for (const e of expenses) {
    await db.collection("expenses").add({ ...e, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", expenses.length, "مصروف");

  // Create accounts (Chart of Accounts)
  const accounts = [
    { code: "1000", name: "الصندوق", type: "asset", balance: 50000 },
    { code: "1100", name: "البنك", type: "asset", balance: 120000 },
    { code: "1200", name: "المخزون", type: "asset", balance: 35000 },
    { code: "2000", name: "الحسابات الدائنة", type: "liability", balance: 15000 },
    { code: "3000", name: "رأس المال", type: "equity", balance: 200000 },
    { code: "4000", name: "إيرادات المبيعات", type: "revenue", balance: 85000 },
    { code: "5000", name: "تكلفة البضاعة المباعة", type: "expense", balance: 42000 },
    { code: "5100", name: "المصروفات الإدارية", type: "expense", balance: 12000 },
    { code: "5200", name: "المصروفات التسويقية", type: "expense", balance: 3000 },
  ];

  for (const a of accounts) {
    await db.collection("accounts").add({ ...a, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", accounts.length, "حساب");

  // Create journal entries
  const journalEntries = [
    { date: "2026-08-01", description: "تسجيل إيرادات مبيعات أغسطس", entries: [{accountCode:"1100",accountName:"البنك",debit:5000,credit:0},{accountCode:"4000",accountName:"إيرادات المبيعات",debit:0,credit:5000}], totalDebit: 5000, totalCredit: 5000 },
    { date: "2026-08-01", description: "تسجيل إيجار أغسطس", entries: [{accountCode:"5100",accountName:"المصروفات الإدارية",debit:5000,credit:0},{accountCode:"1100",accountName:"البنك",debit:0,credit:5000}], totalDebit: 5000, totalCredit: 5000 },
  ];

  for (const je of journalEntries) {
    await db.collection("journalEntries").add({ ...je, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", journalEntries.length, "قيود يومية");

  // Create employees
  const employees = [
    { name: "أحمد أيمن", email: "ahmed@stockflow.com", phone: "+966501234567", position: "مدير عام", department: "الإدارة", salary: 15000, status: "active", hireDate: "2024-01-15" },
    { name: "سارة ويلسون", email: "sarah@stockflow.com", phone: "+966509876543", position: "مديرة المبيعات", department: "المبيعات", salary: 12000, status: "active", hireDate: "2024-03-20" },
    { name: "مايك جونسون", email: "mike@stockflow.com", phone: "+966505554444", position: "موظف مخزن", department: "المخازن", salary: 8000, status: "active", hireDate: "2024-06-01" },
    { name: "نور عبدالله", email: "noor@stockflow.com", phone: "+966503332222", position: "محاسبة", department: "الحسابات", salary: 10000, status: "active", hireDate: "2025-01-10" },
  ];

  for (const emp of employees) {
    await db.collection("employees").add({ ...emp, storeId, createdAt: new Date().toISOString() });
  }
  console.log("✓ تم إنشاء", employees.length, "موظف");

  console.log("\n✅ تم ملء قاعدة البيانات بنجاح على Firestore!");
  console.log("بيانات الدخول: admin / admin123");
  console.log("البريد: ahmed@stockflow.com");
}

seed().catch(console.error);
