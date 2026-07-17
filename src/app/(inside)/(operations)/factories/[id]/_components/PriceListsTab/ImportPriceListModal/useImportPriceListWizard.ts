import { useMutation } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { SelectOption } from "@/components/Input";
import { useToast } from "@/components/Toast";
import { toIsoDate } from "@/utils/format/date";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { distinctValues } from "@/utils/import/columns";
import {
  guessBestSheet,
  readWorkbook,
  SheetMatrix,
  splitAt,
  WorkbookData,
} from "@/utils/import/reader";

import {
  autoGuessMapping,
  isMappingComplete,
} from "../../../_shared/productImportMapping";
import { useCompanyFactoryNode } from "../../../../../_shared/orderItemCatalog";
import { buildImportInput, canImport, PRICE_REQUIRED_FIELDS } from "./build";
import {
  EXTRACT_PRICE_LIST_FILE_MUTATION,
  fileToBase64,
  IMPORT_PRICE_LIST_MUTATION,
} from "./gql";
import { ImportPriceListResponse, ImportPriceListResult } from "./interface";
import { isPriceListConfig, PriceListTemplateConfig } from "./templateConfig";
import { useListDetails } from "./useListDetails";
import { useMappingState } from "./useMappingState";
import { usePriceListCatalog } from "./usePriceListCatalog";
import { usePriceListTemplate } from "./usePriceListTemplate";
import { guessColumns } from "./wizardGuess";

export interface ImportPriceListModalProps {
  companyFactoryId: string;
  factoryId: string;
  onImported: () => void;
}

// Usa os componentes de data LOCAIS (via toIsoDate), não `toISOString().slice`,
// que converte para UTC e desloca o dia num fuso como o BRT (off-by-one).
const toIso = (date: Date | null): string => toIsoDate(date);

