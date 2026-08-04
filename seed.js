const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const db = new Database("dev.db");
db.pragma("foreign_keys = OFF");
function cuid() { return "c" + crypto.randomBytes(12).toString("hex"); }

const existing = db.prepare("SELECT id FROM User WHERE username = ?").get("admin");
if (existing) { console.log("Already seeded. admin / admin123"); db.close(); process.exit(0); }

const storeId = cuid();
const hashedPassword = bcrypt.hashSync("admin123", 10);

db.prepare(`INSERT INTO Store (id,name,description,category,currency,timezone,country,city,state,zipCode,address,ownerName,ownerEmail,ownerPhone,taxId,emailNotifs,orderAlerts,lowStockAlerts,weeklyReports,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`).run(
  storeId, "متجر ستوك فلو", "نظام إدارة مخازن احترافي", "إلكترونيات", "USD", "Asia/Riyadh", "المملكة العربية السعودية", "الرياض", "الرياض", "123456", "شارع الملك فهد", "أحمد أيمن", "ahmed@stockflow.com", "+966501234567", "SA-12345678", 1, 1, 1, 0
);
console.log("Store created:", storeId);

db.prepare(`INSERT INTO User (id,username,email,password,fullName,role,createdAt,storeId) VALUES (?,?,?,?,?,?,datetime('now'),?)`).run(
  cuid(), "admin", "ahmed@stockflow.com", hashedPassword, "أحمد أيمن", "admin", storeId
);
console.log("Admin user created");

const products = [
  ["ماوس لاسلكي", "WM-001", "إلكترونيات", 29.99, 150, 50, "Active"],
  ["كرسي مكتب", "OC-023", "أثاث", 199.0, 45, 20, "Active"],
  ["كابل USB 2م", "UC-045", "ملحقات", 9.99, 500, 100, "Active"],
  ["مكتب قابل للتعديل", "SD-067", "أثاث", 449.0, 12, 15, "Low Stock"],
  ["حامل شاشة", "MS-089", "ملحقات", 39.99, 0, 10, "Out of Stock"],
  ["لوحة مفاتيح برو", "KP-101", "إلكترونيات", 79.99, 200, 50, "Active"],
  ["كاميرا ويب HD", "WC-123", "إلكترونيات", 59.99, 85, 30, "Active"],
  ["مصباح مكتب", "DL-145", "إضاءة", 24.99, 320, 50, "Active"],
];
const insertP = db.prepare(`INSERT INTO Product (id,name,sku,category,price,stock,minStock,status,createdAt,storeId) VALUES (?,?,?,?,?,?,?,?,datetime('now'),?)`);
for (const p of products) insertP.run(cuid(), ...p, storeId);
console.log("Products created:", products.length);

const orders = [
  ["ORD-7891", "أحمد حسن", 5, 1250, "Shipped", "Paid"],
  ["ORD-7890", "سارة محمد", 3, 890, "Processing", "Paid"],
  ["ORD-7889", "عمر علي", 8, 2100, "Delivered", "Paid"],
  ["ORD-7888", "فاطمة يوسف", 2, 560, "Pending", "Pending"],
  ["ORD-7887", "خالد إبراهيم", 12, 3400, "Shipped", "Paid"],
  ["ORD-7886", "نور عبدالله", 6, 780, "Delivered", "Paid"],
  ["ORD-7885", "يوسف كمال", 4, 1650, "Cancelled", "Refunded"],
  ["ORD-7884", "منى صالح", 7, 2340, "Delivered", "Paid"],
];

const orderIds = [];
const insertO = db.prepare(`INSERT INTO "Order" (id,orderNumber,customerName,items,total,status,payment,date,storeId) VALUES (?,?,?,?,?,?,?,?,datetime('now'))`);
for (const o of orders) {
  const id = cuid();
  console.log("Inserting order:", id, o[0], "storeId:", storeId);
  insertO.run(id, ...o, storeId);
  orderIds.push(id);
}
console.log("Orders created:", orders.length);

const shipments = [
  ["SHP-001", "FedEx", "In Transit", "الرياض", "جدة", "6 أغسطس", orderIds[0]],
  ["SHP-002", "UPS", "Delivered", "الدمام", "مكة", "3 أغسطس", orderIds[4]],
  ["SHP-003", "DHL", "Processing", "المدينة", "الخبر", "8 أغسطس", orderIds[1]],
  ["SHP-004", "FedEx", "Returned", "جدة", "الرياض", "5 أغسطس", orderIds[6]],
];
const insertS = db.prepare(`INSERT INTO Shipment (id,shipmentNumber,carrier,status,origin,destination,eta,orderId) VALUES (?,?,?,?,?,?,?,?)`);
for (const s of shipments) insertS.run(cuid(), ...s);
console.log("Shipments created:", shipments.length);

const team = [
  ["أحمد أيمن", "ahmed@stockflow.com", "Admin", "Active"],
  ["سارة ويلسون", "sarah@stockflow.com", "Manager", "Active"],
  ["مايك جونسون", "mike@stockflow.com", "Staff", "Active"],
];
const insertM = db.prepare(`INSERT INTO TeamMember (id,name,email,role,status,joinedAt,storeId) VALUES (?,?,?,?,?,datetime('now'),?)`);
for (const t of team) insertM.run(cuid(), ...t, storeId);
console.log("Team created:", team.length);

const purchaseOrders = [
  ["PO-001", "شركة التقنية", 20, 5000, "Pending", "15 أغسطس"],
  ["PO-002", "مورد الأثاث", 10, 8000, "Approved", "20 أغسطس"],
  ["PO-003", "الإلكترونيات المتحدة", 50, 12000, "Delivered", "1 أغسطس"],
];
const insertPO = db.prepare(`INSERT INTO PurchaseOrder (id,poNumber,supplierName,items,total,status,expectedDate,createdAt,storeId) VALUES (?,?,?,?,?,?,?,datetime('now'),?)`);
for (const po of purchaseOrders) insertPO.run(cuid(), ...po, storeId);
console.log("Purchase orders created:", purchaseOrders.length);

const notifications = [
  ["طلب جديد", "تم استلام طلب جديد من أحمد حسن #ORD-7891", "order", 0],
  ["تنبيه مخزون منخفض", "المنتجات 'حامل شاشة' وصلت للحد الأدنى", "warning", 0],
  ["تم التوصيل", "تم توصيل الطلب #ORD-7889 بنجاح", "success", 0],
  ["عضو جديد", "تمت إضافة مايك جونسون للفريق", "info", 1],
];
const insertN = db.prepare(`INSERT INTO Notification (id,title,message,type,read,createdAt,storeId) VALUES (?,?,?,?,?,datetime('now'),?)`);
for (const n of notifications) insertN.run(cuid(), ...n, storeId);
console.log("Notifications created:", notifications.length);

console.log("\nتم ملء قاعدة البيانات بنجاح!");
console.log("بيانات الدخول: admin / admin123");
db.close();
