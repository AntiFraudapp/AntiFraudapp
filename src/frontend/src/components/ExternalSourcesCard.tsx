interface ExternalSourcesCardProps {
  sources: string[];
}

export function ExternalSourcesCard({ sources }: ExternalSourcesCardProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="p-3 bg-muted/40 border border-border rounded-lg">
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        🔍 Fontes públicas consultadas:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((source) => (
          <span
            key={source}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20"
          >
            {source}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ExternalSourcesCard;
