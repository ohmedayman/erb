import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

function generateToken(payload: { userId: string; storeId: string }) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now() }));
  const sig = btoa(`${header}.${body}.stockflow-secret`);
  return `${header}.${body}.${sig}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, fullName, storeName } = body;

    if (!username || !email || !password || !fullName || !storeName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const store = await prisma.store.create({
      data: {
        name: storeName,
        ownerName: fullName,
        ownerEmail: email,
      },
    });

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullName,
        role: "admin",
        storeId: store.id,
      },
    });

    const token = generateToken({ userId: user.id, storeId: store.id });

    const response = NextResponse.json({
      token,
      user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
      store: { id: store.id, name: store.name },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
