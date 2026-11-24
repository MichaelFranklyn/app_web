import { Alert } from "@/components/Alert";
import { Emphasis } from "@/components/Emphasis";
import { Layers } from "lucide-react";

interface Props {
  activeCount: number;
}

/**
 * Duas ou mais tabelas ativas só fazem sentido por região fiscal. Quem
 * importou "capital" e "interior" como tabelas separadas precisa saber que o
 * pedido usa uma só — o preço por grupo de clientes é NÍVEL dentro da tabela.
 */
export function ActiveListsNotice({ activeCount }: Props) {
  if (activeCount < 2) return null;
  return (
    <Alert.Root variant="warning">
      <Alert.Icon icon={Layers} />
      <Alert.Content>
        <Alert.Title>{activeCount} tabelas ativas ao mesmo tempo</Alert.Title>
        <Alert.Description>
          Isso só serve para regiões fiscais diferentes (imposto de outro
          estado). Se a diferença é o grupo de clientes — capital × interior,
          por exemplo — use uma tabela só, com um <Emphasis>nível</Emphasis>{" "}
          para cada grupo: em <Emphasis>Importar tabela</Emphasis>, escolha{" "}
          <Emphasis>Preços de outro grupo de clientes</Emphasis>.
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
