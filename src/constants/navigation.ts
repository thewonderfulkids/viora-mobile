export const AUTH_ROUTES = ["/welcome", "/login", "/signup", "/onboarding"] as const;

export const ADMIN_ROUTES = ["/admin", "/admin-access"] as const;

export const NAV_HIDDEN_ROUTES = [
  ...AUTH_ROUTES,
  ...ADMIN_ROUTES,
  "/delete-account",
] as const;

export const INTERNAL_ONLY_ROUTES = [
  "/beta-feedback",
  "/launch-candidate",
  "/sync-diagnostics",
] as const;

export function routeMatches(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}
