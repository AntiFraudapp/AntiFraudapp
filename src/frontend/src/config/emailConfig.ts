/**
 * AntiFraudapp — Professional Email Configuration
 * Domain: antifraudapp.com
 *
 * Prepared for 5 professional email addresses via Zoho Mail.
 * DNS TXT verification record: zoho-verification=zb67637258.zmverify.zoho.eu
 *
 * Future email addresses (to be activated after DNS propagation):
 * - suporte@antifraudapp.com
 * - info@antifraudapp.com
 * - legal@antifraudapp.com
 * - dpo@antifraudapp.com
 * - admin@antifraudapp.com
 */

export const EMAIL_CONFIG = {
  domain: "antifraudapp.com",
  provider: "Zoho Mail",
  supportEmail: "suporte.antifraud@gmail.com", // current fallback
  professionalEmails: [
    "suporte@antifraudapp.com",
    "info@antifraudapp.com",
    "legal@antifraudapp.com",
    "dpo@antifraudapp.com",
    "admin@antifraudapp.com",
  ],
};
