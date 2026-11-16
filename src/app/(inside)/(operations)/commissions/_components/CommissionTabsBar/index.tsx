"use client";

import { Tabs } from "@/components/Tabs";
import { Tooltip } from "@/components/Tooltip";

import { ignoresMonth, TAB_HELP } from "../../help";
import { COMMISSION_TABS, CommissionTab } from "../../utils";

interface Props {
  tab: CommissionTab;
  onChange: (tab: CommissionTab) => void;
}

const isCommissionTab = (value: string): value is CommissionTab =>
  COMMISSION_TABS.some((item) => item.id === value);

/**
 * As situações da comissão, em abas.
 *
 * Cada aba carrega a própria explicação: "previsto", "a receber" e "recebido"
 * parecem sinônimos para quem não vive a engine de comissão, e escolher a aba
 * errada faz o fechamento parecer menor do que é. As cinco, numa leitura só,
 * estão no "Como isto é calculado" do topo da tela.
 *
 * A faixa ocupa a linha inteira (o traço de baixo vai de ponta a ponta); no
 * celular, as abas que não cabem rolam para o lado em vez de quebrar linha.
 */
export function CommissionTabsBar({ tab, onChange }: Props) {
  return (
    // Filtro, não abas: a lista abaixo é a MESMA, só recortada pela situação
    // (sem Tabs.Content, o aria-controls do Radix apontava para o nada).
    // No desktop as abas têm a largura delas (o traço acaba na última aba):
    // esticadas, sobrava uma linha enorme vazia até o "Filtros". Abaixo do
    // desktop ocupam a linha toda (a coluna do pai estica).
    <div className="min-w-0">
      <Tabs.Filter
        aria-label="Situação da comissão"
        className="mb-0"
        value={tab}
        onValueChange={(value) => {
          if (isCommissionTab(value)) onChange(value);
        }}
      >
        {COMMISSION_TABS.map((item) => (
          // O Tooltip fica DENTRO da aba: por fora, o gatilho dele (asChild)
          // escrevia o próprio data-state ("closed") na aba e apagava o
          // destaque da ativa.
          <Tabs.FilterItem key={item.id} value={item.id}>
            <Tooltip
              position="bottom"
              className="max-w-[min(400px,calc(100vw-20px))] whitespace-normal"
              content={
                <div className="space-y-2 text-left leading-relaxed normal-case">
                  {TAB_HELP[item.id]}
                </div>
              }
            >
              {/* O asterisco marca, já na faixa, a aba que foge do mês
                  escolhido — o aviso completo aparece abaixo quando ela está
                  aberta. */}
              <span>
                {ignoresMonth(item.id) ? `${item.label} *` : item.label}
              </span>
            </Tooltip>
          </Tabs.FilterItem>
        ))}
      </Tabs.Filter>
    </div>
  );
}
