export const ADMIN_EMAILS = ["admin@stockflow.com", "m44408335@gmail.com", "admin@stockflow.vexonet.online"];

const _rawSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === "production"
  ? (() => { throw new Error("JWT_SECRET env var is required in production"); })()
  : "stockflow-dev-only-secret-do-not-use-in-prod");
export const JWT_SECRET = new TextEncoder().encode(_rawSecret);

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
