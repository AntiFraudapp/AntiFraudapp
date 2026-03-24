/**
 * International contact search page.
 * Performs phone/email analysis and maps results to InternationalContactResult shape.
 */

import {
  type InternationalContactResult,
  InternationalContactSearchResult,
} from "@/components/InternationalContactSearchResult";
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
import { useI18n } from "@/i18n/I18nProvider";
import { analyzeEmail } from "@/utils/emailHeuristics";
import { analyzePhoneReputation } from "@/utils/phoneReputationEngine";
import { Globe, Loader2, Search } from "lucide-react";
import { useState } from "react";

function detectInputType(input: string): "phone" | "email" | "unknown" {
  const trimmed = input.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";
  if (/^\+?[\d\s\-().]{7,20}$/.test(trimmed) && /\d{6,}/.test(trimmed))
    return "phone";
  return "unknown";
}

export function InternationalContactSearchPage() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<InternationalContactResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError(
        t.errorGeneric || "Por favor, introduza um contacto para pesquisar.",
      );
      return;
    }

    setIsSearching(true);
    setError(null);
    setResult(null);

    setTimeout(() => {
      try {
        const inputType = detectInputType(trimmed);

        if (inputType === "phone") {
          const analysis = analyzePhoneReputation(trimmed, 0);
          setResult({
            risk_level: analysis.risk_level,
            risk_score: analysis.risk_score,
            status: analysis.status,
            visual_text: analysis.visual_text,
            explanation: analysis.explanation,
            recommendation: analysis.recommendation,
            report_invite: analysis.report_invite,
            carrier_type: analysis.carrier_type,
            carrier: analysis.carrier,
            country: analysis.country,
            riskLevel: analysis.riskLevel,
            riskScore: analysis.riskScore,
          });
        } else if (inputType === "email") {
          const analysis = analyzeEmail(trimmed);
          setResult({
            risk_level: analysis.risk_level,
            risk_score: analysis.risk_score,
            status: analysis.status,
            visual_text: analysis.visual_text,
            explanation: analysis.explanation,
            recommendation: analysis.recommendation,
            report_invite: analysis.report_invite,
            riskLevel: analysis.riskLevel,
            riskScore: analysis.riskScore,
          });
        } else {
          setError(
            "Formato não reconhecido. Introduza um número de telefone ou endereço de email.",
          );
        }
      } catch (err) {
        console.error("International search error:", err);
        setError("Ocorreu um erro durante a pesquisa. Tente novamente.");
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSearching) handleSearch();
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Globe className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">
            {t.navInternationalSearch || "Pesquisa Internacional"}
          </h1>
          <p className="text-muted-foreground">
            Verifique números de telefone e emails de qualquer país.
          </p>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pesquisar Contacto Internacional</CardTitle>
            <CardDescription>
              Introduza um número de telefone (ex: +1 555 000 0000) ou email
              para verificar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="intl-search-input">
                Número de telefone ou email
              </Label>
              <div className="flex gap-2">
                <Input
                  id="intl-search-input"
                  type="text"
                  placeholder="+1 555 000 0000 ou user@domain.com"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
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
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />A
                      pesquisar...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Pesquisar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result */}
        {result && !error && (
          <InternationalContactSearchResult result={result} />
        )}
      </div>
    </main>
  );
}

export default InternationalContactSearchPage;
