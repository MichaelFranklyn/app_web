"use client";

import { useMutation } from "@apollo/client/react";
import { Download, Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";

import { IMPORT_COMPANY_FACTORIES_MUTATION } from "./gql";
import { ImportSummary } from "./ImportSummary";
import { ImportCompanyFactoriesResponse, ImportResult } from "./interface";
import { downloadExampleSheet, parseFactoriesFile } from "./utils";

export function ImportFactoriesModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const { toast } = useToast();
  const invalidateClient = useInvalidateQueriesClient();
  const [importFactories] = useMutation<ImportCompanyFactoriesResponse>(
    IMPORT_COMPANY_FACTORIES_MUTATION
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
        const rows = parseFactoriesFile(await file.text());
        const res = await importFactories({ variables: { input: { rows } } });

        const payload = res.data?.importCompanyFactories;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao importar fábricas");
        }
        return { data: payload.data, message: payload.message };
      },
      {
        onSuccess: async ({ data, message }) => {
          setResult(data);
          if (data.created > 0) await invalidateClient(["companyFactories"]);

          const allFailed = data.created === 0 && data.skipped === 0;
          toast({
            variant: data.failed > 0 ? "warning" : "success",
            title: allFailed
              ? "Nenhuma fábrica importada"
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
        <Button.Root appearance="outline" color="neutral" size="md">
          <Button.Icon icon={Upload} />
          <Button.Title>Importar dados</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Importar fábricas"
          description="Envie uma planilha CSV para vincular várias fábricas de uma vez. Cada linha vira um vínculo com seus termos comerciais."
        />

        <Modal.Body className="flex flex-col gap-16">
          <div className="flex items-center justify-between gap-12 rounded-lg border border-(--border) px-12 py-10">
            <div className="flex flex-col">
              <Title variant="body" weight="medium">
                Não tem o modelo?
              </Title>
              <Title variant="body-xs" color="muted">
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
            accept=".csv,text/csv"
            hint="Apenas arquivos .csv"
            value={file ? [file] : []}
            onChange={(files) => {
              setResult(null);
              setFile(files[0] ?? null);
            }}
          />

          {result && <ImportSummary result={result} />}
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
