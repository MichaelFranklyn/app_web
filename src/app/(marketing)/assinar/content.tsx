import { Title } from "@/components/Title";
import { Suspense } from "react";
import { Section } from "../_components/Section";
import { CheckoutFlow } from "./_components/CheckoutFlow";

/**
 * A tela de assinatura. O cabeçalho é servidor; o fluxo é cliente e fica dentro
 * de um `Suspense` porque lê `?plano=` — sem o limite, a rota deixaria de ser
 * estática e passaria a ser renderizada a cada acesso.
 */
export default function SubscribeContent() {
  return (
    <Section className="flex flex-col gap-32">
      <div className="flex max-w-[640px] flex-col gap-12">
        <Title variant="eyebrow" color="amber">
          Assinatura
        </Title>

        <Title variant="heading-xl">Contratar o Girus</Title>
      </div>

      <Suspense fallback={null}>
        <CheckoutFlow />
      </Suspense>
    </Section>
  );
}
