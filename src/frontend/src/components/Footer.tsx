import { useI18n } from "@/i18n/I18nProvider";
import { useSimpleRouter } from "@/router/useSimpleRouter";
import { Lock, Mail } from "lucide-react";
import React from "react";
import {
  SiFacebook,
  SiInstagram,
  SiTelegram,
  SiWhatsapp,
  SiX,
} from "react-icons/si";

const SOCIAL_LINKS = [
  {
    href: "https://wa.me/?text=Verifica%20se%20um%20contacto%20%C3%A9%20seguro%20em%20https%3A%2F%2Fantifraudapp.com",
    icon: SiWhatsapp,
    label: "Partilhar no WhatsApp",
    color: "hover:text-green-700",
  },
  {
    href: "https://twitter.com/intent/tweet?text=Verifica%20se%20um%20contacto%20%C3%A9%20seguro%20em%20https%3A%2F%2Fantifraudapp.com",
    icon: SiX,
    label: "Partilhar no X",
    color: "hover:text-black",
  },
  {
    href: "https://t.me/share/url?url=https%3A%2F%2Fantifraudapp.com&text=Verifica%20se%20um%20contacto%20%C3%A9%20seguro",
    icon: SiTelegram,
    label: "Partilhar no Telegram",
    color: "hover:text-blue-700",
  },
  {
    href: "https://www.instagram.com/",
    icon: SiInstagram,
    label: "Instagram",
    color: "hover:text-pink-700",
  },
  {
    href: "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fantifraudapp.com",
    icon: SiFacebook,
    label: "Partilhar no Facebook",
    color: "hover:text-blue-800",
  },
];

export function Footer() {
  const { t } = useI18n();
  const { navigate } = useSimpleRouter();

  return (
    <footer className="border-t border-gray-400 bg-gray-300 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col items-center gap-5">
        {/* Social sharing */}
        <div className="text-center">
          <p className="text-sm font-semibold text-black mb-1">
            {t.footerShareText}
          </p>
          <p className="text-xs text-gray-600 mb-3">{t.footerProtectText}</p>
          <div className="flex items-center justify-center gap-4">
            {SOCIAL_LINKS.map(({ href, icon: Icon, label, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`text-gray-700 transition-colors ${color}`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
            <a
              href="mailto:suporte.antifraud@gmail.com"
              aria-label="Suporte por email"
              className="text-gray-700 hover:text-black transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Legal nav */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-700">
          <button
            type="button"
            onClick={() => navigate("/terms")}
            className="hover:text-black hover:underline transition-colors"
          >
            {t.footerTerms}
          </button>
          <span className="text-gray-500">·</span>
          <button
            type="button"
            onClick={() => navigate("/privacy")}
            className="hover:text-black hover:underline transition-colors"
          >
            {t.footerPrivacy}
          </button>
          <span className="text-gray-500">·</span>
          <button
            type="button"
            onClick={() => navigate("/secure-location-policy")}
            className="hover:text-black hover:underline transition-colors"
          >
            Localização Segura
          </button>
          <span className="text-gray-500">·</span>
          <button
            type="button"
            onClick={() => navigate("/legal-notice")}
            className="hover:text-black hover:underline transition-colors"
          >
            {t.footerLegalNotice}
          </button>
          <span className="text-gray-500">·</span>
          <a
            href="mailto:suporte.antifraud@gmail.com"
            className="hover:text-black hover:underline transition-colors"
          >
            {t.footerSupport}
          </a>
        </nav>

        {/* ICP security seal */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-400 rounded-full px-3 py-1 bg-gray-200">
          <Lock className="w-3 h-3 text-blue-700 shrink-0" />
          <span className="font-medium">{t.footerBlockchain}</span>
          <span className="text-gray-500">—</span>
          <span>100% On-chain Security</span>
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-semibold text-black text-center">
            ©2026 AntiFraud HTenterprise
          </p>
          <p className="text-xs text-gray-700 text-center">{t.footerRights}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
