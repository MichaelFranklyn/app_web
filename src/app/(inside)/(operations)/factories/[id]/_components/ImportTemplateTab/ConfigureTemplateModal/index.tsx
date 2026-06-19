"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CheckCircle2, Settings2 } from "lucide-react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Modal } from "@/components/Modal";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { formatMoney } from "@/utils/format/masks";

import {
  ColumnChoice,
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
} from "../../_import/reader";
import { SheetPreview } from "../../_import/SheetPreview";
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

interface Props {
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

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });

export function ConfigureTemplateModal({ factoryId, current, onSaved }: Props) {
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
  const [createTemplate] = useMutation<{ createImportTemplate: MutationResponse }>(
    CREATE_IMPORT_TEMPLATE_MUTATION
  );
  const [updateTemplate] = useMutation<{ updateImportTemplate: MutationResponse }>(
    UPDATE_IMPORT_TEMPLATE_MUTATION
  );

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
      : presetById(presetId)?.description ?? null;

  /** Texto do formato detectado, para confirmar ao usuário o que reconhecemos. */
  const detectedLabel = detectedPreset ? presetById(detectedPreset)?.label ?? null : null;

  const sheet = useMemo(
    () => (matrix ? splitAt(matrix, headerIndex) : null),
    [matrix, headerIndex]
  );

  const headerOptions: SelectOption[] = useMemo(() => {
    if (!matrix) return [];
    return matrix.slice(0, 12).map((row, index) => {
      const sample = row.filter((c) => c.trim()).slice(0, 4).join(", ");
      return { value: String(index), label: `Linha ${index + 1}: ${sample || "(vazia)"}` };
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
          unitPrice: price != null && Number.isFinite(price) ? String(price) : null,
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
              recipe: { preset: presetId, priceIndex: idx === "none" ? null : idx },
            },
          },
        });
        const payload = res.data?.extractOrderFile;
        if (!payload?.status || !payload.data?.items) {
          throw new Error(payload?.message ?? "Não foi possível ler o PDF com este modelo.");
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
        ...(priceSample.priceOptions ?? []).map((v, i) => ({ value: String(i), label: v })),
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
      c.kind === "column" ? { kind: "column", index: c.index } : { kind: "none" };
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
          if (!payload?.status) throw new Error(payload?.message ?? "Erro ao salvar o modelo.");
          return payload;
        }
        const res = await createTemplate({
          variables: { input: { factoryId, companyId: null, ...shared } },
        });
        const payload = res.data?.createImportTemplate;
        if (!payload?.status) throw new Error(payload?.message ?? "Erro ao salvar o modelo.");
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
    (isPdf || (mapping.sku.kind !== "none" && mapping.quantity.kind !== "none"));
  const hasConcretePreset = !isPdf || presetId !== AUTO || !!detectedPreset;
  const canSave =
    canPreview && !!preview && preview.length > 0 && hasConcretePreset;

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance={current ? "outline" : "solid"} color={current ? "neutral" : "amber"} size="sm">
          <Button.Icon icon={Settings2} />
          <Button.Title>{current ? "Reconfigurar modelo" : "Configurar modelo"}</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="lg">
        <Modal.Header
          title="Modelo de pedido da fábrica"
          description="Envie um pedido de exemplo desta fábrica e diga o formato. Nas próximas importações, o pedido já vem lido automaticamente."
        />

        <Modal.Body className="flex flex-col gap-16 py-16">
          <Input.Archive
            variant="single"
            accept=".pdf,.csv,.xlsx,.xls"
            hint="Pedido de exemplo desta fábrica em PDF, Excel (.xlsx/.xls) ou CSV."
            value={file}
            onChange={handleFiles}
          />

          {file[0] && (
            <div className="grid grid-cols-[190px_1fr] items-center gap-8">
              <Title variant="body-sm" weight="medium">
                Tipo de pedido
              </Title>
              <Input.Select
                options={presetOptions}
                value={presetOptions.find((o) => o.value === presetId) ?? null}
                variant="single"
                placeholder="Selecione o formato do pedido"
                onChange={(val: SelectOption | SelectOption[] | null) => {
                  const opt = Array.isArray(val) ? val[0] : val;
                  setPresetId(opt?.value ?? "");
                  setPreview(null);
                }}
              />
            </div>
          )}

          {presetDescription && (
            <Alert.Root variant="info">
              <Alert.Content>
                <Alert.Description>{presetDescription}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {!isPdf && sheet && (
            <div className="flex flex-col gap-12">
              <div className="grid grid-cols-[190px_1fr] items-center gap-8">
                <Title variant="body-sm" weight="medium">
                  Linha do cabeçalho
                </Title>
                <Input.Select
                  options={headerOptions}
                  value={headerOptions.find((o) => o.value === String(headerIndex)) ?? null}
                  variant="single"
                  disabledClear
                  onChange={(val: SelectOption | SelectOption[] | null) => {
                    const opt = Array.isArray(val) ? val[0] : val;
                    if (opt) setHeaderIndex(Number(opt.value));
                    setPreview(null);
                  }}
                />
              </div>
              <SheetPreview data={sheet} />
              <FieldMapper
                label="Código (SKU)"
                help="Coluna com o código do produto na fábrica."
                headers={sheet.headers}
                choice={mapping.sku}
                onChange={(choice) => {
                  setMapping((p) => ({ ...p, sku: choice }));
                  setPreview(null);
                }}
              />
              <FieldMapper
                label="Quantidade"
                help="Quantidade pedida, em embalagens fechadas."
                headers={sheet.headers}
                choice={mapping.quantity}
                onChange={(choice) => {
                  setMapping((p) => ({ ...p, quantity: choice }));
                  setPreview(null);
                }}
              />
              <FieldMapper
                label="Preço (opcional)"
                help="Sem mapear, usamos o preço da tabela ativa da fábrica."
                headers={sheet.headers}
                choice={mapping.unitPrice}
                onChange={(choice) => {
                  setMapping((p) => ({ ...p, unitPrice: choice }));
                  setPreview(null);
                }}
              />
            </div>
          )}

          {preview && (
            <div className="flex flex-col gap-8">
              <Alert.Root variant={preview.length > 0 ? "success" : "warning"}>
                <Alert.Icon icon={CheckCircle2} />
                <Alert.Content>
                  <Alert.Description>
                    {preview.length > 0
                      ? `${detectedLabel ? `Formato detectado: ${detectedLabel}. ` : ""}${preview.length} item(ns) reconhecido(s) neste exemplo. Confira abaixo e salve o modelo.`
                      : "Nenhum item reconhecido. Tente escolher o formato manualmente no campo acima."}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
              {preview.length > 0 && priceOptions.length > 0 && (
                <div className="grid grid-cols-[190px_1fr] items-center gap-8">
                  <Title variant="body-sm" weight="medium">
                    Qual valor é o preço unitário?
                  </Title>
                  <Input.Select
                    options={priceOptions}
                    value={
                      priceOptions.find(
                        (o) => o.value === (priceIndex === "none" ? "none" : String(priceIndex))
                      ) ?? null
                    }
                    variant="single"
                    disabledClear
                    onChange={onChangePriceIndex}
                  />
                </div>
              )}
              {preview.length > 0 && (
                <Table.Root>
                  <Table.Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Código</Table.Head>
                        <Table.Head>Quantidade</Table.Head>
                        <Table.Head>Preço</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {preview.slice(0, 30).map((item, index) => (
                        <Table.Row key={`${item.sku}-${index}`}>
                          <Table.Cell variant="strong">{item.sku}</Table.Cell>
                          <Table.Cell variant="dim">{item.quantity}</Table.Cell>
                          <Table.Cell variant="dim">
                            {item.unitPrice ? formatMoney(item.unitPrice) : "—"}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Table>
                </Table.Root>
              )}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root type="button" appearance="ghost" color="neutral" size="md" noUppercase disabled={isLoading}>
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          {!preview || preview.length === 0 ? (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              loading={isLoading}
              disabled={!canPreview}
              onClick={runPreview}
            >
              <Button.Title>Pré-visualizar</Button.Title>
            </Button.Root>
          ) : (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              loading={isLoading}
              disabled={!canSave}
              onClick={handleSave}
            >
              <Button.Title>Salvar modelo</Button.Title>
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
