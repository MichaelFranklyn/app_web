"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { CalendarCheck } from "lucide-react";
import { useActionState } from "react";
import { VisitAnswerRow } from "./_components/VisitAnswerRow";
import { VisitFormState, submitVisitResponsesAction } from "./actions";
import { VisitResponseForm } from "./interface";
import { dayHeading, formPeriodLabel, groupStopsByDate } from "./utils";

interface Props {
  form: VisitResponseForm;
  token: string;
}

const INITIAL_STATE: VisitFormState = { status: "idle", message: "" };

/**
 * O vendedor conta como foi o dia.
 *
 * É o outro lado da folha impressa: o escritório manda a rota do dia em PDF com
 * o endereço desta página, e o que ele responde aqui entra na rotina pelo mesmo
 * caminho do app — data da visita em todos os vínculos do cliente, recálculo do
 * score, avanço do dia.
 *
 * Na folha da SEMANA as paradas vêm separadas por dia, e só dos dias que já
 * chegaram — os seguintes aparecem neste mesmo link quando chegarem.
 *
 * Nada é obrigatório. Quem souber dizer de cinco paradas manda cinco e volta
 * depois: a adoção é o gargalo do motor (1 recomendação trabalhada em 94), e um
 * formulário que só aceita o dia inteiro preenchido é um formulário que não é
 * respondido.
 */
export function VisitResponseContent({ form, token }: Props) {
  const [state, formAction, isPending] = useActionState(
    submitVisitResponsesAction,
    INITIAL_STATE
  );

  if (form.stops.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <CalendarCheck size={36} />
        </EmptyState.Icon>
        <EmptyState.Title>
          {form.isWeek
            ? "Nenhuma visita para responder ainda"
            : "Nenhuma visita neste dia"}
        </EmptyState.Title>
        <EmptyState.Description>
          {form.isWeek
            ? "Os dias desta semana aparecem aqui quando chegarem. Volte a este mesmo link depois da primeira visita."
            : `A ${formPeriodLabel(form).toLowerCase()} não tem paradas planejadas.`}
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-[16px]">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-[4px]">
        <Title variant="eyebrow" color="muted">
          {formPeriodLabel(form)}
        </Title>
        <Title variant="body-sm" color="muted">
          Marque o que aconteceu em cada cliente. Responda só o que você souber
          agora — dá para voltar neste mesmo link depois.
          {form.isWeek
            ? " Os dias que ainda não chegaram aparecem aqui quando chegarem."
            : ""}
        </Title>
      </div>

      {state.status !== "idle" ? (
        <Alert.Root variant={state.status === "success" ? "success" : "error"}>
          <Alert.Description>{state.message}</Alert.Description>
        </Alert.Root>
      ) : null}

      {form.isWeek ? (
        groupStopsByDate(form.stops).map((group) => (
          <section key={group.date} className="flex flex-col gap-[8px]">
            <Title variant="body-md" weight="semibold" className="capitalize">
              {dayHeading(group.date)}
            </Title>
            <StopGrid stops={group.stops} />
          </section>
        ))
      ) : (
        <StopGrid stops={form.stops} />
      )}

      {/* Fixo no rodapé: com oito paradas o botão só no fim obrigaria a rolar
          tudo de volta depois de responder duas. */}
      <div className="sticky bottom-0 -mx-[16px] border-t border-(--border) bg-(--bg) px-[16px] py-[12px]">
        <Button.Root
          type="submit"
          appearance="solid"
          color="amber"
          size="md"
          fullWidth
          noUppercase
          loading={isPending}
        >
          <Button.Title>Enviar respostas</Button.Title>
        </Button.Root>
      </div>
    </form>
  );
}

function StopGrid({ stops }: { stops: VisitResponseForm["stops"] }) {
  return (
    <div className="tablet:grid-cols-2 desktop:grid-cols-3 grid grid-cols-1 gap-[12px]">
      {stops.map((stop) => (
        <VisitAnswerRow key={stop.id} stop={stop} />
      ))}
    </div>
  );
}
