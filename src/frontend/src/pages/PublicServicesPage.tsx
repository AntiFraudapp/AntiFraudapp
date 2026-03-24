import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { usePublicServicesDirectory } from "@/hooks/usePublicServicesDirectory";
import { useI18n } from "@/i18n/I18nProvider";
import { setSEO } from "@/utils/seo";
import { Building2, Loader2, MapPin, Phone, Search } from "lucide-react";
import { useEffect, useState } from "react";

export function PublicServicesPage() {
  const { t } = useI18n();
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const { isLoading, error, searchQuery, setSearchQuery, filteredResults } =
    usePublicServicesDirectory();

  useEffect(() => {
    setSEO(
      t.publicServicesPageTitle || "Public Services",
      t.publicServicesPageDescription ||
        "Search for public services and emergency contacts",
    );
  }, [t]);

  const handleSearch = () => {
    setSearchQuery(localSearchQuery.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      hospital: t.publicLocationCategoryHospital || "Hospital",
      police: t.publicLocationCategoryPolice || "Police",
      fire_station: t.publicLocationCategoryFireStation || "Fire Station",
      government: t.publicLocationCategoryGovernment || "Public Service",
      emergency: t.publicLocationCategoryEmergency || "Emergency",
    };
    return categoryMap[category] || t.publicLocationCategoryOther || "Other";
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {t.publicServicesPageTitle || "Public Services"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t.publicServicesPageDescription ||
              "Search for public services and emergency contacts"}
          </p>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t.publicServicesSearchTitle || "Search Public Services"}
            </CardTitle>
            <CardDescription>
              {t.publicServicesSearchDescription ||
                "Enter keywords to find public services"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-input">
                {t.publicServicesLocationLabel || "Search"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="search-input"
                  type="text"
                  placeholder={
                    t.publicServicesLocationPlaceholder ||
                    "Hospital, Police, Emergency..."
                  }
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.publicServicesSearching || "Searching..."}
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      {t.publicServicesSearchButton || "Search"}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Privacy Notice */}
            <Alert>
              <AlertDescription className="text-sm">
                {t.publicServicesPrivacyNotice ||
                  "No location data is stored. All data is from static public sources."}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {!isLoading && !error && filteredResults.length > 0 && (
          <div className="space-y-4">
            {/* Results Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {t.publicLocationResultsTitle || "Public Services Found"}
                </CardTitle>
                <CardDescription>
                  {filteredResults.length}{" "}
                  {t.publicLocationResultsCount || "services found"}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Risk Explanation */}
            <Alert>
              <AlertDescription className="text-sm">
                {t.publicLocationRiskExplanation ||
                  "All public numbers from official entities have 0% risk (LOW)"}
              </AlertDescription>
            </Alert>

            {/* Service Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredResults.map((service) => (
                <Card key={service.name}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {service.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="outline" className="mt-1">
                            {getCategoryLabel(service.category)}
                          </Badge>
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      >
                        {t.structuredRiskLow || "LOW"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {service.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {service.address}
                        </span>
                      </div>
                    )}
                    {service.contact && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{service.contact}</span>
                      </div>
                    )}
                    {service.distanceText && (
                      <div className="text-xs text-muted-foreground">
                        {service.distanceText}
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        {t.publicLocationRiskLevel || "Risk Level"}:{" "}
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          0% (LOW)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading &&
          !error &&
          filteredResults.length === 0 &&
          searchQuery && (
            <Alert>
              <AlertDescription>
                {t.publicLocationNoResults ||
                  "No public services found for this search"}
              </AlertDescription>
            </Alert>
          )}

        {/* Info Card */}
        {!isLoading && !error && !searchQuery && (
          <Card>
            <CardHeader>
              <CardTitle>
                {t.publicServicesInfoTitle || "Available Services"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    {t.publicServicesInfoHospitals ||
                      "Hospitals and medical facilities"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    {t.publicServicesInfoPolice ||
                      "Police stations and law enforcement"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    {t.publicServicesInfoFire ||
                      "Fire stations and emergency services"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    {t.publicServicesInfoGovernment ||
                      "Government offices and public services"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    {t.publicServicesInfoEmergency ||
                      "Emergency contact numbers"}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