export function useImportPriceListWizard({
  companyFactoryId,
  factoryId,
  onImported,
}: ImportPriceListModalProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Aberto direto pelo CTA do modal de importar produtos (?import=price-list)
  const [open, setOpen] = useState(searchParams.get("import") === "price-list");
  const [step, setStep] = useState(0);

  // Fábrica que cobra IPI no pedido: a coluna de IPI da planilha continua sendo
  // importada (vira imposto do produto e alimenta o item do pedido), mas não
  // entra no preço da tabela. O passo de impostos explica isso.
  const ipiInOrder =
    useCompanyFactoryNode(open, factoryId)?.ipiInOrder ?? false;

  const [file, setFile] = useState<File[]>([]);
  const [workbook, setWorkbook] = useState<WorkbookData | null>(null);
  const [sheetName, setSheetName] = useState<string | null>(null);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [result, setResult] = useState<ImportPriceListResult | null>(null);
  // PDF é lido no backend (pdfplumber) e tabelas grandes demoram; sinaliza o
  // processamento para o usuário não achar que travou.
  const [extracting, setExtracting] = useState(false);
  // Descrições das linhas com cara de produto que o leitor de PDF não conseguiu
  // ler (código embaralhado por texto sobreposto) — listamos para o usuário achar.
  const [unreadable, setUnreadable] = useState<string[]>([]);
  // Linhas da planilha que ficaram de fora da importação (sem código/descrição)
  // — guardadas com identidade para listar no resultado.
  const [skipped, setSkipped] = useState<
    { sku: string; name: string; reason: string }[]
  >([]);
  // Produtos importados com múltiplo assumido = 1 (planilha não trazia) — avisamos
  // para o usuário revisar e ajustar depois.
  const [defaultedPack, setDefaultedPack] = useState<
    { sku: string; name: string }[]
  >([]);

  const { toast } = useToast();
  const [importList] = useMutation<ImportPriceListResponse>(
    IMPORT_PRICE_LIST_MUTATION
  );
  const [extractPdf] = useMutation<{
    extractPriceListFile: {
      status: boolean;
      message: string;
      data: { rows: string[][]; unreadableRows: string[] | null } | null;
    };
  }>(EXTRACT_PRICE_LIST_FILE_MUTATION);

  const [templateApplied, setTemplateApplied] = useState(false);
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const matrix = useMemo<SheetMatrix | null>(
    () => (workbook && sheetName ? (workbook.sheets[sheetName] ?? null) : null),
    [workbook, sheetName]
  );

  const parsedSheet = useMemo(
    () => (matrix ? splitAt(matrix, headerIndex) : null),
    [matrix, headerIndex]
  );
  const rows = useMemo(() => parsedSheet?.rows ?? [], [parsedSheet]);

  // Domínio de mapeamento (colunas → produto/nível/impostos) e metadados da lista
  // separados em sub-hooks; o orquestrador só cuida da grade e da execução.
  const {
    mapping,
    setMapping,
    tierColumns,
    setTierColumns,
    ipiChoice,
    handleIpiChoice,
    ipiAsFraction,
    setIpiAsFraction,
    ncmChoice,
    setNcmChoice,
    taxColumns,
    setTaxColumns,
    stMva,
    handleStMvaChange,
    taxesAsFraction,
    setTaxesAsFraction,
    pricesPerUnit,
    setPricesPerUnit,
    applyGuess: applyMappingGuess,
    applyConfig: applyMappingConfig,
    reset: resetMapping,
  } = useMappingState(rows);

  const {
    listName,
    setListName,
    region,
    setRegion,
    validFrom,
    setValidFrom,
    validUntil,
    setValidUntil,
    reset: resetDetails,
  } = useListDetails();

  const distinctUnits = useMemo(
    () => distinctValues(rows, mapping.unit),
    [rows, mapping.unit]
  );
  const distinctPacks = useMemo(
    () => distinctValues(rows, mapping.unitLabel),
    [rows, mapping.unitLabel]
  );

  // Catálogo do sistema (unidades/embalagens) + reconciliação com a planilha.
  const {
    unitLabels,
    packLabels,
    unitRecon,
    setUnitFinal,
    packRecon,
    setPackFinal,
  } = usePriceListCatalog({ matrix, distinctUnits, distinctPacks });

  // Estado de mapeamento atual do wizard = config do modelo (sem nome/vigência).
  const templateConfig: PriceListTemplateConfig = {
    headerIndex,
    mapping,
    tierColumns,
    ipiChoice,
    ipiAsFraction,
    ncmChoice,
    taxColumns,
    stMva,
    pricesPerUnit,
    taxesAsFraction,
  };
  const {
    activeTemplate,
    autoCreateTemplate,
    handleSaveTemplate,
    canSaveTemplateNow,
  } = usePriceListTemplate({
    factoryId,
    open,
    file,
    config: templateConfig,
    execute,
  });

  const headerOptions: SelectOption[] = useMemo(() => {
    if (!matrix) return [];
    return matrix.slice(0, 12).map((row, index) => {
      const preview = row
        .filter((c) => c.trim())
        .slice(0, 4)
        .join(", ");
      return {
        value: String(index),
        label: `Linha ${index + 1}: ${preview || "(vazia)"}`,
      };
    });
  }, [matrix]);

  const sheetOptions: SelectOption[] = useMemo(
    () =>
      workbook?.sheetNames.map((name) => ({
        value: name,
        label: `${name} (${workbook.sheets[name]?.length ?? 0} linhas)`,
      })) ?? [],
    [workbook]
  );

  const buildArgs = {
    companyFactoryId,
    data: parsedSheet ?? { headers: [], rows: [] },
    mapping,
    unitRecon,
    labelRecon: packRecon,
    tierColumns,
    ipiChoice,
    ncmChoice,
    taxColumns,
    stMva,
    listName,
    region,
    validFrom: toIso(validFrom),
    validUntil: toIso(validUntil) || null,
    pricesPerUnit,
    ipiAsFraction,
    taxesAsFraction,
  };

  const reset = () => {
    setStep(0);
    setFile([]);
    setTemplateApplied(false);
    setWorkbook(null);
    setSheetName(null);
    resetMapping();
    resetDetails();
    setResult(null);
    setUnreadable([]);
    setSkipped([]);
    setDefaultedPack([]);
  };

  const handleClose = (value: boolean) => {
    // Importação em andamento: ignora ESC, clique no overlay e o X do header.
    if (!value && isLoading) return;
    setOpen(value);
    if (!value) {
      reset();
      if (searchParams.get("import")) router.replace(pathname);
    }
  };

  const applyHeader = (source: SheetMatrix, index: number) => {
    setHeaderIndex(index);
    setMapping(autoGuessMapping(splitAt(source, index).headers));
  };

  // Re-executa os palpites (cabeçalho, IPI, NCM, ST) sobre a aba escolhida —
  // usado tanto no upload quanto na troca de aba.
  const applySheet = (parsed: SheetMatrix) => {
    const guessed = guessColumns(parsed);
    applyHeader(parsed, guessed.headerIndex);
    applyMappingGuess(guessed);
  };

  // Aplica o mapeamento salvo no modelo da fábrica (em vez dos palpites).
  const applyTemplateConfig = (cfg: PriceListTemplateConfig) => {
    setHeaderIndex(cfg.headerIndex ?? 0);
    applyMappingConfig(cfg);
  };

  // Após carregar a grade: se a fábrica tem modelo salvo, aplica-o; senão adivinha.
  const applyGrid = (rows: SheetMatrix) => {
    if (activeTemplate && isPriceListConfig(activeTemplate.config)) {
      applyTemplateConfig(activeTemplate.config);
      setTemplateApplied(true);
    } else {
      applySheet(rows);
      setTemplateApplied(false);
    }
  };

  const handleSheetChange = (name: string) => {
    if (!workbook || name === sheetName) return;
    setSheetName(name);
    applySheet(workbook.sheets[name] ?? []);
  };

  const handleFiles = async (files: File[]) => {
    setResult(null);
    setUnreadable([]);
    setSkipped([]);
    setDefaultedPack([]);
    setFile(files);
    const selected = files[0];
    if (!selected) {
      setWorkbook(null);
      setSheetName(null);
      return;
    }
    setExtracting(true);
    try {
      const isPdf = /\.pdf$/i.test(selected.name);
      if (isPdf) {
        // PDF: a grade é extraída no backend (pdfplumber) e embrulhada como uma
        // "planilha" de aba única — o resto do fluxo (cabeçalho/colunas) é igual.
        const base64 = await fileToBase64(selected);
        const res = await extractPdf({
          variables: { input: { fileName: selected.name, fileBase64: base64 } },
        });
        const payload = res.data?.extractPriceListFile;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Não foi possível ler o PDF.");
        }
        const pdfRows = payload.data.rows;
        setUnreadable(payload.data.unreadableRows ?? []);
        const wrapped: WorkbookData = {
          sheetNames: ["PDF"],
          sheets: { PDF: pdfRows },
        };
        setWorkbook(wrapped);
        setSheetName("PDF");
        applyGrid(pdfRows);
        if (!listName) setListName(selected.name.replace(/\.pdf$/i, ""));
        setStep(1);
        return;
      }
      const parsed = await readWorkbook(selected);
      // Pré-seleciona a aba com mais linhas — nas planilhas reais, a tabela de
      // preço (ex.: aba "Base") convive com formulário de pedido e ajustes.
      const best = guessBestSheet(parsed);
      if (!best) throw new Error("A planilha está vazia.");
      setWorkbook(parsed);
      setSheetName(best);
      applyGrid(parsed.sheets[best] ?? []);
      if (!listName)
        setListName(selected.name.replace(/\.(csv|xlsx|xls)$/i, ""));
      // Leva direto para a conferência da leitura, que explica o que aconteceu.
      setStep(1);
    } catch (error) {
      setWorkbook(null);
      setSheetName(null);
      toast({
        variant: "error",
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível ler a planilha.",
      });
    } finally {
      setExtracting(false);
    }
  };

  // Pré-monta o payload para validar e exibir linhas ignoradas antes do envio.
  const importPreview = parsedSheet ? buildImportInput(buildArgs) : null;
  const importableRows = importPreview?.input.rows.length ?? 0;
  const skippedRows = importPreview?.skippedRows ?? 0;
  const defaultedCount = importPreview?.defaultedPack.length ?? 0;

  const validTiersCount = tierColumns.filter(
    (t) => t.columnIndex !== null && t.tierName.trim()
  ).length;
  const validTaxesCount = taxColumns.filter(
    (t) => t.columnIndex !== null && t.taxName.trim()
  ).length;
  const stepValid = [
    Boolean(parsedSheet && rows.length > 0), // Planilha: arquivo lido
    Boolean(parsedSheet && rows.length > 0), // Leitura: aba/cabeçalho com dados
    isMappingComplete(mapping, PRICE_REQUIRED_FIELDS),
    validTiersCount > 0,
    true, // Impostos: tudo opcional
    canImport(buildArgs) && importableRows > 0,
    true, // Resultado: só leitura
  ];

  const handleImport = async () => {
    // Monta uma vez: o input vai pro backend e a lista de descartadas fica para
    // o resultado mostrar quais linhas não subiram.
    const built = buildImportInput(buildArgs);
    await execute(
      async () => {
        const res = await importList({ variables: { input: built.input } });
        const payload = res.data?.importFactoryPriceList;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao importar tabela");
        }
        return { data: payload.data, message: payload.message };
      },
      {
        onSuccess: ({ data: r, message }) => {
          setResult(r);
          setSkipped(built.skipped);
          setDefaultedPack(built.defaultedPack);
          setStep(6);
          onImported();
          // A importação também cria níveis comerciais e produtos — sem isso,
          // as abas Níveis e Produtos continuam mostrando o cache antigo.
          invalidateClient(["priceTiers", "products"]);
          toast({
            variant: r.failed > 0 ? "warning" : "success",
            title: r.failed > 0 ? "Importação parcial" : "Tabela importada",
            description: message,
          });
          // 1ª importação desta fábrica: guarda o mapeamento como modelo.
          void autoCreateTemplate();
        },
      }
    );
  };

  const headers = parsedSheet?.headers ?? [];

  return {
    // Máquina de estado + chrome do wizard (estado observável).
    open,
    handleClose,
    step,
    setStep,
    stepValid,
    isLoading,
    result,
    handleImport,
    // Modelo da fábrica (salvar/atualizar mapeamento).
    template: {
      activeTemplate,
      canSaveTemplateNow,
      handleSaveTemplate,
    },

    // Bundles de props por Step — espelham 1:1 os props de cada componente
    // Step*, que ficam intactos: o modal faz `<StepX {...w.xStep} />`. Os passos
    // que dependem da grade ficam `null` até ela existir (o modal gateia no
    // próprio bundle), o que estreita os tipos (matrix/data não-nulos aqui).
    sheetStep: {
      file,
      extracting,
      onFiles: handleFiles,
      ready: Boolean(matrix && parsedSheet),
      templateApplied,
    },
    readingStep:
      matrix && parsedSheet
        ? {
            matrix,
            data: parsedSheet,
            workbook,
            sheetName,
            sheetOptions,
            onSheetChange: handleSheetChange,
            headerOptions,
            headerIndex,
            applyHeader,
            unreadable,
          }
        : null,
    productStep: parsedSheet
      ? {
          headers,
          mapping,
          setMapping,
          ncmChoice,
          setNcmChoice,
          distinctUnits,
          distinctPacks,
          unitLabels,
          packLabels,
          unitRecon,
          setUnitFinal,
          packRecon,
          setPackFinal,
        }
      : null,
    pricesStep: parsedSheet
      ? {
          headers,
          tierColumns,
          setTierColumns,
          pricesPerUnit,
          setPricesPerUnit,
        }
      : null,
    taxesStep: parsedSheet
      ? {
          headers,
          ipiInOrder,
          ipiChoice,
          onIpiChoice: handleIpiChoice,
          ipiAsFraction,
          setIpiAsFraction,
          taxColumns,
          setTaxColumns,
          validTaxesCount,
          stMva,
          onStMvaChange: handleStMvaChange,
          taxesAsFraction,
          setTaxesAsFraction,
        }
      : null,
    detailsStep: {
      listName,
      setListName,
      region,
      setRegion,
      validFrom,
      setValidFrom,
      validUntil,
      setValidUntil,
      isLoading,
      skippedRows,
      importableRows,
      defaultedCount,
    },
    resultStep: result
      ? {
          result,
          skipped,
          unreadable,
          defaultedPack,
        }
      : null,
  };
}
