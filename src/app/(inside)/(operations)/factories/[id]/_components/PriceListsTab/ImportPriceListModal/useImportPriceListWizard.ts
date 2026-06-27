import { useMutation, useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { SelectOption } from "@/components/Input/InputSelect";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useReconciliation } from "@/hooks/useReconciliation";
import {
  ColumnChoice,
  distinctValues,
  parseNumber,
  valueForChoice,
} from "@/utils/import/columns";
import {
  guessBestSheet,
  guessHeaderRow,
  readWorkbook,
  SheetMatrix,
  splitAt,
  WorkbookData,
} from "@/utils/import/reader";

import {
  autoGuessMapping,
  isMappingComplete,
  MappingState,
} from "../../ProductsTab/ImportProductsModal/mapping";
import { buildImportTemplatesVariables } from "../../ImportTemplateTab/gql";
import {
  CREATE_IMPORT_TEMPLATE_MUTATION,
  IMPORT_TEMPLATES_QUERY,
  UPDATE_IMPORT_TEMPLATE_MUTATION,
} from "../../ImportTemplateTab/gql";
import { ImportTemplatesData } from "../../ImportTemplateTab/interface";
import {
  buildImportInput,
  canImport,
  canSaveTemplate,
  PRICE_REQUIRED_FIELDS,
} from "./build";
import {
  EXTRACT_PRICE_LIST_FILE_MUTATION,
  fileToBase64,
  IMPORT_PRICE_LIST_MUTATION,
  PRODUCT_UNIT_LABELS_QUERY,
  PRODUCT_UNITS_QUERY,
} from "./gql";
import {
  ImportPriceListResponse,
  ImportPriceListResult,
  ProductUnitLabelsData,
  ProductUnitsData,
  TaxColumn,
  TierColumn,
} from "./interface";
import { EMPTY_ST_MVA, StMvaChoices } from "./StMvaFields";
import { isPriceListConfig, PriceListTemplateConfig } from "./templateConfig";

export interface ImportPriceListModalProps {
  companyFactoryId: string;
  factoryId: string;
  onImported: () => void;
}

