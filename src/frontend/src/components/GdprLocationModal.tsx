import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { SecureLocationPolicyContent } from "./SecureLocationPolicyContent";

interface GdprLocationModalProps {
  onAccepted: () => void;
}

export function GdprLocationModal({ onAccepted }: GdprLocationModalProps) {
  const [checked, setChecked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const confirmCode = useMemo(
    () => Math.floor(100000 + Math.random() * 900000).toString(),
    [],
  );

  useEffect(() => {
    if (sessionStorage.getItem("afapp_gdpr_sala") === "1") {
      onAccepted();
    }
  }, [onAccepted]);

  const canConfirm = checked && codeInput === confirmCode;

  const handleConfirm = () => {
    if (!canConfirm) return;
    sessionStorage.setItem("afapp_gdpr_sala", "1");
    onAccepted();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      data-ocid="gdpr.modal"
    >
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90dvh] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b shrink-0">
          <h2 className="text-lg font-bold leading-snug">
            🔒 Política de Localização Segura — RGPD
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Leia a política completa antes de entrar na sala.
          </p>
        </div>

        {/* Scrollable policy */}
        <div
          className="overflow-y-auto px-6 py-4 flex-1"
          style={{ maxHeight: "40vh" }}
        >
          <SecureLocationPolicyContent />
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t space-y-4 shrink-0">
          {/* Checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="gdpr-accept"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              data-ocid="gdpr.checkbox"
            />
            <Label
              htmlFor="gdpr-accept"
              className="text-sm leading-snug cursor-pointer"
            >
              Li e aceito a Política de Localização Segura e o RGPD
            </Label>
          </div>

          {/* Confirmation code */}
          <div className="rounded-lg bg-muted px-4 py-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              Código de confirmação — digite abaixo para continuar:
            </p>
            <p className="text-2xl font-bold tracking-widest text-center select-all">
              {confirmCode}
            </p>
            <Input
              placeholder="Digite o código de 6 dígitos"
              value={codeInput}
              onChange={(e) =>
                setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              className="text-center tracking-widest text-lg font-semibold"
              data-ocid="gdpr.input"
            />
          </div>

          <Button
            className="w-full"
            disabled={!canConfirm}
            onClick={handleConfirm}
            data-ocid="gdpr.confirm_button"
          >
            Confirmar e Entrar
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            Em caso de emergência ligue <strong>112</strong>. Sessão expira
            automaticamente em 24h.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GdprLocationModal;
