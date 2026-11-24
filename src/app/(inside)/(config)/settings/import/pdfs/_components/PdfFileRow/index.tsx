"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DocumentNumber } from "@/components/DocumentNumber";
import { Input, SelectOption } from "@/components/Input";
import { Title } from "@/components/Title";
import { parseLocalDate, toIsoDate } from "@/utils/format/date";
import { plural } from "@/utils/format/plural";
import { RotateCw } from "lucide-react";

import { MatchOption } from "../../../interface";
import {
  PdfFileOverride,
  PdfImportBatch,
  PdfImportFile,
} from "../../interface";
import {
  fileBadge,
  fileBlocker,
  fileClientDocument,
  fileOrderDate,
  fileSellerId,
} from "../../utils";

interface Props {
  batch: PdfImportBatch;
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
 * acertar antes de importar — a data, o vendedor, ou deixá-lo de fora.
 */
export function PdfFileRow({
  batch,
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
  const skipped = Boolean(override?.skip);
  const blocker =
    isRead && !skipped ? fileBlocker(batch, file, override) : null;
  const itemCount = file.items?.length ?? 0;
  const stalled = file.status === "PENDING" && file.isStale;
  const document = fileClientDocument(file);
  const byCode = file.clientMatchedBy === "FACTORY_CODE";

  const needsDate = isRead && !header?.orderDate;
  const needsSeller = isRead && !batch.sellerId && !file.suggestedSellerId;
  const sellers: SelectOption[] = sellerOptions.map((o) => ({
    value: o.id,
    label: o.label,
  }));
  const sellerId = fileSellerId(batch, file, override);

  return (
    <Card.Root inset tone="transparent">
      <Card.Body padding="sm">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <Title variant="body-sm" weight="medium" className="break-all">
            {file.fileName}
          </Title>
          <Badge.Root color={badge.color} size="sm">
            <Badge.Text>{badge.label}</Badge.Text>
          </Badge.Root>
        </div>

        {header && (
          <div className="flex flex-col gap-2">
            <Title variant="body-xs" color="muted">
              {file.clientName ??
                header.clientName ??
                "Cliente não identificado"}
              {document && (
                <>
                  {" · "}
                  <DocumentNumber value={document} />
                </>
              )}
              {byCode && ` · achado pelo código ${header.clientCode}`}
              {!byCode && header.clientCode && ` · código ${header.clientCode}`}
              {!file.clientId && document && " · fora da carteira"}
            </Title>
            <Title variant="body-xs" color="muted">
              {header.orderNumber
                ? `Pedido ${header.orderNumber}`
                : "Pedido sem número"}
              {` · ${plural(itemCount, "item", "itens")}`}
              {header.invoiceNumber && ` · NF ${header.invoiceNumber}`}
            </Title>
            {header.paymentTerms && (
              <Title variant="body-xs" color="muted">
                Condição: {header.paymentTerms}
              </Title>
            )}
            {header.notes && (
              <Title
                variant="body-xs"
                color="muted"
                className="break-words whitespace-pre-line"
              >
                Observações: {header.notes}
              </Title>
            )}
            {header.notesPaymentTerms && (
              <Title variant="body-xs" color="warning">
                As observações citam o prazo {header.notesPaymentTerms},
                diferente da condição
                {header.paymentTerms ? ` ${header.paymentTerms}` : " do pedido"}
                . O pedido entra com a condição e a observação fica nas notas
                dele; confira com a fábrica.
              </Title>
            )}
            {file.unreadableRows > 0 && (
              <Title variant="body-xs" color="warning">
                {plural(
                  file.unreadableRows,
                  "linha do PDF não deu",
                  "linhas do PDF não deram"
                )}{" "}
                para ler; confira o pedido depois de importar.
              </Title>
            )}
          </div>
        )}

        {file.error && (
          <Title variant="body-xs" color="red">
            {file.error}
          </Title>
        )}

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

        {isRead && !skipped && (needsDate || needsSeller) && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
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
            {needsSeller && (
              <Input.Select
                label="Vendedor"
                required
                placeholder="Escolha o vendedor"
                variant="single"
                options={sellers}
                value={sellers.find((o) => o.value === sellerId) ?? null}
                disabled={disabled}
                onChange={(val) => {
                  const opt = Array.isArray(val) ? val[0] : val;
                  onOverride({ sellerId: opt ? String(opt.value) : null });
                }}
              />
            )}
          </div>
        )}

        {blocker && (
          <Title variant="body-xs" color="warning">
            Fica de fora: {blocker}
          </Title>
        )}

        {isRead && (
          <Input.Toggle
            label="Deixar este PDF de fora"
            checked={skipped}
            disabled={disabled}
            onChange={(e) => onOverride({ skip: e.target.checked })}
          />
        )}
      </Card.Body>
    </Card.Root>
  );
}
