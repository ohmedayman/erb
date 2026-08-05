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

  const inventory = snapshot.docs.map((doc) => {
    const p = doc.data();
    const stock = p.stock ?? 0;
    const minStock = p.minStock ?? 0;
    return {
      id: doc.id,
      name: p.name,
      sku: p.sku,
      warehouse: "المستودع الرئيسي",
      stock,
      min: minStock,
      status:
        stock === 0 ? "Critical" : stock <= minStock ? "Low" : "Healthy",
    };
  });

  return NextResponse.json(inventory);
}
