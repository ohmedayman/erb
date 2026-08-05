import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App | null = null;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "stockflow-444d3";
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@stockflow-444d3.iam.gserviceaccount.com";
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64
    ? Buffer.from(process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64, "base64").toString("utf-8")
    : process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")
  ) || `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCe3TkiPj422VgZ
44k4UQoaYt4xUCqc7NMlUEOMqm4nO5lPlqsmPMezSjUYJbtzQML1PQLq/VZDBz9P
a3R8y7jHBubpPUr9WkLvlUoGDu1qCJ55wnihCoRDs/VVGB4Y1X3EjziDORmlGXXr
s6UM//bxX/SKXb+mkUoP98/yzWdeUE6jqUACVPN1jmO37c9KEcwABFQdunWdMqUG
xoJ/U4g4X5S+ls9T7M67gh72n3zFn7dkb4kgu1Xm0QT9bxT11+0DTbUzFYcbuihd
REom8MsQWedEERKtxCuQJyNSZgpCgAI/HVAb0e8EcnH/XV42wCdag3VohKDW1GoA
vffoLf89AgMBAAECggEANXVhI/5JBkEGLhQM2Xgfy7hIZ9S/ujXRaaWETaIOVkJu
eUNMzZ23X8RRcJJF7Wc2E7tXr4bXj8+xBMM2nEYbpFHUw1j+Upocmy2kDrzYNI24
8mU4HY0B7BxzKpLmkdnJrCq7zCCbWhziuxGlMWYzDY+KJUOd2enbP9tWzTBEoA4j
RwLbbTkorrw4RtA9KWdDqljeLktDjYkGn4X1L5s1dm8Etv+tuXbtpviSGcvajJLz
gcQszWPLeTM1bQwnHhl5NJiU65vP1xTC9oD9A4yT76ixPj8v2HY/oEoTGtzpQA2a
OuCwytKj1o3od0cukrhoGJrXg7T5JdOc5e7LrjopGwKBgQDSd0pWVcN3yxViy2kP
4BhE/EP2q3CVu0CFz5aBGdlZFpKXhsb989Sf3pT7jrDKEObBN5K1kFndHYkq6n0l
7BNCqTjXMxZJcuu2SaWdzjiK37Cyjf+Gfc7OX1JCsYDKVc1Tvji6VVpz0D6Hg3ZA
Y1BIjAFj6PL2K3Cez/Yfmg29ZwKBgQDBO/P/LV8Ejlpkj9s++ttRAarZWYvlyChL
lkw+4M2mz2yAJtqBobIxUEAkNV+rlFL+rPlCfxJnk8bTctbEz4X6XDJYif9l7eQc
l1xxXAD22lpdVab17JJ3rhkxS02ARNcazUOFLOvAlV8je8vulncrDfhw4EDYwwzL
P4DZKHoTuwKBgCt/niyT0y9qGMRveApg7YMshDtyGXXI2sANNHUAS6ye/rM0luIb
yAE2tqH7Tsyki5y5iKff6sLJfPUSu8TfsudfJDFODLgneVIWjJU97u+85b8xm/NH
Azwh9VV1bEHlU+eP9BeG1ogDLTlC0WjjXc9wqETm+3gnaEJahurnIxnXAoGAU4fB
H+vTCTsoJBRzqDP0nn3kBvTIntn5YUNlTkELZTKBKpyhFCx7xQl10LEp3BfQELth
PLeFkzS0XC9mW8mBlwpH0TJGLx+43gsoMPCekhctvO8Lr39GiWm/BioRJIOdoL5e
k7EpcCSh7crUCx0MApaVcOXf4lPesfWPk1AGBYUCgYAyAE9yxQZxSSI3GztgMCO8
VtMG6BOTzxTWOS+ZGBRj02C7CQUrG4yQmvRewinAsVQlQ0F+K/HCOto+wQMbz37B
4P5fXOC+BdG7olj+B8UhvyU3nG1/eHsNZkWC0QVDIx+e64/lI9admbnhBIqHtrMF
epmXdZ0tvGwOWequxytIxw==
-----END PRIVATE KEY-----`;

  if (projectId && clientEmail && privateKey) {
    try {
      adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } catch (e: any) {
      console.error("Firebase Admin cert failed:", e.message);
      adminApp = initializeApp({ projectId });
    }
  } else {
    adminApp = initializeApp({ projectId });
  }

  return adminApp;
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
