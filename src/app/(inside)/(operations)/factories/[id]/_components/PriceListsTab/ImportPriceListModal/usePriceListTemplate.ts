import { useMutation } from "@apollo/client/react";
import { useMemo } from "react";

import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";

import { useCompleteList } from "@/hooks/useCompleteList";
import { buildImportTemplatesInput } from "../../ImportTemplateTab/gql";
import {
  CREATE_IMPORT_TEMPLATE_MUTATION,
  IMPORT_TEMPLATES_QUERY,
  UPDATE_IMPORT_TEMPLATE_MUTATION,
} from "../../ImportTemplateTab/gql";
import { ImportTemplatesData } from "../../ImportTemplateTab/interface";
import { canSaveTemplate } from "./build";
import { fileToBase64 } from "./gql";
import { PriceListTemplateConfig } from "./templateConfig";

type ExecuteFn = ReturnType<typeof useAsyncAction>["execute"];

interface PriceListTemplateArgs {
  factoryId: string;
  /** Enquanto o modal está fechado, a query do modelo fica suspensa. */
  open: boolean;
  /** Arquivo carregado — guardado no modelo como amostra (base64). */
  file: File[];
  /** Estado de mapeamento atual do wizard, salvo como config do modelo. */
  config: PriceListTemplateConfig;
  /** execute compartilhado do wizard (mantém o mesmo isLoading do modal). */
  execute: ExecuteFn;
}

/**
 * Concern de modelo (template) da importação de tabela de preço: busca o modelo
 * salvo da fábrica, monta o payload a partir do mapeamento atual e cobre os dois
 * caminhos de gravação — salvar manual e auto-criar na 1ª importação. Autocontido:
 * recebe o config do wizard e devolve as ações, sem tocar no resto do estado.
 */
const getTemplates = (d: ImportTemplatesData) => d.importTemplates;

export function usePriceListTemplate({
  factoryId,
  open,
  file,
  config,
  execute,
}: PriceListTemplateArgs) {
  const { toast } = useToast();

  // Modelo (mapeamento) salvo desta fábrica para tabela de preço, se houver.
  // Mesmas variáveis da aba de modelos, pelo mesmo hook: sem teto fixo, e as
  // duas telas dividem a resposta no cache.
  const templatesInput = useMemo(
    () => buildImportTemplatesInput(factoryId),
    [factoryId]
  );

  const { data: tplData, refetch: refetchTemplate } =
    useCompleteList<ImportTemplatesData>(
      IMPORT_TEMPLATES_QUERY,
      templatesInput,
      getTemplates,
      { skip: !open, fetchPolicy: "cache-and-network" }
    );
  const activeTemplate = useMemo(
    () =>
      tplData?.importTemplates.edges
        .map((e) => e.node)
        .find((n) => n.isActive && n.target === "PRICE_LIST") ?? null,
    [tplData]
  );
  const [createTemplate] = useMutation<{
    createImportTemplate: { status: boolean; message: string };
  }>(CREATE_IMPORT_TEMPLATE_MUTATION);
  const [updateTemplate] = useMutation<{
    updateImportTemplate: { status: boolean; message: string };
  }>(UPDATE_IMPORT_TEMPLATE_MUTATION);

  // Payload do template = mapeamento atual + arquivo-modelo (base64). Compartilhado
  // pelo salvar manual e pela criação automática no fim da 1ª importação.
  const buildTemplateInput = async () => {
    const selected = file[0];
    const fileType = selected
      ? /\.pdf$/i.test(selected.name)
        ? "PDF"
        : /\.csv$/i.test(selected.name)
          ? "CSV"
          : "XLSX"
      : "XLSX";
    const base64 = selected ? await fileToBase64(selected) : null;
    return {
      target: "PRICE_LIST",
      fileType,
      parserStrategy: "COLUMN_MAPPING",
      config,
      ...(base64
        ? { sampleFileBase64: base64, sampleFileName: selected!.name }
        : {}),
    };
  };

  // Cria o modelo automaticamente na 1ª importação (só se a fábrica ainda não
  // tem um): assim a próxima tabela do mesmo formato já vem mapeada, sem
  // sobrescrever um modelo existente. Best-effort — falha aqui não derruba a
  // importação que acabou de dar certo.
  const autoCreateTemplate = async () => {
    if (activeTemplate || !canSaveTemplate(config)) return;
    try {
      const input = await buildTemplateInput();
      const res = await createTemplate({
        variables: { input: { factoryId, companyId: null, ...input } },
      });
      if (res.data?.createImportTemplate?.status) {
        await refetchTemplate();
        toast({
          variant: "success",
          title: "Modelo salvo",
          description:
            "Guardamos esse mapeamento como modelo desta fábrica — a próxima tabela do mesmo formato já vem preenchida.",
        });
      }
    } catch {
      // Silencioso: o modelo é um extra; a tabela já foi importada.
    }
  };

  const handleSaveTemplate = async () => {
    await execute(
      async () => {
        const shared = await buildTemplateInput();
        if (activeTemplate) {
          const res = await updateTemplate({
            variables: { id: activeTemplate.id, input: shared },
          });
          if (!res.data?.updateImportTemplate?.status) {
            throw new Error(
              res.data?.updateImportTemplate?.message ??
                "Erro ao salvar o modelo"
            );
          }
          return res.data.updateImportTemplate;
        }
        const res = await createTemplate({
          variables: { input: { factoryId, companyId: null, ...shared } },
        });
        if (!res.data?.createImportTemplate?.status) {
          throw new Error(
            res.data?.createImportTemplate?.message ?? "Erro ao salvar o modelo"
          );
        }
        return res.data.createImportTemplate;
      },
      {
        successMessage: "Modelo de tabela salvo para esta fábrica",
        onSuccess: () => refetchTemplate(),
      }
    );
  };

  return {
    activeTemplate,
    autoCreateTemplate,
    handleSaveTemplate,
    canSaveTemplateNow: canSaveTemplate(config),
  };
}
