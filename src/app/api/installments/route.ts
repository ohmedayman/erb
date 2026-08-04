import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const snapshot = await collections.installments
    .where("storeId", "==", user.storeId)
    .get();

  const installments = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as any)
  );
  installments.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(installments);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const {
    invoiceId,
    invoiceNumber,
    customerName,
    totalAmount,
    numberOfInstallments,
    installmentAmount,
    startDate,
    status,
    notes,
  } = body;

  if (
    !invoiceId ||
    !invoiceNumber ||
    !customerName ||
    !totalAmount ||
    !numberOfInstallments ||
    !installmentAmount ||
    !startDate
  ) {
    return NextResponse.json(
      { error: "جميع الحقول المطلوبة يجب ملؤها" },
      { status: 400 }
    );
  }

  const validStatuses = ["active", "completed", "cancelled"];
  const installmentStatus = validStatuses.includes(status) ? status : "active";

  const docRef = await collections.installments.add({
    invoiceId,
    invoiceNumber,
    customerName,
    totalAmount: parseFloat(totalAmount),
    numberOfInstallments: parseInt(numberOfInstallments),
    installmentAmount: parseFloat(installmentAmount),
    paidInstallments: 0,
    startDate,
    status: installmentStatus,
    notes: notes || "",
    storeId: user.storeId,
    createdBy: user.userId,
    createdAt: new Date().toISOString(),
  });

  const created = await docRef.get();
  return NextResponse.json(
    { id: created.id, ...created.data() },
    { status: 201 }
  );
}
