import { TextLink } from "@/components/TextLink";
import { Title } from "@/components/Title";

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
        <TextLink
          key={link.href}
          href={link.href}
          tone="inherit"
          underline="none"
          className="text-(--color-text-secondary)"
        >
          <Title variant="body-sm" color="inherit">
            {link.label}
          </Title>
        </TextLink>
      ))}
    </nav>
  );
}
