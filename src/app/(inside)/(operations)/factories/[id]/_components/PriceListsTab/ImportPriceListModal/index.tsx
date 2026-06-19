"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { CheckCircle2, Download, Info, Upload } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useMemo, useState } from "react";

import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { StatCard } from "@/components/StatCard";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";

import {
  ColumnChoice,
  distinctValues,
  parseNumber,
  valueForChoice,
} from "../../_import/columns";
import { FieldMapper } from "../../_import/FieldMapper";
import {
  guessBestSheet,
  guessHeaderRow,
  readWorkbook,
  SheetMatrix,
  splitAt,
  WorkbookData,
} from "../../_import/reader";
import { Reconciliation } from "../../_import/Reconciliation";
import { useReconciliation } from "../../_import/reconcile";
import { SheetPreview } from "../../_import/SheetPreview";
import {
  autoGuessMapping,
  isMappingComplete,
  MappingState,
  TARGET_FIELDS,
} from "../../ProductsTab/ImportProductsModal/mapping";
import {
  buildImportInput,
  canImport,
  canSaveTemplate,
  hasConfiguredTaxes,
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
  buildImportTemplatesVariables,
  CREATE_IMPORT_TEMPLATE_MUTATION,
  IMPORT_TEMPLATES_QUERY,
  UPDATE_IMPORT_TEMPLATE_MUTATION,
} from "../../ImportTemplateTab/gql";
import { ImportTemplatesData } from "../../ImportTemplateTab/interface";
import { isPriceListConfig, PriceListTemplateConfig } from "./templateConfig";
import {
  ImportPriceListResponse,
  ImportPriceListResult,
  ProductUnitLabelsData,
  ProductUnitsData,
  TaxColumn,
  TierColumn,
} from "./interface";
import {
  EMPTY_ST_MVA,
  isStMvaComplete,
  isStMvaPartial,
  StMvaChoices,
  StMvaFields,
} from "./StMvaFields";
import { TaxMapper } from "./TaxMapper";
import { downloadExampleSheet } from "./template";
import { TierMapper } from "./TierMapper";

interface Props {
  companyFactoryId: string;
  factoryId: string;
  onImported: () => void;
}

const CATALOG_INPUT = { variables: { input: { first: 200 } } };
const toIso = (date: Date | null): string => (date ? date.toISOString().slice(0, 10) : "");

