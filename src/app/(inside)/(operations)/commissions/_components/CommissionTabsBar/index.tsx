"use client";

import { Button } from "@/components/Button";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Tooltip } from "@/components/Tooltip";

import { ignoresMonth, TAB_HELP } from "../../help";
import { COMMISSION_TABS, CommissionTab } from "../../utils";

interface Props {
  tab: CommissionTab;
  onChange: (tab: CommissionTab) => void;
}

/**
 * As situações da comissão, em botões.
 *
 * Cada botão carrega a própria explicação: "previsto", "a receber" e "recebido"
 * parecem sinônimos para quem não vive a engine de comissão, e escolher a aba
 * errada faz o fechamento parecer menor do que é. O "?" do fim junta as cinco
 * numa leitura só, para quem quer entender a tela antes de clicar.
 */
export function CommissionTabsBar({ tab, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {COMMISSION_TABS.map((item) => (
        <Tooltip
          key={item.id}
          position="bottom"
          className="max-w-100 whitespace-normal"
          content={
            <div className="space-y-2 text-left leading-relaxed normal-case">
              {TAB_HELP[item.id]}
            </div>
          }
        >
          <Button.Root
            appearance={tab === item.id ? "solid" : "ghost"}
            color={tab === item.id ? "amber" : "neutral"}
            size="sm"
            noUppercase
            onClick={() => onChange(item.id)}
          >
            {/* O asterisco marca, já na barra, a aba que foge do mês escolhido —
                o aviso completo aparece abaixo quando ela está aberta. */}
            <Button.Title>
              {ignoresMonth(item.id) ? `${item.label} *` : item.label}
            </Button.Title>
          </Button.Root>
        </Tooltip>
      ))}
      <HelpTooltip
        label="O que significa cada situação"
        position="bottom"
        content={
          <>
            <p>
              Cada botão mostra as parcelas em uma situação. Passe o mouse por
              cima de um deles para ler o que ele traz.
            </p>
            <p>
              A aba marcada com <b>*</b> não segue o mês escolhido lá em cima —
              ela mostra os boletos travados de todos os vencimentos.
            </p>
          </>
        }
      />
    </div>
  );
}
