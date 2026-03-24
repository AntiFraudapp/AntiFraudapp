import type { Translations } from "@/i18n/translations";

/**
 * Centralized documentation content structure
 * Uses existing translation keys for institutional/legal text
 * Organized into sections with proper references
 */

export interface DocumentationSection {
  title: string;
  content: string[];
}

export function getDocumentationContent(
  t: Translations,
): DocumentationSection[] {
  // Helper to safely convert translation value to string
  const toStringContent = (value: any): string => {
    if (typeof value === "string") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.join(" ");
    }
    return String(value);
  };

  return [
    {
      title: "Branding and Identity",
      content: [
        `Application Name: ${t.appTitle}`,
        "Subtitle: By HTenterprise",
        "Support Contact: suporte.antifraud@gmail.com",
        "Domain: antifraudapp.com",
        "PWA: Installable Progressive Web Application",
      ],
    },
    {
      title: "Mission",
      content: [t.missionPageTitle, toStringContent(t.missionPageDescription)],
    },
    {
      title: "How It Works",
      content: [
        t.howItWorksPageTitle,
        toStringContent(t.howItWorksPageDescription),
      ],
    },
    {
      title: "Terms and Conditions",
      content: [
        t.termsPageTitle,
        t.termsSection1Title,
        toStringContent(t.termsSection1Content),
        t.termsSection2Title,
        toStringContent(t.termsSection2Content),
        "Contact: suporte.antifraud@gmail.com",
        `Effective Date: ${t.consentEffectiveDateLabel}`,
      ],
    },
    {
      title: "Privacy Policy",
      content: [
        t.privacyPageTitle,
        t.privacySection1Title,
        toStringContent(t.privacySection1Content),
        t.privacySection2Title,
        toStringContent(t.privacySection2Content),
      ],
    },
    {
      title: "AntiFraud Engine",
      content: [
        "Frontend-only structured fraud analysis engine",
        "Professional risk scoring (0-100)",
        "Specialized analyzers for message/email/phone/crypto",
        "High-risk phrases and keywords detection",
        'Special rule: "transferência" triggers HIGH risk (≥85%)',
        "Public service phone override (emergency numbers → LOW risk 0%)",
        "Collaborative basis with internal report counts",
      ],
    },
    {
      title: "PWA Installation",
      content: [
        "Progressive Web App with offline support",
        "Service worker with app shell caching",
        "Installable on mobile and desktop devices",
        "Network-first strategy with cache fallback",
        "Offline navigation support",
      ],
    },
    {
      title: "Consent Modal",
      content: [
        "Mandatory consent gate on first visit",
        "Explicit checkbox acceptance required",
        "Version tracking and effective date display",
        "Links to Terms and Privacy Policy",
        "Contact email: suporte.antifraud@gmail.com",
      ],
    },
    {
      title: "Supported Languages",
      content: [
        "Base Language: English",
        "Full Translation: Portuguese",
        "Language selector in header",
        "All UI strings translated",
      ],
    },
  ];
}
