import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { col } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const journalEntriesCol = await col("journalEntries");
  const snapshot = await journalEntriesCol
    .where("storeId", "==", user.storeId)
    .orderBy("date", "desc")
    .get();

  const entries = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { date, description, entries, totalDebit, totalCredit } = body;

  if (!date || !description || !entries || entries.length === 0) {
    return NextResponse.json(
      { error: "جميع الحقول المطلوبة يجب ملؤها" },
      { status: 400 }
    );
  }

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    return NextResponse.json(
      { error: "المدين والدائن يجب أن يكونا متساويين" },
      { status: 400 }
    );
  }

  for (const entry of entries) {
    if (!entry.accountCode || (!entry.debit && !entry.credit)) {
      return NextResponse.json(
        { error: "جميع القيود يجب أن تحتوي على رمز حساب ومبلغ" },
        { status: 400 }
      );
    }
  }

  const journalEntriesCol = await col("journalEntries");
  const docRef = await journalEntriesCol.add({
    date,
    description,
    entries,
    totalDebit: parseFloat(totalDebit),
    totalCredit: parseFloat(totalCredit),
    status: "posted",
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
