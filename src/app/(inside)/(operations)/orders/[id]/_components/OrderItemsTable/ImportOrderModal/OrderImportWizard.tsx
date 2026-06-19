"use client";

import { useMutation } from "@apollo/client/react";
import { CheckCircle2, Info } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Modal } from "@/components/Modal";
import { StatCard } from "@/components/StatCard";
import { Stepper } from "@/components/Stepper";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { formatMoney, maskCurrency } from "@/utils/format/masks";

import {
  ColumnChoice,
  parseNumber,
  valueForChoice,
} from "../../../../../factories/[id]/_components/_import/columns";
import { FieldMapper } from "../../../../../factories/[id]/_components/_import/FieldMapper";
import {
  guessBestSheet,
  guessHeaderRow,
  readWorkbook,
  SheetMatrix,
  splitAt,
} from "../../../../../factories/[id]/_components/_import/reader";
import { SheetPreview } from "../../../../../factories/[id]/_components/_import/SheetPreview";
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
  PreviewOrderImportResponse,
  ReviewRow,
} from "./interface";

interface Props {
  orderId: string;
  /** Disparado após gravar itens — recarrega a tabela e os totais do pedido. */
  onImported: () => void;
  /** Informa o pai sobre carregamento em curso (para travar o fechamento do modal). */
  onBusyChange?: (busy: boolean) => void;
  /** Fecha o modal (botão "Fechar" no passo de resultado). */
  onClose: () => void;
}

type Mapping = { sku: ColumnChoice; quantity: ColumnChoice; unitPrice: ColumnChoice };
const NONE: ColumnChoice = { kind: "none" };

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });

/** Palpite de coluna por palavra-chave no cabeçalho (SKU, quantidade, preço). */
const guessMapping = (headers: string[]): Mapping => {
  const find = (...hints: string[]): ColumnChoice => {
    for (const hint of hints) {
      const idx = headers.findIndex((h) => h.toLowerCase().includes(hint));
      if (idx >= 0) return { kind: "column", index: idx };
    }
    return NONE;
  };
  return {
    sku: find("sku", "código", "codigo", "cod", "ref"),
    quantity: find("qtd", "quant", "qtde", "qt"),
    unitPrice: find("preço", "preco", "valor", "unit"),
  };
};

const confidenceTone = (value: number): "green" | "amber" | "red" =>
  value >= 90 ? "green" : value >= 50 ? "amber" : "red";

// O SKU casou (senão seria 0%); a confiança mede o PREÇO/NÍVEL, não o SKU.
const confidenceHelp = (value: number): string => {
  if (value >= 100) return "O preço do arquivo bate com um nível da tabela ativa.";
  if (value >= 90) return "O arquivo não trouxe preço; usamos o preço da tabela ativa.";
  if (value >= 70)
    return (
      "O SKU casou, mas o preço do arquivo não corresponde a nenhum nível da tabela " +
      "(ex.: houve desconto). Escolhemos o nível de preço mais próximo — confira e, " +
      "se precisar, troque o nível ao lado."
    );
  if (value >= 50)
    return "O produto não tem preço na tabela ativa; escolha o nível comercial.";
  return "SKU não encontrado no catálogo desta fábrica.";
};

// Preço vindo do backend ("13.23") → máscara BRL digitável ("13,23"). parseNumber
// continua lendo o valor mascarado na hora de confirmar.
const toMoneyMask = (value: string | null | undefined): string => {
  if (!value) return "";
  const n = parseNumber(String(value));
  return Number.isFinite(n) ? maskCurrency(n.toFixed(2)) : "";
};

/**
 * Núcleo do wizard de importação de itens de pedido (Arquivo → Colunas →
 * Revisão → Resultado). Renderiza Modal.Body + Modal.Footer; quem fornece o
 * Modal.Root/Content/Header é o componente que o usa (detalhe do pedido ou a
 * lista, que cria o pedido antes de montar este wizard).
 */
