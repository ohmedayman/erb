import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { col } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const accountsCol = await col("accounts");
  const snapshot = await accountsCol
    .where("storeId", "==", user.storeId)
    .orderBy("code", "asc")
    .get();

  const accounts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return NextResponse.json(accounts);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { name, type, parentCode, balance, notes } = body;

  if (!name || !type) {
    return NextResponse.json(
      { error: "اسم الحساب ونوعه مطلوبان" },
      { status: 400 }
    );
  }

  const validTypes = ["asset", "liability", "equity", "revenue", "expense"];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: "نوع حساب غير صالح" },
      { status: 400 }
    );
  }

  const typePrefixMap: Record<string, string> = {
    asset: "1",
    liability: "2",
    equity: "3",
    revenue: "4",
    expense: "5",
  };

  const accountsCol = await col("accounts");
  const existingAccounts = await accountsCol
    .where("storeId", "==", user.storeId)
    .where("type", "==", type)
    .get();

  const prefix = typePrefixMap[type];
  const nextNum = String(existingAccounts.size + 1).padStart(3, "0");
  const code = parentCode ? `${parentCode}${nextNum}` : `${prefix}${nextNum}`;

  const docRef = await accountsCol.add({
    code,
    name,
    type,
    parentCode: parentCode || "",
    balance: parseFloat(balance) || 0,
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
