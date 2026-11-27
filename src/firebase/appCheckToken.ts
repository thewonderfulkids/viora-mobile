// Bridge for a trusted platform attestation provider. No debug or fabricated tokens.
type TokenProvider = () => Promise<string | null>;
let provider: TokenProvider | undefined;
export function registerAppCheckTokenProvider(next: TokenProvider): void {
  provider = next;
}
export async function getVioraAppCheckToken(): Promise<string | null> {
  if (!provider) return null;
  const token = await provider();
  if (typeof token !== "string" || !token.trim() || token.length > 8192) throw new Error("App verification unavailable");
  return token;
}
