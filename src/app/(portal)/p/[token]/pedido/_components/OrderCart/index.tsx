import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { Send } from "lucide-react";
import { RefObject, useState } from "react";
import { OrderCartItem, OrderFormState } from "../../interface";
import { CartItemRow } from "../CartItemRow";
import {
  cartEstimate,
  fitToMultiple,
  formatQuantity,
  multipleOf,
  parseQuantity,
  productCountLabel,
  quantityError,
} from "../../utils";

interface OrderCartProps {
  token: string;
  search: string | null;
  page: number;
  factoryId: string;
  items: OrderCartItem[];
  state: OrderFormState;
  isPending: boolean;
  formAction: (formData: FormData) => void;
  onQuantity: (productId: string, quantity: string) => void;
  onRemove: (productId: string) => void;
  /** O recado — o mesmo que o modal do cabeçalho edita. */
  note: string;
  onNote: (note: string) => void;
  /** O formulário, para o "Enviar" do cabeçalho submeter este mesmo. */
  formRef: RefObject<HTMLFormElement | null>;
}

/**
 * A lista do cliente — e o único formulário da tela.
 *
 * Cada produto vai como `pick__{id}` + `qty__{id}`, o mesmo contrato que o
 * `pickedEntries` lê. Preço quem negocia é o representante: o cliente manda
 * só as quantidades e um recado.
 *
 * O "Enviar ao representante" do cabeçalho submete ESTE formulário (pelo
 * `formRef`), com o recado escrito lá ou aqui — um envio só, um caminho só.
 *
 * Quantidade fora da embalagem mínima é corrigida para cima ao sair do campo
 * e, se ainda assim estiver errada, segura o envio com o motivo no campo.
 */
export function OrderCart({
  token,
  search,
  page,
  factoryId,
  items,
  state,
  isPending,
  formAction,
  onQuantity,
  onRemove,
  note,
  onNote,
  formRef,
}: OrderCartProps) {
  const estimate = cartEstimate(items);
  // O erro só aparece depois de tentar enviar ou de sair do campo: avisar
  // enquanto a pessoa ainda digita "1" de "12" é cobrar antes da hora.
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [triedSubmit, setTriedSubmit] = useState(false);
  const errors = new Map(
    items.map((item) => [item.productId, quantityError(item)])
  );
  const hasErrors = [...errors.values()].some((error) => error !== null);

  const handleBlur = (item: OrderCartItem) => {
    const quantity = parseQuantity(item.quantity);
    const multiple = multipleOf(item.saleMultiple);
    if (quantity !== null && quantity > 0) {
      const fitted = fitToMultiple(quantity, multiple);
      if (fitted !== quantity)
        onQuantity(item.productId, formatQuantity(fitted));
    }
    setTouched((current) => new Set(current).add(item.productId));
  };

  const feedback =
    state.status !== "idle" ? (
      <Alert.Root variant={state.status === "success" ? "success" : "error"}>
        <Alert.Description>{state.message}</Alert.Description>
      </Alert.Root>
    ) : null;

  return (
    <Card.Root id="minha-lista" className="scroll-mt-[16px]">
      <Card.Header>
        <Card.Header.Title>Minha lista</Card.Header.Title>
        <Card.Header.Description>
          {items.length === 0
            ? "Nenhum produto ainda."
            : `${productCountLabel(items.length)} para enviar.`}
        </Card.Header.Description>
      </Card.Header>

      {items.length === 0 ? (
        <Card.Body padding="compact">
          {feedback}
          <Title variant="body-sm" color="muted">
            Toque em “Adicionar” nos produtos e eles aparecem aqui.
          </Title>
        </Card.Body>
      ) : (
        <form
          ref={formRef}
          action={formAction}
          noValidate
          onSubmit={(event) => {
            if (hasErrors) {
              event.preventDefault();
              setTriedSubmit(true);
            }
          }}
        >
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="q" value={search ?? ""} />
          <input type="hidden" name="p" value={page} />
          <input type="hidden" name="f" value={factoryId} />

          {items.map((item) => (
            <CartItemRow
              key={item.productId}
              item={item}
              error={
                triedSubmit || touched.has(item.productId)
                  ? (errors.get(item.productId) ?? null)
                  : null
              }
              onQuantity={onQuantity}
              onBlur={handleBlur}
              onRemove={onRemove}
            />
          ))}

          <Card.Row className="flex-col items-stretch">
            <Input.Textarea
              id="note"
              name="note"
              label="Recado para o representante"
              placeholder="Ex: preciso da entrega até sexta"
              maxLength={500}
              rows={3}
              value={note}
              onChange={(event) => onNote(event.target.value)}
            />
          </Card.Row>

          <Card.Row className="flex-col items-stretch">
            {estimate !== null ? (
              <div className="flex flex-col gap-4">
                {/* Mercadoria e impostos só quando há imposto a separar: sem
                    ele, as três linhas repetiriam o mesmo valor. */}
                {estimate.tax !== null && estimate.tax > 0 ? (
                  <>
                    <EstimateLine
                      label="Mercadoria (sem impostos)"
                      value={estimate.goods}
                    />
                    <EstimateLine
                      label="Impostos no preço"
                      value={estimate.tax}
                    />
                  </>
                ) : null}
                <EstimateLine
                  label="Total estimado"
                  value={estimate.total}
                  strong
                />
              </div>
            ) : null}
            {feedback}
            {triedSubmit && hasErrors ? (
              <Alert.Root variant="error">
                <Alert.Description>
                  Confira as quantidades marcadas antes de enviar.
                </Alert.Description>
              </Alert.Root>
            ) : null}
            <Button.Root
              type="submit"
              appearance="solid"
              color="amber"
              fullWidth
              loading={isPending}
            >
              <Button.Icon icon={Send} />
              <Button.Title>Enviar ao representante</Button.Title>
            </Button.Root>
            <Title variant="body-xs" color="muted">
              Nada é comprado agora: o representante confere preço, condição e
              frete e confirma com você antes de mandar para a fábrica.
            </Title>
          </Card.Row>
        </form>
      )}
    </Card.Root>
  );
}

interface EstimateLineProps {
  label: string;
  value: number;
  strong?: boolean;
}

function EstimateLine({ label, value, strong }: EstimateLineProps) {
  return (
    <div className="flex items-baseline justify-between gap-8">
      <Title as="span" variant="body-sm" color="muted">
        {label}
      </Title>
      <Title as="span" variant={strong ? "heading-sm" : "body-md"}>
        {formatMoney(value)}
      </Title>
    </div>
  );
}
