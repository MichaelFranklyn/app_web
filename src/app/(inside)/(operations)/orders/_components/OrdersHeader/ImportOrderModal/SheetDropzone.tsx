import { FileSpreadsheet } from "lucide-react";

import { Input } from "@/components/Input";
import { Title } from "@/components/Title";

interface Props {
  onFile: (files: File[]) => void;
  loading: boolean;
}

/**
 * O caminho da ficha do sistema: só o arquivo.
 *
 * Não há campo nenhum aqui de propósito. A ficha responde tudo o que o
 * formulário perguntaria — quem a preencheu escolheu cliente, fábrica, prazo e
 * frete na loja —, então subir o arquivo leva direto à conferência dos itens,
 * que é onde o catálogo de hoje pode discordar do que foi anotado.
 */
export function SheetDropzone({ onFile, loading }: Props) {
  return (
    <div className="rounded-(--r-md) border border-dashed border-(--border) p-16">
      <div className="mb-8 flex items-center gap-8">
        <FileSpreadsheet size={16} className="text-(--amber)" />
        <Title variant="body-sm" weight="medium">
          Suba a ficha preenchida
        </Title>
      </div>
      <Title variant="body-xs" color="muted" className="mb-12 block">
        É a planilha .xlsx que você baixou. Não precisa preencher mais nada: o
        sistema lê o cliente, a fábrica, a condição de pagamento e os itens.
      </Title>
      <Input.Archive
        variant="single"
        accept=".xlsx"
        hint={
          loading ? "Lendo a ficha..." : "A planilha .xlsx que você baixou."
        }
        value={[]}
        onChange={onFile}
      />
    </div>
  );
}
