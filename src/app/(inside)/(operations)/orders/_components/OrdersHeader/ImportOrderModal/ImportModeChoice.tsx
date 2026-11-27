import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import { FileSpreadsheet, FileStack, FileUp } from "lucide-react";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";

import type { ImportMode } from "./utils";
import { ICON_SIZE } from "@/components/Icon";

interface Props {
  onChoose: (mode: ImportMode) => void;
  /**
   * Mostra a saída para o lote de PDFs (Configurações › Configuração inicial ›
   * Pedidos em PDF). Só gestor: a tela do lote é admin-only.
   */
  canImportBatch: boolean;
}

/** O lote de PDFs: vários pedidos da mesma fábrica, lidos e conferidos juntos. */
const PDF_BATCH_HREF = "/settings/import/pdfs";

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
export function ImportModeChoice({ onChoose, canImportBatch }: Props) {
  return (
    // Com o lote são três cartões numa linha: em 2 colunas o terceiro sobrava
    // sozinho com meia linha em branco.
    <div
      className={cn(
        "grid grid-cols-1 gap-16",
        canImportBatch ? "tablet:grid-cols-3" : "tablet:grid-cols-2"
      )}
    >
      <Card.Root inset tone="transparent">
        <Card.Body padding="compact">
          <div className="flex items-center gap-8">
            <FileSpreadsheet
              size={ICON_SIZE.md}
              className="text-(--color-action-text)"
            />
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
            onClick={() => onChoose("sheet")}
          >
            <Button.Icon icon={FileSpreadsheet} />
            <Button.Title>Importar ficha de pedido do sistema</Button.Title>
          </Button.Root>
        </Card.Body>
      </Card.Root>

      <Card.Root inset tone="transparent">
        <Card.Body padding="compact">
          <div className="flex items-center gap-8">
            <FileUp size={ICON_SIZE.md} className="text-(--color-text-muted)" />
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
            onClick={() => onChoose("file")}
          >
            <Button.Icon icon={FileUp} />
            <Button.Title>Gerar pedido com outra importação</Button.Title>
          </Button.Root>
        </Card.Body>
      </Card.Root>

      {/* Lote = histórico (como a tela dele avisa): sem notificação, mínimo nem
          visita. Não cabe neste modal (sobe até 20 PDFs, guarda o andamento e
          confere cliente/vendedor/situação de cada um): leva à tela dele. */}
      {canImportBatch && (
        <Card.Root inset tone="transparent">
          <Card.Body padding="compact">
            <div className="flex items-center gap-8">
              <FileStack
                size={ICON_SIZE.md}
                className="text-(--color-text-muted)"
              />
              <Title variant="body-sm" weight="medium">
                Vários PDFs de uma vez
              </Title>
            </div>
            <Title variant="body-xs" color="muted" className="block grow">
              Pedidos antigos de uma fábrica, até 20 PDFs por vez. Entram como
              histórico: sem avisar ninguém, sem valor mínimo e sem fechar
              visita.
            </Title>
            <Button.Link
              href={PDF_BATCH_HREF}
              appearance="outline"
              color="neutral"
              size="sm"
            >
              <Button.Icon icon={FileStack} />
              <Button.Title>Importar em lote</Button.Title>
            </Button.Link>
          </Card.Body>
        </Card.Root>
      )}
    </div>
  );
}
