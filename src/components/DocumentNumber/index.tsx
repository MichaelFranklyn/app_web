import { cn } from "@/lib/utils";
import { maskCNPJ, maskCPF } from "@/utils/format/masks";

interface DocumentNumberProps {
  /** Só dígitos ou já mascarado — a máscara é refeita aqui. */
  value: string;
  kind?: "cnpj" | "cpf";
  className?: string;
}

/**
 * CNPJ/CPF dentro de um texto. Herda tamanho, peso e cor de quem envolve.
 *
 * Duas coisas que o número solto não fazia (auditoria 13/11/2026, P-14.4):
 *   • não quebra linha — o navegador partia no "/" e no "-", e o leitor via
 *     "12.345.678/" numa linha e "0001-90" na outra, sem saber que era um só;
 *   • algarismos de largura fixa (`tabular-nums`) — numa lista, os CNPJs
 *     ficam alinhados e dá para comparar de olho.
 */
export function DocumentNumber({
  value,
  kind = "cnpj",
  className,
}: DocumentNumberProps) {
  return (
    <span className={cn("whitespace-nowrap tabular-nums", className)}>
      {kind === "cpf" ? maskCPF(value) : maskCNPJ(value)}
    </span>
  );
}
