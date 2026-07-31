import { Alert } from "@/components/Alert";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { PackageX, Trash2 } from "lucide-react";

import { RemainderMode } from "./usePartialInvoice";

interface Props {
  /** Quantos itens ficaram com sobra (só aparece quando há pelo menos um). */
  count: number;
  mode: RemainderMode;
  onChange: (mode: RemainderMode) => void;
}

/**
 * O destino do que a fábrica não faturou: virar um pedido novo (o padrão, nada
 * se perde) ou ser cancelado de vez — quando a fábrica não vai repor ou o
 * cliente desistiu do restante, e deixar um pedido pendente só atrapalharia.
 */
export function RemainderChoice({ count, mode, onChange }: Props) {
  const items = count === 1 ? "item" : "itens";

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-8 rounded-(--r-md) border border-(--border) bg-(--bg2) px-12 py-12">
        <Title variant="body-sm" weight="medium">
          O que fazer com o que faltou?
        </Title>

        <Input.Radio
          name="remainderMode"
          value="backorder"
          checked={mode === "backorder"}
          onChange={() => onChange("backorder")}
          label="Gerar um novo pedido com o restante (a fábrica ainda vai entregar)"
        />
        <Input.Radio
          name="remainderMode"
          value="cancel"
          checked={mode === "cancel"}
          onChange={() => onChange("cancel")}
          label="Cancelar o saldo (o restante não será entregue)"
        />
      </div>

      {mode === "cancel" ? (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Trash2} />
          <Alert.Content>
            <Alert.Description>
              O que faltou em {count} {items} será cancelado: sai do pedido e
              não fica pendente para faturar depois. A comissão sai só sobre o
              que foi faturado agora.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : (
        <Alert.Root variant="info">
          <Alert.Icon icon={PackageX} />
          <Alert.Content>
            <Alert.Description>
              {count} {items} {count === 1 ? "vai" : "vão"} para um novo pedido
              (backorder), que você fatura quando a fábrica tiver estoque. A
              comissão deste faturamento sai só sobre o que foi faturado agora.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </div>
  );
}
