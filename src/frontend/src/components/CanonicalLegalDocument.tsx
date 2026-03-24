import { TermsContent } from "./TermsContent";

interface CanonicalLegalDocumentProps {
  className?: string;
}

export function CanonicalLegalDocument({
  className = "",
}: CanonicalLegalDocumentProps) {
  return (
    <div className={className}>
      <TermsContent showSeals={false} />
    </div>
  );
}
