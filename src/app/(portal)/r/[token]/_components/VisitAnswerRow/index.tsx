import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import {
  CONTACT_TYPE_LABEL,
  VISIT_STATUS_OPTIONS,
  outcomeOptionsFor,
} from "@/utils/visit";
import { VisitResponseStop } from "../../interface";

interface Props {
  stop: VisitResponseStop;
}

const STATUS_OPTIONS = VISIT_STATUS_OPTIONS.filter(
  (option) => option.value !== "PENDING"
);

/**
 * Uma parada do dia e o que houve nela.
 *
 * A situação abre VAZIA nas paradas ainda pendentes e preenchida nas que já têm
 * desfecho. É o que separa "não respondi" de "respondi": o vendedor manda o que
 * sabe de cinco clientes e volta depois para os outros três, e um seletor que
 * já viesse marcado gravaria, sem querer, um desfecho que ele não deu.
 *
 * "Rendeu pedido" é caixa, e não mais uma opção do resultado, porque as duas
 * coisas são independentes na cabeça de quem responde: "visitei" é a situação e
 * "saiu pedido" é a consequência. A caixa já vem marcada quando o sistema achou
 * o pedido sozinho — perguntar de novo faria o registro parecer perdido.
 *
 * Campos em `size="lg"`: é o tamanho de toque do DS (44px, 16px de texto — sem
 * o zoom automático do Safari do iPhone ao focar).
 */
export function VisitAnswerRow({ stop }: Props) {
  const outcomeOptions = outcomeOptionsFor(stop.contactType);
  const place = [stop.clientCity, stop.clientState].filter(Boolean).join("/");

  return (
    <Card.Root>
      <Card.Body padding="compact" className="gap-[12px]">
        <div className="flex flex-col gap-[4px]">
          <div className="flex flex-wrap items-center gap-[8px]">
            <Badge color="neutral" size="xs">
              <Badge.Text>{stop.plannedOrder}</Badge.Text>
            </Badge>
            <Title variant="body-sm" weight="semibold" className="break-words">
              {stop.clientName}
            </Title>
            {stop.contactType === "REMOTE" ? (
              <Badge color="blue" size="xs">
                <Badge.Text>{CONTACT_TYPE_LABEL.REMOTE}</Badge.Text>
              </Badge>
            ) : null}
          </div>
          {stop.clientAlias ? (
            <Title variant="body-xs" color="muted">
              {stop.clientAlias}
            </Title>
          ) : null}
          <Title variant="body-xs" color="muted">
            {[stop.factoryNames.join(", "), place].filter(Boolean).join(" · ")}
          </Title>
        </div>

        {/* Uma coluna sempre: o card vive numa grade de até três, e com os dois
            seletores lado a lado "Ainda não respondi" virava "Ainda não re". */}
        <Grid.Root cols={{ base: 1 }} gap={12}>
          <Input.Select
            name={`status__${stop.id}`}
            label="O que aconteceu"
            placeholder="Ainda não respondi"
            size="lg"
            searchable={false}
            options={STATUS_OPTIONS}
            defaultValue={
              STATUS_OPTIONS.find((option) => option.value === stop.status) ??
              null
            }
          />
          <Input.Select
            name={`outcome__${stop.id}`}
            label="Resultado"
            placeholder="Opcional"
            size="lg"
            searchable={false}
            options={outcomeOptions}
            defaultValue={
              outcomeOptions.find((option) => option.value === stop.outcome) ??
              null
            }
          />
        </Grid.Root>

        <Input.Checkbox
          name={`order__${stop.id}`}
          defaultChecked={stop.hasLinkedOrder}
          label="Rendeu pedido"
        />

        <Input.Textarea
          name={`notes__${stop.id}`}
          label="Observação"
          placeholder="Opcional"
          size="lg"
          rows={2}
          defaultValue={stop.notes ?? ""}
        />
      </Card.Body>
    </Card.Root>
  );
}
