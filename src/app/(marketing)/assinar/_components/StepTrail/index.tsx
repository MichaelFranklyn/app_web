import { Stepper } from "@/components/Stepper";
import { CheckoutStep } from "../../interface";

/**
 * Onde a pessoa está no fluxo. Três marcos: o passo de resultado não aparece
 * como marco porque não é uma etapa a cumprir — é o fim.
 *
 * Saber quantos passos faltam é o que segura alguém num formulário de
 * pagamento; sem isso, cada tela nova parece uma surpresa.
 *
 * O desenho vem do `Stepper.Trail`, o mesmo de dentro do sistema: quem assina
 * hoje reconhece a trilha amanhã, no wizard de pedido.
 */
const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: "plan", label: "Plano" },
  { key: "billing", label: "Cobrança" },
  { key: "payment", label: "Pagamento" },
];

export function StepTrail({ current }: { current: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);
  // No resultado, todos os marcos ficam cumpridos.
  const reached = current === "result" ? STEPS.length : currentIndex;

  return (
    <Stepper.Trail
      steps={STEPS.map((step) => ({ label: step.label }))}
      current={reached}
      size="sm"
    />
  );
}
