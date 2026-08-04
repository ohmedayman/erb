import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function getTokenUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    return { userId: payload.userId, storeId: payload.storeId };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = getTokenUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await prisma.teamMember.findMany({
    where: { storeId: user.storeId },
    orderBy: { joinedAt: "desc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const user = getTokenUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, role } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const member = await prisma.teamMember.create({
    data: {
      name,
      email,
      role: role || "Staff",
      status: "Active",
      storeId: user.storeId,
    },
  });

  return NextResponse.json(member, { status: 201 });
}
