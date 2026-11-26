"use client";

import { Import } from "@/components/Import";

import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { CLIENT_CACHE_FIELDS } from "@/utils/cacheFields";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";

import { readSpreadsheet } from "@/utils/import/reader";

import { IMPORT_COMPANY_CLIENTS_MUTATION } from "./gql";
import { ImportCompanyClientsResponse, ImportResult } from "./interface";
import { parseClientsRows } from "./utils";
import { useClientsSheetDownload } from "./useClientsSheetDownload";

interface ImportClientsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Aberto pelo menu "Mais ações" do cabeçalho (ver `ClientsMoreMenu`): o botão
 * próprio somava o quinto botão da fileira, e no celular eles empilhavam numa
 * tela inteira antes da carteira (crítica de 23/11/2026).
 */
export function ImportClientsModal({
  open,
  onOpenChange: setOpen,
}: ImportClientsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const { toast } = useToast();
  const invalidateClient = useInvalidateQueriesClient();
  const [importClients] = useMutation<ImportCompanyClientsResponse>(
    IMPORT_COMPANY_CLIENTS_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const downloadSheet = useClientsSheetDownload();

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
          if (
            data.created > 0 ||
            data.linksCreated > 0 ||
            data.codesSaved > 0
          ) {
            await invalidateClient(CLIENT_CACHE_FIELDS);
          }

          const allFailed =
            data.created === 0 &&
            data.linksCreated === 0 &&
            data.codesSaved === 0 &&
            data.skipped === 0;
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
      <Modal.Content size="md">
        <Modal.Header
          title="Importar clientes"
          description="Envie uma planilha do Excel com os CNPJs para adicionar vários clientes de uma vez. Os demais dados vêm da Receita Federal. Serve também a lista exportada de outro sistema: o sistema acha a coluna do CNPJ sozinho."
        />

        <Modal.Body className="flex flex-col gap-16">
          <Import.TemplateDownload
            title="Sua carteira em planilha"
            description="Baixe a planilha já com os seus clientes, ajuste e envie de volta."
            buttonLabel="Baixar planilha"
            onDownload={downloadSheet}
          />

          <div className="flex flex-col gap-4">
            <Title variant="body-sm" weight="medium">
              Vendedor e fábrica
            </Title>
            <Title variant="body-xs" color="muted">
              Uma linha para cada fábrica do cliente: quem é atendido em três
              fábricas aparece em três linhas, com o mesmo CNPJ.
            </Title>
            <Title variant="body-xs" color="muted">
              Vendedor e fábrica se escolhem numa lista, sem digitar. Cada
              fábrica tem um só vendedor por cliente; para trocar, use a página
              do cliente.
            </Title>
            <Title variant="body-xs" color="muted">
              Importar não remove vínculos. Vendedor e fábrica em branco: o
              cliente entra só na carteira.
            </Title>
            <Title variant="body-xs" color="muted">
              Código do cliente na fábrica: o código que a fábrica usa para esse
              cliente. Só vale na linha com vendedor e fábrica; preenchido,
              substitui o atual; em branco, mantém o que já está gravado.
            </Title>
          </div>

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
              createdLabel="Adicionados"
              extraKpis={[
                { label: "Vínculos criados", value: result.linksCreated },
                { label: "Códigos gravados", value: result.codesSaved },
              ]}
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
