"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";

import { ConfigureTemplateModal } from "./ConfigureTemplateModal";
import { TemplateCard } from "./TemplateCard";
import { buildImportTemplatesVariables, IMPORT_TEMPLATES_QUERY } from "./gql";
import { ImportTemplateNode, ImportTemplatesData } from "./interface";
import { presetById } from "./presets";

interface Props {
  factoryId: string;
}

export function ImportTemplateTab({ factoryId }: Props) {
  const pathname = usePathname();
  // O modelo de tabela é salvo dentro do fluxo de importação: este link abre a
  // aba Tabelas com o modal já aberto (?import=price-list).
  const importHref = `${pathname.replace(/\/import-template\/?$/, "")}/price-lists?import=price-list`;

  const { data, loading, refetch } = useQuery<ImportTemplatesData>(
    IMPORT_TEMPLATES_QUERY,
    { variables: buildImportTemplatesVariables(factoryId), fetchPolicy: "cache-and-network" }
  );

  const nodes = useMemo<ImportTemplateNode[]>(
    () => data?.importTemplates.edges.map((e) => e.node) ?? [],
    [data]
  );
  // Cada alvo tem no máximo 1 ativo (regra do backend). Filtra por target para
  // não cruzar o modelo de pedido com o de tabela de preço.
  const orderTemplate = useMemo(
    () => nodes.find((n) => n.isActive && n.target === "ORDER") ?? null,
    [nodes]
  );
  const priceListTemplate = useMemo(
    () => nodes.find((n) => n.isActive && n.target === "PRICE_LIST") ?? null,
    [nodes]
  );

  const isLoading = loading && !data;

  const orderFormatLabel = orderTemplate
    ? presetById(String(orderTemplate.config?.preset ?? ""))?.label ?? "Formato personalizado"
    : "";

  return (
    <div className="flex flex-col gap-16">
      <Title variant="heading-sm" weight="bold">
        Modelos de importação
      </Title>

      <TemplateCard
        title="Modelo de pedido"
        help={
          <div className="flex flex-col gap-2">
            <Title variant="label" color="amber">
              Modelo de pedido
            </Title>
            <Title variant="body-sm">
              Guarde um pedido de exemplo desta fábrica e o seu formato. Quando o
              vendedor importar um pedido dela, o sistema já lê os itens
              automaticamente, sem precisar apontar as colunas toda vez.
            </Title>
          </div>
        }
        template={orderTemplate}
        loading={isLoading}
        formatLabel={orderFormatLabel}
        emptyDescription="Configure o modelo de pedido para importar os pedidos desta fábrica automaticamente."
        downloadLabel="Baixar pedido de exemplo"
        removeLabel="modelo de pedido"
        headerAction={
          <ConfigureTemplateModal factoryId={factoryId} current={orderTemplate} onSaved={() => refetch()} />
        }
        onChanged={() => refetch()}
      />

      <TemplateCard
        title="Modelo de tabela de preço"
        help={
          <div className="flex flex-col gap-2">
            <Title variant="label" color="amber">
              Modelo de tabela de preço
            </Title>
            <Title variant="body-sm">
              Guarda como as colunas da tabela desta fábrica foram mapeadas
              (níveis, IPI, NCM, impostos). Nas próximas importações você só sobe
              o novo arquivo — o mapeamento já vem preenchido.
            </Title>
          </div>
        }
        template={priceListTemplate}
        loading={isLoading}
        formatLabel="Mapeamento de colunas"
        emptyDescription="O modelo é salvo na hora de importar uma tabela. Clique em Configurar modelo para abrir a importação e, ao fim do mapeamento, em “Salvar como modelo”."
        downloadLabel="Baixar tabela de exemplo"
        removeLabel="modelo de tabela de preço"
        headerAction={
          <Link href={importHref}>
            <Button.Root
              appearance={priceListTemplate ? "outline" : "solid"}
              color={priceListTemplate ? "neutral" : "amber"}
              size="sm"
            >
              <Button.Icon icon={Settings2} />
              <Button.Title>
                {priceListTemplate ? "Reconfigurar modelo" : "Configurar modelo"}
              </Button.Title>
            </Button.Root>
          </Link>
        }
        onChanged={() => refetch()}
      />
    </div>
  );
}
