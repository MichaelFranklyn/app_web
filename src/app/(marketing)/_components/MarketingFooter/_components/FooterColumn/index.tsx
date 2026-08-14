import { Title } from "@/components/Title";
import Link from "next/link";

/** Uma coluna de links do rodapé: um rótulo e a lista abaixo dele. */
export function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav className="flex flex-col gap-12">
      <Title variant="label" color="muted">
        {title}
      </Title>

      {links.map((link) => (
        <Link key={link.href} href={link.href} className="hover:opacity-70">
          <Title variant="body-sm" color="secondary">
            {link.label}
          </Title>
        </Link>
      ))}
    </nav>
  );
}
