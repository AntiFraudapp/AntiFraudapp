// Report submission dialog component for anonymous/authenticated reporting
// Prefills contact value, limited category options, optional description
// Shows anonymity notice and success/error states using shadcn-ui Dialog

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  type ReportCategory,
  useSubmitLookupReport,
} from "@/hooks/useSubmitLookupReport";
import { useI18n } from "@/i18n/I18nProvider";
import { AlertCircle, CheckCircle, Info, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface ReportSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledContact?: string;
  contactType?: "phone" | "email";
}

export function ReportSubmissionDialog({
  open,
  onOpenChange,
  prefilledContact,
  contactType,
}: ReportSubmissionDialogProps) {
  const { t } = useI18n();
  const { identity } = useInternetIdentity();
  const { submitReport, isSubmitting, error, success, resetState } =
    useSubmitLookupReport();

  const [category, setCategory] = useState<ReportCategory>("Spam");
  const [description, setDescription] = useState("");

  const isAuthenticated = !!identity;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCategory("Spam");
      setDescription("");
      resetState();
    }
  }, [open, resetState]);

  const handleSubmit = async () => {
    if (!prefilledContact || !contactType) return;

    await submitReport({
      contactValue: prefilledContact,
      contactType,
      category,
      description: description.trim() || undefined,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t.reportDialogTitle}
          </DialogTitle>
          <DialogDescription>{t.reportDialogDescription}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-4">
            <Alert className="border-success bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                {t.reportSuccessMessage}
              </AlertDescription>
            </Alert>
            <Button onClick={handleClose} className="w-full">
              {t.reportCancelButton}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Anonymity Notice */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {isAuthenticated
                  ? "O seu reporte será submetido com autenticação (identidade protegida por hash)."
                  : t.reportAnonymityNotice}
              </AlertDescription>
            </Alert>

            {/* Contact (read-only) */}
            <div className="space-y-2">
              <Label>{t.reportContactLabel}</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {prefilledContact || "Nenhum contacto"}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">{t.reportCategoryLabel}</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as ReportCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spam">{t.reportCategorySpam}</SelectItem>
                  <SelectItem value="Phishing">
                    {t.reportCategoryPhishing}
                  </SelectItem>
                  <SelectItem value="Scam">{t.reportCategoryScam}</SelectItem>
                  <SelectItem value="Other">{t.reportCategoryOther}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description (optional) */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {t.reportDescriptionLabel}
                <span className="text-muted-foreground ml-1">(opcional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder={t.reportDescriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="text-xs text-muted-foreground text-right">
                {description.length}/500
              </div>
            </div>

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t.reportCancelButton}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !prefilledContact}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.reportSubmittingButton}
                </>
              ) : (
                t.reportSubmitButton
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
