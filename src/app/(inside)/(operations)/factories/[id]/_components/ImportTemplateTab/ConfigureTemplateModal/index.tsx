"use client";

import { CheckCircle2, Settings2 } from "lucide-react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { FieldMapper, SheetPreview } from "@/components/Import";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Modal } from "@/components/Modal";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";

import {
  ConfigureTemplateModalProps,
  useConfigureTemplate,
} from "./useConfigureTemplate";

export function ConfigureTemplateModal(props: ConfigureTemplateModalProps) {
  const { current } = props;
  const {
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
  } = useConfigureTemplate(props);

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root
          appearance={current ? "outline" : "solid"}
          color={current ? "neutral" : "amber"}
          size="sm"
        >
          <Button.Icon icon={Settings2} />
          <Button.Title>
            {current ? "Reconfigurar modelo" : "Configurar modelo"}
          </Button.Title>
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
                  value={
                    headerOptions.find(
                      (o) => o.value === String(headerIndex)
                    ) ?? null
                  }
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
                        (o) =>
                          o.value ===
                          (priceIndex === "none" ? "none" : String(priceIndex))
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
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
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
