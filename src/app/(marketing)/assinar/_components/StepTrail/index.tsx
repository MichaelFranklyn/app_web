import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { CheckoutStep } from "../../interface";

/**
 * Onde a pessoa está no fluxo. Três marcos: o passo de resultado não aparece
 * como marco porque não é uma etapa a cumprir — é o fim.
 *
 * Saber quantos passos faltam é o que segura alguém num formulário de
 * pagamento; sem isso, cada tela nova parece uma surpresa.
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
    <ol className="flex items-center gap-12">
      {STEPS.map((step, index) => {
        const isDone = index < reached;
        const isCurrent = index === reached;

        return (
          <li key={step.key} className="flex items-center gap-12">
            <span
              className={cn(
                "flex size-24 items-center justify-center rounded-(--radius-full)",
                isDone && "bg-(--green-bg) text-(--green)",
                isCurrent && "bg-(--amber) text-(--bg2)",
                !isDone && !isCurrent && "bg-(--bg4) text-(--muted)"
              )}
            >
              <Title variant="micro" weight="bold">
                {index + 1}
              </Title>
            </span>

            <Title
              variant="body-sm"
              color={isCurrent ? "default" : "muted"}
              weight={isCurrent ? "semibold" : "regular"}
            >
              {step.label}
            </Title>

            {index < STEPS.length - 1 && (
              <span className="h-1 w-24 bg-(--border2)" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
