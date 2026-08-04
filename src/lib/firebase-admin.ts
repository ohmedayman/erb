import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App | null = null;

function decodePrivateKey(): string | null {
  const b64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64;
  if (b64) {
    try {
      return Buffer.from(b64, "base64").toString("utf-8");
    } catch {}
  }

  const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (raw) {
    return raw.replace(/\\n/g, "\n").replace(/\\r/g, "\r").trim();
  }

  return null;
}

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = decodePrivateKey();

  if (projectId && clientEmail && privateKey) {
    try {
      adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } catch (e: any) {
      console.error("Firebase Admin cert failed:", e.message);
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } else {
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  return adminApp;
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
