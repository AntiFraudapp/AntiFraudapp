import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { setSEO } from "@/utils/seo";
import { Globe, Heart, Shield, Target, Users, Zap } from "lucide-react";
import { useEffect } from "react";

export function MissionPage() {
  useEffect(() => {
    setSEO(
      "A Nossa Missão — AntiFraud",
      "Combater a fraude digital com tecnologia, prevenção e comunidade",
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
            A Nossa Missão
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Combater a fraude digital com tecnologia, prevenção e comunidade
          </p>
        </div>

        {/* Honest summary banner */}
        <Card className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-5 pb-5">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
              AntiFraudApp.com ajuda a verificar conteúdos suspeitos: MB Way,
              IBAN, links crypto, imagens manipuladas. Indicadores de risco, não
              garantias absolutas.
            </p>
          </CardContent>
        </Card>

        {/* Intro */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud nasceu de uma ideia simples, mas muito importante:
              ajudar as pessoas a protegerem-se contra fraudes digitais antes
              que estas aconteçam.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Hoje em dia, milhões de pessoas recebem diariamente mensagens
              suspeitas, chamadas fraudulentas, links maliciosos ou pedidos de
              pagamento que podem resultar em perdas financeiras e roubo de
              dados pessoais. Muitas vezes, as vítimas só percebem que foram
              enganadas depois de ser demasiado tarde.
            </p>
            <p className="text-muted-foreground leading-relaxed font-medium">
              A missão da AntiFraud é mudar essa realidade.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Queremos disponibilizar ferramentas simples, acessíveis e
              inteligentes que permitam a qualquer pessoa verificar rapidamente
              se algo pode representar um risco — antes de tomar uma decisão.
            </p>
          </CardContent>
        </Card>

        {/* Visão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Globe className="h-6 w-6 text-primary" />
              Visão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A nossa visão é contribuir para um mundo onde todas as pessoas
              possam comunicar, comprar, vender e realizar pagamentos online com
              maior segurança, reduzindo o impacto das burlas digitais.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Acreditamos que a tecnologia, quando utilizada de forma
              responsável, pode ser uma poderosa aliada na proteção das pessoas.
              A AntiFraud pretende tornar-se uma plataforma que ajude
              utilizadores de todo o mundo a identificar sinais de fraude e a
              evitar situações perigosas.
            </p>
          </CardContent>
        </Card>

        {/* Missão Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-primary" />
              Missão Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A missão da AntiFraud é desenvolver ferramentas gratuitas e
              acessíveis que ajudem a identificar e prevenir fraudes digitais.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A aplicação foi criada para permitir que qualquer utilizador possa
              analisar rapidamente diferentes tipos de conteúdos suspeitos,
              incluindo:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  números de telefone potencialmente utilizados em fraude
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>links ou websites suspeitos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>IBAN associados a possíveis burlas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>mensagens fraudulentas ou tentativas de phishing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  imagens ou capturas de ecrã potencialmente manipuladas
                </span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Ao combinar tecnologia, análise inteligente e participação da
              comunidade, a AntiFraud pretende ajudar as pessoas a tomar
              decisões mais informadas e seguras.
            </p>
          </CardContent>
        </Card>

        {/* Impacto Social */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Heart className="h-6 w-6 text-primary" />
              Impacto Social
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A fraude digital não afeta apenas empresas ou grandes organizações
              — afeta pessoas comuns todos os dias.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Muitas vítimas são pessoas que simplesmente não tiveram acesso à
              informação ou às ferramentas necessárias para reconhecer uma
              tentativa de fraude.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud pretende contribuir para uma maior consciencialização
              e prevenção, ajudando comunidades a protegerem-se melhor contra
              burlas online.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Quanto mais pessoas tiverem acesso a ferramentas de verificação
              simples e rápidas, menor será o impacto das fraudes.
            </p>
          </CardContent>
        </Card>

        {/* Origem do Projeto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6 text-primary" />A Origem do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud é um projeto independente criado por Hermínio Coragem.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Embora não seja um especialista profissional em cibersegurança,
              Hermínio decidiu desenvolver esta aplicação motivado por uma forte
              vontade de ajudar as pessoas a protegerem-se contra fraudes
              digitais.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O projeto nasceu da preocupação com o aumento constante de burlas
              online e da convicção de que qualquer pessoa deve ter acesso a
              ferramentas simples que ajudem a identificar riscos antes que seja
              tarde demais.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud continua em desenvolvimento e encontra-se atualmente
              em fase Beta, o que significa que novas funcionalidades e
              melhorias continuam a ser adicionadas.
            </p>
          </CardContent>
        </Card>

        {/* Valores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-primary" />
              Os Nossos Valores
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Transparência</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Acreditamos que a confiança é fundamental. Por isso, procuramos
                ser claros sobre como a aplicação funciona, quais são as suas
                capacidades e também quais são as suas limitações.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Privacidade</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A proteção da privacidade dos utilizadores é uma prioridade.
                Sempre que possível, as análises são realizadas localmente no
                dispositivo, evitando a partilha desnecessária de dados.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Acessibilidade</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A AntiFraud pretende ser uma ferramenta acessível a todos. O
                objetivo é disponibilizar funcionalidades essenciais de
                prevenção de fraude de forma simples e compreensível, mesmo para
                pessoas sem conhecimentos técnicos.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Comunidade</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A participação dos utilizadores é um elemento importante na luta
                contra fraudes. As denúncias e partilhas da comunidade ajudam a
                identificar novas ameaças e a tornar a plataforma cada vez mais
                eficaz.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limitações */}
        <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-orange-700 dark:text-orange-400">
              <Shield className="h-6 w-6" />
              Limitações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Apesar de todos os esforços para criar uma ferramenta útil e
              eficaz, nenhum sistema de deteção de fraude é perfeito.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Os resultados apresentados pela aplicação devem ser utilizados
              como indicadores de risco, e não como garantias absolutas.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Os utilizadores devem sempre confirmar informações através de
              canais oficiais quando estiverem em dúvida.
            </p>
          </CardContent>
        </Card>

        {/* Utilização Responsável */}
        <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-blue-700 dark:text-blue-400">
              <Zap className="h-6 w-6" />
              Utilização Responsável
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud deve ser utilizada como uma ferramenta de apoio na
              prevenção de fraudes.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Recomendamos que os utilizadores utilizem o seu próprio
              julgamento, verifiquem informações através de fontes confiáveis e
              mantenham uma atitude crítica sempre que se depararem com pedidos
              de informação pessoal, pagamentos ou links desconhecidos.
            </p>
          </CardContent>
        </Card>

        {/* Closing */}
        <div className="text-center py-4">
          <Separator className="mb-6" />
          <p className="text-muted-foreground leading-relaxed italic max-w-2xl mx-auto">
            A AntiFraud está apenas no início do seu desenvolvimento, mas o
            objetivo é claro: contribuir para um ambiente digital mais seguro,
            onde as pessoas possam proteger-se melhor contra fraudes e esquemas
            fraudulentos.
          </p>
        </div>
      </div>
    </main>
  );
}
