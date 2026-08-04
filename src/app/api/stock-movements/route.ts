import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const snapshot = await collections.stockMovements
    .where("storeId", "==", user.storeId)
    .get();

  const movements = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  movements.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(movements);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const {
    productName,
    sku,
    type,
    quantity,
    fromLocation,
    toLocation,
    reference,
    notes,
  } = body;

  if (!productName || !sku || !type || !quantity) {
    return NextResponse.json({ error: "جميع الحقول المطلوبة مفقودة" }, { status: 400 });
  }

  const docRef = await collections.stockMovements.add({
    productName,
    sku,
    type,
    quantity: parseInt(quantity),
    fromLocation: fromLocation || "",
    toLocation: toLocation || "",
    reference: reference || "",
    notes: notes || "",
    createdBy: user.fullName,
    storeId: user.storeId,
    createdAt: new Date().toISOString(),
  });

  const created = await docRef.get();
  return NextResponse.json(
    { id: created.id, ...created.data() },
    { status: 201 }
  );
}
