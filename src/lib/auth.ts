import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode("stockflow-secret-2026");

export const ADMIN_USER = {
  id: "admin-001",
  username: "admin",
  password: "$2b$10$R4YFRGVnEUE91MS/jV/InO98WNossr4kVLdFvaaDqts.q1ykWxh4y", // admin123
  fullName: "مدير النظام",
  email: "admin@stockflow.com",
  role: "admin",
  storeId: "store-001",
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: Record<string, any>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<Record<string, any> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as Record<string, any>;
  } catch {
    return null;
  }
}

export async function verifyFirebaseToken(request: NextRequest): Promise<Record<string, any> | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7);
  return verifyToken(token);
}
