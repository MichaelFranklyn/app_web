"use client";

import { Alert } from "@/components/Alert";
import { Info } from "lucide-react";

import { ignoresMonth, monthIgnoredNotice } from "../../help";
import { CommissionTab, monthLabel, YearMonth } from "../../utils";

interface Props {
  tab: CommissionTab;
  month: YearMonth;
}

/**
 * Aviso na tela quando a aba aberta NÃO obedece ao mês escolhido.
 *
 * Um tooltip não bastaria aqui: quem abre "Boleto em atraso" vê uma lista maior
 * que o mês e conclui que os cartões de cima estão somando errado — e ninguém
 * vai atrás de um "?" para descobrir que não estão. O aviso aparece só na aba
 * em que isso acontece; nas outras a tela fica limpa.
 */
export function TabScopeAlert({ tab, month }: Props) {
  if (!ignoresMonth(tab)) return null;

  return (
    <Alert.Root variant="info">
      <Alert.Icon icon={Info} />
      <Alert.Content>
        <Alert.Title>Esta aba não segue o mês escolhido</Alert.Title>
        <Alert.Description>
          {monthIgnoredNotice(monthLabel(month))}
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
