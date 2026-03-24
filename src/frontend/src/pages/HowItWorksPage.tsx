import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { setSEO } from "@/utils/seo";
import {
  CreditCard,
  Eye,
  Image,
  Link2,
  Lock,
  MessageSquare,
  Phone,
  Shield,
  Users,
} from "lucide-react";
import { useEffect } from "react";

export function HowItWorksPage() {
  useEffect(() => {
    setSEO(
      "Como Funciona — AntiFraud",
      "Descubra como a AntiFraud ajuda a identificar fraudes digitais",
    );
  }, []);

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Shield className="h-14 w-14 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Como Funciona a AntiFraud
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Verificar antes de confiar
          </p>
        </div>

        {/* Intro */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed font-medium text-foreground">
              AntiFraudApp analisa em segundos: números suspeitos, mensagens,
              IBAN, links phishing, comprovativos. Ferramenta de apoio à
              prevenção de fraudes.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud foi desenvolvida para ajudar qualquer pessoa a
              identificar possíveis fraudes digitais de forma simples, rápida e
              acessível. A aplicação reúne várias ferramentas de análise que
              permitem verificar conteúdos suspeitos antes de tomar decisões que
              possam colocar em risco dinheiro, dados pessoais ou segurança
              online.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O objetivo é transformar a prevenção de fraude numa ação simples
              do dia a dia: verificar antes de confiar.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A plataforma permite analisar diferentes tipos de conteúdos que
              são frequentemente utilizados em burlas digitais.
            </p>
          </CardContent>
        </Card>

        {/* Análise de Números de Telefone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Phone className="h-6 w-6 text-primary" />
              Análise de Números de Telefone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud permite verificar números de telefone potencialmente
              associados a chamadas fraudulentas.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Ao introduzir um número na ferramenta de análise, o sistema avalia
              diferentes indicadores, como padrões suspeitos e denúncias da
              comunidade. Com base nesses fatores, é apresentado um nível de
              risco que ajuda o utilizador a perceber se deve ter cautela ao
              atender ou responder a chamadas desse número.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Este tipo de verificação pode ajudar a reduzir fraudes
              telefónicas, tentativas de suporte técnico falso, falsos contactos
              bancários e outras burlas que utilizam chamadas telefónicas como
              primeiro contacto.
            </p>
          </CardContent>
        </Card>

        {/* Análise de Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Link2 className="h-6 w-6 text-primary" />
              Análise de Links Suspeitos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Links maliciosos são um dos métodos mais comuns utilizados em
              fraudes digitais. Muitas vezes são enviados através de SMS, email
              ou aplicações de mensagens.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud permite introduzir um link para verificar possíveis
              indicadores de risco, como padrões de phishing, domínios suspeitos
              ou características frequentemente associadas a páginas falsas que
              tentam imitar bancos, empresas ou plataformas conhecidas.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Esta verificação pode ajudar os utilizadores a evitar abrir
              páginas fraudulentas destinadas a roubar credenciais ou
              informações pessoais.
            </p>
          </CardContent>
        </Card>

        {/* Verificação de IBAN */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CreditCard className="h-6 w-6 text-primary" />
              Verificação de IBAN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Em muitas burlas online, os fraudadores pedem transferências
              bancárias para contas utilizadas em esquemas fraudulentos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud permite verificar um IBAN antes de realizar uma
              transferência. A análise pode indicar possíveis sinais de risco ou
              denúncias associadas, ajudando o utilizador a avaliar melhor a
              situação antes de enviar dinheiro.
            </p>
          </CardContent>
        </Card>

        {/* Análise de Mensagens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="h-6 w-6 text-primary" />
              Análise de Mensagens Suspeitas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Mensagens fraudulentas são frequentemente utilizadas para criar
              urgência ou pressão psicológica sobre as vítimas.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud permite analisar mensagens recebidas por SMS, email ou
              aplicações de mensagens. O sistema procura identificar padrões
              comuns em tentativas de fraude, como pedidos urgentes de
              pagamento, ameaças falsas ou tentativas de phishing.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O objetivo é ajudar os utilizadores a reconhecer sinais de alerta
              que muitas vezes passam despercebidos.
            </p>
          </CardContent>
        </Card>

        {/* Análise de Imagens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Image className="h-6 w-6 text-primary" />
              Análise de Imagens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Alguns esquemas fraudulentos utilizam capturas de ecrã manipuladas
              ou imagens falsas para tentar convencer as vítimas.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud inclui uma ferramenta que permite analisar imagens e
              identificar possíveis sinais de manipulação ou edição. Esta
              funcionalidade pode ajudar a detetar falsos comprovativos de
              pagamento ou outras imagens utilizadas em burlas.
            </p>
          </CardContent>
        </Card>

        {/* Sistema de Denúncia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-primary" />
              Sistema de Denúncia da Comunidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A participação da comunidade é um elemento importante da
              plataforma. Os utilizadores podem reportar conteúdos suspeitos,
              como números de telefone, links ou tentativas de fraude.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Essas denúncias ajudam a criar uma base de informação que pode
              contribuir para melhorar a deteção de padrões fraudulentos e
              alertar outros utilizadores.
            </p>
          </CardContent>
        </Card>

        {/* Proteção da Privacidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lock className="h-6 w-6 text-primary" />
              Proteção da Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud foi concebida com especial atenção à privacidade dos
              utilizadores. Sempre que possível, as análises são realizadas
              localmente no dispositivo, reduzindo a necessidade de envio de
              dados para servidores externos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O objetivo é fornecer ferramentas úteis de prevenção de fraude
              mantendo o máximo respeito pela privacidade dos utilizadores.
            </p>
          </CardContent>
        </Card>

        {/* Ferramenta de Apoio */}
        <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-orange-700 dark:text-orange-400">
              <Eye className="h-6 w-6" />
              Uma Ferramenta de Apoio à Prevenção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud não substitui verificações oficiais nem garante
              resultados absolutos. A aplicação deve ser utilizada como uma
              ferramenta adicional para ajudar na identificação de possíveis
              riscos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Sempre que existir dúvida, recomenda-se confirmar informações
              diretamente com instituições oficiais ou fontes confiáveis.
            </p>
          </CardContent>
        </Card>

        <div className="text-center py-4">
          <Separator className="mb-6" />
          <p className="text-muted-foreground leading-relaxed italic max-w-2xl mx-auto">
            A AntiFraud é uma ferramenta em constante evolução, desenvolvida
            para ajudar qualquer pessoa a navegar com mais segurança no ambiente
            digital.
          </p>
        </div>
      </div>
    </main>
  );
}
