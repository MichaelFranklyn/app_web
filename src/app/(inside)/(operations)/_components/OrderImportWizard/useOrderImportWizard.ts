import { useMutation } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { SelectOption } from "@/components/Input";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { parseNumber } from "@/utils/import/columns";
import {
  guessBestSheet,
  guessHeaderRow,
  readWorkbook,
  SheetMatrix,
  splitAt,
  WorkbookData,
} from "@/utils/import/reader";

import {
  CONFIRM_ORDER_IMPORT_MUTATION,
  EXTRACT_ORDER_FILE_MUTATION,
  PREVIEW_ORDER_IMPORT_MUTATION,
} from "./gql";
import {
  ConfirmOrderImportResponse,
  ExtractedItem,
  ExtractOrderFileResponse,
  ImportResult,
  Mapping,
  PreviewOrderImportResponse,
  ReviewRow,
  SkippedImportItem,
} from "./interface";
import {
  fileToBase64,
  guessMapping,
  guessOrderSheet,
  ImportRow,
  NONE,
  rowsFromItems,
  rowsFromSheet,
  toMoneyMask,
} from "./utils";

// Quantas linhas iniciais aparecem no seletor de "Linha do cabeçalho". Precisa
// cobrir o alcance do palpite (guessHeaderRow varre 15) com folga para o usuário
// apontar um cabeçalho mais fundo em planilhas-formulário.
const HEADER_OPTION_ROWS = 20;

/** Fluxo em que o pedido ainda NÃO existe: só é criado na confirmação final. */
export interface DeferredOrderTarget {
  factoryId: string;
  clientId: string;
  /**
   * Cria o pedido na hora de confirmar e devolve o id. DEVE memoizar o id em
   * re-tentativas (uma falha ao gravar itens não pode criar um segundo pedido).
   */
  createOrder: () => Promise<string>;
}

interface UseOrderImportWizardArgs {
  /** Pedido existente (detalhe do pedido). Ausente → use `deferred`. */
  orderId?: string | null;
  deferred?: DeferredOrderTarget;
  /** Fábrica cobra IPI no pedido: habilita mapear/editar a alíquota por item. */
  ipiInOrder?: boolean;
  onImported: () => void;
  onBusyChange?: (busy: boolean) => void;
}

