const SUPPORT_LINK = (
  <a
    href="mailto:suporte.antifraud@gmail.com"
    className="text-primary hover:underline font-semibold"
  >
    SUPPORT
  </a>
);

export function LegalNoticeContent() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert space-y-10">
      {/* ═══════════════════════════════════════════════════════════════
          AVISO LEGAL
      ═══════════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-6 pb-4 border-b border-border">
          <h1 className="text-3xl font-bold mb-1">AVISO LEGAL</h1>
          <p className="text-lg font-semibold text-primary">
            AntiFraudapp — Isenção de Responsabilidade
          </p>
          <div className="mt-3 text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Versão:</strong> 2.1 — Fevereiro de 2026
            </p>
          </div>
        </div>

        {/* 1. Natureza Informativa */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">1. Natureza Informativa</h2>
          <p className="mb-3 leading-relaxed">
            A <strong>AntiFraudapp</strong> é uma ferramenta informativa baseada
            em análise algorítmica e contributos da comunidade. Toda a
            informação apresentada é de natureza{" "}
            <strong>indicativa e não vinculativa</strong>. A aplicação não
            declara fraude confirmada, não acusa pessoas ou entidades, e não
            substitui qualquer autoridade oficial.
          </p>
        </div>

        {/* 2. Isenção de Responsabilidade */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            2. Isenção de Responsabilidade
          </h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp <strong>não é responsável</strong> por decisões
            financeiras, comerciais, reputacionais ou de qualquer outra natureza
            tomadas com base na informação apresentada. O utilizador assume
            integralmente a responsabilidade pelas suas decisões.
          </p>
          <p className="mb-3 leading-relaxed">
            Esta avaliação representa apenas uma estimativa algorítmica baseada
            em padrões técnicos.{" "}
            <strong>Não constitui afirmação factual nem acusação.</strong>
          </p>
        </div>

        {/* 3. Não Substituição de Autoridades Oficiais */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            3. Não Substituição de Autoridades Oficiais
          </h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp{" "}
            <strong>
              não substitui autoridades policiais, judiciais, reguladoras ou
              qualquer outro organismo oficial competente.
            </strong>{" "}
            Em caso de suspeita de crime ou fraude, o utilizador deve contactar
            as autoridades competentes:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              <strong>Emergências: 112</strong>
            </li>
            <li>PSP (Polícia de Segurança Pública)</li>
            <li>GNR (Guarda Nacional Republicana)</li>
            <li>PJ (Polícia Judiciária)</li>
            <li>
              CNCS (Centro Nacional de Cibersegurança):{" "}
              <a
                href="https://www.cncs.gov.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.cncs.gov.pt
              </a>
            </li>
          </ul>
        </div>

        {/* 4. Limite de Escala de Risco */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            4. Limite de Escala de Risco
          </h2>
          <p className="mb-3 leading-relaxed">
            A classificação máxima possível é <strong>99%</strong>. A aplicação{" "}
            <strong>nunca atribui 100%</strong> nem declara fraude confirmada.
            Todos os resultados são estimativas algorítmicas indicativas.
          </p>
        </div>

        {/* 5. Conteúdo Submetido por Utilizadores */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            5. Conteúdo Submetido por Utilizadores
          </h2>
          <p className="mb-3 leading-relaxed">
            O utilizador é responsável pelo conteúdo que submete. A AntiFraudapp
            reserva-se o direito de remover qualquer conteúdo sem aviso prévio,
            nomeadamente conteúdo ilegal, difamatório ou que viole os presentes
            termos.
          </p>
        </div>

        {/* 6. Identificação do Responsável */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            6. Identificação do Responsável
          </h2>
          <p className="mb-3 leading-relaxed">
            Titular do domínio <strong>antifraudapp.com</strong>: Hermínio
            Coragem, Portugal.
          </p>
          <p className="mb-3 leading-relaxed">Contacto: {SUPPORT_LINK}</p>
          <p className="mb-3 leading-relaxed">
            <strong>
              A AntiFraudapp é uma ferramenta informativa sem fins lucrativos,
              sem pagamentos, sem subscrições e sem publicidade.
            </strong>{" "}
            Não existe obrigação fiscal associada à operação atual da aplicação.
          </p>
        </div>

        {/* 7. Jurisdição */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">7. Jurisdição</h2>
          <p className="mb-3 leading-relaxed">
            Aplicável legislação portuguesa, sem prejuízo das normas imperativas
            de proteção do consumidor da União Europeia, incluindo o{" "}
            <strong>Regulamento (UE) 2016/679 (RGPD)</strong>.
          </p>
        </div>
      </section>
    </div>
  );
}
