import { useMutation } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { SelectOption } from "@/components/Input/InputSelect";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { fileToBase64 } from "@/utils/file";
import {
  ColumnChoice,
  parseNumber,
  valueForChoice,
} from "@/utils/import/columns";
import {
  guessBestSheet,
  guessHeaderRow,
  readWorkbook,
  SheetMatrix,
  splitAt,
} from "@/utils/import/reader";

import {
  CREATE_IMPORT_TEMPLATE_MUTATION,
  EXTRACT_ORDER_FILE_PREVIEW_MUTATION,
  UPDATE_IMPORT_TEMPLATE_MUTATION,
} from "../gql";
import {
  ExtractOrderFileResponse,
  ImportTemplateNode,
  MutationResponse,
  PreviewItem,
} from "../interface";
import {
  isPdfName,
  PDF_PRESETS,
  presetById,
  SPREADSHEET_PRESET,
} from "../presets";

const AUTO = "auto";
const AUTO_LABEL = "Detectar automaticamente (recomendado)";

export interface ConfigureTemplateModalProps {
  factoryId: string;
  /** Template ativo atual (para reconfigurar/versionar) ou null para criar. */
  current: ImportTemplateNode | null;
  onSaved: () => void;
}

type Mapping = {
  sku: ColumnChoice;
  quantity: ColumnChoice;
  unitPrice: ColumnChoice;
};
const NONE: ColumnChoice = { kind: "none" };

