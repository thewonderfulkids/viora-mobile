import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";
import {
  getAdminControlState,
  grantAdminPlan,
  searchAdminUsers,
  setAdminUserDisabled,
  toggleAdminContent,
  updateAdminConfig,
  upsertAdminContent,
} from "../services/adminControl";
import { AdminAppConfig, AdminContentInput, AdminControlState, AdminManagedContent, AdminUserSearchResult, PremiumPlanCode } from "../types";
import { isVioraAccessAdmin } from "../services/adminAccess";

const EMPTY_CONTENT: AdminContentInput = {
  kind: "video",
  title: "",
  subtitle: "",
  category: "home_workout",
  level: "beginner",
  durationMinutes: 15,
  url: "",
  thumbnailUrl: "",
  storagePath: "",
  thumbnailStoragePath: "",
  mediaFileName: "",
  mediaContentType: "",
  provider: "youtube",
  mediaType: "video",
  caloriesEstimate: 0,
  equipment: [],
  instructor: "",
  benefits: [],
  steps: [],
  isPremium: false,
  isActive: true,
  sortOrder: 100,
};

export function useAdminControl() {
  const { user, isAdmin: authIsAdmin } = useAuth();
  const adminEmail = user?.email || "";
  const isAdmin = authIsAdmin || isVioraAccessAdmin(adminEmail);
  const [state, setState] = useState<AdminControlState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [contentDraft, setContentDraft] = useState<AdminContentInput>(EMPTY_CONTENT);
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<AdminUserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserSearchResult | null>(null);
  const [selectedPlanCode, setSelectedPlanCode] = useState<PremiumPlanCode>("ELITE_FAMILY_YEARLY");

  const load = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getAdminControlState(adminEmail);
      setState(result);
    } catch (err: any) {
      setError(err?.message || "Unable to load admin panel.");
    } finally {
      setLoading(false);
    }
  }, [adminEmail, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const updateConfig = useCallback(async (config: AdminAppConfig) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await updateAdminConfig(adminEmail, config);
      setState((current) => current ? { ...current, appConfig: updated } : current);
      setMessage("App config updated.");
    } catch (err: any) {
      setError(err?.message || "Unable to update app config.");
    } finally {
      setSaving(false);
    }
  }, [adminEmail]);

  const saveContent = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const saved = await upsertAdminContent(adminEmail, contentDraft);
      setState((current) => {
        if (!current) return current;
        const nextContent = current.content.filter((item) => item.id !== saved.id).concat(saved).sort((a, b) => a.sortOrder - b.sortOrder);
        return { ...current, content: nextContent };
      });
      setContentDraft(EMPTY_CONTENT);
      setMessage("Content saved. Users will see it without a new APK after refresh.");
    } catch (err: any) {
      setError(err?.message || "Unable to save content.");
    } finally {
      setSaving(false);
    }
  }, [adminEmail, contentDraft]);

  const editContent = useCallback((item: AdminManagedContent) => {
    setContentDraft({ ...item });
    setMessage("Editing content item. Update fields and save.");
  }, []);

  const toggleContent = useCallback(async (item: AdminManagedContent) => {
    try {
      setSaving(true);
      setError(null);
      await toggleAdminContent(adminEmail, item.id, !item.isActive);
      setState((current) => current ? {
        ...current,
        content: current.content.map((contentItem) => contentItem.id === item.id ? { ...contentItem, isActive: !item.isActive } : contentItem),
      } : current);
    } catch (err: any) {
      setError(err?.message || "Unable to update content status.");
    } finally {
      setSaving(false);
    }
  }, [adminEmail]);

  const searchUsers = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const result = await searchAdminUsers(adminEmail, userSearch);
      setUsers(result);
      setSelectedUser(result[0] || null);
      setMessage(result.length ? "User found. Select plan and apply." : "No user found.");
    } catch (err: any) {
      setError(err?.message || "Unable to search users.");
    } finally {
      setSaving(false);
    }
  }, [adminEmail, userSearch]);

  const applyPlan = useCallback(async () => {
    if (!user || !selectedUser) return;

    try {
      setSaving(true);
      setError(null);
      await grantAdminPlan({
        adminUserId: user.uid,
        adminEmail,
        targetUser: selectedUser,
        planCode: selectedPlanCode,
      });
      setMessage(`Plan updated to ${selectedPlanCode}. Ask user to reopen app or refresh Premium.`);
      await load();
    } catch (err: any) {
      setError(err?.message || "Unable to update plan.");
    } finally {
      setSaving(false);
    }
  }, [adminEmail, load, selectedPlanCode, selectedUser, user]);

  const toggleUserDisabled = useCallback(async (target: AdminUserSearchResult) => {
    try {
      setSaving(true);
      setError(null);
      await setAdminUserDisabled(adminEmail, target.uid, !target.isDisabled);
      setUsers((current) => current.map((item) => item.uid === target.uid ? { ...item, isDisabled: !target.isDisabled } : item));
    } catch (err: any) {
      setError(err?.message || "Unable to update user status.");
    } finally {
      setSaving(false);
    }
  }, [adminEmail]);

  return useMemo(() => ({
    isAdmin,
    state,
    loading,
    saving,
    error,
    message,
    contentDraft,
    setContentDraft,
    userSearch,
    setUserSearch,
    users,
    selectedUser,
    setSelectedUser,
    selectedPlanCode,
    setSelectedPlanCode,
    refresh: load,
    updateConfig,
    saveContent,
    editContent,
    toggleContent,
    searchUsers,
    applyPlan,
    toggleUserDisabled,
  }), [applyPlan, contentDraft, editContent, error, isAdmin, load, loading, message, saveContent, saving, searchUsers, selectedPlanCode, selectedUser, state, toggleContent, toggleUserDisabled, updateConfig, userSearch, users]);
}
