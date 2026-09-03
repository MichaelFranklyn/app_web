"use client";

import { useLazyQuery } from "@apollo/client/react";
import { useCallback, useState } from "react";

import { useToast } from "@/components/Toast";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { loadImage } from "@/utils/media";
import { downloadOrderSheet } from "@/utils/orderSheet";
import { loadGirusLogo } from "@/utils/pdf/footer";

import { ORDER_SHEET_PACKAGE_QUERY } from "./gql";
import type { OrderSheetPackageData } from "./interface";

interface Options {
  /** Cabeçalho já preenchido, quando a ficha sai da tela de um cliente. */
  cnpjDigits?: string;
  clientName?: string;
}

/**
 * Busca o pacote e gera o arquivo.
 *
 * As duas etapas pesadas ficam sob demanda: a query só vai ao servidor no
 * clique, e o ExcelJS (~700KB) só é baixado depois que ela volta. Quem nunca
 * usa a ficha não paga por ela.
 */
export const useOrderSheet = ({ cnpjDigits, clientName }: Options = {}) => {
  const { toast } = useToast();
  const { name: companyName, logoUrl } = useCompanyBranding();
  const [generating, setGenerating] = useState(false);
  const [fetchPackage] = useLazyQuery<OrderSheetPackageData>(
    ORDER_SHEET_PACKAGE_QUERY,
    { fetchPolicy: "network-only" }
  );

  const generate = useCallback(
    async (sellerId?: string | null) => {
      setGenerating(true);
      try {
        const { data, error } = await fetchPackage({
          variables: { sellerId: sellerId ?? null },
        });
        if (error) throw error;

        const pkg = data?.orderSheetPackage;
        if (!pkg) throw new Error("Não foi possível montar a ficha.");

        // Sem fábrica não há catálogo, e a ficha sairia com o dropdown vazio e
        // nenhum produto — melhor dizer o que falta do que entregar isso.
        if (pkg.factories.length === 0) {
          toast({
            variant: "warning",
            title: "Sem fábrica para a ficha",
            description: `${pkg.seller.name} ainda não tem acesso a nenhuma fábrica.`,
          });
          return false;
        }

        // As marcas são as mesmas do PDF que vai ao cliente: a da representação
        // assina o documento, a do sistema fica do outro lado. Logo que não
        // carrega devolve `null` e a ficha sai sem ela.
        const [companyLogo, girusLogo] = await Promise.all([
          loadImage(logoUrl),
          loadGirusLogo(),
        ]);

        await downloadOrderSheet(pkg, {
          cnpjDigits,
          clientName,
          brand: {
            companyLogo,
            girusLogo,
            companyName,
          },
        });
        toast({
          variant: "success",
          title: "Ficha de pedido gerada",
          description:
            "Ela funciona sem internet. Baixe de novo quando o preço mudar.",
        });
        return true;
      } catch (err) {
        toast({
          variant: "error",
          title: "Não foi possível gerar a ficha",
          description: err instanceof Error ? err.message : "Tente novamente.",
        });
        return false;
      } finally {
        setGenerating(false);
      }
    },
    [clientName, cnpjDigits, companyName, fetchPackage, logoUrl, toast]
  );

  return { generate, generating };
};
