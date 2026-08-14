import { Title } from "@/components/Title";
import Image from "next/image";
import { FooterColumn } from "./_components/FooterColumn";

/**
 * Rodapé da landing: a marca, os atalhos das seções e as duas portas de
 * entrada, para quem rolou até o fim e não quer voltar ao topo.
 *
 * O ano sai do servidor no build — a landing é estática, e calcular a data no
 * cliente só serviria para arriscar divergência de hidratação em troca de nada.
 *
 * As âncoras são absolutas (`/#recursos`) pelo mesmo motivo do header: este
 * rodapé também aparece em `/precos` e nas páginas legais, onde a seção
 * apontada não existe.
 *
 * Ainda sem canal de contato: não há e-mail declarado em `legal.ts`, e link
 * para endereço que ninguém lê é pior do que ausência.
 */
const NAV = [
  { href: "/#recursos", label: "Recursos" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/precos", label: "Preços" },
  { href: "/#perguntas", label: "Perguntas" },
];

const ACCESS = [
  { href: "/login", label: "Entrar" },
  { href: "/signup", label: "Testar grátis" },
];

const LEGAL = [
  { href: "/termos", label: "Termos de uso" },
  { href: "/privacidade", label: "Privacidade" },
];

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-(--border) bg-(--bg2)">
      <div className="mx-auto max-w-[1200px] px-24 py-48">
        <div className="tablet:flex-row flex flex-col justify-between gap-32">
          <div className="flex flex-col gap-12">
            <Image
              src="/horizontal_logo.svg"
              alt="Girus"
              width={124}
              height={32}
              className="h-auto w-[124px]"
            />

            <Title variant="body-sm" color="muted" className="max-w-[36ch]">
              Gestão comercial para representações: pedido, carteira, comissão e
              a rota do dia.
            </Title>
          </div>

          <div className="flex flex-wrap gap-48">
            <FooterColumn title="O sistema" links={NAV} />
            <FooterColumn title="Acesso" links={ACCESS} />
            <FooterColumn title="Legal" links={LEGAL} />
          </div>
        </div>

        <div className="mt-32 border-t border-(--border) pt-24">
          <Title variant="body-xs" color="muted">
            © {year} Girus. Todos os direitos reservados.
          </Title>
        </div>
      </div>
    </footer>
  );
}
