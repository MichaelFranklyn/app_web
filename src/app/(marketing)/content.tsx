import { CtaSection } from "./_components/CtaSection";
import { FaqSection } from "./_components/FaqSection";
import { FeaturesSection } from "./_components/FeaturesSection";
import { HeroSection } from "./_components/HeroSection";
import { HowItWorksSection } from "./_components/HowItWorksSection";
import { PlansSection } from "./_components/PlansSection";
import { ProblemSection } from "./_components/ProblemSection";
import { RoutineSection } from "./_components/RoutineSection";
import { ShowcaseSection } from "./_components/ShowcaseSection";
import { VideoSection } from "./_components/VideoSection";

/**
 * A landing, na ordem em que ela argumenta: promessa (com o produto na tela) →
 * o problema que a pessoa reconhece → o núcleo, a rotina de visitas, passo a
 * passo → o vídeo dela (em standby) → o resto da operação em print → todos os
 * módulos → como se começa → onde ela se encaixa → dúvidas → convite.
 *
 * A rotina subiu para antes dos recursos em 14/11/2026: é o centro do produto,
 * e a página passou a mostrar telas reais em vez de ilustrações. Os fundos
 * alternam (`tone`) seção a seção — mexeu na ordem, confira a alternância.
 *
 * Componente de servidor de ponta a ponta (sem `"use client"` em nenhuma
 * seção): a página inteira é gerada no build e servida do CDN da Vercel. O
 * único comportamento interativo é o FAQ, resolvido com `<details>` nativo.
 */
export default function HomeContent() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <RoutineSection />
      <VideoSection />
      <ShowcaseSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PlansSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
