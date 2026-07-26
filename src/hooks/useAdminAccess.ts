import { useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getAdminGrantExpiry, grantPremiumAccess, isVioraAccessAdmin, searchAccessUserByEmail } from "../services/adminAccess";
import { AdminAccessUser, PremiumPlanCode } from "../types";

export function useAdminAccess() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [selectedPlanCode, setSelectedPlanCode] = useState<PremiumPlanCode>("ELITE_FAMILY_YEARLY");
  const [note, setNote] = useState("Manual beta/admin access grant");
  const [targetUser, setTargetUser] = useState<AdminAccessUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const adminEmail = user?.email || "";
  const isAdmin = isVioraAccessAdmin(adminEmail);

  async function searchUser() {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      setTargetUser(null);
      const result = await searchAccessUserByEmail(adminEmail, email);
      if (!result) {
        setError("No Viora user found with this email.");
        return;
      }
      setTargetUser(result);
      setMessage("User found. Select a plan and grant access.");
    } catch (err: any) {
      setError(err?.message || "Unable to search user.");
    } finally {
      setLoading(false);
    }
  }

  async function grantAccess() {
    if (!targetUser || !user) return;

    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const result = await grantPremiumAccess({
        adminUserId: user.uid,
        adminEmail,
        targetUserId: targetUser.uid,
        targetEmail: targetUser.email,
        targetName: targetUser.fullName,
        planCode: selectedPlanCode,
        expiresAt: getAdminGrantExpiry(selectedPlanCode),
        note,
      });
      setMessage(`Access updated to ${result.planCode}. Ask user to reopen the app or pull-refresh Premium.`);
    } catch (err: any) {
      setError(err?.message || "Unable to grant access.");
    } finally {
      setSaving(false);
    }
  }

  return useMemo(() => ({
    email,
    setEmail,
    selectedPlanCode,
    setSelectedPlanCode,
    note,
    setNote,
    targetUser,
    loading,
    saving,
    message,
    error,
    isAdmin,
    searchUser,
    grantAccess,
  }), [adminEmail, email, error, isAdmin, loading, message, note, saving, selectedPlanCode, targetUser, user]);
}
