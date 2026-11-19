import { CtaSection } from "./_components/CtaSection";
import { FaqSection } from "./_components/FaqSection";
import { FeaturesSection } from "./_components/FeaturesSection";
import { HeroSection } from "./_components/HeroSection";
import { HowItWorksSection } from "./_components/HowItWorksSection";
import { PlansSection } from "./_components/PlansSection";
import { ProblemSection } from "./_components/ProblemSection";
import { RoutineSection } from "./_components/RoutineSection";
import { VideoSection } from "./_components/VideoSection";

/**
 * A landing, na ordem em que ela argumenta: promessa (com o produto na tela) →
 * o problema que a pessoa reconhece → o núcleo, a rotina de visitas, passo a
 * passo → o vídeo dela (em standby) → os módulos em bento, com recortes dos
 * prints → como se começa → onde ela se encaixa → dúvidas → convite, na faixa
 * escura que fecha o trajeto.
 *
 * Redesenho de 19/11/2026 (skill `landing-page`): o motivo visual é o trajeto
 * tracejado com paradas numeradas, a vitrine do hero usa prints reais e a
 * antiga `ShowcaseSection` foi absorvida pelo bento dos recursos.
 *
 * A rotina subiu para antes dos recursos em 14/11/2026: é o centro do produto,
 * e a página passou a mostrar telas reais em vez de ilustrações. Os fundos
 * alternam (`tone`) seção a seção — mexeu na ordem, confira a alternância
 * (a `PlansSection` recebe o `tone` daqui; o fechamento é `ink`).
 *
 * Componente de servidor quase de ponta a ponta: a página é gerada no build e
 * servida do CDN da Vercel. As ilhas cliente são a vitrine do hero (troca de
 * tela) e os links do header; o FAQ usa `<details>` nativo.
 */
export default function HomeContent() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <RoutineSection />
      <VideoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PlansSection tone="default" />
      <FaqSection />
      <CtaSection />
    </>
  );
}
