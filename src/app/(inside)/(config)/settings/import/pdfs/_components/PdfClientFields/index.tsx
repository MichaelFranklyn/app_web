"use client";

import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { ToggleGroup } from "@/components/ToggleGroup";
import { isValidCnpj, onlyDigits } from "@/utils/document";
import { maskCNPJ } from "@/utils/format/masks";

import { PdfFileOverride } from "../../interface";
import { PdfClientPicker } from "../PdfClientPicker";

type ClientMode = NonNullable<PdfFileOverride["clientMode"]>;

const MODES: { value: ClientMode; label: string }[] = [
  { value: "existing", label: "Cliente da carteira" },
  { value: "new", label: "Cliente novo" },
];

interface Props {
  override?: PdfFileOverride;
  onOverride: (change: PdfFileOverride) => void;
  disabled: boolean;
}

/**
 * O PDF não trouxe o CNPJ nem um código que case com a fábrica: a pessoa
 * vincula um cliente da carteira ou cadastra um novo (CNPJ e nome). Nada é
 * gravado aqui — o cliente novo só nasce quando o pedido for importado.
 */
export function PdfClientFields({ override, onOverride, disabled }: Props) {
  const mode = override?.clientMode ?? null;
  const document = override?.clientDocument ?? "";
  const cnpjInvalid = document.length === 14 && !isValidCnpj(document);

  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-xs" weight="medium">
        De quem é este pedido?
      </Title>
      <ToggleGroup
        options={MODES}
        value={mode}
        disabled={disabled}
        onChange={(next) =>
          // Trocar de modo limpa o cliente: o da carteira e o digitado não se misturam.
          onOverride({
            clientMode: next,
            clientId: null,
            clientDocument: null,
            clientName: null,
          })
        }
      />

      {mode === "existing" && (
        <PdfClientPicker
          value={
            override?.clientId
              ? {
                  id: override.clientId,
                  document: override.clientDocument ?? "",
                  name: override.clientName ?? "",
                }
              : null
          }
          disabled={disabled}
          onChange={(client) =>
            onOverride({
              clientId: client?.id ?? null,
              clientDocument: client?.document ?? null,
              clientName: client?.name ?? null,
            })
          }
        />
      )}

      {mode === "new" && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Input.Text
            label="CNPJ do cliente"
            required
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            maxLength={18}
            value={maskCNPJ(document)}
            error={cnpjInvalid ? "CNPJ inválido" : undefined}
            disabled={disabled}
            onChange={(e) =>
              onOverride({
                clientDocument: onlyDigits(e.target.value).slice(0, 14) || null,
              })
            }
          />
          <Input.Text
            label="Nome do cliente"
            required
            placeholder="Razão social ou nome fantasia"
            value={override?.clientName ?? ""}
            disabled={disabled}
            onChange={(e) => onOverride({ clientName: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
