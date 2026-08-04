import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const snapshot = await collections.invoices
    .where("storeId", "==", user.storeId)
    .get();

  const invoices = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as any)
  );
  invoices.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const {
    customerName,
    customerPhone,
    items,
    subtotal,
    tax,
    total,
    status,
    notes,
    paymentMethod,
    installments: numberOfInstallments,
  } = body;

  if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "جميع الحقول مطلوبة" },
      { status: 400 }
    );
  }

  const invoiceNumber = "INV-" + Date.now().toString(36).toUpperCase();

  const calculatedSubtotal = items.reduce(
    (sum: number, item: any) => sum + (item.quantity || 0) * (item.price || 0),
    0
  );
  const calculatedTax = calculatedSubtotal * 0.15;
  const calculatedTotal = calculatedSubtotal + calculatedTax;
  const finalTotal = total !== undefined ? parseFloat(total) : calculatedTotal;

  const docRef = await collections.invoices.add({
    invoiceNumber,
    customerName,
    customerPhone: customerPhone || "",
    items: items.map((item: any) => ({
      name: item.name || "",
      sku: item.sku || "",
      quantity: parseFloat(item.quantity) || 0,
      price: parseFloat(item.price) || 0,
      total: (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0),
    })),
    subtotal: subtotal !== undefined ? parseFloat(subtotal) : calculatedSubtotal,
    tax: tax !== undefined ? parseFloat(tax) : calculatedTax,
    total: finalTotal,
    status: status || "unpaid",
    notes: notes || "",
    paymentMethod: paymentMethod || "cash",
    storeId: user.storeId,
    createdBy: user.userId,
    createdAt: new Date().toISOString(),
  });

  if (numberOfInstallments && parseInt(numberOfInstallments) > 0) {
    const installmentCount = parseInt(numberOfInstallments);
    const installmentAmount = finalTotal / installmentCount;
    const startDate = new Date().toISOString().split("T")[0];

    await collections.installments.add({
      invoiceId: docRef.id,
      invoiceNumber,
      customerName,
      totalAmount: finalTotal,
      numberOfInstallments: installmentCount,
      installmentAmount: parseFloat(installmentAmount.toFixed(2)),
      paidInstallments: 0,
      startDate,
      status: "active",
      notes: "",
      storeId: user.storeId,
      createdBy: user.userId,
      createdAt: new Date().toISOString(),
    });
  }

  const created = await docRef.get();
  return NextResponse.json(
    { id: created.id, ...created.data() },
    { status: 201 }
  );
}