export function OrderImportWizard({ orderId, onImported, onBusyChange, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File[]>([]);
  const [matrix, setMatrix] = useState<SheetMatrix | null>(null);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [mapping, setMapping] = useState<Mapping>({ sku: NONE, quantity: NONE, unitPrice: NONE });
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);

  const { toast } = useToast();
  const { execute, isLoading } = useAsyncAction();
  const [extractFile] = useMutation<ExtractOrderFileResponse>(EXTRACT_ORDER_FILE_MUTATION);
  const [previewImport] = useMutation<PreviewOrderImportResponse>(PREVIEW_ORDER_IMPORT_MUTATION);
  const [confirmImport] = useMutation<ConfirmOrderImportResponse>(CONFIRM_ORDER_IMPORT_MUTATION);

  useEffect(() => onBusyChange?.(isLoading), [isLoading, onBusyChange]);

  const data = useMemo(() => (matrix ? splitAt(matrix, headerIndex) : null), [matrix, headerIndex]);

  const headerOptions: SelectOption[] = useMemo(() => {
    if (!matrix) return [];
    return matrix.slice(0, 12).map((row, index) => {
      const preview = row.filter((c) => c.trim()).slice(0, 4).join(", ");
      return { value: String(index), label: `Linha ${index + 1}: ${preview || "(vazia)"}` };
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
      async (): Promise<{ items: ExtractedItem[] } | { matrix: SheetMatrix }> => {
        if (isPdf) {
          const base64 = await fileToBase64(selected);
          const res = await extractFile({
            variables: { input: { orderId, fileName: selected.name, fileBase64: base64 } },
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
      .filter((r) => r.sku !== "" && Number.isFinite(r.quantity) && r.quantity > 0);
  };

  // Casa as linhas (do mapeamento manual OU do modelo da fábrica) e abre a revisão.
  const runPreviewRows = async (
    rows: { sku: string; quantity: number; unitPrice: number | null }[]
  ) => {
    if (rows.length === 0) {
      toast({
        variant: "error",
        title: "Sem itens",
        description: "Nenhuma linha com SKU e quantidade válidos foi encontrada.",
      });
      return;
    }
    await execute(
      async () => {
        const res = await previewImport({ variables: { input: { orderId, rows } } });
        const payload = res.data?.previewOrderImport;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao pré-visualizar a importação.");
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
        .filter((r) => r.sku !== "" && Number.isFinite(r.quantity) && r.quantity > 0)
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
        const res = await confirmImport({ variables: { input: { orderId, items } } });
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
    setReviewRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const canMap = mapping.sku.kind !== "none" && mapping.quantity.kind !== "none";

  return (
    <>
      <Modal.Body className="flex flex-col gap-16 py-24">
        <Stepper.Root
          current={step}
          onChange={(index) => {
            if (!result && !isLoading && index < 3) setStep(index);
          }}
        >
          <Stepper.Item label="Arquivo">
            <div className="flex flex-col gap-12">
              <Stepper.Intro step={1} total={4} title="Envie o pedido da fábrica">
                Arraste o arquivo do pedido (PDF ou Excel) para o quadro abaixo.
                PDFs são lidos automaticamente; se for um PDF escaneado (imagem),
                peça a versão em Excel para a fábrica.
              </Stepper.Intro>
              <Input.Archive
                variant="single"
                accept=".pdf,.csv,.xlsx,.xls"
                hint="Pedido em PDF, Excel (.xlsx/.xls) ou CSV."
                value={file}
                onChange={handleFiles}
              />
              {matrix && data && (
                <Alert.Root variant="success">
                  <Alert.Icon icon={CheckCircle2} />
                  <Alert.Content>
                    <Alert.Description>
                      Arquivo lido. Clique em Próximo para conferir as colunas.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}
            </div>
          </Stepper.Item>

          <Stepper.Item label="Colunas">
            {data && (
              <div className="flex flex-col gap-12">
                <Stepper.Intro step={2} total={4} title="Aponte as colunas do pedido">
                  Diga em qual coluna está o código do produto (SKU), a quantidade
                  e — se houver — o preço. Confira a amostra abaixo; se as colunas
                  estiverem deslocadas, ajuste a linha do cabeçalho.
                </Stepper.Intro>
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
                      if (opt && matrix) {
                        const idx = Number(opt.value);
                        setHeaderIndex(idx);
                        setMapping(guessMapping(splitAt(matrix, idx).headers));
                      }
                    }}
                  />
                </div>
                <SheetPreview data={data} />
                <FieldMapper
                  label="SKU / Código"
                  help="Coluna com o código do produto na fábrica, usado para casar com o catálogo."
                  headers={data.headers}
                  choice={mapping.sku}
                  onChange={(choice) => setMapping((p) => ({ ...p, sku: choice }))}
                />
                <FieldMapper
                  label="Quantidade"
                  help="Quantidade pedida, em embalagens fechadas (mesma unidade do cadastro do produto)."
                  headers={data.headers}
                  choice={mapping.quantity}
                  onChange={(choice) => setMapping((p) => ({ ...p, quantity: choice }))}
                />
                <FieldMapper
                  label="Preço (opcional)"
                  help="Preço por embalagem no pedido. Sem mapear, usamos o preço da tabela ativa da fábrica."
                  headers={data.headers}
                  choice={mapping.unitPrice}
                  onChange={(choice) => setMapping((p) => ({ ...p, unitPrice: choice }))}
                />
              </div>
            )}
          </Stepper.Item>

          <Stepper.Item label="Revisão">
            <div className="flex flex-col gap-12">
              <Stepper.Intro step={3} total={4} title="Confira os itens antes de gravar">
                Casamos cada SKU com o catálogo da fábrica. Confira o produto, o
                nível e o preço. Desmarque o que não quer importar. Linhas sem
                produto ou sem nível não podem ser gravadas — ajuste o catálogo e
                importe de novo.
              </Stepper.Intro>
              <Table.Root>
                <Table.Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Incluir</Table.Head>
                      <Table.Head>SKU</Table.Head>
                      <Table.Head>Produto</Table.Head>
                      <Table.Head>Nível</Table.Head>
                      <Table.Head>Qtd</Table.Head>
                      <Table.Head>Preço</Table.Head>
                      <Table.Head>Confiança</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {reviewRows.map((row, index) => {
                      const c = row.candidate;
                      const blocked = !c.productId || !row.tierId;
                      const tierOpts = c.tierOptions.map((o) => ({
                        value: o.tierId,
                        label: `${o.tierName ?? "Nível"} — ${formatMoney(o.unitPrice)}`,
                      }));
                      const tierValue = tierOpts.find((o) => o.value === row.tierId) ?? null;
                      return (
                        <Table.Row key={`${c.rowIndex}-${c.rawSku}`}>
                          <Table.Cell>
                            <Input.Checkbox
                              checked={row.include}
                              disabled={blocked}
                              onChange={() => updateRow(index, { include: !row.include })}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Badge.Root color="subtle" appearance="tinted" size="xs">
                              <Badge.Text>{c.rawSku}</Badge.Text>
                            </Badge.Root>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex flex-col">
                              <Table.CellText variant="strong">
                                {c.productName ?? "Produto não encontrado"}
                              </Table.CellText>
                              {c.message && (
                                <Table.CellText variant="dim2">{c.message}</Table.CellText>
                              )}
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            {!c.productId ? (
                              <Table.CellText variant="dim">—</Table.CellText>
                            ) : tierOpts.length > 0 ? (
                              <Input.Select
                                options={tierOpts}
                                value={tierValue}
                                variant="single"
                                disabledClear
                                onChange={(val: SelectOption | SelectOption[] | null) => {
                                  const opt = Array.isArray(val) ? val[0] : val;
                                  // Trocar o nível NÃO sobrescreve o preço: o pedido pode
                                  // estar com desconto e queremos manter o valor real.
                                  if (opt) updateRow(index, { tierId: opt.value });
                                }}
                              />
                            ) : (
                              <Table.CellText variant="dim">{c.tierName ?? "—"}</Table.CellText>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <Input.Text
                              value={row.quantity}
                              disabled={blocked}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updateRow(index, { quantity: e.target.value })
                              }
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Input.Text
                              inputMode="decimal"
                              value={row.unitPrice}
                              disabled={blocked}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updateRow(index, { unitPrice: maskCurrency(e.target.value) })
                              }
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-4">
                              <Badge.Root
                                color={confidenceTone(Number(c.confidence))}
                                appearance="tinted"
                                size="xs"
                              >
                                <Badge.Text>{Math.round(Number(c.confidence))}%</Badge.Text>
                              </Badge.Root>
                              <HelpTooltip
                                label="O que significa a confiança?"
                                content={
                                  <div className="flex flex-col gap-4">
                                    <span>{confidenceHelp(Number(c.confidence))}</span>
                                    {c.message && (
                                      <span className="opacity-80">{c.message}</span>
                                    )}
                                  </div>
                                }
                              />
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Table>
              </Table.Root>
              <Title variant="caption" color="muted">
                {confirmableCount} item(ns) serão gravados.
              </Title>
            </div>
          </Stepper.Item>

          <Stepper.Item label="Resultado">
            {result && (
              <div className="flex flex-col gap-12">
                <Alert.Root variant={result.failed > 0 ? "warning" : "success"}>
                  <Alert.Icon icon={result.failed > 0 ? Info : CheckCircle2} />
                  <Alert.Content>
                    <Alert.Title>
                      {result.failed > 0 ? "Importação parcial" : "Itens importados"}
                    </Alert.Title>
                    <Alert.Description>
                      {result.created} item(ns) gravado(s) no pedido
                      {result.failed > 0 ? ` · ${result.failed} com erro` : ""}.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
                <div className="grid grid-cols-2 gap-8">
                  <StatCard label="Gravados" value={result.created} tone="green" />
                  <StatCard label="Com erro" value={result.failed} tone="red" />
                </div>
                {result.errors.length > 0 && (
                  <div className="flex max-h-[260px] flex-col gap-4 overflow-y-auto">
                    {result.errors.map((err) => (
                      <Title key={`${err.index}-${err.sku}`} variant="caption">
                        <Title variant="caption" color="red" weight="medium" className="inline">
                          Linha {err.index}
                        </Title>
                        {err.sku ? ` (${err.sku})` : ""} — {err.message}
                      </Title>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Stepper.Item>
        </Stepper.Root>
      </Modal.Body>

      <Modal.Footer>
        {result ? (
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            onClick={onClose}
          >
            <Button.Title>Fechar</Button.Title>
          </Button.Root>
        ) : (
          <>
            {step > 0 && (
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={isLoading}
                onClick={() => setStep((s) => s - 1)}
              >
                <Button.Title>Voltar</Button.Title>
              </Button.Root>
            )}
            {step === 0 && (
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                disabled={!data || isLoading}
                onClick={() => setStep(1)}
              >
                <Button.Title>Próximo</Button.Title>
              </Button.Root>
            )}
            {step === 1 && (
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                loading={isLoading}
                disabled={!canMap}
                onClick={runPreview}
              >
                <Button.Title>Casar produtos</Button.Title>
              </Button.Root>
            )}
            {step === 2 && (
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                loading={isLoading}
                disabled={confirmableCount === 0}
                onClick={runConfirm}
              >
                <Button.Title>Importar {confirmableCount} item(ns)</Button.Title>
              </Button.Root>
            )}
          </>
        )}
      </Modal.Footer>
    </>
  );
}
