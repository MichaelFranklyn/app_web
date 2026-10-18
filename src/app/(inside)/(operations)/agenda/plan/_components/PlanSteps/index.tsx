"use client";

import { Button } from "@/components/Button";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { CalendarCheck, Sparkles } from "lucide-react";

const STEPS = [
  { label: "Escolha os clientes" },
  { label: "Organize a semana" },
] as const;

interface Props {
  /** Quantos clientes já estão escolhidos. */
  chosen: number;
  /** "3 visitas e 1 contato" — o resumo do que foi escolhido. */
  chosenPhrase: string;
  onOrganize: () => void;
  /** Organizar sem escolher: o sistema completa com os mais urgentes. */
  onLetSystemChoose: () => void;
}

/**
 * O caminho da tela, em dois passos, no topo do painel "Sua semana".
 *
 * Existe porque a ordem não era óbvia (relato de 18/10/2026): o vendedor via
 * "Organizar a semana" e clicava antes de escolher os clientes. Agora o passo 1
 * diz o que fazer na lista, e o botão de organizar só vira o botão principal
 * quando há alguém escolhido. Quem não quer escolher tem a saída em texto
 * menor — "deixe o sistema escolher" —, que não compete com o caminho normal.
 */
export function PlanSteps({
  chosen,
  chosenPhrase,
  onOrganize,
  onLetSystemChoose,
}: Props) {
  const current = chosen > 0 ? 1 : 0;

  return (
    <div className="flex flex-col gap-12">
      <Stepper.Trail steps={STEPS} current={current} size="sm" />
      {current === 0 ? (
        <>
          <div className="flex flex-col gap-2">
            <Title variant="body-sm" weight="semibold">
              Toque nos clientes que você quer ver nesta semana.
            </Title>
            <Title variant="body-xs" color="muted">
              Os mais urgentes estão no topo de cada cidade. Para cada um,
              escolha visita ou contato — e o dia, se quiser.
            </Title>
          </div>
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            noUppercase
            className="self-start"
            onClick={onLetSystemChoose}
          >
            <Button.Icon icon={Sparkles} />
            <Button.Title>Ou deixe o sistema escolher</Button.Title>
          </Button.Root>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Title variant="body-sm" weight="semibold">
              Você escolheu {chosenPhrase}.
            </Title>
            <Title variant="body-xs" color="muted">
              Pode escolher mais. Quando terminar, organize a semana: você diz
              qual semana e quanto por dia, e o sistema monta os dias.
            </Title>
          </div>
          <Button.Root
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            className="w-full"
            onClick={onOrganize}
          >
            <Button.Icon icon={CalendarCheck} />
            <Button.Title>Organizar a semana</Button.Title>
          </Button.Root>
        </>
      )}
    </div>
  );
}
