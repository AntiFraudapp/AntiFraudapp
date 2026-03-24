// FIX: prevention page with sources, tips and alerts
// FIX: community reports stats for Radar Global
import { LegalDisclaimerBanner } from "@/components/LegalDisclaimerBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getAllReports } from "../services/reportsService";

const FRAUD_TYPES = [
  {
    emoji: "🎣",
    title: "Phishing",
    desc: "Emails ou mensagens falsas que imitam bancos, serviços e entidades oficiais para roubar dados pessoais, passwords ou informações bancárias.",
    signals: [
      "Remetente com domínio estranho (ex: banco-pt.ru)",
      "Links encurtados ou domínios com erros (ex: Paypa1.com)",
      'Urgência excessiva: "Clique agora ou a conta será suspensa"',
      "Pedido de password, PIN ou dados do cartão",
    ],
  },
  {
    emoji: "📞",
    title: "Scam Telefónico (Vishing)",
    desc: "Chamadas fraudulentas de pessoas que se identificam como funcionários de bancos, AT, EDP ou forças de segurança para extorquir dinheiro ou dados.",
    signals: [
      "Número desconhecido ou estrangeiro a pedir dados bancários",
      'Pressão para transferir dinheiro "para proteger a conta"',
      "Afirmam ser da PJ, Banco de Portugal ou Finanças",
      "Pedem o código MBWay ou número do cartão",
    ],
  },
  {
    emoji: "💰",
    title: "Fraude em Criptomoedas",
    desc: "Esquemas de investimento fraudulentos, carteiras falsas, rug pulls e plataformas de trading ilegítimas que prometem retornos impossíveis.",
    signals: [
      "Promessas de lucro garantido ou retorno de 100%+",
      "Plataformas sem licença da CMVM ou regulador europeu",
      'Pedido de depósito em crypto para "desbloquear" fundos',
      "Carteiras com histórico de denúncias em CryptoScamDB",
    ],
  },
  {
    emoji: "🦠",
    title: "Malware e Ransomware",
    desc: "Software malicioso instalado através de anexos de email, links ou apps falsas que encriptam ficheiros ou roubam dados em segundo plano.",
    signals: [
      "Anexos .exe, .zip ou .pdf inesperados",
      "Apps de fontes fora da App Store / Google Play",
      "Pedido de acesso remoto ao computador",
      'Mensagem de "vírus detetado" a pedir pagamento',
    ],
  },
  {
    emoji: "🌐",
    title: "IPs e URLs Maliciosos",
    desc: "Sites falsos criados para roubar credenciais, injetar malware ou imitar plataformas legítimas. IPs conhecidos por actividade criminal.",
    signals: [
      "URL com pequenas diferenças do site original",
      "Conexão não segura (HTTP em vez de HTTPS)",
      "Formulários a pedir dados bancários sem verificação",
      "IP reportado em bases públicas como AbuseIPDB",
    ],
  },
];

const HOW_TO_ACT = [
  { icon: "🚫", text: "Não responda nem clique em links suspeitos" },
  { icon: "🔇", text: "Bloqueie o contacto imediatamente" },
  { icon: "📸", text: "Faça captura de ecrã como prova" },
  { icon: "📱", text: "Reporte à plataforma (WhatsApp, email, etc.)" },
  { icon: "🛡️", text: "Use a AntiFraudapp para verificar o contacto" },
  { icon: "🏛️", text: "Reporte às autoridades competentes (links abaixo)" },
];

const OFFICIAL_LINKS = [
  {
    country: "🇵🇹 Portugal",
    links: [
      {
        label: "CNCS — Centro Nacional de Cibersegurança",
        url: "https://www.cncs.gov.pt/",
      },
      {
        label: "CNPD — Comissão Nacional de Proteção de Dados",
        url: "https://www.cnpd.pt/",
      },
    ],
  },
  {
    country: "🇪🇺 Europa",
    links: [
      {
        label: "Europol — European Cybercrime Centre (EC3)",
        url: "https://www.europol.europa.eu/",
      },
    ],
  },
  {
    country: "🇺🇸 Estados Unidos",
    links: [
      {
        label: "FTC — Reportar Fraude Online",
        url: "https://reportfraud.ftc.gov/",
      },
      {
        label: "IC3 — Internet Crime Complaint Center (FBI)",
        url: "https://www.ic3.gov/",
      },
    ],
  },
];

const SOURCE_LINKS = [
  { label: "CNCS Portugal", url: "https://www.cncs.gov.pt/", icon: "🇵🇹" },
  { label: "CNPD Portugal", url: "https://www.cnpd.pt/", icon: "🔒" },
  { label: "Europol EC3", url: "https://www.europol.europa.eu/", icon: "🇪🇺" },
  { label: "FTC Fraud", url: "https://reportfraud.ftc.gov/", icon: "🇺🇸" },
  { label: "IC3 / FBI", url: "https://www.ic3.gov/", icon: "🕵️" },
  { label: "AbuseIPDB", url: "https://www.abuseipdb.com/", icon: "🌐" },
  { label: "CoinGecko", url: "https://www.coingecko.com/", icon: "💹" },
  { label: "Etherscan", url: "https://etherscan.io/", icon: "⛓️" },
  { label: "CryptoScamDB", url: "https://cryptoscamdb.org/", icon: "🚨" },
  { label: "PhishTank", url: "https://www.phishtank.com/", icon: "🎣" },
];

