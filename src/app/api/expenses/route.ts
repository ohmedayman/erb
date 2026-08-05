import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { col } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const expensesCol = await col("expenses");
  const snapshot = await expensesCol
    .where("storeId", "==", user.storeId)
    .orderBy("date", "desc")
    .get();

  const expenses = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const {
    description,
    amount,
    category,
    paymentMethod,
    date,
    notes,
    receiptNumber,
  } = body;

  if (!description || !amount || !category || !paymentMethod || !date) {
    return NextResponse.json(
      { error: "جميع الحقول المطلوبة يجب ملؤها" },
      { status: 400 }
    );
  }

  const validCategories = [
    "rent",
    "utilities",
    "salaries",
    "marketing",
    "transport",
    "other",
  ];
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: "فئة غير صالحة" },
      { status: 400 }
    );
  }

  const validPaymentMethods = ["cash", "card", "transfer"];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return NextResponse.json(
      { error: "طريقة دفع غير صالحة" },
      { status: 400 }
    );
  }

  const expensesCol = await col("expenses");
  const docRef = await expensesCol.add({
    description,
    amount: parseFloat(amount),
    category,
    paymentMethod,
    date,
    notes: notes || "",
    receiptNumber: receiptNumber || "",
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
