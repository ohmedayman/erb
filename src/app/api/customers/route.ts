import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { col } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const customersCol = await col("customers");
  const snapshot = await customersCol
    .where("storeId", "==", user.storeId)
    .get();

  const customers = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as any)
  );
  customers.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(customers);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, email, address, taxId, type, balance } = body;

  if (!name) {
    return NextResponse.json({ error: "اسم العميل مطلوب" }, { status: 400 });
  }

  const customersCol = await col("customers");
  const docRef = await customersCol.add({
    name,
    phone: phone || "",
    email: email || "",
    address: address || "",
    taxId: taxId || "",
    type: type || "individual",
    balance: parseFloat(balance) || 0,
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
