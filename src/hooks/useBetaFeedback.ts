import { useCallback, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { submitBetaFeedback } from "../services/support";
import { BetaFeedbackCategory, BetaFeedbackSeverity } from "../types";

export function useBetaFeedback() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [currentScreen, setCurrentScreen] = useState("");
  const [category, setCategory] = useState<BetaFeedbackCategory>("bug");
  const [severity, setSeverity] = useState<BetaFeedbackSeverity>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => title.trim().length >= 4 && details.trim().length >= 10 && !submitting, [details, submitting, title]);

  const reset = useCallback(() => {
    setTitle("");
    setDetails("");
    setCurrentScreen("");
    setCategory("bug");
    setSeverity("medium");
    setSuccessMessage(null);
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      await submitBetaFeedback({
        userId: user?.uid || "",
        title,
        details,
        category,
        severity,
        currentScreen,
      });

      setSuccessMessage("Feedback submitted. Thank you for helping stabilize Viora beta.");
      setTitle("");
      setDetails("");
      setCurrentScreen("");
      setCategory("bug");
      setSeverity("medium");
    } catch (err: any) {
      setError(err?.message || "Unable to submit feedback right now.");
    } finally {
      setSubmitting(false);
    }
  }, [category, currentScreen, details, severity, title, user?.uid]);

  return {
    title,
    setTitle,
    details,
    setDetails,
    currentScreen,
    setCurrentScreen,
    category,
    setCategory,
    severity,
    setSeverity,
    submitting,
    canSubmit,
    successMessage,
    error,
    reset,
    submit,
  };
}
