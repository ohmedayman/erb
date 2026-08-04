import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const snapshot = await collections.shipments
    .where("storeId", "==", user.storeId)
    .get();

  const shipments = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(shipments);
}
