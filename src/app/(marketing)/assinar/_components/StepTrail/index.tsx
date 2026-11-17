import { Stepper } from "@/components/Stepper";
import { CheckoutStep } from "../../interface";

/**
 * Onde a pessoa está no fluxo. Dois marcos: escolher o plano e pagar. Os dados
 * da empresa não são pedidos — vêm da conta.
 *
 * O desenho vem do `Stepper.Trail`, o mesmo de dentro do sistema: quem assina
 * hoje reconhece a trilha amanhã, no wizard de pedido.
 */
const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: "plan", label: "Plano" },
  { key: "payment", label: "Pagamento" },
];

export function StepTrail({ current }: { current: CheckoutStep }) {
  return (
    <Stepper.Trail
      steps={STEPS.map((step) => ({ label: step.label }))}
      current={STEPS.findIndex((step) => step.key === current)}
      size="sm"
    />
  );
}