export function ImportPriceListModal({ companyFactoryId, factoryId, onImported }: Props) {
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
  const [skipped, setSkipped] = useState<{ sku: string; name: string; reason: string }[]>([]);
  // Produtos importados com múltiplo assumido = 1 (planilha não trazia) — avisamos
  // para o usuário revisar e ajustar depois.
  const [defaultedPack, setDefaultedPack] = useState<{ sku: string; name: string }[]>([]);

  const { toast } = useToast();
  const [importList] = useMutation<ImportPriceListResponse>(IMPORT_PRICE_LIST_MUTATION);
  const [extractPdf] = useMutation<{
    extractPriceListFile: {
      status: boolean;
      message: string;
      data: { rows: string[][]; unreadableRows: string[] | null } | null;
    };
  }>(EXTRACT_PRICE_LIST_FILE_MUTATION);

  // Modelo (mapeamento) salvo desta fábrica para tabela de preço, se houver.
  const { data: tplData, refetch: refetchTemplate } = useQuery<ImportTemplatesData>(
    IMPORT_TEMPLATES_QUERY,
    { variables: buildImportTemplatesVariables(factoryId), skip: !open, fetchPolicy: "cache-and-network" }
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
  const [templateApplied, setTemplateApplied] = useState(false);
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const matrix = useMemo<SheetMatrix | null>(
    () => (workbook && sheetName ? workbook.sheets[sheetName] ?? null : null),
    [workbook, sheetName]
  );

  const { data: unitsData } = useQuery<ProductUnitsData>(PRODUCT_UNITS_QUERY, {
    ...CATALOG_INPUT,
    skip: !matrix,
  });
  const { data: labelsData } = useQuery<ProductUnitLabelsData>(PRODUCT_UNIT_LABELS_QUERY, {
    ...CATALOG_INPUT,
    skip: !matrix,
  });
  const unitLabels = useMemo(
    () => unitsData?.productUnits.edges.map((e) => e.node.label) ?? [],
    [unitsData]
  );
  const packLabels = useMemo(
    () => labelsData?.productUnitLabels.edges.map((e) => e.node.label) ?? [],
    [labelsData]
  );

  const data = useMemo(() => (matrix ? splitAt(matrix, headerIndex) : null), [matrix, headerIndex]);
  const rows = useMemo(() => data?.rows ?? [], [data]);
  const distinctUnits = useMemo(() => distinctValues(rows, mapping.unit), [rows, mapping.unit]);
  const distinctPacks = useMemo(() => distinctValues(rows, mapping.unitLabel), [rows, mapping.unitLabel]);
  const { recon: unitRecon, setFinal: setUnitFinal } = useReconciliation(distinctUnits, unitLabels);
  const { recon: packRecon, setFinal: setPackFinal } = useReconciliation(distinctPacks, packLabels);

  const headerOptions: SelectOption[] = useMemo(() => {
    if (!matrix) return [];
    return matrix.slice(0, 12).map((row, index) => {
      const preview = row.filter((c) => c.trim()).slice(0, 4).join(", ");
      return { value: String(index), label: `Linha ${index + 1}: ${preview || "(vazia)"}` };
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
  const looksLikeFraction = (choice: ColumnChoice, dataRows: string[][]): boolean => {
    if (choice.kind === "none") return false;
    const values = dataRows
      .map((cells) => parseNumber(valueForChoice(choice, cells)))
      .filter((v) => Number.isFinite(v) && v > 0);
    return values.length > 0 && values.every((v) => v <= 1);
  };

  const handleIpiChoice = (choice: ColumnChoice) => {
    setIpiChoice(choice);
    if (choice.kind !== "none") setIpiAsFraction(looksLikeFraction(choice, rows));
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
        const idx = split.headers.findIndex((h) => h.toLowerCase().includes(hint));
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
      cfg.tierColumns?.length ? cfg.tierColumns : [{ id: "t1", columnIndex: null, tierName: "" }]
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
      ...(base64 ? { sampleFileBase64: base64, sampleFileName: selected!.name } : {}),
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
          description: "Guardamos esse mapeamento como modelo desta fábrica — a próxima tabela do mesmo formato já vem preenchida.",
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
          const res = await updateTemplate({ variables: { id: activeTemplate.id, input: shared } });
          if (!res.data?.updateImportTemplate?.status) {
            throw new Error(res.data?.updateImportTemplate?.message ?? "Erro ao salvar o modelo");
          }
          return res.data.updateImportTemplate;
        }
        const res = await createTemplate({
          variables: { input: { factoryId, companyId: null, ...shared } },
        });
        if (!res.data?.createImportTemplate?.status) {
          throw new Error(res.data?.createImportTemplate?.message ?? "Erro ao salvar o modelo");
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
        const wrapped: WorkbookData = { sheetNames: ["PDF"], sheets: { PDF: pdfRows } };
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
      if (!listName) setListName(selected.name.replace(/\.(csv|xlsx|xls)$/i, ""));
      // Leva direto para a conferência da leitura, que explica o que aconteceu.
      setStep(1);
    } catch (error) {
      setWorkbook(null);
      setSheetName(null);
      toast({
        variant: "error",
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível ler a planilha.",
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

  const validTiersCount = tierColumns.filter((t) => t.columnIndex !== null && t.tierName.trim()).length;
  const validTaxesCount = taxColumns.filter((t) => t.columnIndex !== null && t.taxName.trim()).length;
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

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Upload} />
          <Button.Title>Importar tabela</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="5xl">
        <Modal.Header
          title="Importar tabela de preço"
          description="Suba a planilha da fábrica: criamos a tabela, os níveis, os produtos e os preços."
        />

        <Modal.Body className="flex flex-col gap-16 py-24">
          {/* Depois de importado (result), a navegação trava no Resultado. */}
          <Stepper.Root
            current={step}
            onChange={(index) => {
              if (!result && !isLoading && index < 6) setStep(index);
            }}
          >
            <Stepper.Item label="Planilha">
              <div className="flex flex-col gap-12">
                <Stepper.Intro step={1} total={6} title="Envie a planilha de preços da fábrica">
                  Pegue o arquivo Excel que a fábrica te mandou e arraste para o
                  quadro abaixo (ou clique nele para escolher o arquivo). O sistema
                  lê a planilha e tenta descobrir sozinho onde está cada informação
                  — nos próximos passos você só confere se ele acertou.
                </Stepper.Intro>
                <div className="flex items-center justify-between gap-12 rounded-lg border border-(--border) px-12 py-10">
                  <div className="flex flex-col">
                    <Title variant="body" weight="medium">
                      Não tem a planilha da fábrica em mãos?
                    </Title>
                    <Title variant="body-xs" color="muted">
                      Baixe o modelo com as colunas que o sistema reconhece sozinho — inclui
                      exemplos com IPI e ST por MVA.
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
                  accept=".csv,.xlsx,.xls,.pdf"
                  hint="Suba a tabela da fábrica em Excel (.xlsx/.csv) ou PDF. Em PDF, lemos a grade automaticamente; confira as colunas no passo seguinte."
                  value={file}
                  disabled={extracting}
                  onChange={handleFiles}
                />
                {extracting && (
                  <div className="flex items-center gap-8 rounded-lg border border-(--border) bg-(--bg2) px-12 py-10">
                    <Loading.Spinner size="sm" colorClass="amber" />
                    <Title variant="body" color="muted">
                      Lendo o arquivo e procurando as colunas… Em tabelas grandes (PDF) isso pode levar alguns segundos.
                    </Title>
                  </div>
                )}
                {!extracting && matrix && data && (
                  <Alert.Root variant="success">
                    <Alert.Icon icon={CheckCircle2} />
                    <Alert.Content>
                      <Alert.Description>
                        {templateApplied
                          ? "Arquivo lido e modelo desta fábrica aplicado: as colunas já vêm mapeadas. Confira nos próximos passos."
                          : "Planilha lida com sucesso. Clique em Próximo para conferir o que o sistema entendeu."}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}
              </div>
            </Stepper.Item>

            <Stepper.Item label="Leitura">
              {matrix && data && (
                <div className="flex flex-col gap-12">
                  <Stepper.Intro step={2} total={6} title="Veja o que o sistema entendeu da planilha">
                    O arquivo foi lido: encontramos {data.rows.length} linha(s) de
                    produtos
                    {workbook && workbook.sheetNames.length > 1 && sheetName
                      ? ` na aba "${sheetName}"`
                      : ""}
                    . A tabela abaixo mostra uma amostra das primeiras linhas, do
                    jeito que o sistema enxergou. Compare com o Excel: se as
                    colunas estiverem certas, clique em Próximo. Se aparecer
                    estranho, ajuste a aba ou a linha do cabeçalho aqui embaixo.
                  </Stepper.Intro>
                  {unreadable.length > 0 && (
                    <Alert.Root variant="warning">
                      <Alert.Icon icon={Info} />
                      <Alert.Content>
                        <Alert.Title>
                          {unreadable.length} linha(s) do PDF não puderam ser lidas
                        </Alert.Title>
                        <Alert.Description>
                          O código destes produtos saiu embaralhado no PDF (texto
                          sobreposto) e eles NÃO entram na importação. Confira a descrição,
                          ache o código no PDF e cadastre-os manualmente:
                          <ul className="mt-4 list-disc pl-16">
                            {unreadable.map((desc, i) => (
                              <li key={`${desc}-${i}`}>{desc}</li>
                            ))}
                          </ul>
                        </Alert.Description>
                      </Alert.Content>
                    </Alert.Root>
                  )}
                  {workbook && workbook.sheetNames.length > 1 && (
                    <div className="grid grid-cols-[190px_1fr] items-center gap-8">
                      <span className="inline-flex items-center gap-4 whitespace-nowrap">
                        <Title variant="body-sm" weight="medium">Aba da planilha</Title>
                        <HelpTooltip
                          label="Qual aba escolher?"
                          content="O arquivo tem mais de uma aba. Escolha a que contém a tabela de preço (geralmente a com mais linhas) — abas de formulário de pedido ou ajustes não servem para importação. Trocar a aba refaz os palpites de cabeçalho e colunas."
                          position="right"
                        />
                      </span>
                      <Input.Select
                        options={sheetOptions}
                        value={sheetOptions.find((o) => o.value === sheetName) ?? null}
                        variant="single"
                        disabledClear
                        onChange={(val: SelectOption | SelectOption[] | null) => {
                          const opt = Array.isArray(val) ? val[0] : val;
                          if (opt) handleSheetChange(String(opt.value));
                        }}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-[190px_1fr] items-center gap-8">
                    <span className="inline-flex items-center gap-4 whitespace-nowrap">
                      <Title variant="body-sm" weight="medium">Linha do cabeçalho</Title>
                      <HelpTooltip
                        label="O que é a linha do cabeçalho?"
                        content="É a linha da planilha onde estão os títulos das colunas (Código, Descrição, Preço…). O sistema já escolheu a mais provável — só mude aqui se a tabela de exemplo logo abaixo aparecer errada."
                        position="right"
                      />
                    </span>
                    <Input.Select
                      options={headerOptions}
                      value={headerOptions.find((o) => o.value === String(headerIndex)) ?? null}
                      variant="single"
                      disabledClear
                      onChange={(val: SelectOption | SelectOption[] | null) => {
                        const opt = Array.isArray(val) ? val[0] : val;
                        if (opt && matrix) applyHeader(matrix, Number(opt.value));
                      }}
                    />
                  </div>
                  <SheetPreview data={data} />
                  <Title variant="caption" color="muted">{data.rows.length} linha(s) de dados.</Title>
                </div>
              )}
            </Stepper.Item>

            <Stepper.Item label="Produto">
              {data && (
                <div className="flex flex-col gap-12">
                  <Stepper.Intro step={3} total={6} title="Confira onde estão os dados do produto">
                    Aqui você diz em qual coluna da planilha está o código, o nome
                    e a embalagem de cada produto. O sistema já tentou adivinhar —
                    confira se cada campo aponta para a coluna certa e corrija se
                    for preciso. Em caso de dúvida, abra a planilha no Excel e
                    compare.
                  </Stepper.Intro>
                  <Title variant="body-sm" weight="medium">
                    Identificação do produto
                  </Title>
                  {TARGET_FIELDS.filter((field) =>
                    PRICE_REQUIRED_FIELDS.includes(String(field.key))
                  ).map((field) => (
                    <FieldMapper
                      key={field.key}
                      label={field.label}
                      help={field.description}
                      fixedExample={field.fixedExample}
                      headers={data.headers}
                      choice={mapping[field.key] ?? { kind: "none" }}
                      onChange={(choice) => setMapping((p) => ({ ...p, [field.key]: choice }))}
                    />
                  ))}

                  <span className="inline-flex items-center gap-4 pt-4">
                    <Title variant="body-sm" weight="medium">
                      Classificação (opcional)
                    </Title>
                    <HelpTooltip
                      label="O que acontece se eu não mapear?"
                      content="Muitas planilhas não trazem essas colunas. Sem mapeamento, o produto entra com categoria 'Geral', unidade 'Unidade' e embalagem 'Unidade' — dá para ajustar depois no cadastro do produto."
                      position="right"
                    />
                  </span>
                  {TARGET_FIELDS.filter(
                    (field) => !PRICE_REQUIRED_FIELDS.includes(String(field.key))
                  ).map((field) => (
                    <FieldMapper
                      key={field.key}
                      label={field.label}
                      help={`${field.description} Sem mapeamento, usamos o padrão do sistema.`}
                      fixedExample={field.fixedExample}
                      headers={data.headers}
                      choice={mapping[field.key] ?? { kind: "none" }}
                      onChange={(choice) => setMapping((p) => ({ ...p, [field.key]: choice }))}
                    />
                  ))}
                  <FieldMapper
                    label="NCM"
                    help={
                      <div className="flex flex-col gap-2">
                        <Title variant="label" color="amber">
                          Classificação fiscal
                        </Title>
                        <Title variant="body-sm">
                          Código de 8 dígitos que classifica a mercadoria (ex.: 3926.90.90).
                          Fica no cadastro do produto e será usado quando o pedido virar
                          documento fiscal (NF-e).
                        </Title>
                        <Title variant="body-sm" color="muted">
                          Não entra no cálculo do preço — pode deixar sem mapear.
                        </Title>
                      </div>
                    }
                    headers={data.headers}
                    choice={ncmChoice}
                    onChange={setNcmChoice}
                  />
                  {(distinctUnits.length > 0 || distinctPacks.length > 0) && (
                    <Card.Root isCompact className="flex flex-col gap-12">
                      <Reconciliation title="Unidades" values={distinctUnits} existingLabels={unitLabels} recon={unitRecon} onChange={setUnitFinal} />
                      <Reconciliation title="Rótulos de embalagem" values={distinctPacks} existingLabels={packLabels} recon={packRecon} onChange={setPackFinal} />
                    </Card.Root>
                  )}
                </div>
              )}
            </Stepper.Item>

            <Stepper.Item label="Preços">
              {data && (
                <div className="flex flex-col gap-16">
                  <Stepper.Intro step={4} total={6} title="Marque as colunas que têm preço">
                    Diga quais colunas da planilha trazem os preços. Se a fábrica
                    trabalha com mais de um preço (ex.: DIAMANTE, PLATINA, OURO),
                    marque uma coluna para cada um — cada uma vira um nível de
                    preço no sistema. Depois, responda se o preço da planilha é da
                    embalagem fechada ou de uma peça só.
                  </Stepper.Intro>
                  <TierMapper headers={data.headers} tiers={tierColumns} onChange={setTierColumns} />
                  <Card.Root>
                    <div className="flex flex-col gap-8 p-12">
                      <span className="inline-flex items-center gap-4">
                        <Title variant="caption" color="muted">
                          Os preços da planilha são:
                        </Title>
                        <HelpTooltip
                          label="Como saber a semântica do preço?"
                          content="Na dúvida, olhe um produto conhecido: se a torneira aparece por R$ 1,41 e a caixa tem 12 peças, o preço da planilha é por unidade. O sistema sempre grava o preço da embalagem fechada — na opção 'por unidade' nós multiplicamos pelas unidades por embalagem."
                          position="right"
                        />
                      </span>
                      <Input.Radio
                        name="priceSemantics"
                        checked={!pricesPerUnit}
                        onChange={() => setPricesPerUnit(false)}
                        label="Por embalagem fechada (caixa, saco, fardo) — usados como estão"
                      />
                      <Input.Radio
                        name="priceSemantics"
                        checked={pricesPerUnit}
                        onChange={() => setPricesPerUnit(true)}
                        label="Por unidade (peça, kg, m²) — convertemos multiplicando pelas unidades por embalagem"
                      />
                    </div>
                  </Card.Root>
                </div>
              )}
            </Stepper.Item>

            <Stepper.Item label="Impostos">
              {data && (
                <div className="flex flex-col gap-12">
                  <Stepper.Intro step={5} total={6} title="Impostos — só se a planilha tiver">
                    Se a planilha da fábrica tem colunas de impostos (IPI, ST,
                    ICMS…), informe aqui em qual coluna está cada um, para o
                    sistema calcular o preço final com imposto. Se a planilha não
                    traz impostos, ou se você não tem certeza, pode pular este
                    passo e seguir em frente — dá para configurar depois.
                  </Stepper.Intro>

                  <Card.Root>
                    <Card.Header>
                      <Card.Header.Title size="sm" weight="bold">
                        IPI
                      </Card.Header.Title>
                      <Card.Header.Actions>
                        <Badge.Root
                          color={ipiChoice.kind !== "none" ? "green" : "neutral"}
                          appearance="tinted"
                        >
                          <Badge.Text>
                            {ipiChoice.kind !== "none" ? "Mapeado" : "Não usado"}
                          </Badge.Text>
                        </Badge.Root>
                      </Card.Header.Actions>
                    </Card.Header>
                    <Card.Body padding="compact" className="flex flex-col gap-12">
                      <FieldMapper
                        label="Coluna do IPI"
                        help="Alíquota de IPI de cada produto, gravada como imposto do produto."
                        headers={data.headers}
                        choice={ipiChoice}
                        onChange={handleIpiChoice}
                      />
                      {ipiChoice.kind !== "none" && (
                        <div className="flex flex-col gap-8 rounded-md border border-(--border) bg-(--bg2) p-12">
                          <Title variant="caption" color="muted">
                            O IPI da planilha está em:
                          </Title>
                          <Input.Radio
                            name="ipiSemantics"
                            checked={!ipiAsFraction}
                            onChange={() => setIpiAsFraction(false)}
                            label="Percentual (ex.: 3,25 = 3,25%) — usado como está"
                          />
                          <Input.Radio
                            name="ipiSemantics"
                            checked={ipiAsFraction}
                            onChange={() => setIpiAsFraction(true)}
                            label="Fração decimal (ex.: 0,0325 = 3,25%) — convertemos multiplicando por 100"
                          />
                        </div>
                      )}
                    </Card.Body>
                  </Card.Root>

                  <Card.Root>
                    <Card.Header>
                      <Card.Header.Title size="sm" weight="bold">
                        Impostos de alíquota simples
                      </Card.Header.Title>
                      <Card.Header.Actions>
                        <Badge.Root color={validTaxesCount > 0 ? "green" : "neutral"} appearance="tinted">
                          <Badge.Text>
                            {validTaxesCount > 0 ? `${validTaxesCount} mapeado(s)` : "Nenhum"}
                          </Badge.Text>
                        </Badge.Root>
                      </Card.Header.Actions>
                    </Card.Header>
                    <Card.Body padding="compact" className="flex flex-col gap-12">
                      <Title variant="caption" color="muted">
                        Percentuais somados direto por cima do preço (ex.: ICMS, FECP). Cada
                        coluna mapeada vira um imposto com o nome que você der.
                      </Title>
                      <TaxMapper headers={data.headers} taxes={taxColumns} onChange={setTaxColumns} />
                    </Card.Body>
                  </Card.Root>

                  <Card.Root>
                    <Card.Header>
                      <Card.Header.Title size="sm" weight="bold">
                        ST por MVA (substituição tributária)
                      </Card.Header.Title>
                      <Card.Header.Actions>
                        <Badge.Root
                          color={
                            isStMvaComplete(stMva)
                              ? "green"
                              : isStMvaPartial(stMva)
                                ? "amber"
                                : "neutral"
                          }
                          appearance="tinted"
                        >
                          <Badge.Text>
                            {isStMvaComplete(stMva)
                              ? "Configurado"
                              : isStMvaPartial(stMva)
                                ? "Incompleto — mapeie os 3 campos"
                                : "Não usado"}
                          </Badge.Text>
                        </Badge.Root>
                      </Card.Header.Actions>
                    </Card.Header>
                    <Card.Body padding="compact" className="flex flex-col gap-12">
                      <Title variant="caption" color="muted">
                        ST calculado por margem, com o IPI na base: preço × (1+IPI) × (1+MVA) ×
                        alíquota interna − preço × crédito de ICMS. Mapeie os três componentes;
                        produtos com MVA zero ficam fora do regime.
                      </Title>
                      <StMvaFields headers={data.headers} value={stMva} onChange={handleStMvaChange} />
                    </Card.Body>
                  </Card.Root>

                  {hasConfiguredTaxes({ taxColumns, stMva }) && (
                    <Card.Root>
                      <div className="flex flex-col gap-8 p-12">
                        <Title variant="caption" color="muted">
                          As alíquotas desses impostos (simples e ST) estão em:
                        </Title>
                        <Input.Radio
                          name="taxesSemantics"
                          checked={!taxesAsFraction}
                          onChange={() => setTaxesAsFraction(false)}
                          label="Percentual (ex.: 20,5 = 20,5%) — usadas como estão"
                        />
                        <Input.Radio
                          name="taxesSemantics"
                          checked={taxesAsFraction}
                          onChange={() => setTaxesAsFraction(true)}
                          label="Fração decimal (ex.: 0,205 = 20,5%) — convertemos multiplicando por 100"
                        />
                      </div>
                    </Card.Root>
                  )}
                </div>
              )}
            </Stepper.Item>

            <Stepper.Item label="Tabela">
              <div className="flex flex-col gap-12">
                <Stepper.Intro step={6} total={6} title="Para terminar, dê um nome à tabela">
                  Escreva um nome para essa tabela de preços — pode usar o mesmo
                  nome que está na planilha (ex.: LISTA 39). Confira a data de
                  início e, se estiver tudo certo, clique no botão{" "}
                  <b>Importar tabela</b> aqui embaixo.
                </Stepper.Intro>
                <Input.Text label="Nome da tabela" value={listName} placeholder="Ex: LISTA 39 - NORDESTE" disabled={isLoading} onChange={(e: ChangeEvent<HTMLInputElement>) => setListName(e.target.value)} />
                <Input.Text
                  label="Região (opcional)"
                  value={region}
                  placeholder="Ex: NORDESTE, ICMS 7% — vazio = geral"
                  disabled={isLoading}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRegion(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-8">
                  <Input.Date label="Vigência início" value={validFrom} disabled={isLoading} onChange={(d: unknown) => setValidFrom(d instanceof Date ? d : null)} />
                  <Input.Date label="Vigência fim (opcional)" value={validUntil} disabled={isLoading} onChange={(d: unknown) => setValidUntil(d instanceof Date ? d : null)} />
                </div>
                <Alert.Root variant="info">
                  <Alert.Icon icon={Info} />
                  <Alert.Content>
                    <Alert.Description>
                      A nova tabela fica ativa e a anterior da mesma região é desativada — tabelas
                      de outras regiões continuam ativas. Produtos e níveis que não existirem são
                      criados automaticamente.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
                {skippedRows > 0 && (
                  <Alert.Root variant="warning">
                    <Alert.Icon icon={Info} />
                    <Alert.Content>
                      <Alert.Description>
                        {skippedRows} linha(s) da planilha serão ignoradas por não terem código
                        ou descrição (títulos, totais e observações no meio dos dados). Serão
                        importadas {importableRows} linha(s).
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}
                {defaultedCount > 0 && (
                  <Alert.Root variant="warning">
                    <Alert.Icon icon={Info} />
                    <Alert.Content>
                      <Alert.Description>
                        {defaultedCount} produto(s) não têm múltiplo/embalagem na planilha e serão
                        importados com múltiplo 1. Você pode ajustar depois em cada produto.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}
              </div>
            </Stepper.Item>

            <Stepper.Item label="Resultado">
              {result && (
                <div className="flex flex-col gap-12">
                  {result.failed > 0 ? (
                    <Alert.Root variant="warning">
                      <Alert.Icon icon={Info} />
                      <Alert.Content>
                        <Alert.Title>Importação parcial</Alert.Title>
                        <Alert.Description>
                          A tabela &quot;{result.listName}&quot; foi criada, mas {result.failed}{" "}
                          linha(s) falharam — veja os motivos abaixo. Você pode corrigir a
                          planilha e importar de novo: produtos já criados são reaproveitados
                          e os preços são atualizados.
                        </Alert.Description>
                      </Alert.Content>
                    </Alert.Root>
                  ) : skipped.length > 0 || unreadable.length > 0 ? (
                    <Alert.Root variant="warning">
                      <Alert.Icon icon={Info} />
                      <Alert.Content>
                        <Alert.Title>
                          Tabela importada — mas {skipped.length + unreadable.length} linha(s)
                          ficaram de fora
                        </Alert.Title>
                        <Alert.Description>
                          A tabela &quot;{result.listName}&quot; está ativa com {result.totalRows}{" "}
                          linha(s). As linhas abaixo NÃO entraram — confira se há produtos que
                          precisam ser cadastrados à mão ou ajustados na planilha.
                        </Alert.Description>
                      </Alert.Content>
                    </Alert.Root>
                  ) : (
                    <Alert.Root variant="success">
                      <Alert.Icon icon={CheckCircle2} />
                      <Alert.Content>
                        <Alert.Title>Tabela importada com sucesso</Alert.Title>
                        <Alert.Description>
                          A tabela &quot;{result.listName}&quot; está ativa com as{" "}
                          {result.totalRows} linha(s) da planilha — nenhuma ficou de fora.
                        </Alert.Description>
                      </Alert.Content>
                    </Alert.Root>
                  )}
                  <ResultView result={result} />
                  {defaultedPack.length > 0 && (
                    <DefaultedPackView items={defaultedPack} />
                  )}
                  {(skipped.length > 0 || unreadable.length > 0) && (
                    <LeftOutView skipped={skipped} unreadable={unreadable} />
                  )}
                </div>
              )}
            </Stepper.Item>
          </Stepper.Root>
        </Modal.Body>

        <Modal.Footer>
          {result ? (
            // Importação concluída: só resta fechar — reimportar exige reabrir o fluxo.
            <Modal.Close asChild>
              <Button.Root type="button" appearance="solid" color="amber" size="md" noUppercase>
                <Button.Title>Fechar</Button.Title>
              </Button.Root>
            </Modal.Close>
          ) : (
            <>
              {step > 0 && (
                <Button.Root type="button" appearance="ghost" color="neutral" size="md" noUppercase disabled={isLoading} onClick={() => setStep((s) => s - 1)}>
                  <Button.Title>Voltar</Button.Title>
                </Button.Root>
              )}
              {/* Assim que o mapeamento (produto + níveis) está pronto, salvar o
                  modelo independe do nome/vigência da tabela — fica disponível
                  do passo Preços em diante. */}
              {canSaveTemplate(buildArgs) && (
                <Button.Root
                  type="button"
                  appearance="ghost"
                  color="neutral"
                  size="md"
                  noUppercase
                  loading={isLoading}
                  onClick={handleSaveTemplate}
                >
                  <Button.Title>
                    {activeTemplate ? "Atualizar modelo" : "Salvar como modelo"}
                  </Button.Title>
                </Button.Root>
              )}
              {step < 5 ? (
                <Button.Root type="button" appearance="solid" color="amber" size="md" noUppercase disabled={!stepValid[step]} onClick={() => setStep((s) => s + 1)}>
                  <Button.Title>Próximo</Button.Title>
                </Button.Root>
              ) : (
                <Button.Root type="button" appearance="solid" color="amber" size="md" noUppercase loading={isLoading} disabled={!stepValid[5]} onClick={handleImport}>
                  <Button.Title>Importar tabela</Button.Title>
                </Button.Root>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

function ResultView({ result }: { result: ImportPriceListResult }) {
  const imported = result.totalRows - result.failed;
  return (
    <div className="flex flex-col gap-8">
      {/* Reconciliação principal: responde "todas as linhas subiram?" de forma direta. */}
      <Card.Root isCompact className="flex flex-row items-baseline gap-6">
        <Title variant="heading-sm" weight="bold" color={result.failed > 0 ? "amber" : "green"}>
          {imported} de {result.totalRows}
        </Title>
        <Title variant="body-sm" color="muted">
          linha(s) enviada(s) gravada(s)
          {result.failed > 0 ? ` — ${result.failed} falharam (veja abaixo)` : ""}
        </Title>
      </Card.Root>
      <div className="grid grid-cols-4 gap-8">
        <StatCard label="Produtos novos" value={result.productsCreated} tone="green" />
        <StatCard label="Atualizados" value={result.productsReused} tone="muted" />
        <StatCard label="Preços gravados" value={result.pricesSet} tone="green" />
        <StatCard label="Com erro" value={result.failed} tone="red" />
      </div>
      {result.attention > 0 && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Description>
              {result.attention} produto(s) entraram marcados como “Precisa de
              atenção” (produto novo, múltiplo assumido ou sem preço). Eles
              aparecem com a tag na listagem; editar e salvar o produto remove a
              marcação.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {result.errors.length > 0 && (
        <>
          <Title variant="body-sm" weight="medium" className="pt-4">
            Linhas com erro e motivo
          </Title>
          <Card.Root isCompact className="flex max-h-[320px] flex-col gap-4 overflow-y-auto">
            {result.errors.map((err) => (
              <Title key={`${err.row}-${err.sku}`} variant="caption">
                <Title variant="caption" color="red" weight="medium" className="inline">
                  Linha {err.row}
                </Title>
                {err.sku ? ` (SKU ${err.sku})` : ""} — {err.message}
              </Title>
            ))}
          </Card.Root>
        </>
      )}
    </div>
  );
}

/** Produtos importados, mas SEM múltiplo na planilha: entraram com múltiplo 1 e
 *  precisam de revisão manual depois. */
function DefaultedPackView({ items }: { items: { sku: string; name: string }[] }) {
  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-sm" weight="medium" color="amber" className="pt-4">
        Importados com múltiplo 1 — revise ({items.length})
      </Title>
      <Title variant="caption" color="muted">
        A planilha não trazia o múltiplo/embalagem destes produtos. Eles entraram com
        múltiplo 1 — abra cada um e ajuste se vender em caixa/fardo.
      </Title>
      <Card.Root isCompact className="flex max-h-[320px] flex-col gap-4 overflow-y-auto">
        {items.map((it, i) => (
          <Title key={`${it.sku}-${i}`} variant="caption">
            <Title variant="caption" color="amber" weight="medium" className="inline">
              {it.sku}
            </Title>
            {it.name ? ` ${it.name}` : ""}
          </Title>
        ))}
      </Card.Root>
    </div>
  );
}

/** Linhas que não chegaram a ser importadas: descartadas no mapeamento (sem
 *  código/descrição) ou ilegíveis no PDF (texto sobreposto). */
function LeftOutView({
  skipped,
  unreadable,
}: {
  skipped: { sku: string; name: string; reason: string }[];
  unreadable: string[];
}) {
  // Produtos identificáveis primeiro (têm código); linhas sem código viram contagem.
  const named = skipped.filter((s) => s.sku);
  const noCode = skipped.length - named.length;
  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-sm" weight="medium" color="amber" className="pt-4">
        Linhas que ficaram de fora ({skipped.length + unreadable.length})
      </Title>
      {(named.length > 0 || unreadable.length > 0) && (
        <Card.Root isCompact className="flex max-h-[320px] flex-col gap-4 overflow-y-auto">
          {named.map((s, i) => (
            <Title key={`named-${s.sku}-${i}`} variant="caption">
              <Title variant="caption" color="amber" weight="medium" className="inline">
                {s.sku}
              </Title>
              {s.name ? ` ${s.name}` : ""} — {s.reason}
            </Title>
          ))}
          {unreadable.map((desc, i) => (
            <Title key={`unreadable-${i}`} variant="caption">
              <Title variant="caption" color="amber" weight="medium" className="inline">
                {desc}
              </Title>{" "}
              — código ilegível no PDF (texto sobreposto); ache o código no arquivo
              e cadastre à mão
            </Title>
          ))}
        </Card.Root>
      )}
      {noCode > 0 && (
        <Title variant="caption" color="muted">
          {noCode} linha(s) sem código foram ignoradas (títulos, totais e observações
          no meio dos dados).
        </Title>
      )}
    </div>
  );
}
