import { CtaSection } from "./_components/CtaSection";
import { FaqSection } from "./_components/FaqSection";
import { FeaturesSection } from "./_components/FeaturesSection";
import { HeroSection } from "./_components/HeroSection";
import { HowItWorksSection } from "./_components/HowItWorksSection";
import { PlansSection } from "./_components/PlansSection";
import { ProblemSection } from "./_components/ProblemSection";
import { RoutineSection } from "./_components/RoutineSection";

/**
 * A landing, na ordem em que ela argumenta: promessa → o problema que a pessoa
 * reconhece → o que o sistema faz → o diferencial (o motor de visita) → como se
 * começa → onde ela se encaixa → dúvidas → convite.
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
      <FeaturesSection />
      <RoutineSection />
      <HowItWorksSection />
      <PlansSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
