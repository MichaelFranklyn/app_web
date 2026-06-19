"use client";

import { useMutation } from "@apollo/client/react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";

import { IMPORT_COMPANY_FACTORIES_MUTATION } from "./gql";
import {
  ImportCompanyFactoriesResponse,
  ImportResult,
  ImportRowDetail,
} from "./interface";
import { downloadExampleSheet, parseFactoriesFile } from "./utils";

export function ImportFactoriesModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const invalidateClient = useInvalidateQueriesClient();
  const [importFactories] = useMutation<ImportCompanyFactoriesResponse>(
    IMPORT_COMPANY_FACTORIES_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const reset = () => {
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = (value: boolean) => {
    setOpen(value);
    if (!value) reset();
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

          <label className="flex cursor-pointer flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-(--border) px-16 py-24 text-center transition-colors hover:border-(--orange)">
            <FileSpreadsheet className="size-24 text-(--muted)" />
            <Title variant="body" weight="medium">
              {file ? file.name : "Selecionar planilha CSV"}
            </Title>
            <Title variant="body-xs" color="muted">
              Apenas arquivos .csv
            </Title>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                setResult(null);
                setFile(e.target.files?.[0] ?? null);
              }}
            />
          </label>

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
            <Button.Title>{result ? "Importar novamente" : "Importar"}</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

function ImportSummary({ result }: { result: ImportResult }) {
  const hasDetails = result.errors.length > 0 || result.ignored.length > 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-3 gap-8">
        <SummaryStat label="Criadas" value={result.created} tone="text-(--green)" />
        <SummaryStat label="Ignoradas" value={result.skipped} tone="text-(--amber)" />
        <SummaryStat label="Com erro" value={result.failed} tone="text-(--red)" />
      </div>

      {hasDetails && (
        <div className="flex max-h-[180px] flex-col gap-4 overflow-y-auto rounded-lg border border-(--border) p-8">
          {result.errors.map((err) => (
            <DetailLine
              key={`err-${err.row}-${err.cnpj}`}
              label="Erro"
              tone="text-(--red)"
              detail={err}
            />
          ))}
          {result.ignored.map((item) => (
            <DetailLine
              key={`ign-${item.row}-${item.cnpj}`}
              label="Ignorada"
              tone="text-(--amber)"
              detail={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DetailLine({
  label,
  tone,
  detail,
}: {
  label: string;
  tone: string;
  detail: ImportRowDetail;
}) {
  return (
    <div className="text-xs text-(--text)">
      <Title variant="body-xs" weight="medium" className={`inline ${tone}`}>
        {label} · Linha {detail.row}
      </Title>
      {detail.cnpj ? ` (${detail.cnpj})` : ""}: {detail.message}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-(--border) py-8">
      <Title variant="heading-md" weight="semibold" className={tone}>{value}</Title>
      <Title variant="body-xs" color="muted">{label}</Title>
    </div>
  );
}
