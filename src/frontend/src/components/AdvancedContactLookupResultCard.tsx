/**
 * Advanced contact lookup result card.
 * Renders all 8 schema fields with mandatory GREEN precaution message and report invite.
 * Has both named export and default export.
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Flag, Info, Shield } from "lucide-react";
import React, { useState } from "react";

export interface AdvancedContactLookupResult {
  risk_level?: "LOW" | "MEDIUM" | "HIGH";
  risk_score?: number;
  status?: "GREEN" | "YELLOW" | "RED";
  visual_text?: string;
  explanation?: string;
  recommendation?: string;
  report_invite?: string;
  // Legacy fields
  riskLevel?: string;
  riskScore?: number;
  carrier_type?: string;
  carrier?: string;
  country?: string;
  details?: string;
  displayName?: string;
  summary?: string;
  category?: string;
}

interface Props {
  result: AdvancedContactLookupResult;
  contactValue?: string;
  onReport?: () => void;
}

const GREEN_PRECAUTION_BLOCK = (
  <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
    <div className="flex items-start gap-2">
      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-1">
          Nenhum risco conhecido encontrado. Se não reconhecer:
        </p>
        <ul className="space-y-0.5 list-none">
          <li>• Verifique por canal oficial</li>
          <li>• Não forneça dados pessoais</li>
          <li>
            • Em dúvida: <strong>PSP 112</strong>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

function getStatusIcon(status: string) {
  if (status === "RED")
    return <AlertTriangle className="w-5 h-5 text-red-500" />;
  if (status === "YELLOW")
    return <Shield className="w-5 h-5 text-yellow-500" />;
  return <CheckCircle className="w-5 h-5 text-green-500" />;
}

function getStatusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "RED") return "destructive";
  if (status === "YELLOW") return "secondary";
  return "default";
}

function getStatusColor(status: string): string {
  if (status === "RED")
    return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20";
  if (status === "YELLOW")
    return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20";
  return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20";
}

export function AdvancedContactLookupResultCard({
  result,
  contactValue: _contactValue,
  onReport,
}: Props) {
  const [reportSent, setReportSent] = useState(false);

  const status =
    result.status ??
    ((result.risk_level ?? result.riskLevel) === "HIGH"
      ? "RED"
      : (result.risk_level ?? result.riskLevel) === "MEDIUM"
        ? "YELLOW"
        : "GREEN");
  const score = result.risk_score ?? result.riskScore ?? 0;
  const cappedScore = Math.min(score, 99);
  const riskLevel = result.risk_level ?? result.riskLevel ?? "LOW";
  const visualText =
    result.visual_text ??
    `${status === "RED" ? "🚨" : status === "YELLOW" ? "⚠️" : "✅"} Risco ${riskLevel}`;
  const explanation = result.explanation ?? result.summary ?? "";
  const recommendation = result.recommendation ?? "";
  const reportInvite = result.report_invite ?? "Reportar à comunidade?";

  const handleReport = () => {
    setReportSent(true);
    onReport?.();
  };

  return (
    <Card className={`border-2 ${getStatusColor(status)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {getStatusIcon(status)}
          <span className="flex-1 min-w-0 truncate">{visualText}</span>
          <Badge
            variant={getStatusBadgeVariant(status)}
            className="ml-auto text-xs flex-shrink-0"
          >
            {cappedScore}/99
          </Badge>
        </CardTitle>
        {result.displayName && (
          <p className="text-sm font-medium text-foreground mt-1">
            {result.displayName}
          </p>
        )}
        {result.category && (
          <Badge variant="outline" className="text-xs w-fit mt-1">
            {result.category}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Explanation */}
        {explanation && (
          <div className="text-sm text-muted-foreground leading-relaxed">
            {explanation}
          </div>
        )}

        {/* Carrier/Country info */}
        {(result.carrier_type || result.carrier || result.country) && (
          <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
            {(result.carrier_type || result.carrier) && (
              <span>📡 {result.carrier_type || result.carrier}</span>
            )}
            {result.country && <span>🌍 {result.country}</span>}
          </div>
        )}

        {/* Recommendation for non-GREEN */}
        {recommendation && status !== "GREEN" && (
          <Alert className="py-2">
            <AlertDescription className="text-sm whitespace-pre-line">
              {recommendation}
            </AlertDescription>
          </Alert>
        )}

        {/* GREEN precaution block — always shown for GREEN/LOW */}
        {(status === "GREEN" || riskLevel === "LOW") && GREEN_PRECAUTION_BLOCK}

        {/* Details */}
        {result.details && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
            {result.details}
          </div>
        )}

        {/* Report invite — always shown */}
        <div className="pt-1 border-t border-border/50">
          {reportSent ? (
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Obrigado pelo seu contributo para a comunidade!
            </p>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
              onClick={handleReport}
            >
              <Flag className="w-3 h-3 mr-1" />
              {reportInvite}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AdvancedContactLookupResultCard;
