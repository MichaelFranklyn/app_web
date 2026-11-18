"use client";

import { useMutation } from "@apollo/client/react";
import { Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Import } from "@/components/Import";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { readSpreadsheet } from "@/utils/import/reader";

import { IMPORT_SELLERS_MUTATION } from "./gql";
import {
  ImportSellersModalProps,
  ImportSellersResponse,
  ImportSellersResult,
} from "./interface";
import { downloadExampleSheet, parseSellersRows } from "./utils";

export function ImportSellersModal({ onImported }: ImportSellersModalProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportSellersResult | null>(null);

  const { toast } = useToast();
  const invalidateClient = useInvalidateQueriesClient();
  const [importSellers] = useMutation<ImportSellersResponse>(
    IMPORT_SELLERS_MUTATION
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
        const rows = parseSellersRows(await readSpreadsheet(file));
        const res = await importSellers({ variables: { input: { rows } } });

        const payload = res.data?.importSellers;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao importar vendedores");
        }
        return { data: payload.data, message: payload.message };
      },
      {
        onSuccess: async ({ data, message }) => {
          setResult(data);
          if (data.created > 0) {
            await invalidateClient(["users"]);
            onImported();
          }

          toast({
            variant: data.failed > 0 ? "warning" : "success",
            title:
              data.created === 0
                ? "Nenhum vendedor importado"
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
          <Button.Title>Importar planilha</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Importar vendedores"
          description="Uma linha por vendedor: nome, email, CPF e região. O email de acesso sai na hora — durante a configuração inicial, só quando você concluí-la."
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
              // O backend não pula linha: ou entra, ou volta com o motivo.
              result={{ ...result, skipped: 0, ignored: [] }}
              identify={(detail) => detail.email}
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
