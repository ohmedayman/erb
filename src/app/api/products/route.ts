import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { col } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const productsCol = await col("products");
  const snapshot = await productsCol
    .where("storeId", "==", user.storeId)
    .get();

  const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { name, sku, category, price, stock, minStock } = body;

  if (!name || !category || price === undefined || stock === undefined) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  }

  const finalSku =
    sku ||
    "SKU-" +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).substring(2, 5).toUpperCase();

  const min = parseInt(minStock || "10");
  const st = parseInt(stock);
  let status = "Active";
  if (st === 0) status = "Out of Stock";
  else if (st <= min) status = "Low Stock";

  const productsCol = await col("products");
  const docRef = await productsCol.add({
    name,
    sku: finalSku,
    category,
    price: parseFloat(price),
    stock: st,
    minStock: min,
    status,
    storeId: user.storeId,
    createdAt: new Date().toISOString(),
  });

  const created = await docRef.get();
  return NextResponse.json({ id: created.id, ...created.data() }, { status: 201 });
}
