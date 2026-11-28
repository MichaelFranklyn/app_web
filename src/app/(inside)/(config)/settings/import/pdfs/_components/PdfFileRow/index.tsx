"use client";

import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { DocumentNumber } from "@/components/DocumentNumber";
import { Grid } from "@/components/Grid";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { formatDate, parseLocalDate, toIsoDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";
import { Info, RotateCw, Trash2 } from "lucide-react";
import React, { useState } from "react";

import { HistoryOrderStatus, MatchOption } from "../../../interface";
import { STATUS_OPTIONS } from "../../../utils";
import { PdfDefaults, PdfFileOverride, PdfImportFile } from "../../interface";
import {
  fileBadge,
  fileBlocker,
  fileClientDocument,
  fileClientName,
  fileAmounts,
  fileNeedsClient,
  fileOrderDate,
  filePaymentTerms,
  fileSellerId,
  fileStatus,
  paymentTermsHint,
  pickedId,
  toSelect,
} from "../../utils";
import { DeletePdfFileModal } from "../DeletePdfFileModal";
import { PdfClientFields } from "../PdfClientFields";
import { PdfLearnedNotice } from "../PdfLearnedNotice";

interface Props {
  batchId: string;
  /** A fábrica do lote. */
  factoryId: string;
  defaults: PdfDefaults;
  file: PdfImportFile;
  override?: PdfFileOverride;
  onOverride: (change: PdfFileOverride) => void;
  sellerOptions: MatchOption[];
  canResend: boolean;
  onResend: () => void;
  disabled: boolean;
}

/**
 * Um PDF do lote: o que foi lido dele (cliente, pedido, itens) e o que falta
 * acertar antes de importar — o cliente, a data, o vendedor, a situação. O que
 * não tiver acerto sai pela lixeira. Nada vai ao banco antes de importar.
 */
export function PdfFileRow({
  batchId,
  factoryId,
  defaults,
  file,
  override,
  onOverride,
  sellerOptions,
  canResend,
  onResend,
  disabled,
}: Props) {
  const badge = fileBadge(file);
  const header = file.header;
  const isRead = file.status === "READ";
  const blocker = isRead ? fileBlocker(defaults, file, override) : null;
  const itemCount = file.items?.length ?? 0;
  const stalled = file.status === "PENDING" && file.isStale;
  const needsClient = fileNeedsClient(file);
  const document = fileClientDocument(file, override);
  const clientName = fileClientName(file, override);
  const byCode = file.clientMatchedBy === "FACTORY_CODE";

  const needsDate = isRead && !header?.orderDate;
  const sellers = toSelect(sellerOptions);
  const statuses = toSelect(STATUS_OPTIONS);
  const sellerId = fileSellerId(defaults, file, override);
  const status = fileStatus(defaults, file, override);
  const amount = fileAmounts(file);
  const taxes = amount ? taxesText(amount.ipi, amount.st) : null;
  const paymentTerms = filePaymentTerms(file, override);
  const termsHint = paymentTermsHint(paymentTerms);
  // O CNPJ digitado na prévia pode ou não estar na carteira: não se afirma nada.
  const outsideBase = !file.clientId && Boolean(document) && !needsClient;
  const [deleting, setDeleting] = useState(false);

  const title = header
    ? header.orderNumber
      ? `Pedido ${header.orderNumber}`
      : "Pedido sem número"
    : file.fileName;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>
          {title}
          <Badge.Root color={badge.color} size="sm">
            <Badge.Text>{badge.label}</Badge.Text>
          </Badge.Root>
          {outsideBase && (
            <Badge.Root color="warning" size="sm">
              <Badge.Text>Empresa não cadastrada</Badge.Text>
            </Badge.Root>
          )}
        </Card.Header.Title>
        {header && (
          <Card.Header.Description>{file.fileName}</Card.Header.Description>
        )}
        <Card.Header.Actions>
          <Button.Root
            appearance="tinted"
            color="red"
            size="sm"
            disabled={disabled}
            onClick={() => setDeleting(true)}
          >
            <Button.Icon icon={Trash2} />
            <Button.Title>Excluir PDF</Button.Title>
          </Button.Root>
        </Card.Header.Actions>
      </Card.Header>

      <Card.Body>
        {header && (
          <Card.Kpi.Group>
            <Card.Kpi>
              <Card.Kpi.Label>Total do pedido</Card.Kpi.Label>
              <Card.Kpi.Value status={amount ? "neutral" : "muted"} size="sm">
                {amount ? formatMoney(amount.total) : "Não informado"}
              </Card.Kpi.Value>
              {amount && amount.unpriced > 0 ? (
                <Card.Kpi.Delta>
                  {plural(amount.unpriced, "item sem preço", "itens sem preço")}
                </Card.Kpi.Delta>
              ) : (
                amount &&
                taxes && (
                  <Card.Kpi.Delta>
                    {formatMoney(amount.items)} em itens + {taxes}
                  </Card.Kpi.Delta>
                )
              )}
            </Card.Kpi>
            <Card.Kpi>
              <Card.Kpi.Label>Itens</Card.Kpi.Label>
              <Card.Kpi.Value size="sm">{itemCount}</Card.Kpi.Value>
            </Card.Kpi>
            <Card.Kpi>
              <Card.Kpi.Label>Data do pedido</Card.Kpi.Label>
              <Card.Kpi.Value
                size="sm"
                status={header.orderDate ? "neutral" : "muted"}
              >
                {header.orderDate
                  ? formatDate(header.orderDate)
                  : "Não informado"}
              </Card.Kpi.Value>
            </Card.Kpi>
            <Card.Kpi>
              <Card.Kpi.Label>Condição</Card.Kpi.Label>
              <Card.Kpi.Value
                size="sm"
                status={paymentTerms ? "neutral" : "muted"}
              >
                {paymentTerms ?? "Não informado"}
              </Card.Kpi.Value>
            </Card.Kpi>
          </Card.Kpi.Group>
        )}

        {header && (
          <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
            <Card.Field label="Cliente">
              <div className="flex min-w-0 flex-col gap-2">
                <Title
                  variant="body"
                  color={clientName ? undefined : "muted"}
                  className="break-words"
                >
                  {clientName ?? "Não identificado"}
                </Title>
                {byCode && (
                  <Title variant="body-xs" color="muted">
                    Achado pelo código na fábrica
                  </Title>
                )}
              </div>
            </Card.Field>
            <Card.Field
              label="CNPJ/CPF"
              value={document ? <DocumentNumber value={document} /> : null}
            />
            <Card.Field label="Nota fiscal" value={header.invoiceNumber} />
            <Card.Field label="Código na fábrica" value={header.clientCode} />
            {header.notes && (
              <Grid.Item span={{ base: 1, desktop: 2 }}>
                <Card.Field label="Observações">
                  <Title
                    variant="body"
                    className="break-words whitespace-pre-line"
                  >
                    {header.notes}
                  </Title>
                </Card.Field>
              </Grid.Item>
            )}
          </Grid.Root>
        )}

        {header?.notesPaymentTerms && (
          <Notice variant="warning">
            As observações citam o prazo {header.notesPaymentTerms}, diferente
            da condição
            {header.paymentTerms ? ` ${header.paymentTerms}` : " do pedido"}. O
            pedido entra com a condição e a observação fica nas notas dele;
            confira com a fábrica.
          </Notice>
        )}
        {amount?.printedItems != null && (
          <Notice variant="warning">
            Os itens lidos somam {formatMoney(amount.items)}, mas o PDF diz{" "}
            {formatMoney(amount.printedItems)} em produtos. Algum preço ou
            quantidade pode ter saído errado; confira os itens antes de
            importar.
          </Notice>
        )}
        {file.unreadableRows > 0 && (
          <Notice variant="warning">
            {plural(
              file.unreadableRows,
              "linha do PDF não deu",
              "linhas do PDF não deram"
            )}{" "}
            para ler; confira o pedido depois de importar.
          </Notice>
        )}
        {file.error && <Notice variant="error">{file.error}</Notice>}

        {stalled && (
          <div className="flex flex-wrap items-center gap-8">
            <Title variant="body-xs" color="muted">
              O envio caiu no meio.
              {!canResend && " Escolha o arquivo de novo acima para reenviar."}
            </Title>
            {canResend && (
              <Button.Root
                appearance="outline"
                color="neutral"
                size="sm"
                disabled={disabled}
                onClick={onResend}
              >
                <Button.Icon icon={RotateCw} />
                <Button.Title>Enviar de novo</Button.Title>
              </Button.Root>
            )}
          </div>
        )}

        {isRead && (
          <>
            <Divider.Root />
            <Title variant="micro" color="muted">
              Antes de importar
            </Title>
            <PdfLearnedNotice
              file={file}
              override={override}
              onOverride={onOverride}
              disabled={disabled}
            />
            {needsClient && (
              <PdfClientFields
                factoryId={factoryId}
                readCode={header?.clientCode ?? null}
                override={override}
                onOverride={onOverride}
                disabled={disabled}
              />
            )}
            {/* Uma fileira só no desktop (3 ou 4 campos); no tablet, em pares,
                a Situação ocupa a linha inteira quando sobra sozinha. */}
            <Grid.Root
              cols={{ base: 1, tablet: 2, desktop: needsDate ? 4 : 3 }}
              gap={12}
            >
              {needsDate && (
                <Input.Date
                  label="Data do pedido"
                  required
                  placeholder="dd/mm/aaaa"
                  value={parseLocalDate(fileOrderDate(file, override))}
                  disabled={disabled}
                  onChange={(d) =>
                    onOverride({ orderDate: toIsoDate(d) || null })
                  }
                />
              )}
              <Input.Select
                label="Vendedor"
                required
                placeholder="Escolha o vendedor"
                variant="single"
                options={sellers}
                value={sellers.find((o) => o.value === sellerId) ?? null}
                disabled={disabled}
                onChange={(val) => onOverride({ sellerId: pickedId(val) })}
              />
              <Input.Text
                label="Condição de pagamento"
                placeholder="Ex.: 30/60/90 ou à vista"
                value={override?.paymentTerms ?? header?.paymentTerms ?? ""}
                disabled={disabled}
                hint={termsHint.error ? undefined : termsHint.message}
                error={termsHint.error ? termsHint.message : undefined}
                onChange={(e) => onOverride({ paymentTerms: e.target.value })}
              />
              <Grid.Item span={{ tablet: needsDate ? 1 : 2, desktop: 1 }}>
                <Input.Select
                  label="Situação"
                  required
                  placeholder="Escolha a situação"
                  variant="single"
                  options={statuses}
                  value={statuses.find((o) => o.value === status) ?? null}
                  disabled={disabled}
                  onChange={(val) =>
                    onOverride({
                      status:
                        (pickedId(val) as HistoryOrderStatus) ?? undefined,
                    })
                  }
                />
              </Grid.Item>
            </Grid.Root>
            {blocker && (
              <Notice variant="warning">
                Este PDF ainda não entra na importação: {blocker}
              </Notice>
            )}
          </>
        )}
      </Card.Body>
      <DeletePdfFileModal
        batchId={batchId}
        file={file}
        open={deleting}
        onOpenChange={setDeleting}
      />
    </Card.Root>
  );
}

/** Aviso do PDF numa caixa: o que pede conferência não se perde no meio dos dados. */
function Notice({
  variant,
  children,
}: {
  variant: "warning" | "error";
  children: React.ReactNode;
}) {
  return (
    <Alert.Root variant={variant}>
      <Alert.Icon icon={Info} />
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}

/** "R$ 51,29 de IPI + R$ 10,00 de ST"; nulo sem imposto. */
function taxesText(ipi: number, st: number): string | null {
  const parts = [
    ipi > 0 ? `${formatMoney(ipi)} de IPI` : null,
    st > 0 ? `${formatMoney(st)} de ST` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" + ") : null;
}
