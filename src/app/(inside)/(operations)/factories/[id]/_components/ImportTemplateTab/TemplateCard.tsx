"use client";

import { ReactNode } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";

import { RemoveTemplateModal } from "./RemoveTemplateModal";
import { ImportTemplateNode } from "./interface";

/** Origem da API (sem o /graphql) para montar o link do arquivo-modelo. */
const apiOrigin = (): string => {
  try {
    return new URL(process.env.NEXT_PUBLIC_GRAPHQL_API_HOST ?? "").origin;
  } catch {
    return "";
  }
};

/** Ícone do arquivo-modelo conforme o tipo (planilha x documento). */
const fileIconFor = (fileType: string) =>
  fileType === "PDF" ? FileText : FileSpreadsheet;

interface Props {
  title: string;
  help: ReactNode;
  template: ImportTemplateNode | null;
  loading: boolean;
  /** Texto do formato (ex.: nome do preset do pedido, ou "Mapeamento de colunas"). */
  formatLabel: string;
  emptyDescription: string;
  downloadLabel: string;
  /** Substantivo do modelo p/ o modal de remoção (ex.: "modelo de pedido"). */
  removeLabel: string;
  /** Ação no cabeçalho (ex.: configurar modelo de pedido). */
  headerAction?: ReactNode;
  onChanged: () => void;
}

export function TemplateCard({
  title,
  help,
  template,
  loading,
  formatLabel,
  emptyDescription,
  downloadLabel,
  removeLabel,
  headerAction,
  onChanged,
}: Props) {
  const FileIcon = template ? fileIconFor(template.fileType) : FileText;

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          {title}
          <HelpTooltip label={`O que é o ${title.toLowerCase()}?`} content={help} />
        </Table.CardHead.Title>
        {headerAction && <Table.CardHead.Actions>{headerAction}</Table.CardHead.Actions>}
      </Table.CardHead>

      {loading ? (
        <div className="flex flex-col gap-8 p-24">
          <Loading.Skeleton className="h-[16px] w-1/3" />
          <Loading.Skeleton className="h-[12px] w-1/4" />
        </div>
      ) : !template ? (
        <div className="flex flex-col gap-4 p-24">
          <Title variant="body-md" weight="semibold" className="inline-flex items-center gap-6">
            <FileText size={16} className="shrink-0 text-(--muted2)" />
            Nenhum modelo configurado
          </Title>
          <Title variant="body-sm" color="muted" className="max-w-[520px]">
            {emptyDescription}
          </Title>
        </div>
      ) : (
        <div className="flex flex-col gap-12 p-24">
          <div className="flex flex-wrap items-center gap-8">
            <FileIcon size={16} className="shrink-0 text-(--amber)" />
            <Title variant="body-md" weight="semibold">
              {formatLabel}
            </Title>
            <Badge.Root color="green" appearance="tinted" size="xs">
              <Badge.Dot />
              <Badge.Text>Ativo</Badge.Text>
            </Badge.Root>
            <Badge.Root color="subtle" appearance="tinted" size="xs">
              <Badge.Text>{template.fileType}</Badge.Text>
            </Badge.Root>
            <Title variant="caption" color="muted">
              versão {template.version}
            </Title>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-8 border-t border-(--border) pt-12">
            {template.sampleFileUrl ? (
              <a
                href={`${apiOrigin()}${template.sampleFileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="w-fit"
              >
                <Button.Root type="button" appearance="ghost" color="neutral" size="sm" noUppercase>
                  <Button.Icon icon={Download} />
                  <Button.Title>{downloadLabel}</Button.Title>
                </Button.Root>
              </a>
            ) : (
              <span />
            )}

            <RemoveTemplateModal templateId={template.id} label={removeLabel} onRemoved={onChanged} />
          </div>
        </div>
      )}
    </Table.Root>
  );
}
