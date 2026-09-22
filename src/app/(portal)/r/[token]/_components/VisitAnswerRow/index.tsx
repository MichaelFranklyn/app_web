import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
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

/** Mesma altura de toque do formulário de estoque do portal: 44px, 16px de texto
 *  (abaixo disso o Safari do iPhone dá zoom automático ao focar o campo). */
const FIELD =
  "h-[44px] w-full rounded-[8px] border border-(--border) bg-(--bg2) px-[8px] text-[16px] text-(--text)";

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
 */
export function VisitAnswerRow({ stop }: Props) {
  const isAnswered = stop.status !== "PENDING";
  const outcomeOptions = outcomeOptionsFor(stop.contactType);
  const place = [stop.clientCity, stop.clientState].filter(Boolean).join("/");

  return (
    <Card.Root className="p-[12px]">
      <div className="flex flex-col gap-[10px]">
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

        <div className="tablet:grid-cols-2 grid grid-cols-1 gap-[8px]">
          <label className="flex flex-col gap-[4px]">
            <Title variant="body-xs" color="muted">
              O que aconteceu
            </Title>
            <select
              name={`status__${stop.id}`}
              defaultValue={isAnswered ? stop.status : ""}
              className={FIELD}
            >
              <option value="">Ainda não respondi</option>
              {VISIT_STATUS_OPTIONS.filter(
                (option) => option.value !== "PENDING"
              ).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-[4px]">
            <Title variant="body-xs" color="muted">
              Resultado
            </Title>
            <select
              name={`outcome__${stop.id}`}
              defaultValue={stop.outcome ?? ""}
              className={FIELD}
            >
              <option value="">—</option>
              {outcomeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex items-center gap-[8px]">
          <input
            type="checkbox"
            name={`order__${stop.id}`}
            defaultChecked={stop.hasLinkedOrder}
            className="size-[20px] accent-(--amber)"
          />
          <Title variant="body-sm">Rendeu pedido</Title>
        </label>

        <label className="flex flex-col gap-[4px]">
          <Title variant="body-xs" color="muted">
            Observação
          </Title>
          <textarea
            name={`notes__${stop.id}`}
            defaultValue={stop.notes ?? ""}
            rows={2}
            placeholder="Opcional"
            className="w-full rounded-[8px] border border-(--border) bg-(--bg2) p-[8px] text-[16px] text-(--text)"
          />
        </label>
      </div>
    </Card.Root>
  );
}
