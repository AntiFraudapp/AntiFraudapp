import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";
import type { LookupResult, ReportCategory } from "@/ic/idl/reports.idl";
import { CheckCircle2, Info } from "lucide-react";

interface CollaborativeResultCardProps {
  result: LookupResult | null;
  loading: boolean;
  error: string;
}

export function CollaborativeResultCard({
  result,
  loading,
  error,
}: CollaborativeResultCardProps) {
  const { t } = useI18n();

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>{t.collaborativeEmptyState}</AlertDescription>
      </Alert>
    );
  }

  const getCategoryLabel = (category: ReportCategory): string => {
    if ("Phishing" in category) return t.categoryPhishing;
    if ("Scam" in category) return t.categoryScam;
    if ("Spam" in category) return t.categorySpam;
    if ("Fraud" in category) return t.categoryFraud;
    if ("Impersonation" in category) return t.categoryImpersonation;
    if ("Other" in category) return t.categoryOther;
    return "Unknown";
  };

  const getRiskColor = (score: number): string => {
    if (score >= 75) return "text-destructive";
    if (score >= 50) return "text-orange-600";
    if (score >= 25) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5" />
          {t.collaborativeTitle}
        </CardTitle>
        <CardDescription>{t.collaborativeDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {t.collaborativeRiskScore}
            </p>
            <p
              className={`text-3xl font-bold ${getRiskColor(result.riskScore)}`}
            >
              {result.riskScore}/100
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {t.collaborativeReportCount}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {result.reportCount.toString()}
            </p>
          </div>
        </div>

        {result.categories.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {t.collaborativeCategories}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.categories.map((category, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: ReportCategory is not a string key
                <Badge key={idx} variant="secondary">
                  {getCategoryLabel(category)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {t.collaborativeDisclaimer}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
