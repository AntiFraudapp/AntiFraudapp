import { PrivacyContent } from "@/components/PrivacyContent";
import { setSEO } from "@/utils/seo";
import { useEffect } from "react";

export function PrivacyPage() {
  useEffect(() => {
    setSEO(
      "Política de Privacidade — AntiFraud",
      "Política de Privacidade da AntiFraud v2.1. Conformidade RGPD (UE) 2016/679, proteção de dados pessoais, direitos dos utilizadores e política de localização segura.",
    );
  }, []);

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
      <PrivacyContent />
    </main>
  );
}