const TYPE_LABELS: Record<string, string> = {
  phone: "📞 Telefone",
  crypto: "💰 Cripto",
  ip: "🌐 IP",
  url: "🔗 URL",
  email: "📧 Email",
  message: "💬 Mensagem",
  iban: "🏦 IBAN",
  image: "🖼️ Imagem",
};

// FIX: prevention page with sources, tips and alerts
export function PreventionPage() {
  // FIX: community reports stats for Radar Global
  const [stats, setStats] = useState<{
    total: number;
    last7: number;
    last24h: number;
    byType: { type: string; count: number; pct: number }[];
    byCountry: { country: string; count: number }[];
    trend: number[];
  } | null>(null);

  useEffect(() => {
    const compute = () => {
      const all = getAllReports();
      const now = Date.now();
      const last30 = all.filter(
        (r: { timestamp: number }) =>
          now - r.timestamp < 30 * 24 * 60 * 60 * 1000,
      );
      const last7 = all.filter(
        (r: { timestamp: number }) =>
          now - r.timestamp < 7 * 24 * 60 * 60 * 1000,
      );
      const last24h = all.filter(
        (r: { timestamp: number }) => now - r.timestamp < 24 * 60 * 60 * 1000,
      );

      const byType: Record<string, number> = {};
      const byCountry: Record<string, number> = {};
      for (const r of last30 as { type: string; country?: string }[]) {
        byType[r.type] = (byType[r.type] || 0) + 1;
        if (r.country) byCountry[r.country] = (byCountry[r.country] || 0) + 1;
      }

      const total = last30.length;
      const byTypeSorted = Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([type, count]) => ({
          type,
          count,
          pct: total > 0 ? Math.round((count / total) * 100) : 0,
        }));

      const byCountrySorted = Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([country, count]) => ({ country, count }));

      // 7-day trend: count per day
      const trend: number[] = Array(7).fill(0);
      for (const r of last7 as { timestamp: number }[]) {
        const daysAgo = Math.floor((now - r.timestamp) / (24 * 60 * 60 * 1000));
        if (daysAgo < 7) trend[6 - daysAgo]++;
      }

      setStats({
        total,
        last7: last7.length,
        last24h: last24h.length,
        byType: byTypeSorted,
        byCountry: byCountrySorted,
        trend,
      });
    };
    compute();
    const interval = setInterval(compute, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main
      id="main-content"
      className="flex-1 container mx-auto px-4 py-6 max-w-4xl"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            🛡️ Prevenção Digital
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Guia prático para identificar, evitar e reportar fraudes digitais.
            Partilhe com quem precisa.
          </p>
        </div>

        {/* FIX: community reports stats for Radar Global — Estatísticas Globais */}
        <section>
          <h2 className="text-xl font-bold mb-4">
            📊 Estatísticas Globais de Denúncias
          </h2>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <Card className="border shadow-sm text-center">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-red-600">
                  {stats?.total ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Denúncias (30 dias)
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm text-center">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-amber-600">
                  {stats?.last7 ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Últimos 7 dias
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm text-center">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-blue-600">
                  {stats?.last24h ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Últimas 24 horas
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Bar chart by type */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Denúncias por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && stats.byType.length > 0 ? (
                  <div className="space-y-2">
                    {stats.byType.map((item) => (
                      <div key={item.type} className="flex items-center gap-2">
                        <span className="text-xs w-24 shrink-0 text-muted-foreground">
                          {TYPE_LABELS[item.type] ?? item.type}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sem denúncias nos últimos 30 dias.
                    <br />
                    Faça a primeira denúncia na página principal!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Trend sparkline + top countries */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tendência (7 dias)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats && (
                  <>
                    <div>
                      {stats.trend.every((v) => v === 0) ? (
                        <p className="text-xs text-muted-foreground">
                          Sem dados de tendência ainda.
                        </p>
                      ) : (
                        <svg
                          viewBox="0 0 140 40"
                          className="w-full h-10"
                          preserveAspectRatio="none"
                          role="img"
                          aria-label="Tendência de denúncias nos últimos 7 dias"
                        >
                          {(() => {
                            const vals = stats.trend;
                            const max = Math.max(...vals, 1);
                            const pts = vals
                              .map(
                                (v, i) =>
                                  `${(i / (vals.length - 1)) * 140},${40 - (v / max) * 36}`,
                              )
                              .join(" ");
                            const fill = `0,40 ${pts} 140,40`;
                            return (
                              <>
                                <polygon
                                  points={fill}
                                  fill="rgba(59,130,246,0.15)"
                                />
                                <polyline
                                  points={pts}
                                  fill="none"
                                  stroke="#3b82f6"
                                  strokeWidth="2"
                                />
                              </>
                            );
                          })()}
                        </svg>
                      )}
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>7 dias atrás</span>
                        <span>Hoje</span>
                      </div>
                    </div>
                    {stats.byCountry.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Top Países
                        </p>
                        {stats.byCountry.map((c) => (
                          <div
                            key={c.country}
                            className="flex justify-between text-xs text-gray-600"
                          >
                            <span>{c.country}</span>
                            <span className="font-bold">{c.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 1. Tipos de Fraude */}
        <section>
          <h2 className="text-xl font-bold mb-4">📚 Tipos de Fraude Digital</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {FRAUD_TYPES.map((ft) => (
              <Card key={ft.title} className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{ft.emoji}</span> {ft.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{ft.desc}</p>
                  <div>
                    <p className="text-xs font-semibold text-red-600 mb-1">
                      ⚠️ Sinais de alerta:
                    </p>
                    <ul className="space-y-1">
                      {ft.signals.map((s) => (
                        <li
                          key={s}
                          className="text-xs text-gray-600 flex items-start gap-1"
                        >
                          <span className="text-red-400 mt-0.5">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 2. Como identificar */}
        <section>
          <Card className="border-l-4 border-l-amber-400">
            <CardHeader>
              <CardTitle className="text-base">
                🔍 Como Identificar uma Fraude
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="bg-amber-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-bold text-amber-800 uppercase">
                    Mensagens suspeitas
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Erros ortográficos frequentes</li>
                    <li>• Pedido urgente de dinheiro ou dados</li>
                    <li>• Links que não correspondem ao site oficial</li>
                    <li>• Prémios ou heranças inesperadas</li>
                  </ul>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-bold text-amber-800 uppercase">
                    Contactos suspeitos
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Número desconhecido com indicativo estrangeiro</li>
                    <li>• Chamada automática (robocall) com oferta</li>
                    <li>• Mensagem de "familiar em apuros"</li>
                    <li>• Solicitação de código MBWay ou CVV</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-bold text-gray-700 mb-2">
                  💡 Exemplos reais documentados (CNCS 2025):
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• SMS falso do MB com link para "atualizar dados"</li>
                  <li>
                    • Chamada de "suporte Microsoft" a pedir acesso remoto
                  </li>
                  <li>• Email de "Finanças" com reembolso e pedido de IBAN</li>
                  <li>
                    • Anúncio de investimento em criptomoedas com retorno de
                    300%/mês
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. Como agir */}
        <section>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-base">
                🧭 Como Agir se Receber uma Fraude
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {HOW_TO_ACT.map((a) => (
                  <div
                    key={a.text}
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <span className="text-xl">{a.icon}</span>
                    <p className="text-sm text-gray-700">{a.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. Links oficiais */}
        <section>
          <h2 className="text-xl font-bold mb-4">
            🔗 Contactos e Entidades Oficiais
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {OFFICIAL_LINKS.map((group) => (
              <Card key={group.country} className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">
                    {group.country}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-700 hover:text-blue-900 hover:underline break-words leading-relaxed"
                    >
                      🌐 {link.label}
                    </a>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 5. Fontes e links úteis */}
        <section>
          <h2 className="text-xl font-bold mb-4">📌 Fontes e Links Úteis</h2>
          <div className="flex flex-wrap gap-2">
            {SOURCE_LINKS.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-3 py-1.5 transition-colors"
              >
                <span>{s.icon}</span> {s.label}
              </a>
            ))}
          </div>
        </section>

        {/* 6. Apoio ao utilizador */}
        <section>
          <Card className="bg-[#0b1e3d] text-white border-0">
            <CardHeader>
              <CardTitle className="text-base text-white">
                🆘 Apoio ao Utilizador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-blue-200 text-sm">
                Se foi vítima de fraude ou tem dúvidas, siga estes passos:
              </p>
              <ol className="space-y-2">
                {[
                  "Não efetue mais pagamentos nem forneça mais dados.",
                  "Contacte o seu banco imediatamente se transferiu dinheiro.",
                  "Altere as suas passwords de email e banca online.",
                  "Guarde todas as provas (ecrãs, números, mensagens).",
                  "Apresente queixa na PSP, GNR ou Ministério Público.",
                  "Reporte o contacto suspeito nesta app para alertar outros utilizadores.",
                ].map((step, i) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 text-sm text-blue-100"
                  >
                    <span className="bg-white text-[#0b1e3d] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-4 pt-3 border-t border-blue-700 text-xs text-blue-300">
                Suporte:{" "}
                <a
                  href="mailto:suporte.antifraud@gmail.com"
                  className="underline"
                >
                  suporte.antifraud@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        <LegalDisclaimerBanner variant="full" />
      </div>
    </main>
  );
}

export default PreventionPage;
