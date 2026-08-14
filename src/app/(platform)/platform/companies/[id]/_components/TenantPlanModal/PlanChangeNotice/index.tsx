import { Title } from "@/components/Title";
import { FEATURE_LABEL } from "@/services/plan";
import { AlertTriangle, ArrowRight, Plus } from "lucide-react";

import { limitText } from "../../../../../_components/PlanSummary";
import { PlanChange } from "../../../../../utils";

/**
 * O que a troca de plano faz com a empresa, dito antes de salvar.
 *
 * A perda vem PRIMEIRO e com destaque: ganhar recurso não gera chamado, perder
 * gera. Um downgrade tira telas inteiras de gente que estava trabalhando nelas,
 * e quem aperta o botão precisa ver isso na hora — não descobrir pelo telefone.
 */
export function PlanChangeNotice({ change }: { change: PlanChange }) {
  const hasChange =
    change.gained.length > 0 ||
    change.lost.length > 0 ||
    change.limitChanges.length > 0;

  if (!hasChange) return null;

  return (
    <div className="flex flex-col gap-8 rounded-(--radius-md) border border-(--border) bg-(--bg2) p-12">
      <Title variant="micro" color="muted">
        O que muda para esta empresa
      </Title>

      {change.lost.length > 0 && (
        <div className="flex items-start gap-6">
          <span className="mt-[2px] text-(--red)" aria-hidden>
            <AlertTriangle size={14} />
          </span>
          <Title variant="caption" color="red">
            Perde: {change.lost.map((f) => FEATURE_LABEL[f]).join(", ")}. Quem
            estiver usando essas telas deixa de abri-las.
          </Title>
        </div>
      )}

      {change.gained.length > 0 && (
        <div className="flex items-start gap-6">
          <span className="mt-[2px] text-(--green)" aria-hidden>
            <Plus size={14} />
          </span>
          <Title variant="caption">
            Ganha: {change.gained.map((f) => FEATURE_LABEL[f]).join(", ")}.
          </Title>
        </div>
      )}

      {change.limitChanges.length > 0 && (
        <div className="flex flex-col gap-4">
          {change.limitChanges.map((limit) => (
            <div key={limit.key} className="flex items-center gap-6">
              <Title variant="caption" className="capitalize">
                {limit.label}
              </Title>
              <span className="text-(--muted)" aria-hidden>
                <ArrowRight size={12} />
              </span>
              <Title
                variant="caption"
                weight="semibold"
                color={limit.isTighter ? "red" : undefined}
              >
                {limitText(limit.from)} → {limitText(limit.to)}
              </Title>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
