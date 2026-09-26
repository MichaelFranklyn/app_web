"use client";

import { Import } from "@/components/Import";

import { useMutation } from "@apollo/client/react";
import { Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { CLIENT_CACHE_FIELDS } from "@/utils/cacheFields";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";

import { readSpreadsheet } from "@/utils/import/reader";

import { IMPORT_COMPANY_CLIENTS_MUTATION } from "./gql";
import { ImportCompanyClientsResponse, ImportResult } from "./interface";
import { downloadExampleSheet, parseClientsRows } from "./utils";

export function ImportClientsModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const { toast } = useToast();
  const invalidateClient = useInvalidateQueriesClient();
  const [importClients] = useMutation<ImportCompanyClientsResponse>(
    IMPORT_COMPANY_CLIENTS_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleClose = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setFile(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    await execute(
      async () => {
        const rows = parseClientsRows(await readSpreadsheet(file));
        const res = await importClients({ variables: { input: { rows } } });

        const payload = res.data?.importCompanyClients;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao importar clientes");
        }
        return { data: payload.data, message: payload.message };
      },
      {
        onSuccess: async ({ data, message }) => {
          setResult(data);
          if (data.created > 0) {
            await invalidateClient(CLIENT_CACHE_FIELDS);
          }

          const allFailed = data.created === 0 && data.skipped === 0;
          toast({
            variant: data.failed > 0 ? "warning" : "success",
            title: allFailed
              ? "Nenhum cliente importado"
              : data.failed > 0
                ? "Importação parcial"
                : "Importação concluída",
            description: message,
          });
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Upload} />
          <Button.Title>Importar</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Importar clientes"
          description="Envie uma planilha do Excel com os CNPJs para adicionar vários clientes de uma vez. Os demais dados são preenchidos automaticamente via Receita Federal."
        />

        <Modal.Body className="flex flex-col gap-16">
          <Import.TemplateDownload onDownload={downloadExampleSheet} />

          <Input.Archive
            variant="single"
            accept=".xlsx,.xls,.csv"
            hint="Planilha do Excel (.xlsx) ou .csv"
            value={file ? [file] : []}
            onChange={(files) => {
              setResult(null);
              setFile(files[0] ?? null);
            }}
          />

          {result && (
            <Import.Summary
              result={result}
              identify={(detail) => detail.cnpj}
            />
          )}
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>{result ? "Fechar" : "Cancelar"}</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            disabled={!file}
            onClick={handleImport}
          >
            <Button.Title>
              {result ? "Importar novamente" : "Importar"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
