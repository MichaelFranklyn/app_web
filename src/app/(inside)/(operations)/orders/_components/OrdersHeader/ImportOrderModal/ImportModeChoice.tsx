import { FileSpreadsheet, FileUp } from "lucide-react";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";

import type { ImportMode } from "./utils";

interface Props {
  onChoose: (mode: ImportMode) => void;
}

/**
 * A pergunta que abre a importação: qual arquivo você tem na mão?
 *
 * Os dois caminhos não se parecem em nada. A ficha do sistema se lê sozinha —
 * ela sabe o cliente, a fábrica, o prazo e os itens, e o vendedor vai direto
 * conferir o que casou com o catálogo. O arquivo da fábrica não sabe de quem é
 * o pedido, então antes dele vêm as perguntas.
 *
 * Perguntar isso na entrada evita a tela que tentava servir aos dois: um
 * formulário com um campo de upload no meio, em que não ficava claro se era
 * para preencher, para subir, ou para os dois.
 */
export function ImportModeChoice({ onChoose }: Props) {
  return (
    <div className="tablet:grid-cols-2 grid grid-cols-1 gap-16">
      <div className="flex flex-col gap-8 rounded-(--r-md) border border-(--border) p-16">
        <div className="flex items-center gap-8">
          <FileSpreadsheet size={16} className="text-(--amber)" />
          <Title variant="body-sm" weight="medium">
            Ficha de pedido do sistema
          </Title>
        </div>
        <Title variant="body-xs" color="muted" className="block grow">
          A planilha que você baixou e preencheu na loja. O sistema lê tudo:
          cliente, fábrica, condição de pagamento e os itens.
        </Title>
        <Button.Root
          type="button"
          appearance="solid"
          color="amber"
          size="sm"
          noUppercase
          onClick={() => onChoose("sheet")}
        >
          <Button.Icon icon={FileSpreadsheet} />
          <Button.Title>Importar ficha de pedido do sistema</Button.Title>
        </Button.Root>
      </div>

      <div className="flex flex-col gap-8 rounded-(--r-md) border border-(--border) p-16">
        <div className="flex items-center gap-8">
          <FileUp size={16} className="text-(--muted)" />
          <Title variant="body-sm" weight="medium">
            Outro arquivo
          </Title>
        </div>
        <Title variant="body-xs" color="muted" className="block grow">
          Pedido em PDF ou Excel da fábrica. Você diz de quem é o pedido e nós
          casamos os produtos com o catálogo.
        </Title>
        <Button.Root
          type="button"
          appearance="outline"
          color="neutral"
          size="sm"
          noUppercase
          onClick={() => onChoose("file")}
        >
          <Button.Icon icon={FileUp} />
          <Button.Title>Gerar pedido com outra importação</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
