"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input, SelectOption } from "@/components/Input";
import { Title } from "@/components/Title";
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
  const statusOptions: SelectOption[] = NEXT_STATUS_OPTIONS.filter(
    (value) => value !== currentStatus
  ).map((value) => ({ value, label: SUPPORT_STATUS_LABEL[value] }));

  return (
    <Card.Root>
      <div className="flex flex-col gap-12">
        <Title variant="heading-sm">Registrar andamento</Title>

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
                : "Deixe em branco para manter a situação atual."
            }
            options={statusOptions}
            value={statusOptions.find((o) => o.value === form.status) ?? null}
            variant="single"
            placeholder="Manter como está"
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

        <div className="flex justify-end">
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={form.isLoading}
            disabled={!form.isValid}
            onClick={() => form.submit()}
          >
            <Button.Title>Registrar andamento</Button.Title>
          </Button.Root>
        </div>
      </div>
    </Card.Root>
  );
}
