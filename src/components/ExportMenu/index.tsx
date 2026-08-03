"use client";

import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

/** Saída extra específica de uma tela (ex.: o PDF do pedido com as fotos). */
export interface ExportMenuAction {
  label: string;
  icon: LucideIcon;
  onSelect: () => Promise<void> | void;
}

interface ExportMenuProps {
  /** Baixa a planilha (.xlsx). O menu cuida do estado de carregamento. */
  onExportSheet: () => Promise<void> | void;
  /** Baixa o PDF. O menu cuida do estado de carregamento. */
  onExportPdf: () => Promise<void> | void;
  /**
   * Saídas adicionais, listadas depois das duas padrão. Existe para variações
   * de um mesmo formato que só fazem sentido numa tela — a alternativa seria
   * mais um botão no cabeçalho, competindo com o "Exportar".
   */
  extraActions?: ExportMenuAction[];
  disabled?: boolean;
  label?: string;
  sheetLabel?: string;
  pdfLabel?: string;
}

/**
 * Botão "Exportar" com as duas saídas do sistema: planilha para trabalhar os
 * dados e PDF para imprimir ou mandar por WhatsApp.
 *
 * Dois botões lado a lado ocupariam o dobro do cabeçalho e obrigariam a ler os
 * rótulos antes de clicar; aqui a ação é uma só ("exportar") e o formato é a
 * escolha seguinte — com o nome da extensão à vista, porque quem usa o sistema
 * pensa em "arquivo do Excel", não em "planilha".
 *
 * O botão fica em carregamento até o download começar: montar o PDF baixa as
 * logos e varre todas as páginas da lista, o que leva alguns segundos, e sem o
 * sinal a pessoa clica de novo achando que não funcionou.
 */
export function ExportMenu({
  onExportSheet,
  onExportPdf,
  extraActions = [],
  disabled,
  label = "Exportar",
  sheetLabel = "Planilha (.xlsx)",
  pdfLabel = "PDF",
}: ExportMenuProps) {
  const [busy, setBusy] = useState(false);

  const run = (action: () => Promise<void> | void) => async () => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild disabled={disabled || busy}>
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          noUppercase
          loading={busy}
          disabled={disabled}
        >
          <Button.Icon icon={Download} />
          <Button.Title>{label}</Button.Title>
          <Button.Icon icon={ChevronDown} />
        </Button.Root>
      </Dropdown.Trigger>

      <Dropdown.Content align="start">
        <Dropdown.Item icon={FileSpreadsheet} onSelect={run(onExportSheet)}>
          {sheetLabel}
        </Dropdown.Item>
        <Dropdown.Item icon={FileText} onSelect={run(onExportPdf)}>
          {pdfLabel}
        </Dropdown.Item>
        {extraActions.map((action) => (
          <Dropdown.Item
            key={action.label}
            icon={action.icon}
            onSelect={run(action.onSelect)}
          >
            {action.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