export function useOrderImportWizard({
  orderId,
  deferred,
  ipiInOrder = false,
  onImported,
  onBusyChange,
}: UseOrderImportWizardArgs) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File[]>([]);
  // Excel com várias abas: guardamos o workbook e a aba escolhida para o
  // seletor de aba (a "PEDIDO" costuma não ser a maior — essa é o catálogo).
  const [workbook, setWorkbook] = useState<WorkbookData | null>(null);
  const [sheetName, setSheetName] = useState<string | null>(null);
  const [matrix, setMatrix] = useState<SheetMatrix | null>(null);
  const [headerIndex, setHeaderIndex] = useState(0);
  // Linhas com cara de item que o backend não conseguiu ler (PDF): avisadas ao
  // usuário para ele não achar que subiram em silêncio.
  const [unreadableRows, setUnreadableRows] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({
    sku: NONE,
    quantity: NONE,
    unitPrice: NONE,
    ipiRate: NONE,
  });
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);

  const { toast } = useToast();
  const { execute, isLoading } = useAsyncAction();
  const [extractFile] = useMutation<ExtractOrderFileResponse>(
    EXTRACT_ORDER_FILE_MUTATION
  );
  const [previewImport] = useMutation<PreviewOrderImportResponse>(
    PREVIEW_ORDER_IMPORT_MUTATION
  );
  const [confirmImport] = useMutation<ConfirmOrderImportResponse>(
    CONFIRM_ORDER_IMPORT_MUTATION
  );

  useEffect(() => onBusyChange?.(isLoading), [isLoading, onBusyChange]);

  const parsedSheet = useMemo(
    () => (matrix ? splitAt(matrix, headerIndex) : null),
    [matrix, headerIndex]
  );

  const headerOptions: SelectOption[] = useMemo(() => {
    if (!matrix) return [];
    // Cobre com folga o alcance do palpite (guessHeaderRow varre as 15 primeiras)
    // e ainda deixa escolher um cabeçalho mais fundo — planilhas de pedido
    // (ex.: PADRÃO FORTE) trazem o cabeçalho real após um bloco de dados do
    // cliente, no índice ~12. Com o corte antigo (12) a linha certa nem aparecia
    // na lista e o seletor ficava vazio, apesar de a amostra abaixo estar certa.
    return matrix.slice(0, HEADER_OPTION_ROWS).map((row, index) => {
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

  const applyMatrix = (parsed: SheetMatrix) => {
    const guessed = guessHeaderRow(parsed);
    setMatrix(parsed);
    setHeaderIndex(guessed);
    setMapping(guessMapping(splitAt(parsed, guessed).headers));
    setStep(1);
  };

  const handleFiles = async (files: File[]) => {
    setResult(null);
    setReviewRows([]);
    setUnreadableRows([]);
    setWorkbook(null);
    setSheetName(null);
    setFile(files);
    const selected = files[0];
    if (!selected) {
      setMatrix(null);
      return;
    }
    const isPdf = /\.pdf$/i.test(selected.name);
    await execute(
      async (): Promise<
        | { items: ExtractedItem[] }
        | { matrix: SheetMatrix }
        | { workbook: WorkbookData; sheet: string }
      > => {
        if (isPdf) {
          const base64 = await fileToBase64(selected);
          const target = orderId
            ? { orderId }
            : { factoryId: deferred?.factoryId };
          const res = await extractFile({
            variables: {
              input: { ...target, fileName: selected.name, fileBase64: base64 },
            },
          });
          const payload = res.data?.extractOrderFile;
          if (!payload?.status || !payload.data) {
            throw new Error(payload?.message ?? "Não foi possível ler o PDF.");
          }
          setUnreadableRows(payload.data.unreadableRows ?? []);
          // Fábrica com modelo de pedido: os itens já vêm prontos do backend →
          // pula o mapeamento de colunas e vai direto para a revisão.
          if (payload.data.items && payload.data.items.length > 0) {
            return { items: payload.data.items };
          }
          return { matrix: payload.data.rows };
        }
        const parsed = await readWorkbook(selected);
        // Prefere a aba do PEDIDO; o usuário troca no seletor se errarmos.
        const sheet = guessOrderSheet(parsed) ?? guessBestSheet(parsed);
        if (!sheet) throw new Error("A planilha está vazia.");
        return { workbook: parsed, sheet };
      },
      {
        onSuccess: (out) => {
          if ("items" in out) void previewItems(out.items);
          else if ("workbook" in out) {
            setWorkbook(out.workbook);
            setSheetName(out.sheet);
            applyMatrix(out.workbook.sheets[out.sheet] ?? []);
          } else applyMatrix(out.matrix);
        },
        onError: () => {
          setMatrix(null);
          setFile([]);
        },
      }
    );
  };

  const sheetOptions: SelectOption[] = useMemo(
    () =>
      workbook?.sheetNames.map((name) => ({
        value: name,
        label: `${name} (${workbook.sheets[name]?.length ?? 0} linhas)`,
      })) ?? [],
    [workbook]
  );

  const onSheetChange = (name: string) => {
    if (!workbook || name === sheetName) return;
    setSheetName(name);
    applyMatrix(workbook.sheets[name] ?? []);
  };

  // Casa as linhas (do mapeamento manual OU do modelo da fábrica) e abre a revisão.
  const runPreviewRows = async (rows: ImportRow[]) => {
    if (rows.length === 0) {
      toast({
        variant: "error",
        title: "Sem itens",
        description:
          "Nenhuma linha com código do produto e quantidade válidos foi encontrada.",
      });
      return;
    }
    await execute(
      async () => {
        const target = orderId
          ? { orderId }
          : {
              factoryId: deferred?.factoryId,
              clientId: deferred?.clientId,
            };
        // O preview casa por SKU/preço; o IPI viaja à parte (alinhado por
        // rowIndex) e só entra na confirmação — o backend do preview não o aceita.
        const previewRows = rows.map(({ sku, quantity, unitPrice }) => ({
          sku,
          quantity,
          unitPrice,
        }));
        const res = await previewImport({
          variables: { input: { ...target, rows: previewRows } },
        });
        const payload = res.data?.previewOrderImport;
        if (!payload?.status || !payload.data) {
          throw new Error(
            payload?.message ?? "Erro ao pré-visualizar a importação."
          );
        }
        return payload.data.candidates;
      },
      {
        onSuccess: (candidates) => {
          setReviewRows(
            candidates.map((c) => ({
              candidate: c,
              include: c.matched && Boolean(c.tierId),
              tierId: c.tierId,
              quantity: c.quantity,
              unitPrice: toMoneyMask(c.unitPrice),
              // rowIndex é 1-based sobre as linhas enviadas ao preview.
              ipiRate:
                ipiInOrder && rows[c.rowIndex - 1]?.ipiRate
                  ? String(rows[c.rowIndex - 1].ipiRate)
                  : "",
            }))
          );
          setStep(2);
        },
      }
    );
  };

  const previewItems = (items: ExtractedItem[]) =>
    runPreviewRows(rowsFromItems(items));

  const runPreview = () => runPreviewRows(rowsFromSheet(parsedSheet, mapping));

  const confirmableCount = reviewRows.filter(
    (r) => r.include && r.candidate.productId && r.tierId
  ).length;

  // Itens que o arquivo trouxe mas NÃO podem ser gravados (produto fora de
  // linha/não cadastrado ou sem nível de preço). Não são erro de digitação do
  // usuário: são avisados para ele saber que subiu N e só M entraram.
  const skippedItems: SkippedImportItem[] = reviewRows
    .filter((r) => !r.candidate.productId || !r.tierId)
    .map((r) => ({
      sku: r.candidate.rawSku,
      name: r.candidate.rawName ?? r.candidate.productName,
      reason: !r.candidate.productId
        ? (r.candidate.message ??
          "Produto não encontrado no catálogo desta fábrica.")
        : "Sem nível de preço para gravar.",
    }));

  const runConfirm = async () => {
    const items = reviewRows
      .filter((r) => r.include && r.candidate.productId && r.tierId)
      .map((r) => ({
        productId: r.candidate.productId,
        tierId: r.tierId,
        quantity: parseNumber(r.quantity),
        unitPrice: parseNumber(r.unitPrice),
        // Sempre 0, de propósito: no import o preço vem do arquivo da fábrica,
        // que já é o preço negociado — o desconto costuma estar embutido nele, e
        // aplicar outro por cima descontaria duas vezes. A revisão não pede
        // desconto; quem precisar ajusta no item, no detalhe do pedido (lá o
        // desconto aceita % ou R$). O input do backend aceita `discount`, então
        // a coluna existe se um dia a planilha trouxer o desconto separado.
        discount: 0,
        ipiRate: ipiInOrder ? parseNumber(r.ipiRate) || 0 : 0,
        sku: r.candidate.rawSku,
      }));

    await execute(
      async () => {
        // Fluxo sem pedido prévio: o pedido nasce AQUI, junto com os itens —
        // desistir antes da confirmação não deixa pedido vazio para trás.
        const targetOrderId = orderId ?? (await deferred!.createOrder());
        const res = await confirmImport({
          variables: { input: { orderId: targetOrderId, items } },
        });
        const payload = res.data?.confirmOrderImport;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao importar os itens.");
        }
        return payload.data;
      },
      {
        onSuccess: (r) => {
          setResult(r);
          setStep(3);
          onImported();
          const partial = r.failed > 0 || skippedItems.length > 0;
          const skippedNote = skippedItems.length
            ? ` · ${skippedItems.length} não importado(s) (fora do catálogo)`
            : "";
          toast({
            variant: partial ? "warning" : "success",
            title: partial ? "Importação parcial" : "Itens importados",
            description: `${r.created} item(ns) importado(s), ${r.failed} com erro${skippedNote}.`,
          });
        },
      }
    );
  };

  const updateRow = (index: number, patch: Partial<ReviewRow>) =>
    setReviewRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );

  const onHeaderChange = (index: number) => {
    if (!matrix) return;
    setHeaderIndex(index);
    setMapping(guessMapping(splitAt(matrix, index).headers));
  };

  const canMap =
    mapping.sku.kind !== "none" && mapping.quantity.kind !== "none";

  return {
    step,
    setStep,
    file,
    matrix,
    data: parsedSheet,
    headerIndex,
    mapping,
    setMapping,
    reviewRows,
    result,
    isLoading,
    handleFiles,
    headerOptions,
    onHeaderChange,
    runPreview,
    confirmableCount,
    skippedItems,
    runConfirm,
    updateRow,
    canMap,
    ipiInOrder,
    workbook,
    sheetName,
    sheetOptions,
    onSheetChange,
    unreadableRows,
  };
}
