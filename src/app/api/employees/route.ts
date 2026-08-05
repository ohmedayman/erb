import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { col } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const employeesCol = await col("employees");
  const snapshot = await employeesCol
    .where("storeId", "==", user.storeId)
    .orderBy("name", "asc")
    .get();

  const employees = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return NextResponse.json(employees);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    email,
    phone,
    position,
    department,
    salary,
    hireDate,
    status,
    bankAccount,
    nationalId,
  } = body;

  if (!name || !position || !department || !salary || !hireDate) {
    return NextResponse.json(
      { error: "جميع الحقول المطلوبة يجب ملؤها" },
      { status: 400 }
    );
  }

  const validStatuses = ["active", "on-leave", "terminated"];
  const employeeStatus = validStatuses.includes(status) ? status : "active";

  const employeesCol = await col("employees");
  const docRef = await employeesCol.add({
    name,
    email: email || "",
    phone: phone || "",
    position,
    department,
    salary: parseFloat(salary),
    hireDate,
    status: employeeStatus,
    bankAccount: bankAccount || "",
    nationalId: nationalId || "",
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
