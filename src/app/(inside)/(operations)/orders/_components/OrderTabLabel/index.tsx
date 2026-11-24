/**
 * Rótulo de aba que encurta no celular. Em 360px "Esperando entrega (59)" ficava
 * cortado na borda esmaecida da faixa, e quem não arrasta a faixa nem sabia que
 * a aba existia (crítica de /orders, 23/11/2026). No celular aparece o curto
 * ("A entregar (59)"); o nome acessível continua o completo, em qualquer tela.
 */
export function OrderTabLabel({
  full,
  short,
}: {
  full: string;
  short: string;
}) {
  return (
    <>
      <span className="max-tablet:sr-only">{full}</span>
      <span aria-hidden className="tablet:hidden">
        {short}
      </span>
    </>
  );
}
