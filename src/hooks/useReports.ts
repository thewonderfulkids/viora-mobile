import { useCallback, useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import { createAndShareReportPdf, createReportExport, getReportCenter, saveGeneratedReport, shareSavedReportExport } from "../services";
import { HealthReportDoc, ReportCenterDashboard, ReportRange } from "../types";

export function useReports() {
  const [dashboard, setDashboard] = useState<ReportCenterDashboard | null>(null);
  const [selectedRange, setSelectedRange] = useState<ReportRange>("daily");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (range = selectedRange) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setLoading(false);
      setRefreshing(false);
      setError("Please login again.");
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const result = await getReportCenter(currentUser.uid, range);
      setDashboard(result);
    } catch (error: any) {
      setError(error?.message || "Unable to load health reports.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    refresh(selectedRange);
  }, [refresh, selectedRange]);

  const changeRange = useCallback((range: ReportRange) => {
    setSelectedRange(range);
  }, []);

  const saveCurrentReport = useCallback(async (report: HealthReportDoc) => {
    setSaving(true);
    setError(null);

    try {
      await saveGeneratedReport(report);
      await refresh(report.range);
    } catch (error: any) {
      setError(error?.message || "Unable to save report.");
    } finally {
      setSaving(false);
    }
  }, [refresh]);

  const exportCurrentReport = useCallback(async (report: HealthReportDoc) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setSaving(true);
    setError(null);

    try {
      await createAndShareReportPdf(report);
      await createReportExport(currentUser.uid, report);
      await refresh(report.range);
    } catch (error: any) {
      setError(error?.message || "Unable to export report.");
    } finally {
      setSaving(false);
    }
  }, [refresh]);

  const openSavedExport = useCallback(async (exportId: string) => {
    const record = dashboard?.exports.find((item) => item.id === exportId);
    if (!record) return;

    setSaving(true);
    setError(null);

    try {
      await shareSavedReportExport(record);
    } catch (error: any) {
      setError(error?.message || "Unable to open saved report.");
    } finally {
      setSaving(false);
    }
  }, [dashboard?.exports]);

  return {
    dashboard,
    selectedRange,
    loading,
    refreshing,
    saving,
    error,
    refresh,
    changeRange,
    saveCurrentReport,
    exportCurrentReport,
    openSavedExport,
  };
}
