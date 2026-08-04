import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const snapshot = await collections.teamMembers
    .where("storeId", "==", user.storeId)
    .get();

  const members = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, role } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "الاسم والبريد مطلوبين" },
      { status: 400 }
    );
  }

  const docRef = await collections.teamMembers.add({
    name,
    email,
    role: role || "Staff",
    status: "Active",
    storeId: user.storeId,
    joinedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  const created = await docRef.get();
  return NextResponse.json(
    { id: created.id, ...created.data() },
    { status: 201 }
  );
}
