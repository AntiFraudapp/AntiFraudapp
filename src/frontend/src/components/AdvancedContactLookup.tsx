import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdvancedContactLookupCache } from "@/hooks/useAdvancedContactLookupCache";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useI18n } from "@/i18n/I18nProvider";
import { analyzeContactInput } from "@/utils/contactInputHeuristics";
import { lookupPublicContact } from "@/utils/publicContactLookup";
import { detectPublicServicePhoneOverride } from "@/utils/publicServicePhoneOverride";
import {
  type AnalysisResult,
  analyzeEmail,
  analyzeMessageText,
  analyzePhoneNumber,
} from "@/utils/structuredFraudAnalysis";
import { Loader2, Search, WifiOff } from "lucide-react";
import { useState } from "react";
import { StructuredAnalysisResultCard } from "./StructuredAnalysisResultCard";

export function AdvancedContactLookup() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const isOffline = useOfflineStatus();
  const { getCachedResult, cacheResult } = useAdvancedContactLookupCache();

  const handleSearch = async () => {
    if (!input.trim()) {
      setError(t.advancedLookupInvalidInput);
      return;
    }

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      // Detect contact type
      const contactAnalysis = analyzeContactInput(input.trim());

      if (!contactAnalysis.isValid) {
        setError(t.advancedLookupInvalidInput);
        setIsSearching(false);
        return;
      }

      // Check cache first if offline
      if (isOffline) {
        const cached = getCachedResult(
          input.trim(),
          contactAnalysis.type as "phone" | "email",
        );
        if (cached) {
          setResult({
            contactType: cached.type,
            normalizedValue: cached.query,
            analysis: cached.antifraudResult,
            publicInfo: cached.publicInfo,
            isPublicServiceOverride: false,
            fromCache: true,
          });
          setIsSearching(false);
          return;
        }
        setError(t.advancedLookupOfflineNoCache);
        setIsSearching(false);
        return;
      }

      // Perform public contact lookup
      const publicInfo = await lookupPublicContact(
        contactAnalysis.normalizedValue,
        contactAnalysis.type as "phone" | "email",
      );

      // Check for public service override (phone only)
      let isPublicServiceOverride = false;
      if (contactAnalysis.type === "phone" && publicInfo && publicInfo.found) {
        const overrideResult = detectPublicServicePhoneOverride(
          contactAnalysis.normalizedValue,
          publicInfo.displayName,
          publicInfo.summary,
          publicInfo.category,
        );
        isPublicServiceOverride = overrideResult.override;
      }

      // Perform antifraud analysis based on type
      let analysisResult: AnalysisResult;

      if (isPublicServiceOverride) {
        // Public service override: force LOW risk (0%)
        analysisResult = {
          risk_level: "LOW" as const,
          risk_score: 0,
          status: "GREEN" as const,
          visual_text: "✅ Serviço Público · Verificado",
          carrier_type: "Serviço Público",
          sources: ["Serviços Públicos PT"],
          recommendation:
            "Nenhum risco conhecido encontrado nesta pesquisa.\nNo entanto, se não reconhecer o contacto, tome precauções:\n• Verifique por canal oficial\n• Não forneça dados pessoais/financeiros\n• Em dúvida, contacte autoridades locais (PSP · 112 Emergências)",
          report_invite: "Reportar à comunidade AntiFraudApp?",
          riskLevel: "Baixo Risco",
          explanation: "✅ Serviço Público · Verificado",
          score: 0,
        };
      } else if (contactAnalysis.type === "phone") {
        analysisResult = await analyzePhoneNumber(
          contactAnalysis.normalizedValue,
        );
      } else if (contactAnalysis.type === "email") {
        analysisResult = await analyzeEmail(contactAnalysis.normalizedValue);
      } else {
        analysisResult = await analyzeMessageText(
          contactAnalysis.normalizedValue,
        );
      }

      const finalResult = {
        contactType: contactAnalysis.type,
        normalizedValue: contactAnalysis.normalizedValue,
        analysis: analysisResult,
        publicInfo: publicInfo.found ? publicInfo.info : undefined,
        isPublicServiceOverride,
      };

      // Cache result for offline use
      if (
        contactAnalysis.type === "phone" ||
        contactAnalysis.type === "email"
      ) {
        cacheResult(input.trim(), contactAnalysis.type, {
          antifraudResult: analysisResult,
          publicInfo: publicInfo.found ? publicInfo.info : undefined,
        });
      }

      setResult(finalResult);
    } catch (err) {
      console.error("Advanced lookup error:", err);
      setError(t.advancedLookupSearchError);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSearching) {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t.advancedLookupTitle}</CardTitle>
          <CardDescription>{t.advancedLookupDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-input">{t.advancedLookupInputLabel}</Label>
            <div className="flex gap-2">
              <Input
                id="contact-input"
                type="text"
                placeholder={t.advancedLookupInputPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !input.trim()}
                className="min-w-[120px]"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.advancedLookupSearching}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    {t.advancedLookupSearchButton}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Offline indicator */}
          {isOffline && (
            <Alert>
              <WifiOff className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {t.advancedLookupOfflineIndicator}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {result && !error && (
        <>
          {result.fromCache && (
            <Alert>
              <AlertDescription className="text-sm">
                {t.advancedLookupOfflineIndicator}
              </AlertDescription>
            </Alert>
          )}
          <StructuredAnalysisResultCard
            result={result.analysis}
            contact={result.normalizedValue}
          />
        </>
      )}
    </div>
  );
}
