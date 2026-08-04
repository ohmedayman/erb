import { getAdminAuth, getAdminFirestore } from "./firebase-admin";

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  storeId: string;
}

export async function verifyFirebaseToken(
  request: Request
): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token || token.length < 10) {
      return null;
    }

    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);

    const firestore = getAdminFirestore();
    const userDoc = await firestore
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data()!;
    return {
      userId: decodedToken.uid,
      email: decodedToken.email || userData.email || "",
      fullName: userData.fullName || "",
      role: userData.role || "user",
      storeId: userData.storeId || "",
    };
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Token verification skipped in dev:", error.message);
    }
    return null;
  }
}

export async function getTokenUser(
  request: Request
): Promise<AuthUser | null> {
  return verifyFirebaseToken(request);
}
