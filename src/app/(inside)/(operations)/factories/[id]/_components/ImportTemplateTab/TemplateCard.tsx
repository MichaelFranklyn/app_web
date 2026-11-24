"use client";
import { Divider } from "@/components/Divider";

import { ReactNode } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";

import { RemoveTemplateModal } from "./RemoveTemplateModal";
import { ImportTemplateNode } from "./interface";
import { ICON_SIZE } from "@/components/Icon";

/** Origem da API (sem o /graphql) para montar o link do arquivo-modelo. */
const apiOrigin = (): string => {
  try {
    return new URL(process.env.NEXT_PUBLIC_GRAPHQL_API_HOST ?? "").origin;
  } catch {
    return "";
  }
};

/**
 * Respiro do corpo: no celular igual ao do cabeçalho (`px-16`), para o texto
 * do corpo alinhar com o título do card; do tablet em diante, mais folga.
 */
const bodyPadding = "p-16 tablet:p-24";

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
        <Table.CardHead.Title>
          {title}
          <HelpTooltip
            label={`O que é o ${title.toLowerCase()}?`}
            content={help}
          />
        </Table.CardHead.Title>
        {headerAction && (
          <Table.CardHead.Actions>{headerAction}</Table.CardHead.Actions>
        )}
      </Table.CardHead>

      {loading ? (
        <div className={cn(bodyPadding, "flex flex-col gap-8")}>
          <Loading.Skeleton text="heading-sm" className="w-1/3" />
          <Loading.Skeleton text="body-sm" className="w-1/4" />
        </div>
      ) : !template ? (
        <div className={cn(bodyPadding, "flex flex-col gap-4")}>
          <Title
            variant="body-md"
            weight="semibold"
            className="inline-flex items-center gap-6"
          >
            <FileText
              size={ICON_SIZE.md}
              className="shrink-0 text-(--color-text-disabled)"
            />
            Nenhum modelo configurado
          </Title>
          <Title variant="body-sm" color="muted" className="max-w-[520px]">
            {emptyDescription}
          </Title>
        </div>
      ) : (
        <div className={cn(bodyPadding, "flex flex-col gap-12")}>
          {/* Nome do formato numa linha, e o "estado" (ativo, tipo, versão)
          sempre na de baixo: juntos, no celular as tags quebravam no meio
          ("Ativo" em cima, "PDF · versão 3" sozinhos embaixo). */}
          <div className="flex flex-col gap-6">
            <Title
              variant="body-md"
              weight="semibold"
              className="inline-flex items-center gap-6"
            >
              <FileIcon
                size={ICON_SIZE.md}
                className="shrink-0 text-(--color-action-text)"
              />
              {formatLabel}
            </Title>
            <div className="flex flex-wrap items-center gap-8">
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
          </div>

          <Divider.Root />
          {/* No celular o download ocupa o que sobra da linha (sem vão entre
          os dois botões); do tablet em diante cada um volta ao tamanho natural,
          um em cada ponta. */}
          <div className="flex items-center justify-between gap-8">
            {template.sampleFileUrl ? (
              <Button.Link
                href={`${apiOrigin()}${template.sampleFileUrl}`}
                external
                appearance="outline"
                color="neutral"
                size="sm"
                className="max-tablet:min-w-0 max-tablet:flex-1"
              >
                <Button.Icon icon={Download} />
                <Button.Title>{downloadLabel}</Button.Title>
              </Button.Link>
            ) : (
              <span />
            )}

            <RemoveTemplateModal
              templateId={template.id}
              label={removeLabel}
              onRemoved={onChanged}
            />
          </div>
        </div>
      )}
    </Table.Root>
  );
}
