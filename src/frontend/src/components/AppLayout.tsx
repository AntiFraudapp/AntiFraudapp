import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/i18n/I18nProvider";
import { useSimpleRouter } from "@/router/useSimpleRouter";
import {
  AlertTriangle,
  BookOpen,
  Crown,
  FileText,
  HelpCircle,
  Info,
  Lock,
  MapPin,
  Menu,
  Mic,
  Shield,
  Signal,
  X,
} from "lucide-react";
import { useState } from "react";
import { AuthControl } from "./AuthControl";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import { LanguageSelector } from "./LanguageSelector";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { t } = useI18n();
  const { navigate, currentRoute } = useSimpleRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t.navHome, path: "/" },
    { label: t.navMission, path: "/mission" },
    {
      label: t.navHowItWorks,
      path: "/how-it-works",
      icon: <HelpCircle className="w-3 h-3" />,
    },
    {
      label: t.navAbout,
      path: "/about",
      icon: <Info className="w-3 h-3" />,
    },
    {
      label: t.navSecureLocation,
      path: "/sala",
      icon: <MapPin className="w-3 h-3" />,
    },
    {
      label: t.navAutoShield,
      path: "/autoshield",
      icon: <Shield className="w-3 h-3" />,
    },
    {
      label: "Análise de Áudio",
      path: "/audio-analysis",
      icon: <Mic className="w-3 h-3" />,
    },
    {
      label: t.navFraudRadar,
      path: "/fraud-radar",
      icon: <Signal className="w-3 h-3" />,
    },
    {
      label: t.navPrevention,
      path: "/prevention",
      icon: <Shield className="w-3 h-3" />,
    },
    {
      label: t.navDocumentation,
      path: "/tutorial",
      icon: <BookOpen className="w-3 h-3" />,
    },
    {
      label: t.navAdmin,
      path: "/admin",
      icon: <Shield className="w-3 h-3" />,
    },
  ];

  const legalNavItems = [
    {
      label: t.footerTerms,
      path: "/terms",
      icon: <FileText className="w-3 h-3" />,
    },
    {
      label: t.footerPrivacy,
      path: "/privacy",
      icon: <Shield className="w-3 h-3" />,
    },
    {
      label: `${t.navSecureLocation} (Política)`,
      path: "/secure-location-policy",
      icon: <Lock className="w-3 h-3" />,
    },
    {
      label: t.footerLegalNotice,
      path: "/legal-notice",
      icon: <AlertTriangle className="w-3 h-3" />,
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-3 py-1 rounded z-50"
      >
        Saltar para o conteúdo
      </a>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-400 bg-gray-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo with Image and BETA badge */}
          <button
            type="button"
            onClick={() => handleNavigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/generated/antifraud-header-logo-v3.dim_256x256.png"
              alt="AntiFraudapp"
              className="h-10 w-10 object-contain"
            />
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-black">
                  AntiFraudapp
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 bg-gray-400 text-black border-gray-500"
                >
                  BETA
                </Badge>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] px-1 py-0 h-4 text-black border-gray-500"
              >
                Global Protection
              </Badge>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-gray-600 ${
                  currentRoute === item.path
                    ? "text-black font-semibold"
                    : "text-gray-700"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSelector />
            <AuthControl />
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-black hover:bg-gray-400"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] overflow-y-auto"
            >
              <nav className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                  <span className="font-semibold">AntiFraudapp</span>
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0 h-4"
                  >
                    BETA
                  </Badge>
                </div>
                {navItems.map((item) => (
                  <button
                    type="button"
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-2 text-left px-4 py-2 rounded-md transition-colors ${
                      currentRoute === item.path
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    {item.path === "/sala" && (
                      <Badge
                        variant="outline"
                        className="ml-auto text-[9px] px-1.5 py-0 h-4"
                      >
                        NOVO
                      </Badge>
                    )}
                  </button>
                ))}

                {/* Plus Plans section */}
                <div className="px-4">
                  <Separator className="my-2" />
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                    Planos
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  data-ocid="plux.plans.button"
                  className="flex items-center gap-2 text-left px-4 py-2 rounded-md transition-colors hover:bg-muted opacity-60 cursor-not-allowed"
                >
                  <Crown className="w-3 h-3 text-amber-500" />
                  Planos Plus
                  <Badge
                    variant="outline"
                    className="ml-auto text-[9px] px-1.5 py-0 h-4 text-amber-700 border-amber-400"
                  >
                    Em breve
                  </Badge>
                </button>

                {/* Legal section separator */}
                <div className="px-4">
                  <Separator className="my-2" />
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                    Legal
                  </p>
                </div>
                {legalNavItems.map((item) => (
                  <button
                    type="button"
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-2 text-left px-4 py-2 rounded-md transition-colors text-sm ${
                      currentRoute === item.path
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}

                <div className="border-t border-border pt-4 mt-4 space-y-4">
                  <LanguageSelector />
                  <AuthControl />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content — padding-bottom accounts for fixed bottom nav on mobile */}
      <main id="main-content" className="flex-1 pb-28 lg:pb-6 pt-4">
        {children}
      </main>

      {/* Footer — flush against bottom nav on mobile (h-16 = mb-16) */}
      <div className="mb-16 lg:mb-0">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default AppLayout;
