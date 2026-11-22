import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase/firebaseConfig";
import { AdminAccessGrantInput, AdminAccessGrantResult, AdminAccessUser } from "../../types";

export async function searchAccessUserByEmail(_adminEmail: string, targetEmail: string): Promise<AdminAccessUser | null> {
  const email = targetEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid user email.");
  // Do not expose the full user directory through client-side Firestore queries.
  // The server securely resolves registered and future users during grant.
  return { uid: "", fullName: "Email recipient", email };
}

export async function grantPremiumAccess(input: AdminAccessGrantInput): Promise<AdminAccessGrantResult & { status: string }> {
  const call = httpsCallable<{ email: string; planCode: string; note: string }, { status: string; email: string; planCode: string }>(functions, "adminGrantPremiumByEmail");
  const response = await call({ email: input.targetEmail, planCode: input.planCode, note: input.note || "" });
  return { subscriptionId: "", planCode: input.planCode, expiresAt: null, status: response.data.status };
}

export function getAdminGrantExpiry(_planCode: string): null { return null; }
