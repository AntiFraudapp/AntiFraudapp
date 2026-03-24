// React hook for submitting reports from Advanced Contact Lookup
// Calls backend canister for hybrid anonymous/authenticated reporting
// Manages loading/error/success state with localized error messages

import { useI18n } from "@/i18n/I18nProvider";
import { useState } from "react";
import { TargetType } from "../backend";
import { useActor } from "./useActor";

export type ReportCategory = "Spam" | "Phishing" | "Scam" | "Other";

interface SubmitReportParams {
  contactValue: string;
  contactType: "phone" | "email";
  category: ReportCategory;
  description?: string;
}

export function useSubmitLookupReport() {
  const { t } = useI18n();
  const { actor } = useActor();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitReport = async (params: SubmitReportParams) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      if (!actor) {
        throw new Error("Backend actor not available");
      }

      // Map contact type to TargetType
      const targetType: TargetType =
        params.contactType === "phone"
          ? TargetType.phoneNumber
          : TargetType.email;

      // Submit report to backend (supports both anonymous and authenticated)
      await actor.report(targetType, params.contactValue, params.category);

      setSuccess(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error("Report submission error:", err);
      setError(t.reportSubmissionError || "Failed to submit report");
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    submitReport,
    isSubmitting,
    error,
    success,
    resetState,
  };
}
