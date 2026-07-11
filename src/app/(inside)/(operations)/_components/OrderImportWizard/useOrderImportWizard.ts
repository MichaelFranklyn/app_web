import { useMutation } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { SelectOption } from "@/components/Input/InputSelect";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { parseNumber, valueForChoice } from "@/utils/import/columns";
import {
  guessBestSheet,
  guessHeaderRow,
  readWorkbook,
  SheetMatrix,
  splitAt,
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
} from "./interface";
import { fileToBase64, guessMapping, NONE, toMoneyMask } from "./utils";

interface UseOrderImportWizardArgs {
  orderId: string;
  onImported: () => void;
  onBusyChange?: (busy: boolean) => void;
}

export function useOrderImportWizard({
  orderId,
  onImported,
  onBusyChange,
}: UseOrderImportWizardArgs) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File[]>([]);
  const [matrix, setMatrix] = useState<SheetMatrix | null>(null);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [mapping, setMapping] = useState<Mapping>({
    sku: NONE,
    quantity: NONE,
    unitPrice: NONE,
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

  const data = useMemo(
    () => (matrix ? splitAt(matrix, headerIndex) : null),
    [matrix, headerIndex]
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
    setFile(files);
    const selected = files[0];
    if (!selected) {
      setMatrix(null);
      return;
    }
    const isPdf = /\.pdf$/i.test(selected.name);
    await execute(
      async (): Promise<
        { items: ExtractedItem[] } | { matrix: SheetMatrix }
      > => {
        if (isPdf) {
          const base64 = await fileToBase64(selected);
          const res = await extractFile({
            variables: {
              input: { orderId, fileName: selected.name, fileBase64: base64 },
            },
          });
          const payload = res.data?.extractOrderFile;
          if (!payload?.status || !payload.data) {
            throw new Error(payload?.message ?? "Não foi possível ler o PDF.");
          }
          // Fábrica com modelo de pedido: os itens já vêm prontos do backend →
          // pula o mapeamento de colunas e vai direto para a revisão.
          if (payload.data.items && payload.data.items.length > 0) {
            return { items: payload.data.items };
          }
          return { matrix: payload.data.rows };
        }
        const workbook = await readWorkbook(selected);
        const best = guessBestSheet(workbook);
        if (!best) throw new Error("A planilha está vazia.");
        return { matrix: workbook.sheets[best] ?? [] };
      },
      {
        onSuccess: (out) => {
          if ("items" in out) void previewItems(out.items);
          else applyMatrix(out.matrix);
        },
        onError: () => {
          setMatrix(null);
          setFile([]);
        },
      }
    );
  };

  const buildPreviewRows = () => {
    if (!data) return [];
    return data.rows
      .map((cells) => {
        const priceRaw =
          mapping.unitPrice.kind === "none"
            ? NaN
            : parseNumber(valueForChoice(mapping.unitPrice, cells));
        return {
          sku: valueForChoice(mapping.sku, cells).trim(),
          quantity: parseNumber(valueForChoice(mapping.quantity, cells)),
          unitPrice: Number.isFinite(priceRaw) ? priceRaw : null,
        };
      })
      .filter(
        (r) => r.sku !== "" && Number.isFinite(r.quantity) && r.quantity > 0
      );
  };

  // Casa as linhas (do mapeamento manual OU do modelo da fábrica) e abre a revisão.
  const runPreviewRows = async (
    rows: { sku: string; quantity: number; unitPrice: number | null }[]
  ) => {
    if (rows.length === 0) {
      toast({
        variant: "error",
        title: "Sem itens",
        description:
          "Nenhuma linha com SKU e quantidade válidos foi encontrada.",
      });
      return;
    }
    await execute(
      async () => {
        const res = await previewImport({
          variables: { input: { orderId, rows } },
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
            }))
          );
          setStep(2);
        },
      }
    );
  };

  const previewItems = (items: ExtractedItem[]) =>
    runPreviewRows(
      items
        .map((it) => {
          const price = it.unitPrice != null ? parseNumber(it.unitPrice) : null;
          return {
            sku: it.sku.trim(),
            quantity: parseNumber(it.quantity),
            unitPrice: price != null && Number.isFinite(price) ? price : null,
          };
        })
        .filter(
          (r) => r.sku !== "" && Number.isFinite(r.quantity) && r.quantity > 0
        )
    );

  const runPreview = () => runPreviewRows(buildPreviewRows());

  const confirmableCount = reviewRows.filter(
    (r) => r.include && r.candidate.productId && r.tierId
  ).length;

  const runConfirm = async () => {
    const items = reviewRows
      .filter((r) => r.include && r.candidate.productId && r.tierId)
      .map((r) => ({
        productId: r.candidate.productId,
        tierId: r.tierId,
        quantity: parseNumber(r.quantity),
        unitPrice: parseNumber(r.unitPrice),
        discount: 0,
        sku: r.candidate.rawSku,
      }));

    await execute(
      async () => {
        const res = await confirmImport({
          variables: { input: { orderId, items } },
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
          toast({
            variant: r.failed > 0 ? "warning" : "success",
            title: r.failed > 0 ? "Importação parcial" : "Itens importados",
            description: `${r.created} item(ns) importado(s), ${r.failed} com erro.`,
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
    data,
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
    runConfirm,
    updateRow,
    canMap,
  };
}
