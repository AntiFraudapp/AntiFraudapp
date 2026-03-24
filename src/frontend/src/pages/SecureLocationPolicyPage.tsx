import { SecureLocationPolicyContent } from "@/components/SecureLocationPolicyContent";
import { setSEO } from "@/utils/seo";
import { useEffect } from "react";

export function SecureLocationPolicyPage() {
  useEffect(() => {
    setSEO(
      "Política de Localização Segura — AntiFraud",
      "Política de Localização Segura da AntiFraud v2.1. Partilha de localização com consentimento mútuo, conformidade RGPD (UE) 2016/679.",
    );
  }, []);

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
      <SecureLocationPolicyContent />
    </main>
  );
}
