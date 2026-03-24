const SUPPORT_LINK = (
  <a
    href="mailto:suporte.antifraud@gmail.com"
    className="text-primary hover:underline font-semibold"
  >
    SUPPORT
  </a>
);

export function PrivacyContent() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert space-y-10">
      {/* ═══════════════════════════════════════════════════════════════
          POLÍTICA DE PRIVACIDADE
      ═══════════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-6 pb-4 border-b border-border">
          <h1 className="text-3xl font-bold mb-1">POLÍTICA DE PRIVACIDADE</h1>
          <p className="text-lg font-semibold text-primary">
            AntiFraudapp — Proteção de Dados Pessoais
          </p>
          <div className="mt-3 text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Versão:</strong> 2.1 — Fevereiro de 2026
            </p>
            <p>
              <strong>Conformidade:</strong> Regulamento (UE) 2016/679 (RGPD) ·
              Lei n.º 58/2019
            </p>
            <p>
              <strong>Responsável pelo Tratamento:</strong> Hermínio Coragem
              (HTenterprise) — {SUPPORT_LINK}
            </p>
          </div>
        </div>

        {/* 1. Introdução e Base Legal */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">1. Introdução e Base Legal</h2>
          <p className="mb-3 leading-relaxed">
            A presente Política de Privacidade descreve como a{" "}
            <strong>AntiFraudapp</strong> recolhe, utiliza, armazena e protege
            os dados pessoais dos seus utilizadores, em conformidade com o{" "}
            <strong>Regulamento (UE) 2016/679 (RGPD)</strong> e a{" "}
            <strong>Lei n.º 58/2019</strong>.
          </p>
          <p className="mb-3 leading-relaxed">
            A base legal para o tratamento de dados é o{" "}
            <strong>consentimento explícito do utilizador</strong> (Art. 6.º,
            n.º 1, al. a) do RGPD), formalizado no momento da primeira
            utilização da aplicação.
          </p>
        </div>

        {/* 2. Dados Recolhidos */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">2. Dados Recolhidos</h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp pode recolher os seguintes dados:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              <strong>Dados de utilização:</strong> Textos, números de telefone,
              endereços de email e endereços de criptomoeda submetidos para
              análise de risco;
            </li>
            <li>
              <strong>Dados de localização:</strong> Coordenadas GPS
              temporárias, apenas durante sessões de partilha ativas e com
              consentimento mútuo;
            </li>
            <li>
              <strong>Dados de autenticação:</strong> Identificador anónimo
              gerado pelo sistema de autenticação (Internet Identity), sem dados
              pessoais identificáveis;
            </li>
            <li>
              <strong>Dados de preferências:</strong> Idioma selecionado e
              preferências de interface, armazenados localmente no dispositivo;
            </li>
            <li>
              <strong>Dados de relatórios:</strong> Contactos reportados pela
              comunidade, de forma anónima.
            </li>
          </ul>
        </div>

        {/* 3. Finalidades do Tratamento */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            3. Finalidades do Tratamento
          </h2>
          <p className="mb-3 leading-relaxed">
            Os dados são tratados exclusivamente para:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>Prestação do serviço de análise indicativa de risco;</li>
            <li>
              Funcionamento da funcionalidade de partilha de localização segura;
            </li>
            <li>
              Manutenção da base de dados colaborativa de contactos reportados;
            </li>
            <li>Melhoria contínua dos algoritmos de deteção de fraude;</li>
            <li>Cumprimento de obrigações legais aplicáveis.</li>
          </ul>
          <p className="mb-3 leading-relaxed">
            <strong>
              Os dados não são utilizados para fins de marketing, publicidade ou
              criação de perfis comportamentais.
            </strong>
          </p>
        </div>

        {/* 4. Partilha de Dados com Terceiros */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            4. Partilha de Dados com Terceiros
          </h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp{" "}
            <strong>
              não vende, não aluga e não partilha dados pessoais com terceiros
              para fins comerciais.
            </strong>{" "}
            Os dados podem ser partilhados apenas nas seguintes circunstâncias:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>Cumprimento de obrigações legais ou ordens judiciais;</li>
            <li>
              Proteção dos direitos, propriedade ou segurança da AntiFraudapp,
              dos seus utilizadores ou do público em geral.
            </li>
          </ul>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp não recolhe dados das redes sociais. A partilha
            social é voluntária e externa à aplicação.
          </p>
        </div>

        {/* 5. Conservação dos Dados */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">5. Conservação dos Dados</h2>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              <strong>Dados de localização:</strong> Eliminados imediatamente
              após o término ou expiração da sessão (máximo 24 horas);
            </li>
            <li>
              <strong>Dados de análise de risco:</strong> Não são armazenados de
              forma permanente após a análise;
            </li>
            <li>
              <strong>Dados de relatórios:</strong> Conservados enquanto
              necessários para o funcionamento da base colaborativa;
            </li>
            <li>
              <strong>Dados de preferências locais:</strong> Armazenados no
              dispositivo do utilizador e eliminados ao limpar os dados do
              navegador.
            </li>
          </ul>
        </div>

        {/* 6. Segurança dos Dados */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">6. Segurança dos Dados</h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp implementa medidas técnicas e organizativas adequadas
            para proteger os dados pessoais contra acesso não autorizado,
            alteração, divulgação ou destruição. No entanto, nenhum sistema é
            absolutamente seguro e o operador não pode garantir segurança total.
          </p>
        </div>

        {/* 7. Direitos dos Titulares dos Dados (RGPD) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            7. Direitos dos Titulares dos Dados (RGPD)
          </h2>
          <p className="mb-3 leading-relaxed">
            Nos termos do <strong>Regulamento (UE) 2016/679 (RGPD)</strong>, o
            utilizador tem os seguintes direitos:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              <strong>Direito de acesso (Art. 15.º RGPD):</strong> Direito a
              obter confirmação sobre se os seus dados pessoais são tratados e,
              em caso afirmativo, acesso aos mesmos;
            </li>
            <li>
              <strong>Direito de retificação (Art. 16.º RGPD):</strong> Direito
              a obter a retificação de dados pessoais inexatos;
            </li>
            <li>
              <strong>Direito ao apagamento (Art. 17.º RGPD):</strong> Direito a
              obter o apagamento dos seus dados pessoais ("direito a ser
              esquecido");
            </li>
            <li>
              <strong>
                Direito à limitação do tratamento (Art. 18.º RGPD):
              </strong>{" "}
              Direito a obter a limitação do tratamento dos seus dados;
            </li>
            <li>
              <strong>Direito à portabilidade (Art. 20.º RGPD):</strong> Direito
              a receber os seus dados num formato estruturado e legível por
              máquina;
            </li>
            <li>
              <strong>Direito de oposição (Art. 21.º RGPD):</strong> Direito a
              opor-se ao tratamento dos seus dados pessoais;
            </li>
            <li>
              <strong>Direito de retirar o consentimento:</strong> O
              consentimento pode ser retirado a qualquer momento, sem prejuízo
              da licitude do tratamento efetuado com base no consentimento
              previamente dado.
            </li>
          </ul>
          <p className="mb-3 leading-relaxed">
            Para exercer estes direitos, contacte {SUPPORT_LINK}. Tem também o
            direito de apresentar reclamação à{" "}
            <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong> em{" "}
            <a
              href="https://www.cnpd.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.cnpd.pt
            </a>
            .
          </p>
        </div>

        {/* 8. Cookies e Armazenamento Local */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            8. Cookies e Armazenamento Local
          </h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp utiliza armazenamento local (
            <strong>localStorage</strong> e <strong>sessionStorage</strong>)
            para guardar preferências de idioma, histórico de pesquisas e estado
            de consentimento.{" "}
            <strong>
              Não são utilizados cookies de rastreamento ou publicidade.
            </strong>
          </p>
        </div>

        {/* 9. Transferências Internacionais */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            9. Transferências Internacionais
          </h2>
          <p className="mb-3 leading-relaxed">
            Os dados são armazenados em infraestrutura descentralizada (
            <strong>Internet Computer Protocol — ICP</strong>). O operador
            assegura que quaisquer transferências de dados cumprem os requisitos
            do RGPD.
          </p>
        </div>

        {/* 10. Menores */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">10. Menores</h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp{" "}
            <strong>não é destinada a menores de 16 anos.</strong> O operador
            não recolhe intencionalmente dados de menores. Se tiver conhecimento
            de que um menor forneceu dados pessoais, contacte {SUPPORT_LINK}{" "}
            para remoção imediata.
          </p>
        </div>

        {/* 11. Alterações à Política de Privacidade */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            11. Alterações à Política de Privacidade
          </h2>
          <p className="mb-3 leading-relaxed">
            O operador reserva-se o direito de atualizar esta Política de
            Privacidade. As alterações serão comunicadas através da aplicação. A
            continuação da utilização após a publicação das alterações constitui
            aceitação das mesmas.
          </p>
        </div>

        {/* 12. Contacto */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">12. Contacto</h2>
          <p className="mb-3 leading-relaxed">
            Para questões relacionadas com privacidade e proteção de dados,
            contacte: {SUPPORT_LINK}
          </p>
        </div>
      </section>
    </div>
  );
}
