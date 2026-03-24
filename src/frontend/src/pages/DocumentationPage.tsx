import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";
import { generateDocumentationPdf } from "@/utils/generateDocumentationPdf";
import { setSEO } from "@/utils/seo";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

export function DocumentationPage() {
  const { t } = useI18n();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setSEO(t.documentationPageTitle, t.documentationPageDescription);
  }, [t]);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      await generateDocumentationPdf(t);
    } catch (error) {
      console.error("Error generating documentation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <FileText className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              {t.documentationPageTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.documentationPageDescription}
            </p>
          </div>

          {/* Main Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.documentationCardTitle}</CardTitle>
              <CardDescription>
                {t.documentationCardDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Overview */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {t.documentationContentTitle}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t.documentationSection1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t.documentationSection2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t.documentationSection3}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t.documentationSection4}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t.documentationSection5}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t.documentationSection6}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t.documentationSection7}</span>
                  </li>
                </ul>
              </div>

              {/* Language Note */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t.documentationLanguageNote}
                </p>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGeneratePdf}
                disabled={isGenerating}
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t.documentationGenerating}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    {t.documentationGenerateButton}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
