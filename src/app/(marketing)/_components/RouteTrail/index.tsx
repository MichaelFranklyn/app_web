import { cn } from "@/lib/utils";

/**
 * O motivo visual da landing (19/11/2026): um trajeto tracejado com paradas
 * numeradas — o mesmo `#1`, `#2`… da rota do dia dentro do produto. A página
 * fala de visita e estrada; o desenho também.
 *
 * Puramente decorativo (`aria-hidden`). O tracejado anda devagar (keyframe
 * `route-dash`); com movimento reduzido, a regra global o deixa parado.
 *
 * As coordenadas são do `viewBox`, não da tela: quem usa escolhe o caminho e
 * as paradas uma vez, e o SVG escala com a caixa.
 */
export function RouteTrail({
  viewBox,
  path,
  stops,
  tone = "default",
  className,
}: {
  viewBox: string;
  /** O `d` do caminho, nas coordenadas do `viewBox`. */
  path: string;
  /** As paradas sobre o caminho; o número é a ordem da lista. */
  stops: { x: number; y: number }[];
  /** `inverse` para a faixa escura do fechamento: o vão do traço fica claro. */
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox={viewBox}
      fill="none"
      className={cn("pointer-events-none overflow-visible", className)}
    >
      <path
        d={path}
        stroke="var(--color-action)"
        strokeOpacity={tone === "inverse" ? 0.9 : 0.55}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="12 12"
        style={{ animation: "route-dash 1.6s linear infinite" }}
      />

      {stops.map(({ x, y }, index) => (
        <g key={`${x}-${y}`}>
          <circle
            cx={x}
            cy={y}
            r={22}
            fill="var(--color-action)"
            fillOpacity={0.14}
          />
          <circle
            cx={x}
            cy={y}
            r={14}
            fill="var(--color-action)"
            stroke={tone === "inverse" ? "var(--color-text)" : "var(--bg)"}
            strokeWidth={3}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-on-action)"
            fontSize={13}
            fontWeight={700}
            fontFamily="var(--font-head)"
          >
            {index + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
