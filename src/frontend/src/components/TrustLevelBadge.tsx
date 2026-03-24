import { getTrustLevel } from "../services/communityReportsService";

interface TrustLevelBadgeProps {
  count: number;
}

export function TrustLevelBadge({ count }: TrustLevelBadgeProps) {
  const trust = getTrustLevel(count);
  if (!trust.nivel) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${trust.color}`}
    >
      <span>🔍</span>
      <span>{trust.label}</span>
      <span>—</span>
      <span>{trust.description}</span>
    </span>
  );
}

export default TrustLevelBadge;
