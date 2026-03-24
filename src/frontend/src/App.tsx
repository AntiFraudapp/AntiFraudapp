import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense, lazy, useEffect } from "react";
import { AppLayout } from "./components/AppLayout";
import { ConsentGateModal } from "./components/ConsentGateModal";
import { FraudDataProvider } from "./context/FraudDataContext";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { I18nProvider } from "./i18n/I18nProvider";
import { AboutPage } from "./pages/AboutPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminTermsPage } from "./pages/AdminTermsPage";
import { AudioAnalysisPage } from "./pages/AudioAnalysisPage";
import { AutoShieldPage } from "./pages/AutoShieldPage";
import { DocumentationPage } from "./pages/DocumentationPage";
import { HomePage } from "./pages/HomePage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { InternationalContactSearchPage } from "./pages/InternationalContactSearchPage";
import { LegalNoticePage } from "./pages/LegalNoticePage";
import LocationSessionPage from "./pages/LocationSessionPage";
import LocationSessionTestPage from "./pages/LocationSessionTestPage";
import { MissionPage } from "./pages/MissionPage";
import { PreventionPage } from "./pages/PreventionPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { PublicServicesPage } from "./pages/PublicServicesPage";
import { SalaSeguraMapPage } from "./pages/SalaSeguraMapPage";
import { SalaSeguraPage } from "./pages/SalaSeguraPage";
import SecureLocationJoinPage from "./pages/SecureLocationJoinPage";
import SecureLocationMapPage from "./pages/SecureLocationMapPage";
import { SecureLocationPolicyPage } from "./pages/SecureLocationPolicyPage";
import { TermsPage } from "./pages/TermsPage";
import VerifyGlobalPhonePage from "./pages/VerifyGlobalPhonePage";
import { useSimpleRouter } from "./router/useSimpleRouter";

// FIX: performance optimization + lazy loading for heavy pages
const FraudRadarPage = lazy(() =>
  import("./pages/FraudRadarPage").then((m) => ({ default: m.FraudRadarPage })),
);

const LazyFallback = (
  <div className="flex items-center justify-center p-8 text-muted-foreground">
    A carregar dados globais...
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ─── Global Error Boundary ────────────────────────────────────────────────────
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[GlobalErrorBoundary] Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="text-center space-y-4 max-w-md">
            <p className="text-5xl">⚠️</p>
            <h2 className="text-xl font-bold text-red-600">Algo correu mal</h2>
            <p className="text-sm text-gray-600">
              Ocorreu um erro inesperado na aplicação. Por favor, tente
              recarregar a página.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-400 font-mono bg-gray-100 px-3 py-2 rounded">
                {this.state.error}
              </p>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PAGE_TITLES: Record<string, string> = {
  "/": "AntiFraudApp | Proteção Golpes Cripto PT\u{1F1F5}\u{1F1F9} BR\u{1F1E7}\u{1F1F7} USA\u{1F1FA}\u{1F1F8}",
  "/sala": "Sala Segura Anti-Scam | Criptomoedas Seguras",
  "/fraud-radar": "Radar AntiFraud 6/6 ICP | Detecta Scams Realtime",
  "/autoshield": "AutoShield AntiFraud | Proteção Automática Scams",
  "/audio-analysis": "Análise Áudio AntiFraud | Detecta Fraudes por Voz",
  "/secure-location-map": "Localização Segura | AntiFraudApp",
  "/prevention": "Prevenção Fraudes | AntiFraudApp",
  "/admin": "Dashboard Admin | AntiFraudApp",
  "/terms": "Termos de Uso | AntiFraudApp",
  "/privacy": "Política de Privacidade | AntiFraudApp",
  "/legal-notice": "Aviso Legal | AntiFraudApp",
};

function AppContent() {
  const { currentRoute } = useSimpleRouter();

  useEffect(() => {
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("SW registered:", registration);
          })
          .catch((error) => {
            console.log("SW registration failed:", error);
          });
      });
    }
  }, []);

  // Dynamic page title per route
  useEffect(() => {
    const title =
      PAGE_TITLES[currentRoute] ?? "AntiFraudApp | Proteção Anti-Scam";
    document.title = title;
  }, [currentRoute]);

  const renderPage = () => {
    // Sala Segura routes
    if (currentRoute.startsWith("/sala/")) {
      const roomId = currentRoute.replace("/sala/", "").trim();
      if (roomId) {
        return <SalaSeguraMapPage roomId={roomId} />;
      }
    }

    // Handle parameterized routes
    if (currentRoute.startsWith("/location/join/")) {
      const joinToken = currentRoute.replace("/location/join/", "");
      if (joinToken && joinToken !== "manual") {
        return <SecureLocationJoinPage joinToken={joinToken} />;
      }
      return <SecureLocationJoinPage joinToken="" />;
    }

    // Test map route
    if (currentRoute === "/location/session/test") {
      return <LocationSessionTestPage />;
    }

    // Generic session map route
    if (currentRoute.startsWith("/location/session/")) {
      const sid = currentRoute.replace("/location/session/", "").trim();
      if (sid && sid !== "test") {
        return <LocationSessionPage sessionId={sid} />;
      }
    }

    switch (currentRoute) {
      case "/":
        return <HomePage />;
      case "/mission":
        return <MissionPage />;
      case "/how-it-works":
        return <HowItWorksPage />;
      case "/terms":
        return <TermsPage />;
      case "/privacy":
        return <PrivacyPage />;
      case "/secure-location-policy":
        return <SecureLocationPolicyPage />;
      case "/legal-notice":
        return <LegalNoticePage />;
      case "/documentation":
        return <DocumentationPage />;
      case "/admin":
        return <AdminDashboard />;
      case "/admin/terms":
        return <AdminTermsPage />;
      case "/international-search":
        return <InternationalContactSearchPage />;
      case "/map":
        return <PublicServicesPage />;
      case "/verify-global-phone":
        return <VerifyGlobalPhonePage />;
      case "/secure-location-map":
        return <SecureLocationMapPage />;
      case "/sala":
        return <SalaSeguraPage />;
      case "/about":
        return <AboutPage />;
      case "/autoshield":
        return <AutoShieldPage />;
      case "/audio-analysis":
        return <AudioAnalysisPage />;
      case "/fraud-radar":
        return (
          <Suspense fallback={LazyFallback}>
            <FraudRadarPage />
          </Suspense>
        );
      case "/prevention":
        return <PreventionPage />;
      case "/tutorial":
        return <DocumentationPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      <AppLayout>{renderPage()}</AppLayout>
      <ConsentGateModal />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <I18nProvider>
          <FraudDataProvider>
            <GlobalErrorBoundary>
              <AppContent />
              <Toaster position="bottom-center" richColors />
            </GlobalErrorBoundary>
          </FraudDataProvider>
        </I18nProvider>
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}

export default App;