const CATALOG_INPUT = { variables: { input: { first: 200 } } };
const toIso = (date: Date | null): string =>
  date ? date.toISOString().slice(0, 10) : "";

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

  const [file, setFile] = useState<File[]>([]);
  const [workbook, setWorkbook] = useState<WorkbookData | null>(null);
  const [sheetName, setSheetName] = useState<string | null>(null);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [mapping, setMapping] = useState<MappingState>({});
  const [tierColumns, setTierColumns] = useState<TierColumn[]>([]);
  const [ipiChoice, setIpiChoice] = useState<ColumnChoice>({ kind: "none" });
  // O sistema guarda alíquota percentual (3,25); planilhas costumam trazer
  // fração decimal (0,0325). Conversão ×100 feita no backend.
  const [ipiAsFraction, setIpiAsFraction] = useState(false);
  const [ncmChoice, setNcmChoice] = useState<ColumnChoice>({ kind: "none" });
  const [taxColumns, setTaxColumns] = useState<TaxColumn[]>([]);
  const [stMva, setStMva] = useState<StMvaChoices>(EMPTY_ST_MVA);
  // Mesma semântica do IPI, para os demais impostos (rate/MVA/crédito/interna).
  const [taxesAsFraction, setTaxesAsFraction] = useState(false);
  // Planilhas de fábrica costumam trazer preço por peça; o sistema armazena
  // sempre o preço da embalagem fechada (conversão feita no backend).
  const [pricesPerUnit, setPricesPerUnit] = useState(false);
  const [listName, setListName] = useState("");
  const [region, setRegion] = useState("");
  const [validFrom, setValidFrom] = useState<Date | null>(new Date());
  const [validUntil, setValidUntil] = useState<Date | null>(null);
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

  // Modelo (mapeamento) salvo desta fábrica para tabela de preço, se houver.
  const { data: tplData, refetch: refetchTemplate } =
    useQuery<ImportTemplatesData>(IMPORT_TEMPLATES_QUERY, {
      variables: buildImportTemplatesVariables(factoryId),
      skip: !open,
      fetchPolicy: "cache-and-network",
    });
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
  const [templateApplied, setTemplateApplied] = useState(false);
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const matrix = useMemo<SheetMatrix | null>(
    () => (workbook && sheetName ? (workbook.sheets[sheetName] ?? null) : null),
    [workbook, sheetName]
  );

  const { data: unitsData } = useQuery<ProductUnitsData>(PRODUCT_UNITS_QUERY, {
    ...CATALOG_INPUT,
    skip: !matrix,
  });
  const { data: labelsData } = useQuery<ProductUnitLabelsData>(
    PRODUCT_UNIT_LABELS_QUERY,
    {
      ...CATALOG_INPUT,
      skip: !matrix,
    }
  );
  const unitLabels = useMemo(
    () => unitsData?.productUnits.edges.map((e) => e.node.label) ?? [],
    [unitsData]
  );
  const packLabels = useMemo(
    () => labelsData?.productUnitLabels.edges.map((e) => e.node.label) ?? [],
    [labelsData]
  );

  const data = useMemo(
    () => (matrix ? splitAt(matrix, headerIndex) : null),
    [matrix, headerIndex]
  );
  const rows = useMemo(() => data?.rows ?? [], [data]);
  const distinctUnits = useMemo(
    () => distinctValues(rows, mapping.unit),
    [rows, mapping.unit]
  );
  const distinctPacks = useMemo(
    () => distinctValues(rows, mapping.unitLabel),
    [rows, mapping.unitLabel]
  );
  const { recon: unitRecon, setFinal: setUnitFinal } = useReconciliation(
    distinctUnits,
    unitLabels
  );
  const { recon: packRecon, setFinal: setPackFinal } = useReconciliation(
    distinctPacks,
    packLabels
  );

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

  // Se todos os valores da coluna são ≤ 1 (ex.: 0,0325), a planilha traz
  // fração decimal e não percentual.
  const looksLikeFraction = (
    choice: ColumnChoice,
    dataRows: string[][]
  ): boolean => {
    if (choice.kind === "none") return false;
    const values = dataRows
      .map((cells) => parseNumber(valueForChoice(choice, cells)))
      .filter((v) => Number.isFinite(v) && v > 0);
    return values.length > 0 && values.every((v) => v <= 1);
  };

  const handleIpiChoice = (choice: ColumnChoice) => {
    setIpiChoice(choice);
    if (choice.kind !== "none")
      setIpiAsFraction(looksLikeFraction(choice, rows));
  };

  // Sugere a semântica dos demais impostos pela alíquota interna do ST (no
  // padrão das planilhas, todas as colunas fiscais seguem a mesma convenção).
  const handleStMvaChange = (next: StMvaChoices) => {
    setStMva(next);
    if (next.internalRate.kind !== "none") {
      setTaxesAsFraction(looksLikeFraction(next.internalRate, rows));
    }
  };

  const buildArgs = {
    companyFactoryId,
    data: data ?? { headers: [], rows: [] },
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
    setMapping({});
    setTierColumns([]);
    setIpiChoice({ kind: "none" });
    setIpiAsFraction(false);
    setNcmChoice({ kind: "none" });
    setTaxColumns([]);
    setStMva(EMPTY_ST_MVA);
    setTaxesAsFraction(false);
    setPricesPerUnit(false);
    setListName("");
    setRegion("");
    setValidFrom(new Date());
    setValidUntil(null);
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
    const guessed = guessHeaderRow(parsed);
    applyHeader(parsed, guessed);
    const split = splitAt(parsed, guessed);
    // Hints em ordem de prioridade: o mais específico ganha mesmo que outra
    // coluna apareça antes (ex.: "icms cred" acha ICMS CREDITO e não ICMS).
    const findHeader = (...hints: string[]): ColumnChoice => {
      for (const hint of hints) {
        const idx = split.headers.findIndex((h) =>
          h.toLowerCase().includes(hint)
        );
        if (idx >= 0) return { kind: "column", index: idx };
      }
      return { kind: "none" };
    };
    const ipi = findHeader("ipi");
    setIpiChoice(ipi);
    setIpiAsFraction(looksLikeFraction(ipi, split.rows));
    setNcmChoice(findHeader("ncm"));
    // Colunas fiscais da planilha estilo Bahia: MVA, ICMS Crédito, Alíquota Interna.
    const guessedSt: StMvaChoices = {
      mva: findHeader("mva"),
      icmsCredit: findHeader("icms créd", "icms cred", "icms"),
      internalRate: findHeader("interna"),
    };
    setStMva(guessedSt);
    setTaxesAsFraction(looksLikeFraction(guessedSt.internalRate, split.rows));
    setTierColumns([{ id: "t1", columnIndex: null, tierName: "" }]);
  };

  // Aplica o mapeamento salvo no modelo da fábrica (em vez dos palpites).
  const applyTemplateConfig = (cfg: PriceListTemplateConfig) => {
    setHeaderIndex(cfg.headerIndex ?? 0);
    setMapping(cfg.mapping ?? {});
    setTierColumns(
      cfg.tierColumns?.length
        ? cfg.tierColumns
        : [{ id: "t1", columnIndex: null, tierName: "" }]
    );
    setIpiChoice(cfg.ipiChoice ?? { kind: "none" });
    setIpiAsFraction(!!cfg.ipiAsFraction);
    setNcmChoice(cfg.ncmChoice ?? { kind: "none" });
    setTaxColumns(cfg.taxColumns ?? []);
    setStMva(cfg.stMva ?? EMPTY_ST_MVA);
    setPricesPerUnit(!!cfg.pricesPerUnit);
    setTaxesAsFraction(!!cfg.taxesAsFraction);
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

  // Payload do template = mapeamento atual + arquivo-modelo (base64). Compartilhado
  // pelo salvar manual e pela criação automática no fim da 1ª importação.
  const buildTemplateInput = async () => {
    const selected = file[0];
    const config: PriceListTemplateConfig = {
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
    if (activeTemplate || !canSaveTemplate(buildArgs)) return;
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
  const importPreview = data ? buildImportInput(buildArgs) : null;
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
    Boolean(data && rows.length > 0), // Planilha: arquivo lido
    Boolean(data && rows.length > 0), // Leitura: aba/cabeçalho com dados
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

  const canSaveTemplateNow = canSaveTemplate(buildArgs);

  return {
    open,
    handleClose,
    step,
    setStep,
    result,
    isLoading,
    file,
    extracting,
    handleFiles,
    matrix,
    data,
    templateApplied,
    workbook,
    sheetName,
    sheetOptions,
    handleSheetChange,
    headerOptions,
    headerIndex,
    applyHeader,
    unreadable,
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
    tierColumns,
    setTierColumns,
    pricesPerUnit,
    setPricesPerUnit,
    ipiChoice,
    handleIpiChoice,
    ipiAsFraction,
    setIpiAsFraction,
    taxColumns,
    setTaxColumns,
    validTaxesCount,
    stMva,
    handleStMvaChange,
    taxesAsFraction,
    setTaxesAsFraction,
    listName,
    setListName,
    region,
    setRegion,
    validFrom,
    setValidFrom,
    validUntil,
    setValidUntil,
    skippedRows,
    importableRows,
    defaultedCount,
    skipped,
    defaultedPack,
    activeTemplate,
    handleSaveTemplate,
    stepValid,
    handleImport,
    canSaveTemplateNow,
  };
}
