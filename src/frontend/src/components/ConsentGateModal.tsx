import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useConsentGate } from "@/hooks/useConsentGate";
import { useI18n } from "@/i18n/I18nProvider";
import { useSimpleRouter } from "@/router/useSimpleRouter";
import { useState } from "react";

export function ConsentGateModal() {
  const { t } = useI18n();
  const { needsConsent, giveConsent } = useConsentGate();
  const { navigate } = useSimpleRouter();
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const canProceed = cookiesAccepted && termsAccepted;

  const handleAccept = () => {
    if (canProceed) {
      giveConsent();
    }
  };

  const handleViewTerms = () => {
    navigate("/terms");
  };

  const handleViewPrivacy = () => {
    navigate("/privacy");
  };

  const handleViewLegalNotice = () => {
    navigate("/legal-notice");
  };

  if (!needsConsent) {
    return null;
  }

  return (
    <Dialog open={needsConsent} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">{t.consentModalTitle}</DialogTitle>
          <DialogDescription className="text-base">
            {t.consentModalDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Version and legal basis info */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Versão dos Termos:</span>
              <span className="font-semibold text-foreground">
                v2.1 — Fevereiro de 2026
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                Versão da Política de Privacidade:
              </span>
              <span className="font-semibold text-foreground">
                v2.1 — Fevereiro de 2026
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Base Legal:</span>
              <span>Art. 7.º do Regulamento (UE) 2016/679 (RGPD)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{t.termsContactLabel}:</span>
              <a
                href="mailto:suporte.antifraud@gmail.com"
                className="text-primary hover:underline"
              >
                suporte.antifraud@gmail.com
              </a>
            </div>
          </div>

          {/* Consent checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="cookies"
                checked={cookiesAccepted}
                onCheckedChange={(checked) =>
                  setCookiesAccepted(checked === true)
                }
              />
              <Label
                htmlFor="cookies"
                className="text-sm font-normal leading-relaxed cursor-pointer"
              >
                {t.consentCookiesLabel}
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked === true)
                }
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-relaxed cursor-pointer"
              >
                Aceito os <strong>Termos e Condições v2.1</strong> e a{" "}
                <strong>Política de Privacidade v2.1</strong> da AntiFraud, em
                conformidade com o artigo 7.º do Regulamento (UE) 2016/679
                (RGPD).
              </Label>
            </div>
          </div>

          {/* Document links */}
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              {t.consentReadBeforeAccepting}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={handleViewTerms}>
                Termos e Condições v2.1
              </Button>
              <Button variant="outline" size="sm" onClick={handleViewPrivacy}>
                Política de Privacidade v2.1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewLegalNotice}
              >
                Aviso Legal
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left flex-1">
            {t.consentFooterNote}
          </p>
          <Button
            onClick={handleAccept}
            disabled={!canProceed}
            className="w-full sm:w-auto"
          >
            {t.consentAcceptButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
