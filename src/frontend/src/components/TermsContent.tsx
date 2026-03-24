interface TermsContentProps {
  showSeals?: boolean;
}

const SUPPORT_LINK = (
  <a
    href="mailto:suporte.antifraud@gmail.com"
    className="text-primary hover:underline font-semibold"
  >
    SUPPORT
  </a>
);

export function TermsContent({
  showSeals: _showSeals = false,
}: TermsContentProps) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert space-y-10">
      {/* ═══════════════════════════════════════════════════════════════
          TERMOS E CONDIÇÕES DE UTILIZAÇÃO
      ═══════════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-6 pb-4 border-b border-border">
          <h1 className="text-3xl font-bold mb-1">
            TERMOS E CONDIÇÕES DE UTILIZAÇÃO
          </h1>
          <p className="text-lg font-semibold text-primary">
            AntiFraudapp — Plataforma de Proteção Contra Fraude
          </p>
          <div className="mt-3 text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Versão:</strong> 2.2 — Março de 2026
            </p>
            <p>
              <strong>Operador:</strong> Sociedade HTenterprise (Hermínio
              Coragem & Tiago Ferro)
            </p>
            <p>
              <strong>Domínio:</strong> antifraudapp.com
            </p>
            <p>
              <strong>Contacto:</strong> {SUPPORT_LINK}
            </p>
            <p>
              <strong>Legislação aplicável:</strong> Regulamento (UE) 2016/679
              (RGPD) · Lei n.º 58/2019 · Lei n.º 109/2009 · Código Civil
              Português
            </p>
          </div>
        </div>

        {/* 1. Identificação */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            1. Identificação e Natureza da Aplicação
          </h2>
          <p className="mb-3 leading-relaxed">
            A <strong>AntiFraudapp</strong> é uma aplicação digital de utilidade
            pública, desenvolvida e operada pela sociedade HTenterprise,
            destinada à análise indicativa de risco de mensagens, contactos
            telefónicos, endereços de correio eletrónico e endereços de
            criptomoeda, bem como à partilha temporária e voluntária de
            localização geográfica com consentimento mútuo explícito entre as
            partes envolvidas.
          </p>
          <p className="mb-3 leading-relaxed">
            A aplicação encontra-se disponível em{" "}
            <strong>antifraudapp.com</strong> e como Aplicação Web Progressiva
            (PWA) instalável em dispositivos móveis e de secretária.
          </p>
          <p className="mb-3 leading-relaxed">
            <strong>Titular do domínio:</strong> Hermínio Coragem, Portugal.
            Contacto oficial: {SUPPORT_LINK}
          </p>
        </div>

        {/* 2. Objeto */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            2. Objeto e Âmbito da Aplicação
          </h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp fornece os seguintes serviços:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              Sistema indicativo de avaliação de risco de mensagens, contactos
              telefónicos, endereços de email e endereços de criptomoeda;
            </li>
            <li>
              Classificação baseada em padrões conhecidos de fraude,
              palavras-chave de risco e heurísticas técnicas;
            </li>
            <li>
              Funcionalidade opcional de partilha temporária de localização
              geográfica com consentimento explícito e mútuo de ambas as partes;
            </li>
            <li>
              Informação educativa sobre prevenção de fraude, burlas e esquemas
              de engenharia social;
            </li>
            <li>
              Base de dados colaborativa de contactos reportados pela comunidade
              de utilizadores;
            </li>
            <li>
              Pesquisa de serviços públicos e entidades oficiais verificadas.
            </li>
          </ul>
          <p className="mb-3 leading-relaxed">
            <strong>
              A aplicação não substitui autoridades policiais, judiciais,
              reguladoras ou qualquer outro organismo oficial competente.
            </strong>{" "}
            Em caso de suspeita de crime, o utilizador deve contactar as
            autoridades competentes (PSP, GNR, PJ, CNCS ou ligar 112). A
            AntiFraudapp é uma ferramenta informativa e não tem poderes de
            investigação, acusação ou sanção.
          </p>
        </div>

        {/* 3. Natureza Indicativa */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            3. Natureza Indicativa do Sistema de Avaliação de Risco
          </h2>
          <p className="mb-3 leading-relaxed">
            O motor de avaliação de risco da AntiFraudapp é de natureza
            estritamente <strong>indicativa e não vinculativa</strong>. O
            utilizador deve compreender e aceitar que:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              A percentagem de risco apresentada (0–99%) é meramente indicativa
              e baseia-se em padrões técnicos, palavras-chave e heurísticas
              conhecidas;
            </li>
            <li>
              A aplicação <strong>nunca declara "100% seguro"</strong> nem
              "fraude confirmada";
            </li>
            <li>
              Os resultados <strong>não constituem prova legal</strong> nem
              podem ser utilizados como tal em processos judiciais ou
              administrativos;
            </li>
            <li>
              A análise baseia-se exclusivamente em padrões técnicos e não em
              investigação criminal;
            </li>
            <li>
              Falsos positivos e falsos negativos são tecnicamente possíveis;
            </li>
            <li>
              O sistema não tem acesso a bases de dados policiais, judiciais ou
              governamentais;
            </li>
            <li>
              <strong>
                O utilizador é sempre e integralmente responsável pelas decisões
                tomadas
              </strong>{" "}
              com base na informação apresentada pela aplicação.
            </li>
          </ul>
          <p className="mb-3 leading-relaxed">
            Esta avaliação representa apenas uma estimativa algorítmica baseada
            em padrões técnicos. Não constitui afirmação factual nem acusação. A
            AntiFraudapp recomenda sempre que, perante qualquer suspeita séria
            de fraude ou crime, o utilizador contacte as autoridades competentes
            e não tome decisões exclusivamente com base nos resultados da
            aplicação.
          </p>
        </div>

        {/* 4. Aceitação */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            4. Aceitação dos Termos e Condições
          </h2>
          <p className="mb-3 leading-relaxed">
            A utilização da aplicação AntiFraudapp implica a leitura,
            compreensão e aceitação integral dos presentes Termos e Condições,
            da Política de Privacidade, da Política de Localização Segura e do
            Aviso Legal aqui contidos.
          </p>
          <p className="mb-3 leading-relaxed">
            Caso o utilizador não concorde com qualquer disposição dos presentes
            termos, deverá abster-se de utilizar a aplicação.
          </p>
          <p className="mb-3 leading-relaxed">
            A aceitação é formalizada através da confirmação explícita no modal
            de consentimento apresentado na primeira utilização da aplicação, em
            conformidade com o artigo 7.º do Regulamento (UE) 2016/679 (RGPD).
          </p>
        </div>

        {/* 5. Acesso e Disponibilidade */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            5. Acesso, Disponibilidade e Requisitos Técnicos
          </h2>
          <p className="mb-3 leading-relaxed">
            O acesso à AntiFraudapp é gratuito e não requer registo obrigatório
            para as funcionalidades básicas de análise de risco. Algumas
            funcionalidades avançadas, como a partilha de localização segura,
            requerem autenticação.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              A aplicação está disponível 24 horas por dia, 7 dias por semana,
              sujeita a manutenção programada;
            </li>
            <li>
              O operador não garante disponibilidade ininterrupta e não é
              responsável por interrupções temporárias de serviço;
            </li>
            <li>
              A utilização requer um dispositivo com acesso à Internet e um
              navegador web moderno compatível;
            </li>
            <li>
              A aplicação pode ser instalada como PWA em dispositivos Android,
              iOS e computadores de secretária;
            </li>
            <li>
              O operador reserva-se o direito de suspender ou encerrar o serviço
              mediante aviso prévio razoável.
            </li>
          </ul>
        </div>

        {/* 6. Partilha de Localização */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            6. Funcionalidade de Partilha de Localização Segura
          </h2>
          <p className="mb-3 leading-relaxed">
            A funcionalidade de partilha de localização geográfica da
            AntiFraudapp foi concebida com os mais elevados padrões de
            privacidade e segurança. O utilizador deve compreender que:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              <strong>Consentimento mútuo obrigatório:</strong> A partilha de
              localização exige consentimento explícito e voluntário de ambos os
              números de telefone envolvidos;
            </li>
            <li>
              <strong>Ativação por código:</strong> A sessão é ativada apenas
              após confirmação de um código de verificação por ambas as partes;
            </li>
            <li>
              <strong>Expiração automática:</strong> Todas as sessões de
              localização expiram automaticamente após 24 horas;
            </li>
            <li>
              <strong>Interrupção a qualquer momento:</strong> Qualquer das
              partes pode interromper a partilha de localização a qualquer
              momento, sem necessidade de justificação, através do botão STOP
              visível durante toda a sessão;
            </li>
            <li>
              <strong>Sem armazenamento permanente:</strong> Os dados de
              localização não são armazenados de forma permanente após a
              expiração ou interrupção da sessão;
            </li>
            <li>
              <strong>Sem rastreamento unilateral:</strong> Não é possível
              rastrear a localização de outra pessoa sem o seu consentimento
              explícito;
            </li>
            <li>
              <strong>Sem acesso oculto:</strong> Não é possível aceder à
              localização de outra pessoa de forma oculta ou sem o seu
              conhecimento;
            </li>
            <li>
              <strong>Visibilidade bilateral:</strong> Ambas as partes podem ver
              a localização uma da outra durante a sessão ativa;
            </li>
            <li>
              A AntiFraudapp{" "}
              <strong>
                não realiza vigilância, monitorização secreta ou controlo
                invisível
              </strong>{" "}
              de qualquer utilizador.
            </li>
          </ul>
          <p className="mb-3 leading-relaxed">
            <strong>
              A funcionalidade de localização foi concebida exclusivamente para
              fins de prevenção e proteção pessoal, não para controlo,
              perseguição ou vigilância de terceiros.
            </strong>{" "}
            A utilização desta funcionalidade para fins de perseguição, assédio,
            stalking ou qualquer outra finalidade ilícita é expressamente
            proibida e pode constituir crime nos termos da legislação portuguesa
            e europeia aplicável.
          </p>
        </div>

        {/* 7. Utilizações Proibidas */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">7. Utilizações Proibidas</h2>
          <p className="mb-3 leading-relaxed">
            É expressamente proibido utilizar a AntiFraudapp para:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>Fins ilegais, fraudulentos ou contrários à ordem pública;</li>
            <li>
              Perseguição, assédio, stalking ou vigilância não consentida de
              terceiros;
            </li>
            <li>
              Difamação, calúnia ou dano à reputação de pessoas ou entidades;
            </li>
            <li>
              Submissão de relatórios falsos ou enganosos sobre contactos ou
              mensagens;
            </li>
            <li>Tentativas de acesso não autorizado a sistemas ou dados;</li>
            <li>
              Utilização automatizada ou por bots sem autorização expressa do
              operador;
            </li>
            <li>
              Qualquer finalidade que viole os direitos fundamentais de
              terceiros;
            </li>
            <li>Contornar ou manipular o sistema de avaliação de risco;</li>
            <li>Recolha não autorizada de dados de outros utilizadores.</li>
          </ul>
          <p className="mb-3 leading-relaxed">
            A violação destas proibições pode resultar na suspensão imediata do
            acesso à aplicação e, quando aplicável, na participação às
            autoridades competentes.
          </p>
        </div>

        {/* 8. Proteção de Dados */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            8. Proteção de Dados Pessoais (RGPD)
          </h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp cumpre integralmente o{" "}
            <strong>
              Regulamento (UE) 2016/679 do Parlamento Europeu e do Conselho
            </strong>{" "}
            (RGPD), de 27 de abril de 2016, relativo à proteção das pessoas
            singulares no que diz respeito ao tratamento de dados pessoais e à
            livre circulação desses dados, bem como a{" "}
            <strong>Lei n.º 58/2019</strong>, de 8 de agosto, que assegura a
            execução do RGPD na ordem jurídica nacional portuguesa.
          </p>
          <p className="mb-3 leading-relaxed">
            Os princípios fundamentais aplicados são:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              <strong>Licitude, lealdade e transparência:</strong> Os dados são
              tratados de forma lícita, leal e transparente;
            </li>
            <li>
              <strong>Limitação das finalidades:</strong> Os dados são
              recolhidos para finalidades determinadas, explícitas e legítimas;
            </li>
            <li>
              <strong>Minimização dos dados:</strong> Apenas são recolhidos os
              dados estritamente necessários para as finalidades declaradas;
            </li>
            <li>
              <strong>Exatidão:</strong> Os dados são mantidos exatos e
              atualizados;
            </li>
            <li>
              <strong>Limitação da conservação:</strong> Os dados não são
              conservados por mais tempo do que o necessário;
            </li>
            <li>
              <strong>Integridade e confidencialidade:</strong> Os dados são
              tratados com segurança técnica adequada;
            </li>
            <li>
              <strong>Responsabilidade:</strong> O operador é responsável pelo
              cumprimento destes princípios.
            </li>
          </ul>
          <p className="mb-3 leading-relaxed">
            <strong>
              Não são vendidos dados pessoais. Não são partilhados dados com
              terceiros para fins de marketing. Não é criado qualquer perfil
              comportamental oculto.
            </strong>
          </p>
        </div>

        {/* 9. Responsável pelo Tratamento */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            9. Responsável pelo Tratamento e Direitos do Utilizador
          </h2>
          <p className="mb-3 leading-relaxed">
            O responsável pelo tratamento dos dados pessoais é{" "}
            <strong>HTenterprise (Hermínio Coragem e Tiago Ferro)</strong>,
            contactável através de {SUPPORT_LINK}.
          </p>
          <p className="mb-3 leading-relaxed">
            Nos termos do RGPD, o utilizador tem os seguintes direitos:
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
            Para exercer qualquer um destes direitos, o utilizador deve
            contactar {SUPPORT_LINK}. O operador responderá no prazo máximo de
            30 dias, conforme previsto no RGPD.
          </p>
          <p className="mb-3 leading-relaxed">
            O utilizador tem ainda o direito de apresentar reclamação à{" "}
            <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong>,
            autoridade de controlo nacional competente, através do portal{" "}
            <strong>www.cnpd.pt</strong>.
          </p>
        </div>

        {/* 10. Responsabilidades do Utilizador */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            10. Responsabilidades do Utilizador
          </h2>
          <p className="mb-3 leading-relaxed">
            O utilizador é responsável por:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              Utilizar a aplicação de forma lícita e em conformidade com os
              presentes termos;
            </li>
            <li>
              Todas as decisões tomadas com base nos resultados da aplicação;
            </li>
            <li>A veracidade e exatidão das informações submetidas;</li>
            <li>Manter a confidencialidade das suas credenciais de acesso;</li>
            <li>
              Notificar imediatamente o operador de qualquer utilização não
              autorizada da sua conta;
            </li>
            <li>
              Garantir que a utilização da funcionalidade de localização é feita
              com o consentimento genuíno de todas as partes envolvidas.
            </li>
          </ul>
        </div>

        {/* 11. Limitação de Responsabilidade */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            11. Limitação de Responsabilidade e Isenção
          </h2>
          <p className="mb-3 leading-relaxed">
            Na máxima extensão permitida pela lei aplicável, a AntiFraudapp e o
            seu operador não são responsáveis por:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              Decisões tomadas pelos utilizadores com base nos resultados da
              aplicação;
            </li>
            <li>
              Uso indevido, abusivo ou ilícito da aplicação por parte de
              terceiros;
            </li>
            <li>
              Informações incorretas, incompletas ou desatualizadas fornecidas
              por utilizadores ou terceiros;
            </li>
            <li>
              Interrupções temporárias de serviço por razões técnicas, de
              manutenção ou força maior;
            </li>
            <li>
              Danos diretos, indiretos, incidentais, especiais ou consequentes
              resultantes da utilização ou impossibilidade de utilização da
              aplicação;
            </li>
            <li>
              Perdas financeiras ou danos patrimoniais resultantes de decisões
              baseadas nos resultados da aplicação;
            </li>
            <li>
              Atos de terceiros, incluindo ataques informáticos ou violações de
              segurança fora do controlo razoável do operador.
            </li>
          </ul>
          <p className="mb-3 leading-relaxed">
            <strong>
              A AntiFraudapp não substitui autoridades policiais, judiciais ou
              reguladoras.
            </strong>{" "}
            Em caso de suspeita de crime, o utilizador deve contactar as
            autoridades competentes (PSP, GNR, PJ) ou ligar 112. A aplicação não
            tem poderes de investigação, acusação ou sanção.
          </p>
        </div>

        {/* 12. Propriedade Intelectual */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            12. Propriedade Intelectual
          </h2>
          <p className="mb-3 leading-relaxed">
            Todos os elementos da aplicação AntiFraudapp, incluindo, sem
            limitação, o design, a estrutura, o código-fonte, os algoritmos, a
            marca, os logótipos, os textos, as imagens e a documentação, são
            propriedade exclusiva de sociedade HTenterprise e estão protegidos
            pelos direitos de propriedade intelectual aplicáveis, incluindo
            direitos de autor, marcas registadas e segredos comerciais.
          </p>
          <p className="mb-3 leading-relaxed">
            É expressamente proibida a reprodução, distribuição, modificação,
            engenharia reversa ou qualquer outra utilização não autorizada dos
            elementos da aplicação sem autorização prévia e escrita do operador.
          </p>
        </div>

        {/* 13. Segurança */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            13. Segurança e Medidas Técnicas
          </h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp implementa medidas técnicas e organizativas adequadas
            para proteger os dados dos utilizadores, incluindo:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>Transmissão de dados cifrada via HTTPS/TLS;</li>
            <li>
              Armazenamento descentralizado em infraestrutura blockchain ICP;
            </li>
            <li>Controlo de acesso baseado em funções (RBAC);</li>
            <li>Autenticação segura via Internet Identity;</li>
            <li>
              Dados de localização temporários, cifrados e apenas entre
              utilizadores consententes.
            </li>
          </ul>
          <p className="mb-3 leading-relaxed">
            O operador não garante segurança absoluta e recomenda que os
            utilizadores adotem boas práticas de segurança digital.
          </p>
        </div>

        {/* 14. Alterações */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">14. Alterações aos Termos</h2>
          <p className="mb-3 leading-relaxed">
            O operador reserva-se o direito de alterar os presentes Termos e
            Condições a qualquer momento, mediante notificação prévia razoável
            através da aplicação. A continuação da utilização da aplicação após
            a publicação das alterações constitui aceitação das mesmas.
          </p>
        </div>

        {/* 15. Jurisdição */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            15. Jurisdição e Lei Aplicável
          </h2>
          <p className="mb-3 leading-relaxed">
            Os presentes Termos e Condições são regidos pela legislação
            portuguesa, sem prejuízo das normas imperativas de proteção do
            consumidor da União Europeia, incluindo o Regulamento (UE) 2016/679
            (RGPD). Para a resolução de litígios, é competente o tribunal da
            comarca de Portugal, sem prejuízo do direito do utilizador de
            recorrer a mecanismos alternativos de resolução de litígios.
          </p>
        </div>
      </section>

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
              <strong>Versão:</strong> 2.2 — Março de 2026
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

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">1. Introdução e Base Legal</h2>
          <p className="mb-3 leading-relaxed">
            A presente Política de Privacidade descreve como a AntiFraudapp
            recolhe, utiliza, armazena e protege os dados pessoais dos seus
            utilizadores, em conformidade com o{" "}
            <strong>Regulamento (UE) 2016/679 (RGPD)</strong> e a Lei n.º
            58/2019.
          </p>
          <p className="mb-3 leading-relaxed">
            A base legal para o tratamento de dados é o consentimento explícito
            do utilizador (Art. 6.º, n.º 1, al. a) do RGPD), formalizado no
            momento da primeira utilização da aplicação.
          </p>
        </div>

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

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            4. Partilha de Dados com Terceiros
          </h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp{" "}
            <strong>
              não vende, não aluga e não partilha dados pessoais com terceiros
            </strong>{" "}
            para fins comerciais. Os dados podem ser partilhados apenas nas
            seguintes circunstâncias:
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

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">6. Segurança dos Dados</h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp implementa medidas técnicas e organizativas adequadas
            para proteger os dados pessoais contra acesso não autorizado,
            alteração, divulgação ou destruição. No entanto, nenhum sistema é
            absolutamente seguro e o operador não pode garantir segurança total.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            7. Direitos dos Titulares dos Dados (RGPD)
          </h2>
          <p className="mb-3 leading-relaxed">
            Nos termos do Regulamento (UE) 2016/679 (RGPD), o utilizador tem
            direito a aceder, retificar, apagar, limitar, portar e opor-se ao
            tratamento dos seus dados pessoais. Para exercer estes direitos,
            contacte {SUPPORT_LINK}.
          </p>
          <p className="mb-3 leading-relaxed">
            Tem também o direito de apresentar reclamação à{" "}
            <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong> em{" "}
            <strong>www.cnpd.pt</strong>.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            8. Cookies e Armazenamento Local
          </h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp utiliza armazenamento local (localStorage e
            sessionStorage) para guardar preferências de idioma, histórico de
            pesquisas e estado de consentimento. Não são utilizados cookies de
            rastreamento ou publicidade.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            9. Transferências Internacionais
          </h2>
          <p className="mb-3 leading-relaxed">
            Os dados são armazenados em infraestrutura descentralizada (Internet
            Computer Protocol — ICP). O operador assegura que quaisquer
            transferências de dados cumprem os requisitos do RGPD.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">10. Menores</h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp não é destinada a menores de 16 anos. O operador não
            recolhe intencionalmente dados de menores. Se tiver conhecimento de
            que um menor forneceu dados pessoais, contacte {SUPPORT_LINK} para
            remoção imediata.
          </p>
        </div>

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

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">12. Contacto</h2>
          <p className="mb-3 leading-relaxed">
            Para questões relacionadas com privacidade e proteção de dados,
            contacte: {SUPPORT_LINK}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          POLÍTICA DE LOCALIZAÇÃO SEGURA
      ═══════════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-6 pb-4 border-b border-border">
          <h1 className="text-3xl font-bold mb-1">
            POLÍTICA DE LOCALIZAÇÃO SEGURA
          </h1>
          <p className="text-lg font-semibold text-primary">
            AntiFraudapp — Partilha de Localização com Consentimento
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            <p>
              <strong>Versão:</strong> 2.2 — Março de 2026 · Conformidade RGPD
              (UE) 2016/679
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">Princípios Fundamentais</h2>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
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
          <p className="mb-3 leading-relaxed">
            <strong>
              A AntiFraudapp não substitui autoridades de segurança ou
              emergência.
            </strong>{" "}
            Em situações de perigo imediato, ligue 112.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          AVISO LEGAL
      ═══════════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-6 pb-4 border-b border-border">
          <h1 className="text-3xl font-bold mb-1">AVISO LEGAL</h1>
          <p className="text-lg font-semibold text-primary">
            AntiFraudapp — Isenção de Responsabilidade
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            <p>
              <strong>Versão:</strong> 2.2 — Março de 2026
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">1. Natureza Informativa</h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp é uma ferramenta informativa baseada em análise
            algorítmica e contributos da comunidade. Toda a informação
            apresentada é de natureza indicativa e não vinculativa. A aplicação
            não declara fraude confirmada, não acusa pessoas ou entidades, e não
            substitui qualquer autoridade oficial.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            2. Isenção de Responsabilidade
          </h2>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp não é responsável por decisões financeiras,
            comerciais, reputacionais ou de qualquer outra natureza tomadas com
            base na informação apresentada. O utilizador assume integralmente a
            responsabilidade pelas suas decisões.
          </p>
          <p className="mb-3 leading-relaxed">
            Esta avaliação representa apenas uma estimativa algorítmica baseada
            em padrões técnicos. Não constitui afirmação factual nem acusação.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            3. Não Substituição de Autoridades Oficiais
          </h2>
          <p className="mb-3 leading-relaxed">
            <strong>
              A AntiFraudapp não substitui autoridades policiais, judiciais,
              reguladoras ou qualquer outro organismo oficial competente.
            </strong>{" "}
            Em caso de suspeita de crime ou fraude, o utilizador deve contactar
            as autoridades competentes:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
            <li>
              Emergências: <strong>112</strong>
            </li>
            <li>PSP (Polícia de Segurança Pública)</li>
            <li>GNR (Guarda Nacional Republicana)</li>
            <li>PJ (Polícia Judiciária)</li>
            <li>
              CNCS (Centro Nacional de Cibersegurança):{" "}
              <strong>www.cncs.gov.pt</strong>
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            4. Limite de Escala de Risco
          </h2>
          <p className="mb-3 leading-relaxed">
            A classificação máxima possível é 99%. A aplicação nunca atribui
            100% nem declara fraude confirmada. Todos os resultados são
            estimativas algorítmicas indicativas.
          </p>
        </div>

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

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            6. Identificação do Responsável
          </h2>
          <p className="mb-3 leading-relaxed">
            <strong>Titular do domínio antifraudapp.com:</strong> Hermínio
            Coragem, Portugal.
            <br />
            <strong>Contacto:</strong> {SUPPORT_LINK}
          </p>
          <p className="mb-3 leading-relaxed">
            A AntiFraudapp é uma ferramenta informativa sem fins lucrativos, sem
            pagamentos, sem subscrições e sem publicidade. Não existe obrigação
            fiscal associada à operação atual da aplicação.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">7. Jurisdição</h2>
          <p className="mb-3 leading-relaxed">
            Aplicável legislação portuguesa, sem prejuízo das normas imperativas
            de proteção do consumidor da União Europeia, incluindo o Regulamento
            (UE) 2016/679 (RGPD).
          </p>
        </div>
      </section>
    </div>
  );
}
