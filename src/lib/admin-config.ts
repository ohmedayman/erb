export const ADMIN_EMAILS = ["admin@stockflow.com", "m44408335@gmail.com", "admin@stockflow.vexonet.online"];

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "stockflow-secret-key-2026"
);

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
