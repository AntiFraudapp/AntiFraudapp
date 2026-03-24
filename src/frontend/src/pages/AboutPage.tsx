import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { setSEO } from "@/utils/seo";
import { Info, Rocket, Shield, Star, TrendingUp, Users } from "lucide-react";
import { useEffect } from "react";

export function AboutPage() {
  useEffect(() => {
    setSEO(
      "Sobre o Projeto — AntiFraud",
      "Conheça o projeto AntiFraud e a sua missão de combater fraudes digitais",
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
            Sobre o Projeto AntiFraud
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Um projeto independente dedicado à prevenção de fraudes digitais
          </p>
        </div>

        {/* Intro */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud é um projeto independente dedicado à prevenção de
              fraudes digitais e à promoção de maior segurança nas interações
              online.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O projeto nasceu da preocupação crescente com o aumento de burlas
              digitais que afetam pessoas em todo o mundo. Mensagens
              fraudulentas, chamadas falsas, links maliciosos e esquemas de
              pagamento são cada vez mais comuns e muitas vítimas não dispõem de
              ferramentas simples para identificar estes riscos.
            </p>
            <p className="text-muted-foreground leading-relaxed font-medium">
              A AntiFraud pretende contribuir para mudar essa realidade.
            </p>
          </CardContent>
        </Card>

        {/* Origem */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Info className="h-6 w-6 text-primary" />
              Origem do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud foi criada por Hermínio Coragem, um criador
              independente que decidiu desenvolver esta aplicação motivado por
              uma forte vontade de ajudar as pessoas a protegerem-se contra
              fraudes digitais.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Embora não seja um especialista profissional em cibersegurança,
              Hermínio acredita que a tecnologia pode ser utilizada para criar
              ferramentas úteis e acessíveis que ajudem qualquer pessoa a
              reconhecer sinais de fraude.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O projeto começou como uma ideia simples: criar uma aplicação onde
              os utilizadores pudessem verificar conteúdos suspeitos antes de
              confiar neles.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Desde então, a aplicação tem vindo a evoluir com novas
              funcionalidades e melhorias contínuas.
            </p>
          </CardContent>
        </Card>

        {/* Estado Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Rocket className="h-6 w-6 text-primary" />
              Estado Atual do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud encontra-se atualmente em fase Beta. Isso significa
              que a plataforma ainda está em desenvolvimento e pode continuar a
              receber melhorias, novas funcionalidades e ajustes com base na
              experiência dos utilizadores.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A fase Beta permite testar a aplicação em condições reais e
              recolher feedback que ajudará a melhorar o sistema ao longo do
              tempo.
            </p>
          </CardContent>
        </Card>

        {/* Objetivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Star className="h-6 w-6 text-primary" />
              Objetivo a Longo Prazo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              O objetivo a longo prazo da AntiFraud é tornar-se uma plataforma
              de referência na prevenção de fraude digital, oferecendo
              ferramentas simples e acessíveis para utilizadores em diferentes
              países.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Acreditamos que a prevenção é uma das formas mais eficazes de
              reduzir o impacto das burlas online. Quando as pessoas têm acesso
              a informação e ferramentas adequadas, tornam-se muito menos
              vulneráveis a esquemas fraudulentos.
            </p>
          </CardContent>
        </Card>

        {/* Evolução */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp className="h-6 w-6 text-primary" />
              Um Projeto em Evolução
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud está em constante evolução. Novas funcionalidades
              poderão ser adicionadas ao longo do tempo para melhorar a
              capacidade de deteção de fraudes e reforçar a proteção dos
              utilizadores.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O projeto pretende continuar a crescer com base na participação da
              comunidade e na melhoria contínua das ferramentas disponíveis.
            </p>
          </CardContent>
        </Card>

        {/* Compromisso */}
        <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-blue-700 dark:text-blue-400">
              <Users className="h-6 w-6" />
              Compromisso com a Segurança e a Transparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              A AntiFraud procura manter uma abordagem transparente sobre o
              funcionamento da aplicação, as suas capacidades e as suas
              limitações.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O objetivo é criar uma ferramenta útil e responsável que ajude os
              utilizadores a tomar decisões mais informadas quando enfrentam
              situações potencialmente suspeitas no ambiente digital.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Acreditamos que tecnologia, informação e colaboração entre
              utilizadores podem contribuir para um ambiente digital mais seguro
              para todos.
            </p>
          </CardContent>
        </Card>

        <div className="text-center py-4">
          <Separator className="mb-6" />
          <p className="text-muted-foreground leading-relaxed italic max-w-2xl mx-auto">
            AntiFraudapp — By HTenterprise (beta) · Portugal
          </p>
        </div>
      </div>
    </main>
  );
}
