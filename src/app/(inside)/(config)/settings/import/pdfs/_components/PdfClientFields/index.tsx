"use client";

import { useRef, useState } from "react";

import { Grid } from "@/components/Grid";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { ToggleGroup } from "@/components/ToggleGroup";
import { isValidCnpj, onlyDigits } from "@/utils/document";
import { maskCNPJ } from "@/utils/format/masks";

import { PdfClientMode, PdfFileOverride } from "../../interface";
import { fileClientMode } from "../../utils";
import { PdfClientPicker } from "../PdfClientPicker";
import { PickedClient } from "../PdfClientPicker/interface";
import { useLinkedClientCode } from "./useLinkedClientCode";

/** Igual ao limite do backend (`factory_client_code`, String 30). */
const CLIENT_CODE_MAX = 30;

const MODES: { value: PdfClientMode; label: string }[] = [
  { value: "wallet", label: "Cliente da carteira" },
  { value: "typed", label: "Digitar CNPJ" },
];

interface Props {
  /** A fábrica do lote: o código do cliente é o do vínculo com ela. */
  factoryId: string;
  /** O código do cliente lido do PDF (sem cliente que case com ele). */
  readCode: string | null;
  override?: PdfFileOverride;
  onOverride: (change: PdfFileOverride) => void;
  disabled: boolean;
}

/**
 * O PDF não trouxe o CNPJ nem um código que case com a fábrica: a pessoa
 * busca o cliente na carteira ou digita o CNPJ, e informa o código dele na
 * fábrica. Nada é gravado aqui — na importação, o CNPJ digitado que não está na
 * carteira vira cliente com os dados da Receita, e o código vai para o vínculo,
 * para o próximo PDF achar o cliente sozinho.
 */
export function PdfClientFields({
  factoryId,
  readCode,
  override,
  onOverride,
  disabled,
}: Props) {
  const mode = fileClientMode(override);
  const document = override?.clientDocument ?? "";
  const cnpjInvalid = document.length === 14 && !isValidCnpj(document);
  const fetchLinkedCode = useLinkedClientCode(factoryId);
  // O último cliente escolhido: a resposta de uma busca antiga não sobrescreve
  // o código de quem foi escolhido depois.
  const pickedRef = useRef<string | null>(null);
  // O cliente cujo código veio do vínculo, para a dica dizer de onde ele saiu.
  const [linkedFor, setLinkedFor] = useState<string | null>(null);
  const showsLinked =
    mode === "wallet" &&
    Boolean(override?.clientId) &&
    linkedFor === override?.clientId;

  const pickClient = async (client: PickedClient | null) => {
    pickedRef.current = client?.id ?? null;
    setLinkedFor(null);
    onOverride({
      clientId: client?.id ?? null,
      clientDocument: client?.document ?? null,
      clientName: client?.name ?? null,
    });
    if (!client) return;
    const code = await fetchLinkedCode(client.id);
    if (!code || pickedRef.current !== client.id) return;
    setLinkedFor(client.id);
    onOverride({ clientCode: code });
  };

  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-xs" weight="medium">
        De quem é este pedido?
      </Title>
      <ToggleGroup
        options={MODES}
        value={mode}
        disabled={disabled}
        onChange={(next) => {
          // Trocar de modo limpa o cliente (o código fica): o da carteira e o
          // digitado não se misturam.
          pickedRef.current = null;
          setLinkedFor(null);
          onOverride({
            clientMode: next ?? "wallet",
            clientId: null,
            clientDocument: null,
            clientName: null,
          });
        }}
      />
      <Grid.Root cols={{ base: 1, tablet: 2 }} gap={12}>
        {mode === "wallet" ? (
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
            onChange={pickClient}
          />
        ) : (
          <Input.Text
            label="CNPJ do cliente"
            required
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            maxLength={18}
            value={maskCNPJ(document)}
            error={cnpjInvalid ? "CNPJ inválido" : undefined}
            hint={
              cnpjInvalid
                ? undefined
                : "Se não estiver na carteira, o cliente é cadastrado com os dados da Receita."
            }
            disabled={disabled}
            onChange={(e) =>
              onOverride({
                clientDocument: onlyDigits(e.target.value).slice(0, 14) || null,
              })
            }
          />
        )}
        <Input.Text
          label="Código do cliente na fábrica"
          placeholder="Ex.: 23401"
          maxLength={CLIENT_CODE_MAX}
          value={override?.clientCode ?? readCode ?? ""}
          hint={
            showsLinked
              ? "Código que este cliente já tem nesta fábrica."
              : "Com o código, o próximo PDF deste cliente é reconhecido sozinho."
          }
          disabled={disabled}
          onChange={(e) => {
            setLinkedFor(null);
            onOverride({ clientCode: e.target.value });
          }}
        />
      </Grid.Root>
    </div>
  );
}
