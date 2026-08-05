import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { col } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const returnsCol = await col("returns");
  const snapshot = await returnsCol
    .where("storeId", "==", user.storeId)
    .get();

  const returns = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  returns.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(returns);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const {
    orderNumber,
    customerName,
    reason,
    quantity,
    status,
    refundAmount,
    notes,
  } = body;

  if (!orderNumber || !customerName || !reason || !quantity) {
    return NextResponse.json({ error: "جميع الحقول المطلوبة مفقودة" }, { status: 400 });
  }

  const timestamp = Date.now().toString(36).toUpperCase();
  const returnNumber = `RET-${timestamp}`;

  const returnsCol = await col("returns");
  const docRef = await returnsCol.add({
    returnNumber,
    orderNumber,
    customerName,
    reason,
    quantity: parseInt(quantity),
    status: status || "Pending",
    refundAmount: parseFloat(refundAmount) || 0,
    notes: notes || "",
    storeId: user.storeId,
    createdAt: new Date().toISOString(),
  });

  const created = await docRef.get();
  return NextResponse.json(
    { id: created.id, ...created.data() },
    { status: 201 }
  );
}
