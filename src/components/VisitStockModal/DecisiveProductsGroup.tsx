"use client";

import { Title } from "@/components/Title";
import { useState } from "react";

import { ProductDaysRow } from "./ProductDaysRow";
import { StockCandidateProduct } from "./useStockObservation";

interface Props {
  products: StockCandidateProduct[];
  daysMap: Record<string, number | null | undefined>;
  onChange: (productId: string, days: number | null) => void;
}

const grid = "desktop:grid-cols-2 grid grid-cols-1 gap-8";

/**
 * Os produtos de uma fábrica, separados entre o que vale perguntar e o resto.
 *
 * O motivo (relato de campo, 2026-08-04): só ~15% dos clientes informam estoque
 * com precisão. Parte disso é a pergunta ser longa demais — a lista trazia os
 * vinte, trinta itens do último pedido, e o vendedor preenchia três e desistia.
 *
 * A saída não é insistir, é perguntar menos. O backend marca os produtos cuja
 * resposta pode MUDAR a decisão da rotina (`isDecisive`): número sem lastro E
 * que manda na urgência do cliente. Esses ficam à vista; o resto continua
 * disponível atrás de um clique, para quem quiser responder mais.
 *
 * Sem nenhum decisivo (tudo já confirmado, ou fábrica sem estoque acompanhado)
 * a lista aparece inteira, como antes: destaque que aparece sempre deixa de ser
 * destaque.
 */
export function DecisiveProductsGroup({ products, daysMap, onChange }: Props) {
  const [showAll, setShowAll] = useState(false);

  const decisive = products.filter((product) => product.isDecisive);
  const rest = products.filter((product) => !product.isDecisive);

  const rows = (list: StockCandidateProduct[]) => (
    <div className={grid}>
      {list.map((product) => (
        <ProductDaysRow
          key={product.id}
          product={product}
          days={daysMap[product.id]}
          onChange={onChange}
        />
      ))}
    </div>
  );

  if (decisive.length === 0) return rows(products);

  return (
    <div className="flex flex-col gap-12">
      <div>
        <Title variant="body-sm" weight="semibold">
          {decisive.length === 1
            ? "Pergunte por este"
            : `Pergunte por estes ${decisive.length}`}
        </Title>
        <Title variant="micro" color="muted" className="mt-[2px]">
          São os que decidem se este cliente precisa de visita. O resto o
          sistema já consegue estimar sozinho.
        </Title>
        <div className="mt-8">{rows(decisive)}</div>
      </div>

      {rest.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="cursor-pointer text-[13px] text-(--muted) underline underline-offset-2 hover:text-(--text)"
          >
            {showAll
              ? "Esconder os demais"
              : `Ver os outros ${rest.length} produtos`}
          </button>
          {showAll && <div className="mt-8">{rows(rest)}</div>}
        </div>
      )}
    </div>
  );
}
