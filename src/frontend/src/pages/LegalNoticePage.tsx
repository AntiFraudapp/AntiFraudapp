import { LegalNoticeContent } from "@/components/LegalNoticeContent";
import { setSEO } from "@/utils/seo";
import { useEffect } from "react";

export function LegalNoticePage() {
  useEffect(() => {
    setSEO(
      "Aviso Legal — AntiFraud",
      "Aviso Legal da AntiFraud v2.1. Isenção de responsabilidade, natureza informativa, identificação do responsável e jurisdição aplicável.",
    );
  }, []);

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
      <LegalNoticeContent />
    </main>
  );
}
