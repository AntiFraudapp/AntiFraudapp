export function SecureLocationPolicyContent() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert space-y-10">
      {/* ═══════════════════════════════════════════════════════════════
          POLÍTICA DE LOCALIZAÇÃO SEGURA
      ═══════════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-6 pb-4 border-b border-border">
          <h1 className="text-3xl font-bold mb-1">
            POLÍTICA DE LOCALIZAÇÃO SEGURA
          </h1>
          <p className="text-lg font-semibold text-primary">
            AntiFraud — Partilha de Localização com Consentimento
          </p>
          <div className="mt-3 text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Versão:</strong> 2.1 — Fevereiro de 2026
            </p>
            <p>
              <strong>Conformidade:</strong> RGPD (UE) 2016/679
            </p>
          </div>
        </div>

        {/* Princípios Fundamentais */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">Princípios Fundamentais</h2>
          <ul className="list-disc list-inside space-y-3 ml-4 mb-6">
            <li>
              <strong>Consentimento mútuo obrigatório:</strong> Ambas as partes
              devem consentir explicitamente antes de qualquer partilha de
              localização;
            </li>
            <li>
              <strong>Código de verificação:</strong> A sessão é ativada apenas
              após confirmação de um código de 6 dígitos por ambas as partes;
            </li>
            <li>
              <strong>Expiração automática:</strong> Todas as sessões expiram
              automaticamente após 24 horas;
            </li>
            <li>
              <strong>Controlo total:</strong> O botão STOP está sempre visível
              durante a sessão ativa e termina a partilha imediatamente;
            </li>
            <li>
              <strong>Sem armazenamento permanente:</strong> Os dados de
              localização são eliminados após o término ou expiração da sessão;
            </li>
            <li>
              <strong>Sem rastreamento oculto:</strong> Não é possível rastrear
              a localização de outra pessoa sem o seu conhecimento e
              consentimento;
            </li>
            <li>
              <strong>Transparência total:</strong> Ambas as partes sabem que a
              localização está a ser partilhada;
            </li>
            <li>
              <strong>Reversibilidade:</strong> Qualquer das partes pode
              terminar a sessão a qualquer momento, unilateralmente;
            </li>
            <li>
              <strong>Conformidade RGPD:</strong> Toda a funcionalidade foi
              concebida em conformidade com o Regulamento (UE) 2016/679.
            </li>
          </ul>
        </div>

        {/* Aviso de Emergência */}
        <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p className="text-base font-semibold text-destructive">
            ⚠️ A AntiFraud não substitui autoridades de segurança ou emergência.
            Em situações de perigo imediato, ligue <strong>112</strong>.
          </p>
        </div>

        {/* Finalidade da Funcionalidade */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            Finalidade da Funcionalidade
          </h2>
          <p className="mb-3 leading-relaxed">
            A funcionalidade de localização foi concebida{" "}
            <strong>
              exclusivamente para fins de prevenção e proteção pessoal
            </strong>
            , não para controlo, perseguição ou vigilância de terceiros.
          </p>
          <p className="mb-3 leading-relaxed">
            A utilização desta funcionalidade para fins de perseguição, assédio,{" "}
            <em>stalking</em> ou qualquer outra finalidade ilícita é{" "}
            <strong>expressamente proibida</strong> e pode constituir crime nos
            termos da legislação portuguesa e europeia aplicável.
          </p>
        </div>

        {/* Dados Técnicos */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">Dados Técnicos e Segurança</h2>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              Os dados de localização são transmitidos de forma cifrada via
              HTTPS/TLS;
            </li>
            <li>
              As coordenadas GPS são armazenadas temporariamente apenas durante
              a sessão ativa;
            </li>
            <li>
              Após o término ou expiração da sessão, todos os dados de
              localização são eliminados;
            </li>
            <li>
              Não é possível aceder à localização de outra pessoa de forma
              oculta ou sem o seu conhecimento;
            </li>
            <li>
              A AntiFraud não realiza vigilância, monitorização secreta ou
              controlo invisível de qualquer utilizador.
            </li>
          </ul>
        </div>

        {/* Direitos dos Utilizadores */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">Direitos dos Utilizadores</h2>
          <p className="mb-3 leading-relaxed">
            Em conformidade com o{" "}
            <strong>Regulamento (UE) 2016/679 (RGPD)</strong>, os utilizadores
            têm o direito de:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              Retirar o consentimento a qualquer momento, terminando a sessão de
              localização;
            </li>
            <li>
              Solicitar a eliminação dos dados de localização associados à sua
              conta;
            </li>
            <li>Obter informação sobre os dados de localização tratados.</li>
          </ul>
          <p className="mb-3 leading-relaxed">
            Para exercer estes direitos, contacte{" "}
            <a
              href="mailto:suporte.antifraud@gmail.com"
              className="text-primary hover:underline font-semibold"
            >
              SUPPORT
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