export function useConfigureTemplate({
  factoryId,
  current,
  onSaved,
}: ConfigureTemplateModalProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File[]>([]);
  const [isPdf, setIsPdf] = useState(false);
  const [presetId, setPresetId] = useState<string>("");

  // Planilha (Excel/CSV): grade + cabeçalho + mapeamento de colunas.
  const [matrix, setMatrix] = useState<SheetMatrix | null>(null);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [mapping, setMapping] = useState<Mapping>({
    sku: NONE,
    quantity: NONE,
    unitPrice: NONE,
  });

  const [preview, setPreview] = useState<PreviewItem[] | null>(null);
  // Preset concreto detectado pelo backend quando o usuário deixa em "auto".
  const [detectedPreset, setDetectedPreset] = useState<string | null>(null);
  // Qual valor "R$" é o preço unitário (PDF multilinha). number = índice; "none" = sem preço.
  const [priceIndex, setPriceIndex] = useState<number | "none">(0);

  const { execute, isLoading } = useAsyncAction();
  const [extractPreview] = useMutation<ExtractOrderFileResponse>(
    EXTRACT_ORDER_FILE_PREVIEW_MUTATION
  );
  const [createTemplate] = useMutation<{
    createImportTemplate: MutationResponse;
  }>(CREATE_IMPORT_TEMPLATE_MUTATION);
  const [updateTemplate] = useMutation<{
    updateImportTemplate: MutationResponse;
  }>(UPDATE_IMPORT_TEMPLATE_MUTATION);

  const presetOptions: SelectOption[] = useMemo(() => {
    if (isPdf) {
      return [
        { value: AUTO, label: AUTO_LABEL },
        ...PDF_PRESETS.map((p) => ({ value: p.id, label: p.label })),
      ];
    }
    return [{ value: SPREADSHEET_PRESET.id, label: SPREADSHEET_PRESET.label }];
  }, [isPdf]);

  // Descrição mostrada abaixo do seletor (auto tem texto próprio).
  const presetDescription =
    presetId === AUTO
      ? "Vamos descobrir o formato do pedido sozinhos a partir do exemplo enviado."
      : (presetById(presetId)?.description ?? null);

  /** Texto do formato detectado, para confirmar ao usuário o que reconhecemos. */
  const detectedLabel = detectedPreset
    ? (presetById(detectedPreset)?.label ?? null)
    : null;

  const sheet = useMemo(
    () => (matrix ? splitAt(matrix, headerIndex) : null),
    [matrix, headerIndex]
  );

  const headerOptions: SelectOption[] = useMemo(() => {
    if (!matrix) return [];
    return matrix.slice(0, 12).map((row, index) => {
      const sample = row
        .filter((c) => c.trim())
        .slice(0, 4)
        .join(", ");
      return {
        value: String(index),
        label: `Linha ${index + 1}: ${sample || "(vazia)"}`,
      };
    });
  }, [matrix]);

  const resetFlow = () => {
    setFile([]);
    setMatrix(null);
    setHeaderIndex(0);
    setMapping({ sku: NONE, quantity: NONE, unitPrice: NONE });
    setPreview(null);
    setDetectedPreset(null);
    setPriceIndex(0);
    setPresetId("");
    setIsPdf(false);
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) resetFlow();
  };

  const handleFiles = async (files: File[]) => {
    setFile(files);
    setPreview(null);
    setDetectedPreset(null);
    setPriceIndex(0);
    const selected = files[0];
    if (!selected) {
      setMatrix(null);
      return;
    }
    const pdf = isPdfName(selected.name);
    setIsPdf(pdf);
    // PDF começa em detecção automática; planilha usa mapeamento de colunas.
    setPresetId(pdf ? AUTO : SPREADSHEET_PRESET.id);
    if (pdf) {
      setMatrix(null);
      return;
    }
    // Planilha: lê no browser e adivinha cabeçalho/colunas.
    await execute(
      async () => {
        const workbook = await readWorkbook(selected);
        const best = guessBestSheet(workbook);
        if (!best) throw new Error("A planilha está vazia.");
        return workbook.sheets[best] ?? [];
      },
      {
        onSuccess: (rows) => {
          const guessed = guessHeaderRow(rows);
          setMatrix(rows);
          setHeaderIndex(guessed);
        },
        onError: () => setMatrix(null),
      }
    );
  };

  const buildSpreadsheetPreview = (): PreviewItem[] => {
    if (!sheet) return [];
    return sheet.rows
      .map((cells) => {
        const qty = parseNumber(valueForChoice(mapping.quantity, cells));
        const price =
          mapping.unitPrice.kind === "none"
            ? null
            : parseNumber(valueForChoice(mapping.unitPrice, cells));
        return {
          sku: valueForChoice(mapping.sku, cells).trim(),
          name: null,
          quantity: Number.isFinite(qty) ? String(qty) : "0",
          unitPrice:
            price != null && Number.isFinite(price) ? String(price) : null,
        };
      })
      .filter((r) => r.sku !== "" && Number(r.quantity) > 0);
  };

  const previewPdf = async (idx: number | "none") => {
    const selected = file[0];
    if (!selected || !presetId) return;
    await execute(
      async () => {
        const base64 = await fileToBase64(selected);
        const res = await extractPreview({
          variables: {
            input: {
              fileName: selected.name,
              fileBase64: base64,
              recipe: {
                preset: presetId,
                priceIndex: idx === "none" ? null : idx,
              },
            },
          },
        });
        const payload = res.data?.extractOrderFile;
        if (!payload?.status || !payload.data?.items) {
          throw new Error(
            payload?.message ?? "Não foi possível ler o PDF com este modelo."
          );
        }
        return payload.data;
      },
      {
        onSuccess: (out) => {
          setPreview(out.items ?? []);
          // Em "auto", guarda o preset concreto detectado (p/ salvar depois).
          setDetectedPreset(presetId === AUTO ? out.detectedPreset : presetId);
        },
      }
    );
  };

  const runPreview = async () => {
    if (isPdf) {
      await previewPdf(priceIndex);
      return;
    }
    setPreview(buildSpreadsheetPreview());
  };

  // Item de amostra com valores "R$" p/ montar o seletor de preço unitário.
  const priceSample = preview?.find((it) => (it.priceOptions?.length ?? 0) > 0);
  const priceOptions: SelectOption[] = priceSample
    ? [
        ...(priceSample.priceOptions ?? []).map((v, i) => ({
          value: String(i),
          label: v,
        })),
        { value: "none", label: "Sem preço (usar a tabela da fábrica)" },
      ]
    : [];

  const onChangePriceIndex = (val: SelectOption | SelectOption[] | null) => {
    const opt = Array.isArray(val) ? val[0] : val;
    if (!opt) return;
    const next = opt.value === "none" ? "none" : Number(opt.value);
    setPriceIndex(next);
    void previewPdf(next);
  };

  const buildConfig = (): Record<string, unknown> => {
    // Em PDF, salva sempre o preset CONCRETO (nunca "auto") + o preço escolhido.
    if (isPdf) {
      return {
        preset: presetId === AUTO ? detectedPreset : presetId,
        priceIndex: priceIndex === "none" ? null : priceIndex,
      };
    }
    const asColumn = (c: ColumnChoice) =>
      c.kind === "column"
        ? { kind: "column", index: c.index }
        : { kind: "none" };
    return {
      preset: "column_mapping",
      headerRow: headerIndex,
      columns: {
        sku: asColumn(mapping.sku),
        quantity: asColumn(mapping.quantity),
        unitPrice: asColumn(mapping.unitPrice),
      },
    };
  };

  const fileTypeOf = (name: string): "PDF" | "XLSX" | "CSV" => {
    if (isPdfName(name)) return "PDF";
    return /\.csv$/i.test(name) ? "CSV" : "XLSX";
  };

  const handleSave = async () => {
    const selected = file[0];
    if (!selected) return;
    await execute(
      async () => {
        const base64 = await fileToBase64(selected);
        const config = buildConfig();
        const shared = {
          fileType: fileTypeOf(selected.name),
          parserStrategy: isPdf ? "FIXED_LAYOUT" : "COLUMN_MAPPING",
          config,
          sampleFileBase64: base64,
          sampleFileName: selected.name,
        };
        if (current) {
          const res = await updateTemplate({
            variables: { id: current.id, input: shared },
          });
          const payload = res.data?.updateImportTemplate;
          if (!payload?.status)
            throw new Error(payload?.message ?? "Erro ao salvar o modelo.");
          return payload;
        }
        const res = await createTemplate({
          variables: { input: { factoryId, companyId: null, ...shared } },
        });
        const payload = res.data?.createImportTemplate;
        if (!payload?.status)
          throw new Error(payload?.message ?? "Erro ao salvar o modelo.");
        return payload;
      },
      {
        successMessage: "Modelo de pedido salvo",
        onSuccess: () => {
          onSaved();
          handleClose(false);
        },
      }
    );
  };

  const canPreview =
    !!file[0] &&
    !!presetId &&
    (isPdf ||
      (mapping.sku.kind !== "none" && mapping.quantity.kind !== "none"));
  const hasConcretePreset = !isPdf || presetId !== AUTO || !!detectedPreset;
  const canSave =
    canPreview && !!preview && preview.length > 0 && hasConcretePreset;

  return {
    open,
    handleClose,
    file,
    handleFiles,
    presetOptions,
    presetId,
    setPresetId,
    presetDescription,
    isPdf,
    sheet,
    headerOptions,
    headerIndex,
    setHeaderIndex,
    mapping,
    setMapping,
    preview,
    setPreview,
    detectedLabel,
    priceOptions,
    priceIndex,
    onChangePriceIndex,
    canPreview,
    canSave,
    runPreview,
    handleSave,
    isLoading,
  };
}
