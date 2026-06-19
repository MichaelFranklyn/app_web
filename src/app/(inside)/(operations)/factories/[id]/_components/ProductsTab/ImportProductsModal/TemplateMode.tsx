"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";

import { guessHeaderRow, readSpreadsheet, splitAt } from "../../_import/reader";
import { ImportProductRow } from "./interface";
import { downloadExampleSheet, rowToInput } from "./utils";

interface Props {
  onRowsChange: (rows: ImportProductRow[] | null) => void;
  onResetResult: () => void;
}

export function TemplateMode({ onRowsChange, onResetResult }: Props) {
  const [file, setFile] = useState<File[]>([]);
  const { toast } = useToast();

  const handleFiles = async (files: File[]) => {
    onResetResult();
    setFile(files);
    const selected = files[0];
    if (!selected) {
      onRowsChange(null);
      return;
    }
    try {
      const matrix = await readSpreadsheet(selected);
      const { rows } = splitAt(matrix, guessHeaderRow(matrix));
      if (rows.length === 0) {
        throw new Error("A planilha não contém linhas de dados.");
      }
      onRowsChange(rows.map(rowToInput));
    } catch (error) {
      onRowsChange(null);
      toast({
        variant: "error",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Não foi possível ler a planilha.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-16">
      <div className="flex items-center justify-between gap-12 rounded-(--r-lg) border border-(--border) bg-(--bg2) px-12 py-10">
        <div className="flex flex-col gap-2">
          <Title variant="body-sm" weight="medium">
            Não tem o modelo?
          </Title>
          <Title variant="caption" color="muted">
            Baixe a planilha de exemplo, preencha e envie de volta.
          </Title>
        </div>
        <Button.Root
          type="button"
          appearance="ghost"
          color="neutral"
          size="sm"
          noUppercase
          onClick={downloadExampleSheet}
        >
          <Button.Icon icon={Download} />
          <Button.Title>Baixar modelo</Button.Title>
        </Button.Root>
      </div>

      <Input.Archive
        variant="single"
        accept=".csv,.xlsx,.xls"
        value={file}
        onChange={handleFiles}
      />
    </div>
  );
}
