"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input, SelectOption } from "@/components/Input";
import {
  SUPPORT_STATUS_HINT,
  SUPPORT_STATUS_LABEL,
  SUPPORT_UPDATE_KIND_LABEL,
  SupportStatus,
  SupportUpdateKind,
} from "@/utils/support";

import { NEXT_STATUS_OPTIONS, UPDATE_KIND_OPTIONS } from "../../utils";
import { useAddUpdate } from "./useAddUpdate";

interface Props {
  caseId: string;
  currentStatus: SupportStatus;
  onSaved: () => void;
}

const single = (
  val: SelectOption | SelectOption[] | null
): SelectOption | null => (Array.isArray(val) ? (val[0] ?? null) : val);

/**
 * Onde se escreve o que aconteceu — e, se for o caso, para onde o caso vai.
 *
 * A situação nova é OPCIONAL: a maioria dos andamentos é só "liguei, não
 * atenderam", e obrigar uma escolha de situação a cada anotação ensinaria a
 * pessoa a repetir a mesma opção sem ler.
 */
export function AddUpdateCard({ caseId, currentStatus, onSaved }: Props) {
  const form = useAddUpdate({ caseId, onSaved });

  const kindOptions: SelectOption[] = UPDATE_KIND_OPTIONS.map((value) => ({
    value,
    label: SUPPORT_UPDATE_KIND_LABEL[value],
  }));
  // Caso aberto não "fica como está": o back passa o primeiro andamento para
  // Em andamento sozinho (add_support_update.py). O campo diz isso antes.
  const startsOnSave = currentStatus === "OPEN";
  const statusOptions: SelectOption[] = NEXT_STATUS_OPTIONS.filter(
    (value) => value !== currentStatus
  ).map((value) => ({ value, label: SUPPORT_STATUS_LABEL[value] }));

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>Registrar andamento</Card.Header.Title>
      </Card.Header>
      <Card.Body>
        <Input.Textarea
          label="O que aconteceu"
          required
          rows={3}
          placeholder="Ex: Falei com a fábrica, eles vão trocar a mercadoria na próxima entrega."
          value={form.body}
          onChange={(e) => form.setBody(e.target.value)}
        />

        <div className="tablet:grid-cols-2 grid grid-cols-1 gap-12">
          <Input.Select
            placeholder="Escolha o tipo"
            label="Tipo"
            options={kindOptions}
            value={
              kindOptions.find((o) => o.value === form.kind) ?? kindOptions[0]
            }
            variant="single"
            disabledClear
            onChange={(val) =>
              form.setKind((single(val)?.value as SupportUpdateKind) ?? "NOTE")
            }
          />
          <Input.Select
            label="Mudar a situação para"
            hint={
              form.status
                ? SUPPORT_STATUS_HINT[form.status as SupportStatus]
                : startsOnSave
                  ? "Ao registrar, o caso sai de Aberto e passa para Em andamento."
                  : undefined
            }
            options={statusOptions}
            value={statusOptions.find((o) => o.value === form.status) ?? null}
            variant="single"
            placeholder={startsOnSave ? "Em andamento" : "Manter como está"}
            onChange={(val) =>
              form.setStatus((single(val)?.value as SupportStatus) ?? "")
            }
          />
        </div>

        {/* Encerrar pede a solução por escrito: é esse texto que se relê meses
            depois, quando o mesmo problema volta. */}
        {form.isClosing && (
          <Input.Textarea
            label="Como o problema terminou"
            rows={2}
            placeholder="Ex: Fábrica emitiu boleto novo com o valor certo."
            value={form.resolution}
            onChange={(e) => form.setResolution(e.target.value)}
          />
        )}

        {/* No celular o botão ocupa a linha: sozinho à direita deixava a
            linha com sobra vazia. */}
        <div className="max-tablet:[&>*]:w-full flex justify-end">
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            loading={form.isLoading}
            disabled={!form.isValid}
            onClick={() => form.submit()}
          >
            <Button.Title>Registrar andamento</Button.Title>
          </Button.Root>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
