import { TermsContent } from "@/components/TermsContent";
import { setSEO } from "@/utils/seo";
import { useEffect } from "react";

export function TermsPage() {
  useEffect(() => {
    setSEO(
      "Termos e Condições — AntiFraud",
      "Termos e Condições de Utilização, Política de Privacidade, Política de Localização Segura e Aviso Legal da AntiFraud. Conformidade RGPD (UE) 2016/679.",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
      <TermsContent showSeals={false} />
    </main>
  );
}
