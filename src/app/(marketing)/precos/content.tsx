import { Title } from "@/components/Title";
import { TRIAL_DAYS } from "../plans";
import { PlansSection } from "../_components/PlansSection";
import { Section } from "../_components/Section";
import { PlanMatrix } from "./_components/PlanMatrix";
import { PricingFaq } from "./_components/PricingFaq";

/**
 * A página de preços reaproveita a MESMA `PlansSection` da home — os três
 * cartões são a resposta curta, e a tabela abaixo é a longa. Duas versões dos
 * cartões acabariam divergindo, e divergência em página de preço é a que mais
 * custa confiança.
 */
export default function PricingContent() {
  return (
    <>
      <Section className="flex max-w-[720px] flex-col gap-16">
        <Title variant="eyebrow" color="amber">
          Preços
        </Title>

        {/* O título evita repetir "tamanho da operação", que é o da seção de
            planos logo abaixo — duas manchetes iguais em sequência fazem o
            leitor achar que rolou para o lugar errado. */}
        <Title variant="heading-xl">Quanto custa organizar o comercial</Title>

        <Title variant="body-md" color="secondary">
          Um valor por mês, sem taxa de implantação e sem cobrança por pedido.
          No plano anual, dois meses saem de graça. E dá para conhecer antes:
          são {TRIAL_DAYS} dias de teste com o sistema inteiro liberado, sem
          cartão.
        </Title>
      </Section>

      <PlansSection showComparisonLink={false} />
      <PlanMatrix />
      <PricingFaq />
    </>
  );
}
