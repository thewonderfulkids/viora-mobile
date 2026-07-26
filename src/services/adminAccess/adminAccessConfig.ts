const VIORA_ADMIN_EMAILS = ["support@winflyindia.in", "drdigiweb@gmail.com"];

export function normalizeAdminEmail(email?: string | null) {
  return String(email || "").trim().toLowerCase();
}

export function isVioraAccessAdmin(email?: string | null) {
  return VIORA_ADMIN_EMAILS.includes(normalizeAdminEmail(email));
}
