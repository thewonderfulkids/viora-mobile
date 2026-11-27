// Bridge for a trusted platform attestation provider. No debug or fabricated tokens.
type TokenProvider = () => Promise<string | null>;
let provider: TokenProvider | undefined;
export function registerAppCheckTokenProvider(next: TokenProvider): void {
  provider = next;
}
export async function getVioraAppCheckToken(): Promise<string | null> {
  if (!provider) return null;
  const activeProvider = provider;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let token: string | null;
  try {
    token = await Promise.race([
      activeProvider(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("App verification unavailable")), 8000);
      }),
    ]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
  if (typeof token !== "string" || !token.trim() || token.length > 8192) throw new Error("App verification unavailable");
  return token;
}
