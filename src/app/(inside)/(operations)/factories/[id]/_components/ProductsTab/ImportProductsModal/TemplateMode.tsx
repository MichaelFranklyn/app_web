"use client";

import { Import } from "@/components/Import";

import { useState } from "react";

import { Input } from "@/components/Input";
import { useToast } from "@/components/Toast";

import {
  guessHeaderRow,
  readSpreadsheet,
  splitAt,
} from "@/utils/import/reader";
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
          error instanceof Error
            ? error.message
            : "Não foi possível ler a planilha.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-16">
      <Import.TemplateDownload onDownload={downloadExampleSheet} />

      <Input.Archive
        variant="single"
        accept=".csv,.xlsx,.xls"
        value={file}
        onChange={handleFiles}
      />
    </div>
  );
}
