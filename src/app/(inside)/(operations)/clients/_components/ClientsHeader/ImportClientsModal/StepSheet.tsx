"use client";

import { Import } from "@/components/Import";

import { useState } from "react";

import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { readSpreadsheet } from "@/utils/import/reader";

import { ImportClientRow } from "./interface";
import { useClientsSheetDownload } from "./useClientsSheetDownload";
import { parseClientsRows } from "./utils";

interface Props {
  onRowsChange: (rows: ImportClientRow[] | null) => void;
}

const GUIDANCE = [
  "Uma linha para cada fábrica do cliente: quem é atendido em três fábricas aparece em três linhas, com o mesmo CNPJ.",
  "Vendedor e fábrica se escolhem numa lista, sem digitar. Cada fábrica tem um só vendedor por cliente; para trocar, use a página do cliente.",
  "Importar não remove vínculos. Vendedor e fábrica em branco: o cliente entra só na carteira.",
  "Código do cliente na fábrica: só vale na linha com vendedor e fábrica. Preenchido, substitui o atual; em branco, mantém o que já está gravado.",
];

/** Passo 1: baixar a carteira em planilha, entender as regras e enviar o arquivo. */
export function StepSheet({ onRowsChange }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const downloadSheet = useClientsSheetDownload();

  const handleFiles = async (selected: File[]) => {
    setFiles(selected);
    const file = selected[0];
    if (!file) {
      onRowsChange(null);
      return;
    }
    try {
      onRowsChange(parseClientsRows(await readSpreadsheet(file)));
    } catch (error) {
      onRowsChange(null);
      toast({
        variant: "error",
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível ler a planilha.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-16">
      <Import.TemplateDownload
        title="Sua carteira em planilha"
        description="Baixe a planilha já com os seus clientes, ajuste e envie de volta."
        buttonLabel="Baixar planilha"
        onDownload={downloadSheet}
      />

      <div className="flex flex-col gap-6">
        <Title variant="body-sm" weight="medium">
          Vendedor e fábrica
        </Title>
        <ul className="flex list-disc flex-col gap-4 pl-16">
          {GUIDANCE.map((text) => (
            <li key={text}>
              <Title variant="body-xs" color="muted">
                {text}
              </Title>
            </li>
          ))}
        </ul>
      </div>

      <Input.Archive
        variant="single"
        accept=".xlsx,.xls,.csv"
        hint="Planilha do Excel (.xlsx) ou .csv"
        value={files}
        onChange={handleFiles}
      />
    </div>
  );
}
